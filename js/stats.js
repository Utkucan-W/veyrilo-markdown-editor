/* ═══════════════════════════════════
   Stats Module
   Kelime/karakter sayacı, okuma süresi
   ═══════════════════════════════════ */

window.Stats = (function () {
  'use strict';

  const WORDS_PER_MINUTE = 200; // Ortalama okuma hızı

  let wordCountEl, charCountEl, readTimeEl, cursorPosEl;
  let paragraphCountEl, lineCountEl;

  function init() {
    wordCountEl = document.getElementById('stat-words');
    charCountEl = document.getElementById('stat-chars');
    readTimeEl = document.getElementById('stat-read-time');
    cursorPosEl = document.getElementById('stat-cursor');
    paragraphCountEl = document.getElementById('stat-paragraphs');
    lineCountEl = document.getElementById('stat-lines');
  }

  function update(text) {
    // Karakter sayısı
    const charCount = text.length;

    // Kelime sayısı
    const trimmed = text.trim();
    const wordCount = trimmed === '' ? 0 : trimmed.split(/\s+/).length;

    // Satır sayısı
    const lineCount = text === '' ? 0 : text.split('\n').length;

    // Paragraf sayısı (boş satırlarla ayrılan bloklar)
    const paragraphs = trimmed === '' ? [] : text.split(/\n\s*\n/);
    const paragraphCount = paragraphs.filter(p => p.trim().length > 0).length;

    // Okuma süresi (dakika)
    const readMinutes = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));

    // UI güncelle
    if (wordCountEl) {
      const label = window.I18n ? window.I18n.t('status.words') : '0 kelime';
      wordCountEl.textContent = label.replace('0', wordCount);
    }
    if (charCountEl) {
      const label = window.I18n ? window.I18n.t('status.chars') : '0 karakter';
      charCountEl.textContent = label.replace('0', charCount);
    }
    if (readTimeEl) {
      const label = window.I18n ? window.I18n.t('status.readTime') : '0 dk okuma';
      readTimeEl.textContent = wordCount === 0 ? label.replace('0', '0') : label.replace('0', readMinutes);
    }
    if (paragraphCountEl) {
      const label = window.I18n ? window.I18n.t('status.paragraphs') : '0 paragraf';
      paragraphCountEl.textContent = label.replace('0', paragraphCount);
    }
    if (lineCountEl) {
      const label = window.I18n ? window.I18n.t('status.lines') : '0 satır';
      lineCountEl.textContent = label.replace('0', lineCount);
    }
  }

  function updateCursorPosition(textarea) {
    if (!cursorPosEl || !textarea) return;

    const pos = textarea.selectionStart;
    const text = textarea.value.substring(0, pos);
    const lines = text.split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;

    const label = window.I18n ? window.I18n.t('status.cursor') : 'Satır {line}, Sütun {col}';
    cursorPosEl.textContent = label
      .replace('{line}', line)
      .replace('{col}', col);
  }

  return {
    init,
    update,
    updateCursorPosition,
  };
})();
