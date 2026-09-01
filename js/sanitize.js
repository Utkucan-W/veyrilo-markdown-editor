/* Markdown HTML temizleme politikası — önizleme ve dışa aktarmanın ortak sınırı. */
(function (root) {
  'use strict';

  function sanitizeHtml(html, purifier) {
    const domPurify = purifier || root.DOMPurify;
    if (!domPurify) throw new Error('DOMPurify yüklenemedi');

    return domPurify.sanitize(html, {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ['form', 'iframe', 'object', 'embed', 'style'],
    });
  }

  const api = { sanitizeHtml };
  root.MarkdownSanitizer = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
