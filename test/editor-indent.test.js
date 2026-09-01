const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');

function loadBrowserModule(dom, file) {
  const source = fs.readFileSync(file, 'utf8');
  vm.runInContext(source, dom.getInternalVMContext(), { filename: file });
}

function setupEditor(text) {
  const dom = new JSDOM(
    '<body><div id="editor-shell"><textarea id="editor"></textarea></div></body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  dom.window.Stats = { update() {}, updateCursorPosition() {} };
  dom.window.Preview = { update() {} };
  loadBrowserModule(dom, require.resolve('../js/editor.js'));
  dom.window.Editor.init();

  const editor = dom.window.document.getElementById('editor');
  editor.value = text;
  return { dom, editor };
}

function pressTab(dom, editor, { shift = false } = {}) {
  const event = new dom.window.KeyboardEvent('keydown', {
    key: 'Tab',
    shiftKey: shift,
    bubbles: true,
    cancelable: true,
  });
  editor.dispatchEvent(event);
  return event;
}

function paste(dom, editor, text) {
  const event = new dom.window.Event('paste', { bubbles: true, cancelable: true });
  event.clipboardData = { getData: (type) => (type === 'text/plain' ? text : '') };
  editor.dispatchEvent(event);
  return event;
}

test('Tab tek satırda imlece girinti ekler', () => {
  const { dom, editor } = setupEditor('madde');
  editor.setSelectionRange(0, 0);

  pressTab(dom, editor);

  assert.equal(editor.value, '    madde');
  assert.equal(editor.selectionStart, 4);
});

test('Tab çok satırlı seçimde bütün satırları girintiler', () => {
  const { dom, editor } = setupEditor('bir\niki\nüç');
  editor.setSelectionRange(0, editor.value.length);

  pressTab(dom, editor);

  assert.equal(editor.value, '    bir\n    iki\n    üç');
  assert.equal(editor.selectionStart, 4);
  assert.equal(editor.selectionEnd, editor.value.length);
});

test('Shift+Tab girintiyi en fazla bir kademe azaltır', () => {
  const { dom, editor } = setupEditor('        bir\n  iki\nüç');
  editor.setSelectionRange(0, editor.value.length);

  const event = pressTab(dom, editor, { shift: true });

  assert.equal(event.defaultPrevented, true);
  // İlk satır dört boşluk, ikinci satır mevcut iki boşluğu kaybeder;
  // girintisi olmayan satır olduğu gibi kalır.
  assert.equal(editor.value, '    bir\niki\nüç');
});

test('Shift+Tab girinti yoksa belgeyi değiştirmez', () => {
  const { dom, editor } = setupEditor('bir\niki');
  editor.setSelectionRange(0, editor.value.length);

  pressTab(dom, editor, { shift: true });

  assert.equal(editor.value, 'bir\niki');
});

test('çok satırlı girintide boş satıra boşluk eklenmez', () => {
  const { dom, editor } = setupEditor('bir\n\niki');
  editor.setSelectionRange(0, editor.value.length);

  pressTab(dom, editor);

  assert.equal(editor.value, '    bir\n\n    iki');
});

test('seçili metnin üstüne bağlantı yapıştırınca Markdown bağlantısı oluşur', () => {
  const { dom, editor } = setupEditor('Veyrilo deposu burada.');
  const start = editor.value.indexOf('Veyrilo deposu');
  editor.setSelectionRange(start, start + 'Veyrilo deposu'.length);

  const event = paste(dom, editor, 'https://example.com/veyrilo');

  assert.equal(event.defaultPrevented, true);
  assert.equal(editor.value, '[Veyrilo deposu](https://example.com/veyrilo) burada.');
});

test('seçim yokken yapıştırma varsayılan davranışta kalır', () => {
  const { dom, editor } = setupEditor('metin');
  editor.setSelectionRange(5, 5);

  const event = paste(dom, editor, 'https://example.com');

  assert.equal(event.defaultPrevented, false);
  assert.equal(editor.value, 'metin');
});

test('bağlantı olmayan pano içeriği yapıştırmayı değiştirmez', () => {
  const { dom, editor } = setupEditor('metin');
  editor.setSelectionRange(0, 5);

  const event = paste(dom, editor, 'düz metin');

  assert.equal(event.defaultPrevented, false);
  assert.equal(editor.value, 'metin');
});

test('seçili metin zaten bağlantıysa yapıştırma sarmalamaz', () => {
  const { dom, editor } = setupEditor('https://veyrilo.test');
  editor.setSelectionRange(0, editor.value.length);

  const event = paste(dom, editor, 'https://example.com');

  assert.equal(event.defaultPrevented, false);
  assert.equal(editor.value, 'https://veyrilo.test');
});

test('güvensiz şemalı pano içeriği bağlantıya çevrilmez', () => {
  const { dom, editor } = setupEditor('tıkla');
  editor.setSelectionRange(0, 5);

  const event = paste(dom, editor, 'javascript:alert(1)');

  assert.equal(event.defaultPrevented, false);
  assert.equal(editor.value, 'tıkla');
});

test('satır sonuyla biten seçim sonraki satırı girintilemez', () => {
  const { dom, editor } = setupEditor('bir\niki');
  editor.setSelectionRange(0, 4);

  pressTab(dom, editor);

  assert.equal(editor.value, '    bir\niki');
});

test('satır sonuyla biten seçimde Shift+Tab yalnız seçili satırı etkiler', () => {
  const { dom, editor } = setupEditor('    bir\n    iki');
  editor.setSelectionRange(0, 8);

  pressTab(dom, editor, { shift: true });

  assert.equal(editor.value, 'bir\n    iki');
});
