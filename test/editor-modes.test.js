const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');

function loadBrowserModule(dom, file) {
  const source = fs.readFileSync(file, 'utf8');
  vm.runInContext(source, dom.getInternalVMContext(), { filename: file });
}

test('Odak modu aktif paragrafı koruyup diğer paragrafları soldurur', () => {
  const dom = new JSDOM(
    '<body><div id="editor-shell">' +
      '<pre id="editor-focus-overlay" class="hidden"></pre>' +
      '<textarea id="editor"></textarea>' +
    '</div></body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  dom.window.Stats = { update() {}, updateCursorPosition() {} };
  dom.window.Preview = { update() {} };
  loadBrowserModule(dom, require.resolve('../js/editor.js'));
  dom.window.Editor.init();

  const editor = dom.window.document.getElementById('editor');
  Object.defineProperties(editor, {
    clientWidth: { configurable: true, value: 480 },
    clientHeight: { configurable: true, value: 320 },
  });
  editor.value = 'Birinci paragraf.\n\nİkinci paragraf.\n\nÜçüncü paragraf.';
  editor.setSelectionRange(2, 2);
  dom.window.Editor.toggleFocusMode();

  const overlay = dom.window.document.getElementById('editor-focus-overlay');
  assert.equal(dom.window.document.body.classList.contains('focus-mode'), true);
  assert.equal(overlay.classList.contains('hidden'), false);
  assert.equal(overlay.querySelectorAll('.focus-mask').length, 1);

  editor.setSelectionRange(editor.value.indexOf('İkinci'), editor.value.indexOf('İkinci'));
  editor.dispatchEvent(new dom.window.Event('keyup', { bubbles: true }));
  assert.equal(overlay.querySelectorAll('.focus-mask').length, 2);

  dom.window.Editor.toggleFocusMode();
  assert.equal(overlay.classList.contains('hidden'), true);
});

test('Odak katmanı textarea içerik ölçülerine hizalanır', () => {
  const dom = new JSDOM(
    '<body><div id="editor-shell">' +
      '<pre id="editor-focus-overlay" class="hidden"></pre>' +
      '<textarea id="editor"></textarea>' +
    '</div></body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  dom.window.Stats = { update() {}, updateCursorPosition() {} };
  dom.window.Preview = { update() {} };
  loadBrowserModule(dom, require.resolve('../js/editor.js'));
  dom.window.Editor.init();

  const editor = dom.window.document.getElementById('editor');
  Object.defineProperties(editor, {
    clientWidth: { configurable: true, value: 480 },
    clientHeight: { configurable: true, value: 320 },
  });
  editor.value = 'Birinci paragraf.\n\nİkinci paragraf.';
  editor.setSelectionRange(2, 2);
  dom.window.Editor.toggleFocusMode();

  const overlay = dom.window.document.getElementById('editor-focus-overlay');
  assert.equal(overlay.style.width, '480px');
  assert.equal(overlay.style.height, '320px');
});

test('Odak modu sabit sayıda maske kullanır ve büyük belgede ölçüm DOM’u oluşturmaz', () => {
  const dom = new JSDOM(
    '<body><div id="editor-shell">' +
      '<pre id="editor-focus-overlay" class="hidden"></pre>' +
      '<textarea id="editor"></textarea>' +
    '</div></body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  dom.window.Stats = { update() {}, updateCursorPosition() {} };
  dom.window.Preview = { update() {} };
  loadBrowserModule(dom, require.resolve('../js/editor.js'));
  dom.window.Editor.init();

  const editor = dom.window.document.getElementById('editor');
  Object.defineProperties(editor, {
    clientWidth: { configurable: true, value: 480 },
    clientHeight: { configurable: true, value: 200 },
    scrollTop: { configurable: true, value: 40 },
  });
  editor.value = 'Birinci paragraf.\n\nAktif paragraf.\n\nÜçüncü paragraf.';
  editor.setSelectionRange(editor.value.indexOf('Aktif'), editor.value.indexOf('Aktif'));
  dom.window.Editor.toggleFocusMode();

  const overlay = dom.window.document.getElementById('editor-focus-overlay');
  const masks = overlay.querySelectorAll('.focus-mask');
  assert.equal(overlay.textContent, '');
  assert.equal(masks.length, 2);
  assert.equal(dom.window.document.getElementById('editor-focus-measure'), null);
  assert.equal(masks[0].style.height, '20px');
  assert.equal(masks[1].style.top, '50px');
  assert.equal(masks[1].style.height, '150px');
});

test('Markdown kod blokları normal editörde belirgin koyu arka planla ayrılır', () => {
  const dom = new JSDOM(
    '<body><div id="editor-shell">' +
      '<div id="editor-code-background"></div>' +
      '<pre id="editor-code-overlay"></pre>' +
      '<pre id="editor-focus-overlay"></pre>' +
      '<textarea id="editor"></textarea>' +
    '</div></body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  dom.window.Stats = { update() {}, updateCursorPosition() {} };
  dom.window.Preview = { update() {} };
  dom.window.requestAnimationFrame = callback => { callback(); return 1; };
  dom.window.cancelAnimationFrame = () => {};
  dom.window.Element.prototype.getBoundingClientRect = function getBoundingClientRect() {
    return { top: this.id === 'editor-code-overlay' ? 10 : 0 };
  };
  dom.window.Element.prototype.getClientRects = function getClientRects() {
    const rowTops = { '```bash': 20, 'echo "Veyrilo"': 50, '```': 80 };
    const top = rowTops[this.textContent];
    return top ? [{ top, width: 120, height: 24 }] : [];
  };
  loadBrowserModule(dom, require.resolve('../js/editor.js'));
  dom.window.Editor.init();

  dom.window.Editor.setContent('Normal satır\n```bash\necho "Veyrilo"\n```\nSon satır');

  const codeLines = dom.window.document.querySelectorAll('#editor-code-overlay .in-code');
  assert.equal(codeLines.length, 3);
  assert.equal(codeLines[0].textContent, '```bash');
  assert.equal(codeLines[1].textContent, 'echo "Veyrilo"');
  assert.equal(codeLines[2].textContent, '```');
  assert.ok(dom.window.document.querySelector('#editor-code-background'));
  const backgroundRows = dom.window.document.querySelectorAll('.editor-code-background-row');
  assert.equal(backgroundRows.length, 3);
  assert.equal(backgroundRows[0].style.top, '10px');
  assert.equal(backgroundRows[0].style.height, '30px');
  assert.equal(backgroundRows[2].style.height, '24px');

  dom.window.Editor.setContent('Uzun ama kod bloğu içermeyen normal metin');
  assert.equal(dom.window.document.getElementById('editor-code-overlay').textContent, '');
  dom.window.Editor.setContent('Normal satır\n```bash\necho "Veyrilo"\nNormal satır');
  assert.equal(dom.window.document.querySelectorAll('#editor-code-overlay .in-code').length, 0);
});

test('Yazarken kod katmanı tam belgeyi her tuşta yeniden çizmez', () => {
  const dom = new JSDOM(
    '<body><div id="editor-shell">' +
      '<div id="editor-code-background"></div>' +
      '<pre id="editor-code-overlay"></pre>' +
      '<pre id="editor-focus-overlay"></pre>' +
      '<textarea id="editor"></textarea>' +
    '</div></body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  const scheduled = [];
  dom.window.Stats = { update() {}, updateCursorPosition() {} };
  dom.window.Preview = { update() {} };
  dom.window.setTimeout = callback => { scheduled.push(callback); return scheduled.length; };
  dom.window.clearTimeout = () => {};
  loadBrowserModule(dom, require.resolve('../js/editor.js'));
  dom.window.Editor.init();

  const editor = dom.window.document.getElementById('editor');
  editor.value = '```\necho hızlı yazım\n```';
  editor.dispatchEvent(new dom.window.Event('input', { bubbles: true }));

  assert.equal(dom.window.document.querySelectorAll('#editor-code-overlay .in-code').length, 0);
  scheduled.forEach(callback => callback());
  assert.equal(dom.window.document.querySelectorAll('#editor-code-overlay .in-code').length, 3);
});

test('Biçimlendirme kısayolu kaynak metni ve seçimi tek native textarea katmanında korur', () => {
  const dom = new JSDOM(
    '<body><div id="editor-shell">' +
      '<textarea id="editor"></textarea>' +
    '</div></body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  dom.window.Stats = { update() {}, updateCursorPosition() {} };
  dom.window.Preview = { update() {} };
  dom.window.structuredClone = value => JSON.parse(JSON.stringify(value));
  loadBrowserModule(dom, require.resolve('../js/editor.js'));
  dom.window.Editor.init();
  loadBrowserModule(dom, require.resolve('../js/shortcuts.js'));
  dom.window.Shortcuts.registerHandler('italic', () => dom.window.Editor.italic());
  dom.window.Shortcuts.init();

  const editor = dom.window.document.getElementById('editor');
  editor.value = 'metin';
  editor.setSelectionRange(0, editor.value.length);
  dom.window.document.dispatchEvent(new dom.window.KeyboardEvent('keydown', {
    key: 'i', code: 'KeyI', ctrlKey: true, bubbles: true, cancelable: true,
  }));

  assert.equal(editor.value, '*metin*');
  assert.equal(editor.selectionStart, 1);
  assert.equal(editor.selectionEnd, 6);
  assert.equal(dom.window.document.querySelector('#editor-markdown-decorations'), null);
  assert.equal(dom.window.document.body.classList.contains('markdown-decoration-active'), false);
});

test('Kod bloğu katmanı textarea metrikleriyle hizalanır', () => {
  const css = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');

  assert.match(css, /#editor-code-background,\s*\n#editor-code-overlay,\s*\n#editor-highlights\s*\{[\s\S]*?margin: 0;/);
  const baseCodeLineRule = css.match(/#editor-code-overlay \.editor-code-line\s*\{([^}]*)\}/)?.[1];
  assert.match(baseCodeLineRule, /box-decoration-break: clone/);
  assert.doesNotMatch(baseCodeLineRule, /display:|min-height:/);
  const codeRowRule = css.match(/\.editor-code-background-row\s*\{([^}]*)\}/)?.[1];
  assert.match(codeRowRule, /width: 100%/);
  assert.match(codeRowRule, /background: color-mix\(in srgb, var\(--bg-active\) 72%, var\(--bg-secondary\)\)/);
  assert.match(codeRowRule, /box-shadow: inset 3px 0 0/);
  assert.doesNotMatch(css, /markdown-decoration/);
  const editorRule = css.match(/#editor\s*\{([^}]*)\}/)?.[1];
  assert.match(editorRule, /color: var\(--text-primary\)/);
  assert.doesNotMatch(editorRule, /color:\s*transparent/);
  assert.match(fs.readFileSync(path.join(__dirname, '../js/editor.js'), 'utf8'), /getClientRects\(\)/);
  assert.doesNotMatch(codeRowRule, /border-left:/);
});

test('Odak modu native caret metnini koruyup pasif satırları maske bloklarıyla soldurur', () => {
  const css = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');
  const maskRule = css.match(/#editor-focus-overlay \.focus-mask\s*\{([^}]*)\}/)?.[1];
  const editorRule = css.match(/body\.focus-mode\.focus-overlay-active #editor\s*\{([^}]*)\}/)?.[1];

  assert.match(maskRule, /position: absolute/);
  assert.match(maskRule, /background: var\(--focus-overlay\)/);
  assert.match(editorRule, /color: var\(--text-primary\)/);
  assert.doesNotMatch(css, /editor-focus-measure/);
});

test('Zen modu arayüzü gizler ve tekrar kapatılabilir', () => {
  const dom = new JSDOM(
    '<body><div id="editor-shell"><pre id="editor-focus-overlay"></pre><textarea id="editor"></textarea></div>' +
      '<header id="toolbar"></header><nav id="workspace-tabs"></nav>' +
      '<div id="format-bar"></div><div id="find-bar"></div><footer id="status-bar"></footer></body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  dom.window.Stats = { update() {}, updateCursorPosition() {} };
  dom.window.Preview = { update() {} };
  loadBrowserModule(dom, require.resolve('../js/editor.js'));
  dom.window.Editor.init();

  dom.window.Editor.toggleZenMode();
  assert.equal(dom.window.document.body.classList.contains('zen-mode'), true);
  dom.window.Editor.toggleZenMode();
  assert.equal(dom.window.document.body.classList.contains('zen-mode'), false);
});

test('Ctrl+Z ve Ctrl+Y ile metin geçmişinde geri ve ileri gidilir', () => {
  const dom = new JSDOM(
    '<body><div id="editor-shell"><pre id="editor-focus-overlay"></pre><textarea id="editor"></textarea></div></body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  dom.window.Stats = { update() {}, updateCursorPosition() {} };
  dom.window.Preview = { update() {} };
  loadBrowserModule(dom, require.resolve('../js/editor.js'));
  dom.window.Editor.init();

  const editor = dom.window.document.getElementById('editor');
  editor.value = 'Bir';
  editor.setSelectionRange(3, 3);
  editor.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  editor.value = 'Bir belge';
  editor.setSelectionRange(9, 9);
  editor.dispatchEvent(new dom.window.Event('input', { bubbles: true }));

  assert.equal(dom.window.Editor.undo(), true);
  assert.equal(editor.value, 'Bir');
  assert.equal(dom.window.Editor.redo(), true);
  assert.equal(editor.value, 'Bir belge');
});
