const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');

function loadBrowserModule(dom, file) {
  const source = fs.readFileSync(file, 'utf8');
  vm.runInContext(source, dom.getInternalVMContext(), { filename: file });
}

test('popüler yeni fontlar seçildiğinde editöre uygulanır', () => {
  const dom = new JSDOM(
    '<body><select id="font-family-select">' +
      '<option value="arial">Arial</option>' +
      '<option value="timesNewRoman">Times New Roman</option>' +
    '</select></body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  loadBrowserModule(dom, require.resolve('../js/settings.js'));
  dom.window.Settings.init();

  const select = dom.window.document.getElementById('font-family-select');
  select.value = 'timesNewRoman';
  select.dispatchEvent(new dom.window.Event('change', { bubbles: true }));

  assert.match(dom.window.document.documentElement.style.getPropertyValue('--editor-font-family'), /Times New Roman/);
  assert.equal(dom.window.Settings.getSettings().fontFamily, 'timesNewRoman');
});
