const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');

function loadBrowserModule(dom, file) {
  const source = fs.readFileSync(file, 'utf8');
  vm.runInContext(source, dom.getInternalVMContext(), { filename: file });
}

function editorDom() {
  const dom = new JSDOM(
    '<body><div id="editor-shell"><pre id="editor-focus-overlay"></pre><textarea id="editor"></textarea></div>' +
      '<span id="document-name"></span><div id="recent-files-dropdown"></div></body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  dom.window.Stats = { update() {}, updateCursorPosition() {} };
  dom.window.Preview = { update() {} };
  loadBrowserModule(dom, require.resolve('../js/editor.js'));
  dom.window.Editor.init();
  return dom;
}

test('checkbox listesi Enter ile yeni checkbox maddesi açar', () => {
  const dom = editorDom();
  const editor = dom.window.document.getElementById('editor');
  editor.value = '- [ ] İlk görev';
  editor.setSelectionRange(editor.value.length, editor.value.length);
  editor.dispatchEvent(new dom.window.KeyboardEvent('keydown', {
    key: 'Enter', bubbles: true, cancelable: true,
  }));

  assert.equal(editor.value, '- [ ] İlk görev\n- [ ] ');
});

test('yeni belge açılınca önceki belgenin Undo geçmişi taşınmaz', () => {
  const dom = editorDom();
  dom.window.Editor.setContent('Eski belge');
  dom.window.Editor.clear();

  assert.equal(dom.window.Editor.getContent(), '');
  assert.equal(dom.window.Editor.undo(), false);
});

test('kaydedilmemiş belge Aç ile değiştirilmeden önce onay ister', async () => {
  const dom = editorDom();
  let confirmCount = 0;
  dom.window.confirm = () => { confirmCount += 1; return false; };
  dom.window.desktopAPI = {
    openFile: async () => ({ name: 'diger.md', path: '/tmp/diger.md', content: 'Yeni' }),
  };
  loadBrowserModule(dom, require.resolve('../js/file.js'));
  dom.window.FileManager.init();
  dom.window.Editor.setContent('Kaydedilmemiş');
  dom.window.FileManager.openFile();
  await new Promise(resolve => setTimeout(resolve, 0));

  assert.equal(confirmCount, 1);
  assert.equal(dom.window.Editor.getContent(), 'Kaydedilmemiş');
});

test('yalnızca boşluk içeren değişiklik kaydedilmemiş sayılır', () => {
  const dom = editorDom();
  loadBrowserModule(dom, require.resolve('../js/file.js'));
  dom.window.FileManager.init();
  dom.window.FileManager.openContent('Kaydedildi', 'not.md');
  dom.window.Editor.setContent('   ');

  assert.equal(dom.window.FileManager.hasUnsavedChanges(), true);
});

test('kaydedilmemiş değişiklikler kapatma koruması için algılanır', () => {
  const dom = editorDom();
  loadBrowserModule(dom, require.resolve('../js/file.js'));
  dom.window.FileManager.init();
  dom.window.Editor.setContent('Kaydedilmemiş');

  assert.equal(dom.window.FileManager.hasUnsavedChanges(), true);
});

test('İngilizce imleç konumu İngilizce çevrilir', () => {
  const dom = new JSDOM(
    '<body><span id="stat-cursor"></span><select id="lang-select"><option value="tr">Türkçe</option><option value="en">English</option></select></body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  loadBrowserModule(dom, require.resolve('../js/i18n.js'));
  loadBrowserModule(dom, require.resolve('../js/stats.js'));
  dom.window.I18n.init();
  dom.window.Stats.init();
  dom.window.I18n.setLanguage('en');
  const textarea = dom.window.document.createElement('textarea');
  textarea.value = 'one\ntwo';
  textarea.setSelectionRange(4, 4);
  dom.window.Stats.updateCursorPosition(textarea);

  assert.equal(dom.window.document.getElementById('stat-cursor').textContent, 'Line 2, Col 1');
});
