const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');

function loadBrowserModule(dom, file) {
  const source = fs.readFileSync(file, 'utf8');
  vm.runInContext(source, dom.getInternalVMContext(), { filename: file });
}

test('ilk kayıttan sonra Ctrl+S aynı dosyanın yolunu kullanır ve üstte adını gösterir', async () => {
  const dom = new JSDOM(
    '<body><span id="document-name"></span><div id="recent-files-dropdown"></div></body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  const calls = [];
  dom.window.Editor = { getContent: () => '# Güncel not' };
  dom.window.desktopAPI = {
    saveFile: async (content, defaultName) => {
      calls.push(['saveFile', content, defaultName]);
      return { name: 'proje.md', path: '/tmp/proje.md' };
    },
    saveFileToPath: async (content, path) => {
      calls.push(['saveFileToPath', content, path]);
      return { name: 'proje.md', path };
    },
  };
  loadBrowserModule(dom, require.resolve('../js/file.js'));
  dom.window.FileManager.init();

  dom.window.FileManager.saveFile();
  await new Promise(resolve => setTimeout(resolve, 0));
  dom.window.FileManager.saveFile();
  await new Promise(resolve => setTimeout(resolve, 0));

  assert.deepEqual(calls, [
    ['saveFile', '# Güncel not', 'belge.md'],
    ['saveFileToPath', '# Güncel not', '/tmp/proje.md'],
  ]);
  assert.equal(dom.window.document.getElementById('document-name').textContent, 'proje.md');
  assert.equal(dom.window.document.title, 'proje.md — Veyrilo');
});

test('uygulama açılışında son belge adı yerine yeni belge adı kullanılır', () => {
  const dom = new JSDOM(
    '<body><span id="document-name"></span><div id="recent-files-dropdown"></div></body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  dom.window.localStorage.setItem('markedit_filename', 'son-belge.md');
  loadBrowserModule(dom, require.resolve('../js/file.js'));
  dom.window.FileManager.init();

  assert.equal(dom.window.FileManager.getFileName(), 'belge.md');
  assert.equal(dom.window.document.getElementById('document-name').textContent, 'belge.md');
  assert.equal(dom.window.document.title, 'belge.md — Veyrilo');
});

test('başlatıcıyla verilen dosya içeriği açılışta yüklenir', async () => {
  const dom = new JSDOM(
    '<body><span id="document-name"></span><div id="recent-files-dropdown"></div></body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  let content = '';
  dom.window.Editor = { setContent: value => { content = value; } };
  dom.window.desktopAPI = {
    openStartupFile: async () => ({
      name: 'sağ-tık.md',
      path: '/tmp/sağ-tık.md',
      content: '# Veyrilo ile açıldı',
    }),
  };
  loadBrowserModule(dom, require.resolve('../js/file.js'));
  dom.window.FileManager.init();

  await dom.window.FileManager.openStartupFile();

  assert.equal(content, '# Veyrilo ile açıldı');
  assert.equal(dom.window.FileManager.getFileName(), 'sağ-tık.md');
  assert.equal(dom.window.document.title, 'sağ-tık.md — Veyrilo');
  const [recentFile] = dom.window.FileManager.getRecentFiles();
  assert.equal(recentFile.name, 'sağ-tık.md');
  assert.equal(recentFile.path, '/tmp/sağ-tık.md');
  assert.equal(typeof recentFile.openedAt, 'number');
});

const CLOSE_DIALOG_MARKUP =
  '<div id="close-dialog" class="hidden">' +
  '  <div class="table-dialog-card">' +
  '    <button id="close-dialog-cancel" type="button"></button>' +
  '    <button id="close-dialog-discard" type="button"></button>' +
  '  </div>' +
  '</div>';

async function closeGuardHarness({ unsaved }) {
  const dom = new JSDOM(
    `<body>${CLOSE_DIALOG_MARKUP}</body>`,
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  let closeHandler;
  const invoked = [];
  dom.window.__TAURI__ = {
    core: { invoke: async cmd => { invoked.push(cmd); } },
    window: { getCurrentWindow: () => ({
      onCloseRequested: handler => { closeHandler = handler; },
      destroy: () => { invoked.push('destroy'); },
    }) },
  };
  loadBrowserModule(dom, require.resolve('../js/desktop.js'));
  dom.window.FileManager = {
    init() {},
    getFileName: () => 'belge.md',
    closeRecentFiles() {},
    hasUnsavedChanges: () => unsaved,
  };
  loadBrowserModule(dom, require.resolve('../js/app.js'));
  await new Promise(resolve => setTimeout(resolve, 0));

  const dialog = dom.window.document.getElementById('close-dialog');
  const click = id => dom.window.document.getElementById(id)
    .dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  const key = init => dom.window.document.dispatchEvent(
    new dom.window.KeyboardEvent('keydown', { bubbles: true, ...init }),
  );
  const requestClose = () => {
    const event = { prevented: false, preventDefault() { this.prevented = true; } };
    closeHandler(event);
    return event.prevented;
  };
  return {
    requestClose,
    click,
    key,
    get quit() { return invoked.includes('quit_app'); },
    get dialogOpen() { return !dialog.classList.contains('hidden'); },
  };
}

test('kaydedilmemiş belgede çarpıya basınca uyarı açılır, kapanış ertelenir', async () => {
  const h = await closeGuardHarness({ unsaved: true });
  assert.equal(h.requestClose(), true); // preventDefault → OS kapanışı ertelenir
  assert.equal(h.dialogOpen, true);
  assert.equal(h.quit, false);
});

test('uyarıda "Kaydetmeden çık" seçilince süreç sonlandırılır', async () => {
  const h = await closeGuardHarness({ unsaved: true });
  h.requestClose();
  h.click('close-dialog-discard');
  assert.equal(h.dialogOpen, false);
  assert.equal(h.quit, true);
});

test('uyarıda "İptal" seçilince uygulama açık kalır', async () => {
  const h = await closeGuardHarness({ unsaved: true });
  h.requestClose();
  h.click('close-dialog-cancel');
  assert.equal(h.dialogOpen, false);
  assert.equal(h.quit, false);
});

test('kaydedilmemiş değişiklik yoksa çarpı doğrudan süreci sonlandırır', async () => {
  const h = await closeGuardHarness({ unsaved: false });
  assert.equal(h.requestClose(), true); // her durumda preventDefault + manuel quit
  assert.equal(h.dialogOpen, false);
  assert.equal(h.quit, true);
});

test('Ctrl+Shift+Q her durumda süreci sonlandırır', async () => {
  const h = await closeGuardHarness({ unsaved: true });
  h.key({ key: 'Q', ctrlKey: true, shiftKey: true });
  assert.equal(h.quit, true);
});

test('PDF çıktısı temizlenmiş Markdown içeriği yazdırmaya hazırlar', () => {
  const dom = new JSDOM(
    '<body><article id="pdf-export-container"></article></body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  let printedHtml = '';
  dom.window.Editor = { getContent: () => '# Rapor' };
  dom.window.Preview = { renderToSafeHtml: () => '<h1>Rapor</h1><p>İçerik</p>' };
  dom.window.requestAnimationFrame = callback => callback();
  dom.window.print = () => {
    printedHtml = dom.window.document.getElementById('pdf-export-container').innerHTML;
    dom.window.dispatchEvent(new dom.window.Event('afterprint'));
  };
  loadBrowserModule(dom, require.resolve('../js/file.js'));
  dom.window.FileManager.init();
  dom.window.FileManager.exportPdf();

  assert.equal(printedHtml, '<h1>Rapor</h1><p>İçerik</p>');
  assert.equal(dom.window.document.body.classList.contains('pdf-printing'), false);
  assert.equal(dom.window.document.getElementById('pdf-export-container').innerHTML, '');
});

test('PDF yazdırma ekran temasından bağımsız okunabilir renkler kullanır', () => {
  const css = fs.readFileSync(require.resolve('../css/style.css'), 'utf8');

  const printStart = css.indexOf('@media print {');
  const printEnd = css.indexOf('/* ─── General Utilities', printStart);
  const printRules = css.slice(printStart, printEnd);
  assert.match(printRules, /body\.pdf-printing \{[\s\S]*?background: #ffffff !important;[\s\S]*?color: #1a1a1a !important;/);
  assert.match(printRules, /body\.pdf-printing #pdf-export-container \{[\s\S]*?--text-primary: #1a1a1a;[\s\S]*?--bg-preview: #ffffff;/);
});

test('HTML dışa aktarma seçili arayüz dilini belge diline yazar', async () => {
  const dom = new JSDOM(
    '<html lang="en"><body><span id="document-name"></span><div id="recent-files-dropdown"></div></body></html>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  let exported = '';
  dom.window.Editor = { getContent: () => '# Report' };
  dom.window.Preview = { renderToSafeHtml: () => '<h1>Report</h1>' };
  dom.window.showSaveFilePicker = async () => ({
    name: 'report.html',
    createWritable: async () => ({
      write: async content => { exported = content; },
      close: async () => {},
    }),
  });
  loadBrowserModule(dom, require.resolve('../js/file.js'));
  dom.window.FileManager.init();
  dom.window.FileManager.exportHTML();
  await new Promise(resolve => setTimeout(resolve, 0));

  assert.match(exported, /<html lang="en">/);
});

test('kaydedilmiş belge yeni belge açarken uyarmaz, değişiklik varsa uyarır', async () => {
  const dom = new JSDOM(
    '<body><span id="document-name"></span><div id="recent-files-dropdown"></div></body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  let content = '# Kaydedildi';
  let clearCount = 0;
  let confirmMessage = '';
  dom.window.Editor = {
    getContent: () => content,
    clear: () => { content = ''; clearCount += 1; },
  };
  dom.window.I18n = { t: key => key === 'file.unsavedChanges' ? 'Değişiklikler kaybolacak.' : key };
  dom.window.confirm = message => { confirmMessage = message; return true; };
  dom.window.desktopAPI = {
    saveFile: async () => ({ name: 'not.md', path: '/tmp/not.md' }),
  };
  loadBrowserModule(dom, require.resolve('../js/file.js'));
  dom.window.FileManager.init();
  dom.window.FileManager.saveFile();
  await new Promise(resolve => setTimeout(resolve, 0));

  dom.window.FileManager.newDocument();
  assert.equal(confirmMessage, '');
  assert.equal(clearCount, 1);

  content = '# Yeni değişiklik';
  dom.window.FileManager.newDocument();
  assert.equal(confirmMessage, 'Değişiklikler kaybolacak.');
  assert.equal(clearCount, 2);
});
