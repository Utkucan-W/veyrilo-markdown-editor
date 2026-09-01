const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');

function loadBrowserModule(dom, file) {
  const source = fs.readFileSync(file, 'utf8');
  vm.runInContext(source, dom.getInternalVMContext(), { filename: file });
}

const PROFILE_URL = 'https://github.com/Utkucan-W';
const REPOSITORY_URL = 'https://github.com/Utkucan-W/veyrilo-markdown-editor';

function aboutMarkup() {
  const html = fs.readFileSync(require.resolve('../index.html'), 'utf8');
  const start = html.indexOf('<div id="about-modal"');
  const end = html.indexOf('</div>', html.indexOf('modal-footer'));
  assert.ok(start > -1, 'about-modal bulunamadı');
  return html.substring(start, end);
}

test('Hakkında bölümü geliştirici ve depo bağlantılarını taşır', () => {
  const dom = new JSDOM(`<body>${aboutMarkup()}</body>`, { url: 'https://veyrilo.test' });
  const developer = dom.window.document.getElementById('about-developer-link');
  const repository = dom.window.document.getElementById('about-repository-link');

  assert.equal(developer.getAttribute('href'), PROFILE_URL);
  assert.equal(repository.getAttribute('href'), REPOSITORY_URL);
  // Dış bağlantı yakalayıcısı yalnızca a.ext-link öğelerini işler.
  assert.ok(developer.classList.contains('ext-link'));
  assert.ok(repository.classList.contains('ext-link'));
});

test('Hakkında bağlantılarına tıklamak masaüstü tarayıcı köprüsünü çağırır', async () => {
  const dom = new JSDOM(
    `<body>${aboutMarkup()}<div id="about-overlay"></div></body>`,
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  const opened = [];
  dom.window.desktopAPI = { openExternal: (url) => opened.push(url) };
  loadBrowserModule(dom, require.resolve('../js/app.js'));
  // app.js kendini DOMContentLoaded üzerinden başlatır; dinleyiciler o turdan
  // sonra bağlanır.
  await new Promise((resolve) => setTimeout(resolve, 0));

  dom.window.document.getElementById('about-developer-link').click();
  dom.window.document.getElementById('about-repository-link').click();

  assert.deepEqual(opened, [PROFILE_URL, REPOSITORY_URL]);
});

test('Hakkında metinleri iki dilde de bağlantı etiketlerini tanımlar', () => {
  const dom = new JSDOM('<body></body>', { runScripts: 'outside-only', url: 'https://veyrilo.test' });
  loadBrowserModule(dom, require.resolve('../js/i18n.js'));

  for (const language of ['tr', 'en']) {
    dom.window.I18n.setLanguage(language);
    for (const key of ['about.title', 'about.desc', 'about.developerLabel', 'about.repositoryLabel', 'about.contribute']) {
      const value = dom.window.I18n.t(key);
      assert.ok(value && value !== key, `${language}/${key} çevirisi eksik`);
    }
    // Bağlantı adresleri artık işaretlemede; çeviri metinlerinde gömülü URL kalmamalı.
    assert.ok(!dom.window.I18n.t('about.desc').includes('href='), `${language} about.desc içinde gömülü bağlantı var`);
    assert.ok(!dom.window.I18n.t('about.contribute').includes('href='), `${language} about.contribute içinde gömülü bağlantı var`);
  }
});
