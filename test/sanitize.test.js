const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');
const { marked } = require('marked');
const { sanitizeHtml } = require('../js/sanitize');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

test('Markdown kaynaklı aktif HTML, olay öznitelikleri ve tehlikeli URLleri siler', () => {
  const result = sanitizeHtml(
    '<img src=x onerror="alert(1)"><script>alert(1)</script><a href="javascript:alert(1)">x</a><svg onload="alert(1)"></svg>',
    DOMPurify,
  );

  assert.equal(result.includes('onerror'), false);
  assert.equal(result.includes('<script'), false);
  assert.equal(result.includes('javascript:'), false);
  assert.equal(result.includes('<svg'), false);
});

test('marked ham HTML kabul etse bile güvenli çıktı üretir', () => {
  const rendered = marked.parse('# Başlık\n\n<img src=x onerror="alert(1)">');
  const result = sanitizeHtml(rendered, DOMPurify);

  assert.match(result, /<h1>Başlık<\/h1>/);
  assert.equal(result.includes('onerror'), false);
});

test('normal Markdown HTML çıktısını korur', () => {
  const result = sanitizeHtml('<h1>Başlık</h1><p><a href="https://example.com">Bağlantı</a></p><pre><code>kod</code></pre>', DOMPurify);

  assert.match(result, /<h1>Başlık<\/h1>/);
  assert.match(result, /href="https:\/\/example\.com"/);
  assert.match(result, /<pre><code>kod<\/code><\/pre>/);
});
