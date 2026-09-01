/* ═══════════════════════════════════
   Preview Module
   Markdown → HTML canlı önizleme
   ═══════════════════════════════════ */

window.Preview = (function () {
  'use strict';

  let previewPane, previewContent, editorPane;
  let isVisible = false;
  let updateTimer = null;
  let scrollAnchors = [];
  const DEBOUNCE_DELAY = 150;

  function init() {
    previewPane = document.getElementById('preview-pane');
    previewContent = document.getElementById('preview');
    editorPane = document.getElementById('editor-pane');

    // marked.js ayarları
    if (typeof marked !== 'undefined') {
      try {
        const options = {
          breaks: true,
          gfm: true,
          headerIds: false,
          mangle: false,
        };
        if (marked.use) {
          marked.use(options);
          marked.use({
            renderer: {
              code(token) {
                const code = token.text || '';
                const language = String(token.lang || '').trim().split(/\s+/)[0];
                let rendered = escapeHtml(code);

                if (typeof hljs !== 'undefined') {
                  try {
                    if (language && hljs.getLanguage?.(language)) {
                      rendered = hljs.highlight(code, { language }).value;
                    }
                  } catch (e) {
                    rendered = escapeHtml(code);
                  }
                }

                const className = [
                  'hljs',
                  language ? `language-${escapeHtml(language)}` : '',
                ].filter(Boolean).join(' ');
                return `<pre><code class="${className}">${rendered}</code></pre>\n`;
              },
              link(token) {
                const href = token.href || '';
                const text = token.tokens
                  ? this.parser.parseInline(token.tokens)
                  : escapeHtml(token.text || '');
                const title = token.title
                  ? ` title="${escapeHtml(token.title)}"`
                  : '';
                const isExternal = /^https?:\/\//i.test(href);
                const className = isExternal ? ' class="ext-link"' : '';
                return `<a href="${escapeHtml(href)}"${title}${className}>${text}</a>`;
              },
            },
            extensions: [{
                name: 'highlight',
                level: 'inline',
                start: (source) => {
                  const index = source.indexOf('==');
                  return index === -1 ? undefined : index;
                },
                tokenizer(source) {
                  const match = /^==([^=\n]+)==/.exec(source);
                  if (!match) return;
                  return {
                    type: 'highlight',
                    raw: match[0],
                    text: match[1],
                    tokens: this.lexer.inlineTokens(match[1]),
                  };
                },
                renderer(token) {
                  return `<mark>${this.parser.parseInline(token.tokens)}</mark>`;
                },
              }],
          });
        } else if (marked.setOptions) {
          marked.setOptions(options);
        }
      } catch (e) {
        console.warn('marked.js config error:', e);
      }
    }
  }

  // ─── Önizlemeyi güncelle (debounced) ───
  function update(markdown) {
    if (!isVisible) return;

    clearTimeout(updateTimer);
    updateTimer = setTimeout(() => {
      renderMarkdown(markdown);
    }, DEBOUNCE_DELAY);
  }

  // ─── Markdown → HTML render ───
  function renderToSafeHtml(markdown) {
    let html = '';
    if (typeof marked !== 'undefined') {
      html = marked.parse(markdown || '');
    } else {
      html = basicMarkdown(markdown || '');
    }

    // Markdown'daki ham HTML güvenilir değildir. SVG/MathML de kapatılarak
    // yalnızca normal HTML profili korunur.
    return window.MarkdownSanitizer.sanitizeHtml(html);
  }

  function renderMarkdown(markdown) {
    if (!previewContent) return;

    try {
      previewContent.innerHTML = renderToSafeHtml(markdown);
      buildScrollAnchors(markdown);
      const editor = window.Editor?.getElement?.();
      if (editor && isVisible) syncScroll(editor);
    } catch (e) {
      console.error('Markdown render hatası:', e);
      previewContent.innerHTML = '<p style="color:red">Render hatası</p>';
      scrollAnchors = [];
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  // ─── Basit fallback markdown (marked.js yüklenemezse) ───
  function basicMarkdown(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  }

  // ─── Önizlemeyi aç/kapat ───
  function toggle() {
    const editor = window.Editor?.getElement?.();
    const editorScrollRatio = !isVisible && editor ? getScrollRatio(editor) : null;
    isVisible = !isVisible;

    if (isVisible) {
      previewPane.classList.remove('hidden');
      document.body.classList.add('preview-active');
      // İlk açılışta render et
      if (window.Editor) {
        renderMarkdown(window.Editor.getContent());
      }
      if (editor) syncScroll(editor, editorScrollRatio);
    } else {
      previewPane.classList.add('hidden');
      document.body.classList.remove('preview-active');
    }

    // Buton durumu güncelle
    const btn = document.getElementById('btn-preview');
    if (btn) btn.classList.toggle('active', isVisible);

    return isVisible;
  }

  // Belirli bir belgeyi açarken önizlemeyi kesin olarak görünür yap.
  function show() {
    if (!isVisible) toggle();
    return isVisible;
  }

  // ─── Scroll senkronizasyonu ───
  function getScrollRatio(editor) {
    const maxScroll = Math.max(0, editor.scrollHeight - editor.clientHeight);
    if (!maxScroll) return 0;
    return Math.min(1, Math.max(0, editor.scrollTop / maxScroll));
  }

  // Kaynak blokları ile HTML önizlemesinin üst düzey bloklarını eşleştirir.
  // Toplam yükseklik oranı, başlık/paragraf/kod bloğu gibi farklı yüksekliklerde
  // içeriklerde zamanla kaydığı için gerçek blok konumları tercih edilir.
  function getMarkdownBlockStarts(markdown) {
    const lines = String(markdown || '').split('\n');
    const starts = [];
    let inFence = false;

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      const fence = /^( {0,3})(`{3,}|~{3,})/.test(line);
      if (fence) {
        if (!inFence) starts.push(index);
        inFence = !inFence;
        return;
      }
      if (!inFence && trimmed && (index === 0 || !lines[index - 1].trim())) {
        starts.push(index);
      }
    });

    return starts;
  }

  function buildScrollAnchors(markdown) {
    if (!previewContent) {
      scrollAnchors = [];
      return;
    }

    const blockStarts = getMarkdownBlockStarts(markdown);
    const children = Array.from(previewContent.children);
    const editor = window.Editor?.getElement?.();
    const lineCount = Math.max(1, String(markdown || '').split('\n').length);
    const sourceHeight = Math.max(
      editor?.scrollHeight || 0,
      editor?.clientHeight || 0,
    );
    const sourceLineHeight = sourceHeight / lineCount;
    const previewTop = previewContent.offsetTop || 0;
    const count = Math.min(blockStarts.length, children.length);

    if (blockStarts.length !== children.length || count < 2) {
      scrollAnchors = [];
      return;
    }

    scrollAnchors = Array.from({ length: count }, (_, index) => ({
      source: blockStarts[index] * sourceLineHeight,
      preview: previewTop + children[index].offsetTop,
    }));
  }

  function getAnchoredScrollTop(editor) {
    if (scrollAnchors.length < 2) return null;

    const sourcePosition = editor.scrollTop;
    let previous = scrollAnchors[0];
    let next = scrollAnchors[scrollAnchors.length - 1];

    for (let index = 1; index < scrollAnchors.length; index += 1) {
      if (scrollAnchors[index].source >= sourcePosition) {
        next = scrollAnchors[index];
        previous = scrollAnchors[index - 1];
        break;
      }
    }

    const span = next.source - previous.source;
    const progress = span > 0
      ? (sourcePosition - previous.source) / span
      : 0;
    const sourceOffset = previous.preview - previous.source;
    const nextOffset = next.preview - next.source;
    return sourcePosition + sourceOffset + (nextOffset - sourceOffset) * Math.min(1, Math.max(0, progress));
  }

  function syncScroll(editor, ratio = getScrollRatio(editor)) {
    if (!isVisible || !previewPane) return;

    const previewMaxScroll = Math.max(0, previewPane.scrollHeight - previewPane.clientHeight);
    const anchoredScrollTop = getAnchoredScrollTop(editor);
    previewPane.scrollTop = anchoredScrollTop === null
      ? Math.min(1, Math.max(0, ratio)) * previewMaxScroll
      : Math.min(previewMaxScroll, Math.max(0, anchoredScrollTop));
  }

  // ─── Durumu getir ───
  function getVisible() {
    return isVisible;
  }

  return {
    init,
    update,
    toggle,
    show,
    syncScroll,
    getVisible,
    renderToSafeHtml,
  };
})();
