const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');

function loadBrowserModule(dom, file) {
  const source = fs.readFileSync(file, 'utf8');
  vm.runInContext(source, dom.getInternalVMContext(), { filename: file });
}

test('uygulama açılışında otomatik kaydedilmiş içerik yerine boş belge açılır', () => {
  const dom = new JSDOM(
    '<body><div id="editor-shell"><pre id="editor-focus-overlay"></pre><textarea id="editor"></textarea></div></body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  dom.window.localStorage.setItem('veyrilo_content', '# Önceki belge');
  dom.window.Stats = { update() {}, updateCursorPosition() {} };
  dom.window.Preview = { update() {} };
  loadBrowserModule(dom, require.resolve('../js/editor.js'));

  dom.window.Editor.init();

  assert.equal(dom.window.Editor.getContent(), '');
  assert.equal(dom.window.localStorage.getItem('veyrilo_content'), null);
});
