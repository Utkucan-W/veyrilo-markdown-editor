const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');

function loadBrowserModule(dom, file) {
  const source = fs.readFileSync(file, 'utf8');
  vm.runInContext(source, dom.getInternalVMContext(), { filename: file });
}

test('tablo oluşturucu seçilen satır ve sütun sayısını Markdown olarak ekler', () => {
  const dom = new JSDOM(
    '<body>' +
      '<div id="table-dialog" class="hidden">' +
        '<input id="table-rows" type="number" min="2" max="20" value="3">' +
        '<input id="table-columns" type="number" min="1" max="12" value="3">' +
        '<button id="table-dialog-create"></button>' +
        '<button id="table-dialog-cancel"></button>' +
        '<button id="table-dialog-close"></button>' +
      '</div>' +
      '<textarea id="editor"></textarea>' +
    '</body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  dom.window.Stats = { update() {}, updateCursorPosition() {} };
  dom.window.Preview = { update() {} };
  dom.window.I18n = { getCurrentLang: () => 'en' };
  loadBrowserModule(dom, require.resolve('../js/editor.js'));
  dom.window.Editor.init();

  const editor = dom.window.document.getElementById('editor');
  editor.value = 'Önce';
  editor.setSelectionRange(editor.value.length, editor.value.length);
  dom.window.Editor.table();

  const dialog = dom.window.document.getElementById('table-dialog');
  assert.equal(dialog.classList.contains('hidden'), false);

  dom.window.document.getElementById('table-rows').value = '4';
  dom.window.document.getElementById('table-columns').value = '2';
  dom.window.document.getElementById('table-dialog-create').click();

  assert.equal(dialog.classList.contains('hidden'), true);
  assert.match(editor.value, /\| Header 1 \| Header 2 \|/);
  assert.match(editor.value, /\| --- \| --- \|/);
  assert.match(editor.value, /\| Cell 3\.1 \| Cell 3\.2 \|/);
});

test('son açılan dosya listeye eklenir ve listeden tekrar açılabilir', async () => {
  const dom = new JSDOM(
    '<body><div id="recent-files-dropdown" class="hidden"></div></body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  let content = '';
  dom.window.Editor = { setContent: (value) => { content = value; } };
  dom.window.I18n = { t: (key) => key };
  dom.window.desktopAPI = {
    openPath: async (path) => ({ name: 'notlar.md', content: '# Notlar', path }),
  };
  loadBrowserModule(dom, require.resolve('../js/file.js'));
  dom.window.FileManager.init();

  await dom.window.FileManager.openRecentFile('/home/utku/notlar.md');

  const item = dom.window.document.querySelector('.recent-file-item');
  assert.ok(item);
  assert.equal(item.querySelector('strong').textContent, 'notlar.md');
  assert.equal(item.querySelector('small').textContent, '/home/utku/notlar.md');
  assert.equal(content, '# Notlar');
  assert.equal(dom.window.FileManager.getRecentFiles().length, 1);
  assert.equal(dom.window.localStorage.getItem('markedit_recent_files').includes('notlar.md'), true);
});
