/* ═══════════════════════════════════
   Search Module — Belge içinde arama
   ═══════════════════════════════════ */

window.Find = (function () {
  'use strict';

  let bar;
  let input;
  let count;
  let editor;
  let highlights;
  let replaceRow;
  let replaceInput;
  let replaceOneButton;
  let replaceAllButton;
  let replaceToggle;
  let matches = [];
  let currentIndex = -1;
  let openState = false;

  function t(key, fallback, variables) {
    let value = window.I18n?.t?.(key);
    if (!value || value === key) value = fallback;
    Object.entries(variables || {}).forEach(([name, replacement]) => {
      value = value.replaceAll(`{${name}}`, String(replacement));
    });
    return value;
  }

  function init() {
    bar = document.getElementById('find-bar');
    input = document.getElementById('find-input');
    count = document.getElementById('find-count');
    editor = window.Editor?.getElement();
    highlights = document.getElementById('editor-highlights');
    replaceRow = document.getElementById('find-replace-row');
    replaceInput = document.getElementById('find-replace-input');
    replaceOneButton = document.getElementById('find-replace-one');
    replaceAllButton = document.getElementById('find-replace-all');
    replaceToggle = document.getElementById('find-toggle-replace');
    if (!bar || !input || !count || !editor) return;

    input.addEventListener('input', () => refresh(true));
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        move(event.shiftKey ? -1 : 1);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    });
    document.getElementById('find-previous')?.addEventListener('click', () => move(-1));
    document.getElementById('find-next')?.addEventListener('click', () => move(1));
    document.getElementById('find-close')?.addEventListener('click', close);
    replaceToggle?.addEventListener('click', () => setReplaceVisible(!isReplaceVisible()));
    replaceOneButton?.addEventListener('click', replaceCurrent);
    replaceAllButton?.addEventListener('click', replaceAll);
    replaceInput?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (event.shiftKey) replaceAll();
        else replaceCurrent();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    });
    editor.addEventListener('input', () => {
      if (openState) refresh(true);
    });
    editor.addEventListener('scroll', syncHighlightScroll);
    window.addEventListener('resize', syncHighlightMetrics);
  }

  function open() {
    if (!bar || !input || !editor) return;

    if (window.App?.showWorkspace) window.App.showWorkspace('editor');
    openState = true;
    bar.classList.remove('hidden');

    if (!input.value && editor.selectionStart !== editor.selectionEnd) {
      input.value = editor.value.substring(editor.selectionStart, editor.selectionEnd);
    }

    refresh(true);
    input.focus();
    input.select();
  }

  // Ctrl+H: arama çubuğunu değiştirme satırı görünür durumda açar.
  function openWithReplace() {
    setReplaceVisible(true);
    open();
  }

  function isReplaceVisible() {
    return Boolean(replaceRow) && !replaceRow.classList.contains('hidden');
  }

  function setReplaceVisible(visible) {
    if (!replaceRow) return;
    replaceRow.classList.toggle('hidden', !visible);
    replaceToggle?.setAttribute('aria-expanded', String(visible));
    updateReplaceButtons();
  }

  function close() {
    if (!bar || !editor) return;
    openState = false;
    bar.classList.add('hidden');
    clearHighlights();
    editor.focus();
  }

  function refresh(selectFirst) {
    if (!input || !editor) return;
    matches = computeMatches();
    currentIndex = matches.length && selectFirst ? 0 : -1;
    updateCount();
    if (currentIndex >= 0) selectMatch(currentIndex);
    renderHighlights();
  }

  // Değiştirme sonrası aramayı yeniler ve imlecin bulunduğu konumdan sonraki
  // ilk eşleşmeyi seçer; sonrasında eşleşme kalmadıysa başa döner.
  function refreshFrom(position) {
    if (!input || !editor) return;
    matches = computeMatches();
    if (!matches.length) {
      currentIndex = -1;
    } else {
      const next = matches.findIndex((match) => match.start >= position);
      currentIndex = next === -1 ? 0 : next;
    }
    updateCount();
    if (currentIndex >= 0) selectMatch(currentIndex);
    renderHighlights();
  }

  function computeMatches() {
    const query = input.value;
    const text = editor.value;
    const found = [];
    if (!query) return found;

    const source = createSearchIndex(text);
    const needle = foldText(query);
    let fromIndex = 0;
    while (fromIndex <= source.value.length - needle.length) {
      const index = source.value.indexOf(needle, fromIndex);
      if (index === -1) break;
      const matchEnd = index + needle.length - 1;
      const start = source.starts[index];
      const end = source.ends[matchEnd];
      if (start === undefined || end === undefined) break;
      found.push({ start, end });
      fromIndex = index + Math.max(needle.length, 1);
    }
    return found;
  }

  // ─── Değiştirme ───
  function replaceCurrent() {
    if (!editor || !replaceInput) return 0;
    const match = matches[currentIndex];
    if (!match) {
      window.App?.showToast?.(t('toast.replaceNoMatch', 'Değiştirilecek eşleşme yok'));
      return 0;
    }

    const replacement = replaceInput.value;
    const text = editor.value;
    const caret = match.start + replacement.length;
    applyDocument(text.slice(0, match.start) + replacement + text.slice(match.end), caret);
    refreshFrom(caret);
    restoreReplaceFocus();
    window.App?.showToast?.(t('toast.replaced', '1 eşleşme değiştirildi'));
    return 1;
  }

  function replaceAll() {
    if (!editor || !replaceInput) return 0;
    if (!matches.length) {
      window.App?.showToast?.(t('toast.replaceNoMatch', 'Değiştirilecek eşleşme yok'));
      return 0;
    }

    const replacement = replaceInput.value;
    const replaced = matches.length;
    // Sondan başa doğru uygulamak, henüz işlenmemiş eşleşmelerin konumlarını
    // bozmaz; tüm değişiklik tek bir geri alma adımı olur.
    let text = editor.value;
    for (let index = matches.length - 1; index >= 0; index -= 1) {
      const match = matches[index];
      text = text.slice(0, match.start) + replacement + text.slice(match.end);
    }
    const caret = matches[0].start + replacement.length;
    applyDocument(text, caret);
    refreshFrom(caret);
    restoreReplaceFocus();
    window.App?.showToast?.(t('toast.replacedAll', '{count} eşleşme değiştirildi', { count: replaced }));
    return replaced;
  }

  // Metni editör üzerinden değiştirir; böylece geri alma geçmişi, otomatik
  // kayıt, istatistikler ve önizleme aynı anda güncellenir.
  function applyDocument(nextValue, caret) {
    if (window.Editor?.replaceValue) {
      window.Editor.replaceValue(nextValue, caret, caret);
      return;
    }
    editor.value = nextValue;
    editor.setSelectionRange(caret, caret);
  }

  function restoreReplaceFocus() {
    replaceInput?.focus();
  }

  function updateReplaceButtons() {
    const enabled = matches.length > 0;
    if (replaceOneButton) replaceOneButton.disabled = !enabled;
    if (replaceAllButton) replaceAllButton.disabled = !enabled;
  }

  function move(step) {
    if (!matches.length) return;
    currentIndex = (currentIndex + step + matches.length) % matches.length;
    selectMatch(currentIndex);
    updateCount();
    renderHighlights();
  }

  function selectMatch(index) {
    const match = matches[index];
    if (!match || !editor) return;
    editor.focus();
    editor.setSelectionRange(match.start, match.end);
    input?.focus();
  }

  function updateCount() {
    updateReplaceButtons();
    if (!count) return;
    if (!matches.length) {
      count.textContent = window.I18n?.t('find.noResults') || 'Sonuç yok';
      return;
    }
    count.textContent = `${currentIndex + 1} / ${matches.length}`;
  }

  function renderHighlights() {
    if (!highlights || !editor || !openState || !input?.value || !matches.length) {
      clearHighlights();
      return;
    }

    const text = editor.value;
    let html = '';
    let cursor = 0;
    matches.forEach((match, index) => {
      html += escapeHtml(text.substring(cursor, match.start));
      const active = index === currentIndex ? ' active' : '';
      html += `<mark class="find-match${active}">${escapeHtml(text.substring(match.start, match.end))}</mark>`;
      cursor = match.end;
    });
    html += escapeHtml(text.substring(cursor));
    highlights.innerHTML = html;
    highlights.classList.remove('hidden');
    syncHighlightScroll();
    scrollToCurrentMatch();
  }

  function scrollToCurrentMatch() {
    if (!highlights || !editor || currentIndex < 0) return;

    const activeMatch = highlights.querySelector('mark.active');
    if (!activeMatch || editor.clientHeight <= 0) return;

    // Inline marks can report an offsetTop of zero even when they are several
    // lines down in the overlay. Use viewport geometry and convert it back to
    // the editor's content coordinates so wrapped matches are positioned too.
    const editorRect = editor.getBoundingClientRect();
    const matchRect = activeMatch.getBoundingClientRect();
    const matchTop = matchRect.top - editorRect.top + editor.scrollTop;
    const matchHeight = matchRect.height || activeMatch.offsetHeight || 0;
    const targetTop = matchTop - Math.max((editor.clientHeight - matchHeight) / 2, 0);
    editor.scrollTop = Math.max(0, targetTop);
    syncHighlightScroll();
  }

  // Küçük harfe çevirme bazı Unicode karakterlerinde karakter sayısını
  // değiştirebilir (ör. İ -> i + birleşik nokta). Arama eşleşmesinin
  // orijinal textarea konumunu kaybetmemesi için her parçanın başlangıç ve
  // bitiş konumunu birlikte tutuyoruz.
  function createSearchIndex(value) {
    const starts = [];
    const ends = [];
    let folded = '';

    for (let index = 0; index < value.length;) {
      const codePoint = value.codePointAt(index);
      const originalChar = String.fromCodePoint(codePoint);
      const foldedChar = foldText(originalChar);
      folded += foldedChar;
      for (let offset = 0; offset < foldedChar.length; offset += 1) {
        starts.push(index);
        ends.push(index + originalChar.length);
      }
      index += originalChar.length;
    }

    return { value: folded, starts, ends };
  }

  function foldText(value) {
    return String(value).toLowerCase();
  }

  function clearHighlights() {
    if (!highlights) return;
    highlights.replaceChildren();
    highlights.classList.add('hidden');
  }

  function syncHighlightScroll() {
    if (!highlights || !editor) return;
    syncHighlightMetrics();
    highlights.scrollTop = editor.scrollTop;
    highlights.scrollLeft = editor.scrollLeft;
  }

  function syncHighlightMetrics() {
    if (!highlights || !editor) return;

    // Textarea client ölçüleri dikey kaydırma çubuğunu hariç tutar. Overlay'i
    // aynı genişliğe çekmek, uzun satırlarda farklı satır kırılmalarını önler.
    if (editor.clientWidth > 0) highlights.style.width = `${editor.clientWidth}px`;
    if (editor.clientHeight > 0) highlights.style.height = `${editor.clientHeight}px`;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  return {
    init, open, openWithReplace, close, refresh,
    replaceCurrent, replaceAll,
    isOpen: () => openState,
    isReplaceVisible,
  };
})();
