const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');

function loadShortcuts() {
  const dom = new JSDOM('<body></body>', {
    runScripts: 'outside-only',
    url: 'https://veyrilo.test',
  });
  dom.window.structuredClone = structuredClone;
  const source = fs.readFileSync(require.resolve('../js/shortcuts.js'), 'utf8');
  vm.runInContext(source, dom.getInternalVMContext());
  return dom;
}

function dispatch(dom, shortcut) {
  const event = new dom.window.KeyboardEvent('keydown', {
    key: shortcut.key,
    code: shortcut.code,
    ctrlKey: shortcut.ctrl,
    shiftKey: shortcut.shift,
    altKey: shortcut.alt,
    bubbles: true,
    cancelable: true,
  });
  dom.window.document.dispatchEvent(event);
  return event;
}

test('bütün varsayılan kısayollar ilgili handlera ulaşır', () => {
  const dom = loadShortcuts();
  const calls = new Map();
  const shortcuts = dom.window.Shortcuts.getShortcuts();

  for (const actionId of Object.keys(shortcuts)) {
    calls.set(actionId, 0);
    dom.window.Shortcuts.registerHandler(actionId, () => calls.set(actionId, calls.get(actionId) + 1));
  }
  dom.window.Shortcuts.init();

  for (const [actionId, shortcut] of Object.entries(shortcuts)) {
    const event = dispatch(dom, shortcut);
    assert.equal(event.defaultPrevented, true, `${actionId} preventDefault yapmadı`);
    assert.equal(calls.get(actionId), 1, `${actionId} handlerı çağrılmadı`);
  }
});

test('Ctrl+Shift+B kalın biçimlendirme alternatifidir', () => {
  const dom = loadShortcuts();
  let calls = 0;
  dom.window.Shortcuts.registerHandler('bold', () => { calls += 1; });
  dom.window.Shortcuts.init();

  const event = dispatch(dom, { key: 'B', code: 'KeyB', ctrl: true, shift: true, alt: false });

  assert.equal(event.defaultPrevented, true);
  assert.equal(calls, 1);
});

test('kalın aliası başka birincil kısayolun önüne geçmez', () => {
  const dom = loadShortcuts();
  let boldCalls = 0;
  let italicCalls = 0;
  dom.window.Shortcuts.registerHandler('bold', () => { boldCalls += 1; });
  dom.window.Shortcuts.registerHandler('italic', () => { italicCalls += 1; });
  dom.window.Shortcuts.init();

  const shortcuts = dom.window.Shortcuts.getShortcuts();
  shortcuts.italic.key = 'b';
  shortcuts.italic.ctrl = true;
  shortcuts.italic.shift = true;
  shortcuts.italic.alt = false;
  dispatch(dom, { key: 'B', code: 'KeyB', ctrl: true, shift: true, alt: false });

  assert.equal(boldCalls, 0);
  assert.equal(italicCalls, 1);
});

test('Shift ile değişen noktalama tuşu kısayolları fiziksel tuş koduyla eşleşir', () => {
  const dom = loadShortcuts();
  let calls = 0;
  dom.window.Shortcuts.registerHandler('horizontalRule', () => { calls += 1; });
  dom.window.Shortcuts.init();

  const event = dispatch(dom, {
    key: '_', code: 'Minus', ctrl: true, shift: true, alt: false,
  });

  assert.equal(event.defaultPrevented, true);
  assert.equal(calls, 1);
});

test('format çubuğundaki kısayollar Ayarlar listesinde düzenlenebilir ve başlık güncellenir', () => {
  const dom = loadShortcuts();
  dom.window.document.body.innerHTML = `
    <button class="fmt-btn" data-action="bold" data-i18n-title="format.boldTitle"></button>
    <button class="fmt-btn" data-action="table" data-i18n-title="format.tableTitle"></button>
  `;
  dom.window.I18n = { t: (key) => ({
    'format.boldTitle': 'Kalın (Ctrl+B)',
    'format.tableTitle': 'Tablo (Ctrl+Shift+T)',
  }[key] || key) };
  const container = dom.window.document.createElement('div');
  dom.window.document.body.appendChild(container);
  dom.window.Shortcuts.init();
  dom.window.Shortcuts.renderShortcutsList(container);

  const shortcuts = dom.window.Shortcuts.getShortcuts();
  const toolbarActions = [...fs.readFileSync(require.resolve('../index.html'), 'utf8').matchAll(/class="fmt-btn" data-action="([^"]+)"/g)]
    .map((match) => match[1]);
  assert.ok(toolbarActions.length > 0);
  assert.ok(toolbarActions.every((actionId) => shortcuts[actionId]), 'format çubuğunda ayarsız aksiyon var');
  assert.equal(container.querySelectorAll('.shortcut-item').length, Object.keys(shortcuts).length);
  assert.equal(dom.window.document.querySelector('[data-action="bold"]').title, 'Kalın (Ctrl+B)');

  shortcuts.bold.key = 'j';
  shortcuts.bold.shift = true;
  dom.window.Shortcuts.updateToolbarTitles();
  assert.equal(dom.window.document.querySelector('[data-action="bold"]').title, 'Kalın (Ctrl+Shift+J)');
});

test('her varsayılan kısayolun uygulamada bir handlerı vardır', () => {
  const dom = loadShortcuts();
  const appSource = fs.readFileSync(require.resolve('../js/app.js'), 'utf8');
  const registered = new Set(
    [...appSource.matchAll(/registerHandler\('([^']+)'/g)].map((match) => match[1]),
  );

  for (const actionId of Object.keys(dom.window.Shortcuts.getShortcuts())) {
    assert.ok(registered.has(actionId), `${actionId} için app.js'te handler kaydı yok`);
  }
});

test('Ctrl+H bul ve değiştir aksiyonuna bağlıdır', () => {
  const dom = loadShortcuts();
  let calls = 0;
  dom.window.Shortcuts.registerHandler('replace', () => { calls += 1; });
  dom.window.Shortcuts.init();

  const event = dispatch(dom, { key: 'h', code: 'KeyH', ctrl: true, shift: false, alt: false });

  assert.equal(event.defaultPrevented, true);
  assert.equal(calls, 1);
});
