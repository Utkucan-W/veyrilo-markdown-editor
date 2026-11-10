const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');

function loadBrowserModule(dom, file) {
  const source = fs.readFileSync(file, 'utf8');
  vm.runInContext(source, dom.getInternalVMContext(), { filename: file });
}

test('Ctrl+F araması eşleşmeleri sayar ve sonuçlar arasında ilerler', () => {
  const dom = new JSDOM(
    '<body>' +
      '<div id="find-bar" class="hidden">' +
        '<input id="find-input">' +
        '<span id="find-count"></span>' +
        '<button id="find-previous"></button>' +
        '<button id="find-next"></button>' +
        '<button id="find-close"></button>' +
      '</div>' +
      '<pre id="editor-highlights" class="hidden"></pre>' +
      '<textarea id="editor">Veyrilo ile yaz. veyrilo hızlıdır.</textarea>' +
    '</body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  dom.window.Editor = {
    getElement: () => dom.window.document.getElementById('editor'),
  };
  dom.window.I18n = { t: () => 'Sonuç yok' };
  loadBrowserModule(dom, require.resolve('../js/search.js'));
  dom.window.Find.init();

  dom.window.Find.open();
  const input = dom.window.document.getElementById('find-input');
  input.value = 'veyrilo';
  input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));

  assert.equal(dom.window.document.getElementById('find-bar').classList.contains('hidden'), false);
  assert.equal(dom.window.document.getElementById('find-count').textContent, '1 / 2');
  assert.equal(dom.window.document.getElementById('editor').selectionStart, 0);
  assert.equal(dom.window.document.querySelectorAll('#editor-highlights mark').length, 2);
  assert.equal(dom.window.document.querySelectorAll('#editor-highlights mark.active').length, 1);

  dom.window.document.getElementById('find-next').click();
  assert.equal(dom.window.document.getElementById('find-count').textContent, '2 / 2');
  assert.equal(dom.window.document.getElementById('editor').selectionStart, 17);
  assert.equal(dom.window.document.querySelector('#editor-highlights mark.active').textContent, 'veyrilo');

  dom.window.Find.close();
  assert.equal(dom.window.document.getElementById('find-bar').classList.contains('hidden'), true);
});

test('arama sonucu editörü eşleşmenin bulunduğu konuma kaydırır', () => {
  const dom = new JSDOM(
    '<body>' +
      '<div id="find-bar" class="hidden">' +
        '<input id="find-input">' +
        '<span id="find-count"></span>' +
      '</div>' +
      '<pre id="editor-highlights" class="hidden"></pre>' +
      '<textarea id="editor">' +
        'İlk satır\n'.repeat(40) +
        'aranan satır\nson satır</textarea>' +
    '</body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  dom.window.Editor = {
    getElement: () => dom.window.document.getElementById('editor'),
  };
  dom.window.I18n = { t: () => 'Sonuç yok' };
  const editor = dom.window.document.getElementById('editor');
  const highlights = dom.window.document.getElementById('editor-highlights');
  Object.defineProperty(editor, 'clientWidth', { value: 480 });
  Object.defineProperty(editor, 'clientHeight', { value: 200 });
  Object.defineProperty(editor, 'getBoundingClientRect', {
    value: () => ({ top: 100, left: 0, right: 480, bottom: 300, height: 200, width: 480 }),
  });
  Object.defineProperty(highlights, 'getBoundingClientRect', {
    value: () => ({ top: 100, left: 0, right: 480, bottom: 300, height: 200, width: 480 }),
  });
  Object.defineProperty(dom.window.HTMLElement.prototype, 'getBoundingClientRect', {
    configurable: true,
    value() {
      return this.classList.contains('active')
        ? {
          top: 1000,
          left: 0,
          right: 80,
          bottom: 1018,
          height: 18,
          width: 80,
        }
        : { top: 100, left: 0, right: 0, bottom: 100, height: 0, width: 0 };
    },
  });
  loadBrowserModule(dom, require.resolve('../js/search.js'));
  dom.window.Find.init();
  dom.window.Find.open();

  const input = dom.window.document.getElementById('find-input');
  input.value = 'aranan';
  input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));

  assert.equal(editor.scrollTop, 809);
  assert.equal(highlights.style.width, '480px');
  assert.equal(highlights.style.height, '200px');
});

test('arama sonucu inline eşleşmenin gerçek ekran konumuna göre kaydırır', () => {
  const dom = new JSDOM(
    '<body>' +
      '<div id="find-bar" class="hidden">' +
        '<input id="find-input">' +
        '<span id="find-count"></span>' +
        '<button id="find-next"></button>' +
      '</div>' +
      '<pre id="editor-highlights" class="hidden"></pre>' +
      '<textarea id="editor">' +
        'İlk satır\n'.repeat(40) +
        'aranan ilk satır\n' +
        'İlk satır\n'.repeat(40) +
        'aranan ikinci satır\nson satır</textarea>' +
    '</body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  dom.window.Editor = {
    getElement: () => dom.window.document.getElementById('editor'),
  };
  dom.window.I18n = { t: () => 'Sonuç yok' };
  const editor = dom.window.document.getElementById('editor');
  const highlights = dom.window.document.getElementById('editor-highlights');
  Object.defineProperty(editor, 'clientHeight', { value: 200 });
  Object.defineProperty(editor, 'clientWidth', { value: 480 });
  Object.defineProperty(editor, 'getBoundingClientRect', {
    value: () => ({ top: 100, left: 0, right: 480, bottom: 300, height: 200, width: 480 }),
  });
  Object.defineProperty(highlights, 'getBoundingClientRect', {
    value: () => ({ top: 100, left: 0, right: 480, bottom: 300, height: 200, width: 480 }),
  });
  Object.defineProperty(dom.window.HTMLElement.prototype, 'offsetTop', {
    configurable: true,
    get() { return 0; },
  });
  Object.defineProperty(dom.window.HTMLElement.prototype, 'getBoundingClientRect', {
    configurable: true,
    value() {
      if (!this.classList.contains('active')) {
        return { top: 100, left: 0, right: 0, bottom: 100, height: 0, width: 0 };
      }
      const top = 1000
        + Array.from(this.parentElement.querySelectorAll('mark')).indexOf(this) * 800
        - editor.scrollTop;
      return { top, left: 0, right: 80, bottom: top + 18, height: 18, width: 80 };
    },
  });
  loadBrowserModule(dom, require.resolve('../js/search.js'));
  dom.window.Find.init();
  dom.window.Find.open();

  const input = dom.window.document.getElementById('find-input');
  input.value = 'aranan';
  input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));

  assert.equal(editor.scrollTop, 809);
  dom.window.document.getElementById('find-next').click();
  assert.equal(editor.scrollTop, 1609);
});

test('Ctrl+F kısayolu arama handlerını çağırır', () => {
  const dom = new JSDOM('<body></body>', {
    runScripts: 'outside-only',
    url: 'https://veyrilo.test',
  });
  dom.window.structuredClone = structuredClone;
  loadBrowserModule(dom, require.resolve('../js/shortcuts.js'));

  let calls = 0;
  dom.window.Shortcuts.registerHandler('find', () => { calls += 1; });
  dom.window.Shortcuts.init();

  const event = new dom.window.KeyboardEvent('keydown', {
    key: 'f',
    ctrlKey: true,
    bubbles: true,
    cancelable: true,
  });
  dom.window.document.dispatchEvent(event);

  assert.equal(calls, 1);
  assert.equal(event.defaultPrevented, true);
});

test('Unicode küçük harf dönüşümü eşleşme konumlarını kaydırmaz', () => {
  const dom = new JSDOM(
    '<body>' +
      '<div id="find-bar" class="hidden">' +
        '<input id="find-input">' +
        '<span id="find-count"></span>' +
        '<button id="find-previous"></button>' +
        '<button id="find-next"></button>' +
        '<button id="find-close"></button>' +
      '</div>' +
      '<pre id="editor-highlights" class="hidden"></pre>' +
      '<textarea id="editor">İşlem 1 ve İşlem 2</textarea>' +
    '</body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  dom.window.Editor = {
    getElement: () => dom.window.document.getElementById('editor'),
  };
  dom.window.I18n = { t: () => 'Sonuç yok' };
  loadBrowserModule(dom, require.resolve('../js/search.js'));
  dom.window.Find.init();
  dom.window.Find.open();

  const input = dom.window.document.getElementById('find-input');
  const editor = dom.window.document.getElementById('editor');
  input.value = '1';
  input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));

  assert.equal(editor.selectionStart, editor.value.indexOf('1'));
  assert.equal(editor.selectionEnd, editor.selectionStart + 1);
  assert.equal(editor.value.substring(editor.selectionStart, editor.selectionEnd), '1');
  assert.equal(dom.window.document.querySelector('#editor-highlights mark').textContent, '1');

  input.value = '2';
  input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));

  assert.equal(editor.selectionStart, editor.value.indexOf('2'));
  assert.equal(editor.selectionEnd, editor.selectionStart + 1);
  assert.equal(editor.value.substring(editor.selectionStart, editor.selectionEnd), '2');
  assert.equal(dom.window.document.querySelector('#editor-highlights mark').textContent, '2');
});

test('tek karakterli arama yalnızca gerçek karakteri vurgular', () => {
  const dom = new JSDOM(
    '<body>' +
      '<div id="find-bar" class="hidden">' +
        '<input id="find-input">' +
        '<span id="find-count"></span>' +
      '</div>' +
      '<pre id="editor-highlights" class="hidden"></pre>' +
      '<textarea id="editor">Başlık 1: Veyrilo\nBoşluklar ve harfler\nSayılar: 10, 21, 1</textarea>' +
    '</body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  dom.window.Editor = {
    getElement: () => dom.window.document.getElementById('editor'),
  };
  dom.window.I18n = { t: () => 'Sonuç yok' };
  loadBrowserModule(dom, require.resolve('../js/search.js'));
  dom.window.Find.init();
  dom.window.Find.open();

  const input = dom.window.document.getElementById('find-input');
  input.value = '1';
  input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));

  const marks = [...dom.window.document.querySelectorAll('#editor-highlights mark')];
  assert.deepEqual(marks.map(mark => mark.textContent), ['1', '1', '1', '1']);
  assert.equal(dom.window.document.getElementById('editor').value
    .substring(dom.window.document.getElementById('editor').selectionStart,
      dom.window.document.getElementById('editor').selectionEnd), '1');
});

test('tam ekran önizlemede arama önizleme metnini işaretler ve sonuçlar arasında gezer', () => {
  const dom = new JSDOM(
    '<body class="preview-active" data-preview-mode="full">' +
      '<div id="find-bar" class="hidden">' +
        '<input id="find-input"><span id="find-count"></span>' +
        '<button id="find-next"></button>' +
        '<div id="find-replace-row" class="hidden"><input id="find-replace-input"></div>' +
        '<button id="find-replace-one"></button><button id="find-replace-all"></button>' +
      '</div>' +
      '<pre id="editor-highlights" class="hidden"></pre>' +
      '<textarea id="editor">**Vey**rilo ve veyrilo</textarea>' +
      '<article id="preview"><p><strong>Vey</strong>rilo ve veyrilo</p></article>' +
    '</body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  const { document } = dom.window;
  dom.window.Editor = { getElement: () => document.getElementById('editor') };
  dom.window.I18n = { t: () => 'Sonuç yok' };
  loadBrowserModule(dom, require.resolve('../js/search.js'));
  dom.window.Find.init();
  dom.window.Find.openWithReplace();

  const input = document.getElementById('find-input');
  input.value = 'veyrilo';
  input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));

  assert.equal(document.getElementById('find-count').textContent, '1 / 2');
  // İlk eşleşme <strong> sınırını aşar: iki parça, ikisi de aktif.
  assert.deepEqual([...document.querySelectorAll('#preview mark.active')].map((m) => m.textContent), ['Vey', 'rilo']);
  assert.equal(document.querySelectorAll('#editor-highlights mark').length, 0);
  assert.equal(document.getElementById('find-replace-one').disabled, true);
  assert.equal(dom.window.Find.replaceAll(), 0);

  document.getElementById('find-next').click();
  assert.equal(document.getElementById('find-count').textContent, '2 / 2');
  assert.equal(document.querySelector('#preview mark.active').textContent, 'veyrilo');

  dom.window.Find.close();
  assert.equal(document.querySelectorAll('#preview mark').length, 0);
  assert.equal(document.getElementById('preview').innerHTML, '<p><strong>Vey</strong>rilo ve veyrilo</p>');
});

test('arama açıkken editöre yazmak odağı arama kutusuna kaçırmaz', () => {
  const dom = new JSDOM(
    '<body><div id="find-bar" class="hidden"><input id="find-input"><span id="find-count"></span></div>' +
      '<pre id="editor-highlights" class="hidden"></pre><textarea id="editor">abc abc</textarea></body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  const { document } = dom.window;
  dom.window.Editor = { getElement: () => document.getElementById('editor') };
  dom.window.I18n = { t: () => 'Sonuç yok' };
  loadBrowserModule(dom, require.resolve('../js/search.js'));
  dom.window.Find.init();
  dom.window.Find.open();
  const input = document.getElementById('find-input');
  input.value = 'abc';
  input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));

  const editor = document.getElementById('editor');
  editor.focus();
  editor.value = 'abc abc abc';
  editor.setSelectionRange(11, 11);
  editor.dispatchEvent(new dom.window.Event('input', { bubbles: true }));

  assert.equal(document.activeElement, editor);
  assert.equal(editor.selectionStart, 11);
  assert.equal(document.getElementById('find-count').textContent, '1 / 3');
});

test('tam ekran önizlemede arama ayrı paragrafları birleştirip eşleştirmez', () => {
  const dom = new JSDOM(
    '<body class="preview-active" data-preview-mode="full">' +
      '<div id="find-bar" class="hidden"><input id="find-input"><span id="find-count"></span></div>' +
      '<textarea id="editor">foo\n\nbar</textarea>' +
      '<article id="preview"><p>foo</p><p>bar</p></article>' +
    '</body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  const { document } = dom.window;
  dom.window.Editor = { getElement: () => document.getElementById('editor') };
  dom.window.I18n = { t: () => 'Sonuç yok' };
  loadBrowserModule(dom, require.resolve('../js/search.js'));
  dom.window.Find.init();
  dom.window.Find.open();
  const input = document.getElementById('find-input');
  input.value = 'foobar';
  input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  assert.equal(document.querySelectorAll('#preview mark').length, 0);
  input.value = 'bar';
  input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  assert.equal(document.querySelector('#preview mark.active').textContent, 'bar');
});
