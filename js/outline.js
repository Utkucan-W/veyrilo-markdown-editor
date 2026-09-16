/* Belge başlıklarından canlı içindekiler paneli. */
window.Outline = (function () {
  'use strict';

  let pane;
  let list;
  let count;
  let toggleButton;
  let headings = [];
  let visible = false;

  function t(key, fallback) {
    const value = window.I18n?.t?.(key);
    return value && value !== key ? value : fallback;
  }

  function parseHeadings(markdown) {
    const result = [];
    let offset = 0;
    let inFence = false;

    String(markdown || '').split('\n').forEach((line, lineIndex, lines) => {
      const fence = /^ {0,3}(`{3,}|~{3,})/.test(line);
      if (fence) {
        inFence = !inFence;
      } else if (!inFence) {
        const match = /^( {0,3})(#{1,6})\s+(.+?)\s*$/.exec(line);
        if (match) {
          result.push({
            level: match[2].length,
            title: match[3].replace(/\s+#+\s*$/, '').trim(),
            line: lineIndex,
            offset,
          });
        }
      }
      offset += line.length + (lineIndex < lines.length - 1 ? 1 : 0);
    });

    return result;
  }

  function render() {
    if (!list) return;
    list.replaceChildren();
    count.textContent = headings.length ? String(headings.length) : '';

    if (!headings.length) {
      const empty = document.createElement('p');
      empty.className = 'outline-empty';
      empty.textContent = t('outline.empty', 'Bu belgede başlık yok');
      list.appendChild(empty);
      return;
    }

    headings.forEach((heading) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'outline-item';
      button.dataset.level = String(heading.level);
      button.style.setProperty('--outline-indent', `${(heading.level - 1) * 12}px`);
      button.textContent = heading.title;
      button.title = heading.title;
      button.addEventListener('click', () => jumpToHeading(heading));
      list.appendChild(button);
    });
  }

  function jumpToHeading(heading) {
    const editor = window.Editor?.getElement?.();
    if (!editor) return;
    editor.focus();
    editor.setSelectionRange(heading.offset, heading.offset + heading.title.length);
    const lineHeight = Number.parseFloat(window.getComputedStyle?.(editor)?.lineHeight) || 24;
    editor.scrollTop = Math.max(0, heading.line * lineHeight - editor.clientHeight / 3);
  }

  function init() {
    pane = document.getElementById('outline-pane');
    list = document.getElementById('outline-list');
    count = document.getElementById('outline-count');
    toggleButton = document.getElementById('btn-outline');
    toggleButton?.addEventListener('click', toggle);
    update(window.Editor?.getContent?.() || '');
  }

  function update(markdown) {
    headings = parseHeadings(markdown);
    if (visible) render();
  }

  function toggle() {
    visible = !visible;
    pane?.classList.toggle('hidden', !visible);
    toggleButton?.classList.toggle('active', visible);
    toggleButton?.setAttribute('aria-pressed', String(visible));
    if (visible) render();
    return visible;
  }

  return { init, update, toggle, isVisible: () => visible, parseHeadings };
})();
