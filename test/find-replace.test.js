const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');

function loadBrowserModule(dom, file) {
  const source = fs.readFileSync(file, 'utf8');
  vm.runInContext(source, dom.getInternalVMContext(), { filename: file });
}

function setupFind(text) {
  const dom = new JSDOM(
    '<body>' +
      '<div id="find-bar" class="hidden">' +
        '<div class="find-row">' +
          '<button id="find-toggle-replace" aria-expanded="false"></button>' +
          '<input id="find-input">' +
          '<span id="find-count"></span>' +
          '<button id="find-previous"></button>' +
          '<button id="find-next"></button>' +
          '<button id="find-close"></button>' +
        '</div>' +
        '<div class="find-row hidden" id="find-replace-row">' +
          '<input id="find-replace-input">' +
          '<button id="find-replace-one"></button>' +
          '<button id="find-replace-all"></button>' +
        '</div>' +
      '</div>' +
      '<pre id="editor-highlights" class="hidden"></pre>' +
      `<textarea id="editor">${text}</textarea>` +
    '</body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );

  const editor = dom.window.document.getElementById('editor');
  const toasts = [];
  dom.window.Editor = {
    getElement: () => editor,
    replaceValue: (value, start, end) => {
      editor.value = value;
      editor.setSelectionRange(start, end ?? start);
    },
  };
  dom.window.App = { showToast: (message) => toasts.push(message) };
  dom.window.I18n = { t: (key) => key };
  loadBrowserModule(dom, require.resolve('../js/search.js'));
  dom.window.Find.init();
  return { dom, editor, toasts };
}

function typeQuery(dom, value) {
  const input = dom.window.document.getElementById('find-input');
  input.value = value;
  input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
}

test('Ctrl+H değiştirme satırını görünür açar', () => {
  const { dom } = setupFind('kedi ve köpek');

  dom.window.Find.openWithReplace();

  assert.equal(dom.window.document.getElementById('find-bar').classList.contains('hidden'), false);
  assert.equal(dom.window.Find.isReplaceVisible(), true);
  assert.equal(
    dom.window.document.getElementById('find-toggle-replace').getAttribute('aria-expanded'),
    'true',
  );
});

test('değiştirme düğmeleri yalnızca eşleşme varken etkin olur', () => {
  const { dom } = setupFind('kedi ve köpek');
  dom.window.Find.openWithReplace();

  const replaceOne = dom.window.document.getElementById('find-replace-one');
  const replaceAll = dom.window.document.getElementById('find-replace-all');
  assert.equal(replaceOne.disabled, true);
  assert.equal(replaceAll.disabled, true);

  typeQuery(dom, 'kedi');
  assert.equal(replaceOne.disabled, false);
  assert.equal(replaceAll.disabled, false);

  typeQuery(dom, 'zürafa');
  assert.equal(replaceOne.disabled, true);
  assert.equal(replaceAll.disabled, true);
});

test('Değiştir yalnızca seçili eşleşmeyi değiştirip sonrakine geçer', () => {
  const { dom, editor, toasts } = setupFind('kedi ve Kedi ve köpek');
  dom.window.Find.openWithReplace();
  typeQuery(dom, 'kedi');
  dom.window.document.getElementById('find-replace-input').value = 'kuş';

  assert.equal(dom.window.document.getElementById('find-count').textContent, '1 / 2');

  dom.window.document.getElementById('find-replace-one').click();

  assert.equal(editor.value, 'kuş ve Kedi ve köpek');
  // Kalan tek eşleşme değiştirmeden sonraki konumda seçili kalır.
  assert.equal(dom.window.document.getElementById('find-count').textContent, '1 / 1');
  assert.equal(editor.selectionStart, editor.value.indexOf('Kedi'));
  assert.equal(toasts.at(-1), '1 eşleşme değiştirildi');
});

test('Tümü büyük/küçük harf farkı gözetmeden bütün eşleşmeleri değiştirir', () => {
  const { dom, editor, toasts } = setupFind('kedi ve Kedi ve KEDİ ve köpek');
  dom.window.Find.openWithReplace();
  typeQuery(dom, 'kedi');
  dom.window.document.getElementById('find-replace-input').value = 'kuş';

  // "KEDİ" küçültüldüğünde birleşik nokta üretir; arama dizini bu kaymayı
  // hesapladığı için eşleşme özgün harfin tamamını kapsar.
  assert.equal(dom.window.document.getElementById('find-count').textContent, '1 / 3');

  dom.window.document.getElementById('find-replace-all').click();

  assert.equal(editor.value, 'kuş ve kuş ve kuş ve köpek');
  assert.equal(dom.window.document.getElementById('find-count').textContent, 'find.noResults');
  assert.equal(toasts.at(-1), '3 eşleşme değiştirildi');
});

test('değiştirme metni arama metnini içerse bile sonsuz döngü oluşmaz', () => {
  const { dom, editor } = setupFind('kedi kedi');
  dom.window.Find.openWithReplace();
  typeQuery(dom, 'kedi');
  dom.window.document.getElementById('find-replace-input').value = 'kedicik';

  dom.window.document.getElementById('find-replace-all').click();

  assert.equal(editor.value, 'kedicik kedicik');
});

test('eşleşme yokken değiştirme belgeyi bozmaz', () => {
  const { dom, editor, toasts } = setupFind('kedi ve köpek');
  dom.window.Find.openWithReplace();
  typeQuery(dom, 'zürafa');
  dom.window.document.getElementById('find-replace-input').value = 'kuş';

  dom.window.Find.replaceCurrent();
  dom.window.Find.replaceAll();

  assert.equal(editor.value, 'kedi ve köpek');
  assert.equal(toasts.at(-1), 'Değiştirilecek eşleşme yok');
});
