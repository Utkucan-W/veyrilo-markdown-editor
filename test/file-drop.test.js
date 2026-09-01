const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');

function loadBrowserModule(dom, file) {
  const source = fs.readFileSync(file, 'utf8');
  vm.runInContext(source, dom.getInternalVMContext(), { filename: file });
}

function setupFileManager({ openPath } = {}) {
  const dom = new JSDOM(
    '<body><div id="recent-files-dropdown" class="hidden"></div><div id="toast" class="hidden"></div></body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  const state = { content: null, toasts: [] };
  dom.window.Editor = { setContent: (value) => { state.content = value; } };
  dom.window.I18n = { t: (key) => key };
  dom.window.App = { showToast: (msg) => state.toasts.push(msg) };
  dom.window.desktopAPI = {
    openPath: openPath || (async (path) => ({ name: path.split('/').pop(), content: '# Bırakılan', path })),
  };
  loadBrowserModule(dom, require.resolve('../js/file.js'));
  dom.window.FileManager.init();
  return { dom, state };
}

test('desteklenen uzantılar tanınır, diğerleri elenir', () => {
  const { dom } = setupFileManager();
  const { isSupportedPath } = dom.window.FileManager;

  assert.equal(isSupportedPath('/home/utku/notlar.md'), true);
  assert.equal(isSupportedPath('/home/utku/NOTLAR.MARKDOWN'), true);
  assert.equal(isSupportedPath('/home/utku/okuma.txt'), true);
  assert.equal(isSupportedPath('/home/utku/resim.png'), false);
  assert.equal(isSupportedPath('/home/utku/arsiv.tar.gz'), false);
  assert.equal(isSupportedPath('/home/utku/LICENSE'), false);
});

test('bırakılan Markdown dosyası editöre yüklenir', async () => {
  const { dom, state } = setupFileManager();

  const opened = await dom.window.FileManager.openDroppedPaths(['/home/utku/notlar.md']);

  assert.equal(opened, true);
  assert.equal(state.content, '# Bırakılan');
  assert.equal(dom.window.FileManager.getFileName(), 'notlar.md');
  assert.equal(dom.window.FileManager.getRecentFiles()[0].path, '/home/utku/notlar.md');
});

test('birden çok dosya bırakılırsa ilk desteklenen dosya açılır', async () => {
  const requested = [];
  const { dom } = setupFileManager({
    openPath: async (path) => {
      requested.push(path);
      return { name: path.split('/').pop(), content: '# Bırakılan', path };
    },
  });

  await dom.window.FileManager.openDroppedPaths([
    '/home/utku/resim.png',
    '/home/utku/notlar.md',
    '/home/utku/ikinci.md',
  ]);

  assert.deepEqual(requested, ['/home/utku/notlar.md']);
});

test('desteklenmeyen dosya bırakıldığında belge korunur', async () => {
  const { dom, state } = setupFileManager();

  const opened = await dom.window.FileManager.openDroppedPaths(['/home/utku/resim.png']);

  assert.equal(opened, false);
  assert.equal(state.content, null);
  assert.equal(state.toasts.at(-1), 'Yalnızca Markdown ve metin dosyaları açılabilir');
});

test('okunamayan dosya hata bildirir ve belgeyi değiştirmez', async () => {
  const { dom, state } = setupFileManager({
    openPath: async () => { throw new Error('okunamadı'); },
  });

  const opened = await dom.window.FileManager.openDroppedPaths(['/home/utku/notlar.md']);

  assert.equal(opened, false);
  assert.equal(state.content, null);
  assert.equal(state.toasts.at(-1), 'Dosya okunamadı');
});

test('boş bırakma isteği yok sayılır', async () => {
  const { dom, state } = setupFileManager();

  assert.equal(await dom.window.FileManager.openDroppedPaths([]), false);
  assert.equal(await dom.window.FileManager.openDroppedPaths(undefined), false);
  assert.equal(state.toasts.length, 0);
});

test('sürükle-bırak olayları göstergeyi açıp kapatır ve dosyayı açar', () => {
  const dom = new JSDOM(
    '<body><div id="drop-overlay" class="hidden"></div></body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  let handler = null;
  const dropped = [];
  dom.window.desktopAPI = { onDragDrop: (fn) => { handler = fn; } };
  dom.window.FileManager = { openDroppedPaths: (paths) => dropped.push(paths) };
  loadBrowserModule(dom, require.resolve('../js/app.js'));

  dom.window.App.registerFileDrop();
  assert.equal(typeof handler, 'function');

  const overlay = dom.window.document.getElementById('drop-overlay');
  handler({ payload: { type: 'enter', paths: [] } });
  assert.equal(overlay.classList.contains('hidden'), false);

  handler({ payload: { type: 'leave' } });
  assert.equal(overlay.classList.contains('hidden'), true);

  handler({ payload: { type: 'over', paths: [] } });
  assert.equal(overlay.classList.contains('hidden'), false);

  handler({ payload: { type: 'drop', paths: ['/home/utku/notlar.md'] } });
  assert.equal(overlay.classList.contains('hidden'), true);
  assert.deepEqual(dropped, [['/home/utku/notlar.md']]);
});
