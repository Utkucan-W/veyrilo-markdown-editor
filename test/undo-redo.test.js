const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');

test('Ctrl+Z ve Ctrl+Y kısayolları editör geçmişini çağırır', () => {
  const dom = new JSDOM('<body></body>', {
    runScripts: 'outside-only',
    url: 'https://veyrilo.test',
  });
  dom.window.structuredClone = structuredClone;
  const source = fs.readFileSync(require.resolve('../js/shortcuts.js'), 'utf8');
  vm.runInContext(source, dom.getInternalVMContext());

  let undoCount = 0;
  let redoCount = 0;
  dom.window.Shortcuts.registerHandler('undo', () => { undoCount += 1; });
  dom.window.Shortcuts.registerHandler('redo', () => { redoCount += 1; });
  dom.window.Shortcuts.init();

  dom.window.document.dispatchEvent(new dom.window.KeyboardEvent('keydown', {
    key: 'z', ctrlKey: true, bubbles: true, cancelable: true,
  }));
  dom.window.document.dispatchEvent(new dom.window.KeyboardEvent('keydown', {
    key: 'y', ctrlKey: true, bubbles: true, cancelable: true,
  }));

  assert.equal(undoCount, 1);
  assert.equal(redoCount, 1);
});
