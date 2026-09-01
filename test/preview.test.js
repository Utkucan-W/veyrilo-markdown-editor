const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');
const { marked } = require('marked');
const createDOMPurify = require('dompurify');

test('önizleme rehberdeki vurgulama, kod ve tablo örneklerini render eder', () => {
  const dom = new JSDOM('<body><div id="preview-pane"></div><article id="preview"></article><textarea id="editor"></textarea></body>', {
    runScripts: 'outside-only',
    url: 'https://veyrilo.test',
  });
  const DOMPurify = createDOMPurify(dom.window);
  dom.window.marked = marked;
  dom.window.hljs = {
    getLanguage: () => true,
    highlight: () => ({ value: '<span class="hljs-keyword">const</span> ok' }),
  };
  dom.window.MarkdownSanitizer = {
    sanitizeHtml: (html) => DOMPurify.sanitize(html),
  };
  vm.runInContext(fs.readFileSync(require.resolve('../js/preview.js'), 'utf8'), dom.getInternalVMContext());
  dom.window.Preview.init();

  const html = dom.window.Preview.renderToSafeHtml(
    '==Vurgulu==\n\n~~~javascript\nconst ok = true;\n~~~\n\n| A | B |\n| --- | --- |\n| 1 | 2 |',
  );

  assert.match(html, /<mark>Vurgulu<\/mark>/);
  assert.match(html, /<pre><code class="hljs language-javascript"><span class="hljs-keyword">const<\/span>/);
  assert.match(html, /<table>/);
  assert.match(dom.window.Preview.renderToSafeHtml('[Site](https:\/\/example.com)'), /class="ext-link"/);
});

test('sözdizimi renkleri karanlık temada görünmez sabit renklere düşmez', () => {
  const css = fs.readFileSync(require.resolve('../css/style.css'), 'utf8');

  assert.match(css, /\.hljs-meta[\s\S]*color: var\(--code-meta\) !important/);
  assert.match(css, /\.hljs-subst[\s\S]*color: var\(--text-primary\) !important/);
  assert.match(css, /\.hljs-string[\s\S]*color: var\(--code-string\) !important/);
  assert.match(css, /--code-string: color-mix\(/);
});

test('dil etiketi olmayan kod bloğu otomatik sözdizimi renklendirmesi yapmaz', () => {
  const dom = new JSDOM('<body><div id="preview-pane"></div><article id="preview"></article><textarea id="editor"></textarea></body>', {
    runScripts: 'outside-only',
    url: 'https://veyrilo.test',
  });
  const DOMPurify = createDOMPurify(dom.window);
  let autoHighlightCalls = 0;
  dom.window.marked = marked;
  dom.window.hljs = {
    getLanguage: () => false,
    highlightAuto: () => {
      autoHighlightCalls += 1;
      return { value: '<span class="hljs-bullet">-</span>' };
    },
  };
  dom.window.MarkdownSanitizer = {
    sanitizeHtml: (html) => DOMPurify.sanitize(html),
  };
  vm.runInContext(fs.readFileSync(require.resolve('../js/preview.js'), 'utf8'), dom.getInternalVMContext());
  dom.window.Preview.init();

  const html = dom.window.Preview.renderToSafeHtml('```\n- IMEI tam hali\n- IMSI\n- SIM ICCID\n```');

  assert.equal(autoHighlightCalls, 0);
  assert.match(html, /<pre><code class="hljs">- IMEI tam hali\n- IMSI\n- SIM ICCID<\/code><\/pre>/);
  assert.doesNotMatch(html, /hljs-bullet/);
});

test('önizleme açılırken editörün mevcut kaydırma oranını korur', () => {
  const dom = new JSDOM(
    '<body><div id="preview-pane" class="hidden"><article id="preview"></article></div>' +
      '<textarea id="editor"></textarea></body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  const DOMPurify = createDOMPurify(dom.window);
  dom.window.marked = marked;
  dom.window.MarkdownSanitizer = {
    sanitizeHtml: (html) => DOMPurify.sanitize(html),
  };
  const editor = dom.window.document.getElementById('editor');
  const previewPane = dom.window.document.getElementById('preview-pane');
  Object.defineProperties(editor, {
    scrollTop: { configurable: true, writable: true, value: 450 },
    scrollHeight: { configurable: true, value: 1800 },
    clientHeight: { configurable: true, value: 300 },
  });
  Object.defineProperties(previewPane, {
    scrollTop: { configurable: true, writable: true, value: 0 },
    scrollHeight: { configurable: true, value: 2200 },
    clientHeight: { configurable: true, value: 500 },
  });
  dom.window.Editor = {
    getElement: () => editor,
    getContent: () => '# Veyrilo',
  };
  vm.runInContext(fs.readFileSync(require.resolve('../js/preview.js'), 'utf8'), dom.getInternalVMContext());
  dom.window.Preview.init();
  dom.window.Preview.toggle();

  assert.equal(previewPane.scrollTop, 450 / 1500 * 1700);
});

test('yan yana kaydırmada farklı Markdown blok yüksekliklerini hesaba katar', () => {
  const dom = new JSDOM(
    '<body><div id="preview-pane"><article id="preview"></article></div>' +
      '<textarea id="editor"></textarea></body>',
    { runScripts: 'outside-only', url: 'https://veyrilo.test' },
  );
  dom.window.marked = marked;
  dom.window.MarkdownSanitizer = { sanitizeHtml: (html) => html };
  const editor = dom.window.document.getElementById('editor');
  const previewPane = dom.window.document.getElementById('preview-pane');
  editor.value = '# Birinci\n\nİçerik\n\n## İkinci\n\nDaha uzun önizleme içeriği';
  Object.defineProperties(editor, {
    scrollTop: { configurable: true, writable: true, value: 100 },
    scrollHeight: { configurable: true, value: 600 },
    clientHeight: { configurable: true, value: 300 },
  });
  Object.defineProperties(previewPane, {
    scrollTop: { configurable: true, writable: true, value: 0 },
    scrollHeight: { configurable: true, value: 1000 },
    clientHeight: { configurable: true, value: 300 },
  });
  const preview = dom.window.document.getElementById('preview');
  Object.defineProperty(preview, 'offsetTop', { configurable: true, value: 40 });
  Object.defineProperty(dom.window.HTMLElement.prototype, 'offsetTop', {
    configurable: true,
    get() {
      if (this.parentElement?.id !== 'preview') return 0;
      return this.tagName === 'H1' ? 0 : this.tagName === 'P' ? 180 : 420;
    },
  });
  dom.window.Editor = { getElement: () => editor, getContent: () => editor.value };
  vm.runInContext(fs.readFileSync(require.resolve('../js/preview.js'), 'utf8'), dom.getInternalVMContext());
  dom.window.Preview.init();
  dom.window.Preview.show();

  editor.scrollTop = 100;
  dom.window.Preview.syncScroll(editor);

  assert.equal(previewPane.scrollTop, 145);
});
