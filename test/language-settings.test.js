const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');

function loadBrowserModule(dom, file) {
  const source = fs.readFileSync(file, 'utf8');
  vm.runInContext(source, dom.getInternalVMContext(), { filename: file });
}

test('dil seçimi ayarlar paneli yeniden açıldığında korunur', () => {
  const dom = new JSDOM(
    '<body><aside id="settings-panel" class="hidden"></aside>' +
      '<div id="settings-overlay" class="hidden"></div>' +
      '<select id="lang-select"><option value="tr">Türkçe</option><option value="en">English</option></select>' +
      '</body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  dom.window.requestAnimationFrame = (callback) => callback();

  loadBrowserModule(dom, require.resolve('../js/i18n.js'));
  loadBrowserModule(dom, require.resolve('../js/settings.js'));
  dom.window.I18n.init();
  dom.window.Settings.init();

  const languageSelect = dom.window.document.getElementById('lang-select');
  languageSelect.value = 'en';
  languageSelect.dispatchEvent(new dom.window.Event('change', { bubbles: true }));

  dom.window.Settings.openPanel();

  assert.equal(dom.window.I18n.getCurrentLang(), 'en');
  assert.equal(languageSelect.value, 'en');
  assert.equal(JSON.parse(dom.window.localStorage.getItem('veyrilo_settings')).language, 'en');
});

test('varsayılan karşılama metni varsayılan içerik olarak tanınır', () => {
  const dom = new JSDOM('<body></body>', {
    runScripts: 'outside-only',
    url: 'https://veyrilo.test',
  });
  loadBrowserModule(dom, require.resolve('../js/i18n.js'));

  const trWelcome = dom.window.I18n.t('welcome');

  assert.equal(dom.window.I18n.isWelcomeContent(trWelcome), true);
  assert.equal(dom.window.I18n.isWelcomeContent('# Kendi belgem'), false);
});

test('Markdown rehberi seçilen dilde kapsamlı örnekleri döndürür', () => {
  const dom = new JSDOM('<body></body>', { runScripts: 'outside-only' });
  loadBrowserModule(dom, require.resolve('../js/markdown-guide.js'));

  const turkishGuide = dom.window.MarkdownGuide.get('tr');
  const englishGuide = dom.window.MarkdownGuide.get('en');

  assert.match(turkishGuide.intro, /kısayol ve kullanım/);
  assert.equal(turkishGuide.sections.length, 18);
  assert.equal(turkishGuide.sections[6].source, '- [x] Tamamlandı\n- [ ] Bekliyor');
  assert.match(englishGuide.intro, /shortcut and usage/);
  assert.equal(englishGuide.sections.length, 18);
  assert.equal(englishGuide.sections[6].source, '- [x] Completed\n- [ ] Pending');
});

test('Markdown rehberi her örneği kaynak ve önizleme kartı olarak oluşturur', () => {
  const dom = new JSDOM('<body><main id="guide-content"></main></body>', {
    runScripts: 'outside-only',
    url: 'https://veyrilo.test',
  });
  dom.window.Preview = { renderToSafeHtml: (source) => `<p>${source}</p>` };
  dom.window.Shortcuts = { getComboString: (actionId) => actionId === 'bold' ? 'Ctrl+Alt+B' : actionId };
  loadBrowserModule(dom, require.resolve('../js/markdown-guide.js'));

  const container = dom.window.document.getElementById('guide-content');
  dom.window.MarkdownGuide.render('en', container);

  assert.equal(container.querySelectorAll('.guide-card').length, 18);
  assert.equal(container.querySelectorAll('.guide-explanation pre').length, 18);
  assert.equal(container.querySelectorAll('.guide-rendered').length, 18);
  assert.match(container.textContent, /Shortcut: h1/);
  assert.match(container.textContent, /Shortcut: Ctrl\+Alt\+B/);
  assert.match(container.textContent, /Live preview/);
});
