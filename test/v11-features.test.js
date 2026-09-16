const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');

function loadBrowserModule(dom, file) {
  const source = fs.readFileSync(file, 'utf8');
  vm.runInContext(source, dom.getInternalVMContext(), { filename: file });
}

test('Outline başlıkları kod bloklarından ayırır ve seçilen başlığa gider', () => {
  const dom = new JSDOM(
    '<body><div id="outline-pane" class="hidden"><span id="outline-count"></span><nav id="outline-list"></nav></div>' +
      '<button id="btn-outline"></button><textarea id="editor"></textarea></body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  const editor = dom.window.document.getElementById('editor');
  editor.value = '# Başlık\n\n```\n# Kod başlığı\n```\n\n## Alt başlık';
  editor.clientHeight = 300;
  dom.window.Editor = {
    getContent: () => '# Başlık\n\n```\n# Kod başlığı\n```\n\n## Alt başlık',
    getElement: () => editor,
  };
  loadBrowserModule(dom, require.resolve('../js/outline.js'));
  dom.window.Outline.init();

  assert.equal(
    dom.window.Outline.parseHeadings(dom.window.Editor.getContent()).map(h => h.title).join('|'),
    'Başlık|Alt başlık',
  );
  dom.window.Outline.toggle();
  const item = dom.window.document.querySelectorAll('.outline-item')[1];
  item.click();

  assert.equal(editor.selectionStart, 33);
  assert.equal(editor.selectionEnd, 43);
  assert.equal(dom.window.document.getElementById('outline-count').textContent, '2');
});

test('komut paleti Ctrl+Shift+P ile açılır, arar ve seçilen komutu çalıştırır', () => {
  const dom = new JSDOM(
    '<body><button id="source">Kaynak</button><div id="command-palette" class="hidden">' +
      '<input id="command-palette-input"><div id="command-palette-list"></div></div></body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  let ran = 0;
  loadBrowserModule(dom, require.resolve('../js/command-palette.js'));
  dom.window.CommandPalette.init();
  dom.window.CommandPalette.setActions([
    { label: 'Yeni belge', keywords: 'new', run: () => { ran += 1; } },
    { label: 'Kaydet', keywords: 'save', run: () => { ran += 10; } },
  ]);
  dom.window.document.dispatchEvent(new dom.window.KeyboardEvent('keydown', {
    key: 'P', ctrlKey: true, shiftKey: true, bubbles: true,
  }));
  const input = dom.window.document.getElementById('command-palette-input');
  input.value = 'kay';
  input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  input.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

  assert.equal(ran, 10);
  assert.equal(dom.window.CommandPalette.isOpen(), false);
});

test('kurtarma taslağı onaylanınca belgeye yüklenir ve saklama alanı temizlenir', () => {
  const dom = new JSDOM(
    '<body><span id="document-name"></span><div id="recent-files-dropdown"></div></body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  let content = '';
  let cleared = 0;
  dom.window.Editor = {
    getRecoveryDraft: () => '# Kurtarılan',
    setContent: value => { content = value; },
    clearRecoveryDraft: () => { cleared += 1; },
  };
  dom.window.confirm = () => true;
  loadBrowserModule(dom, require.resolve('../js/file.js'));
  dom.window.FileManager.init();

  assert.equal(dom.window.FileManager.offerRecoveryDraft(), true);
  assert.equal(content, '# Kurtarılan');
  assert.equal(cleared, 1);
  assert.equal(dom.window.FileManager.getFileName(), 'kurtarılan-belge.md');
});

test('dosya diskte değişince uyarı gösterilir ve kullanıcı editör sürümünü koruyabilir', async () => {
  const dom = new JSDOM(
    '<body><span id="document-name"></span><div id="recent-files-dropdown"></div>' +
      '<div id="external-change-banner" class="hidden"><button id="external-change-reload"></button>' +
      '<button id="external-change-keep"></button></div></body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  let metadata = { modified_ms: 1, size: 5 };
  dom.window.Editor = {
    setContent() {},
    clearRecoveryDraft() {},
    getContent: () => 'İçerik',
  };
  dom.window.confirm = () => true;
  dom.window.desktopAPI = {
    openPath: async path => ({ name: 'not.md', path, content: 'İçerik', ...metadata }),
    fileMetadata: async () => metadata,
  };
  loadBrowserModule(dom, require.resolve('../js/file.js'));
  dom.window.FileManager.init();
  await dom.window.FileManager.openRecentFile('/tmp/not.md');
  metadata = { modified_ms: 2, size: 8 };

  assert.equal(await dom.window.FileManager.checkForExternalChange(), true);
  const banner = dom.window.document.getElementById('external-change-banner');
  assert.equal(banner.classList.contains('hidden'), false);
  dom.window.document.getElementById('external-change-keep').click();
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(banner.classList.contains('hidden'), true);
  dom.window.close();
});
