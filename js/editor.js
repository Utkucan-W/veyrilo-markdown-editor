/* ═══════════════════════════════════
   Editor Module
   Textarea yönetimi, markdown format,
   otomatik kaydetme, focus mode
   ═══════════════════════════════════ */

window.Editor = (function () {
  'use strict';

  let editor;
  let codeBackground;
  let codeOverlay;
  let focusOverlay;
  let focusBounds = null;
  let codeBackgroundFrame = null;
  let codeOverlayTimer = null;
  let statsTimer = null;
  let autoSaveTimer = null;
  let historyCurrent = null;
  let undoStack = [];
  let redoStack = [];
  const MAX_HISTORY = 100;
  const AUTO_SAVE_DELAY = 1000;
  const DECORATION_DEBOUNCE_DELAY = 120;
  const STORAGE_KEY = 'veyrilo_content';
  const INDENT = '    ';

  function t(key, fallback) {
    const value = window.I18n?.t?.(key);
    return value && value !== key ? value : fallback;
  }

  // ─── Init ───
  function init() {
    editor = document.getElementById('editor');
    codeBackground = document.getElementById('editor-code-background');
    codeOverlay = document.getElementById('editor-code-overlay');
    focusOverlay = document.getElementById('editor-focus-overlay');
    if (!editor) { console.error('Editor element not found'); return; }

    undoStack = [];
    redoStack = [];
    startWithNewDocument();
    historyCurrent = createHistorySnapshot();

    editor.addEventListener('input', () => onInput({ deferDecorations: true }));
    editor.addEventListener('keydown', onKeyDown);
    editor.addEventListener('paste', onPaste);
    editor.addEventListener('click', onCursorChange);
    editor.addEventListener('keyup', onCursorChange);
    editor.addEventListener('scroll', onEditorScroll);
    window.addEventListener('resize', () => {
      refreshCodeOverlay();
      syncFocusScroll();
    });
    setupTableDialog();

    triggerUpdate();
  }

  // ─── İçerik yükleme ───
  function startWithNewDocument() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Yeni belge başlatılamadı:', e);
    }
    editor.value = '';
  }

  // ─── Otomatik kaydetme ───
  function autoSave() {
    try {
      localStorage.setItem(STORAGE_KEY, editor.value);
    } catch (e) {
      console.warn('Otomatik kaydetme başarısız:', e);
    }
  }

  // ─── Input handler ───
  function onInput({ deferDecorations = false } = {}) {
    recordHistory();
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(autoSave, AUTO_SAVE_DELAY);
    triggerUpdate({ deferDecorations });
    if (document.body.classList.contains('focus-mode')) applyFocusMode();
  }

  // ─── Güncellemeleri tetikle ───
  function triggerUpdate({ deferDecorations = false } = {}) {
    const text = editor.value;
    if (deferDecorations) {
      scheduleCodeOverlay(text);
      scheduleStatsUpdate(text);
    } else {
      flushCodeOverlay(text);
      flushStatsUpdate(text);
    }
    if (window.Preview) {
      window.Preview.update(text);
    }
  }

  function scheduleCodeOverlay(text) {
    clearTimeout(codeOverlayTimer);
    codeOverlayTimer = setTimeout(() => {
      codeOverlayTimer = null;
      renderCodeOverlay(text);
    }, DECORATION_DEBOUNCE_DELAY);
  }

  function flushCodeOverlay(text) {
    clearTimeout(codeOverlayTimer);
    codeOverlayTimer = null;
    renderCodeOverlay(text);
  }

  function scheduleStatsUpdate(text) {
    clearTimeout(statsTimer);
    statsTimer = setTimeout(() => {
      statsTimer = null;
      updateStats(text);
    }, DECORATION_DEBOUNCE_DELAY);
  }

  function flushStatsUpdate(text) {
    clearTimeout(statsTimer);
    statsTimer = null;
    updateStats(text);
  }

  function updateStats(text) {
    if (!window.Stats) return;
    window.Stats.update(text);
    window.Stats.updateCursorPosition(editor);
  }

  // ─── Cursor değişikliği ───
  function onCursorChange() {
    if (window.Stats) window.Stats.updateCursorPosition(editor);
    if (document.body.classList.contains('focus-mode')) applyFocusMode();
  }

  // ─── Editor scroll ───
  function onEditorScroll() {
    if (window.Preview) window.Preview.syncScroll(editor);
    syncCodeOverlayScroll();
    if (document.body.classList.contains('focus-mode') && focusBounds) renderFocusMasks(focusBounds);
    else syncFocusScroll();
  }

  function renderCodeOverlay(text) {
    if (!codeOverlay) return;

    if (!text.includes('```') && !text.includes('~~~')) {
      if (codeOverlay.textContent) codeOverlay.textContent = '';
      if (codeBackground?.innerHTML) codeBackground.innerHTML = '';
      return;
    }

    const lines = String(text).split('\n');
    const codeLines = findClosedCodeLines(lines);
    let codeBlockIndex = -1;
    let wasInCode = false;
    codeOverlay.innerHTML = lines.map((line, index) => {
      const inCode = codeLines[index];
      if (inCode && !wasInCode) codeBlockIndex += 1;
      wasInCode = inCode;
      const content = line ? escapeHtml(line) : (inCode ? '&nbsp;' : '');
      const renderedLine = inCode
        ? `<span class="editor-code-line in-code" data-code-block="${codeBlockIndex}">${content}</span>`
        : content;
      return index < lines.length - 1 ? `${renderedLine}\n` : renderedLine;
    }).join('');

    syncCodeOverlayScroll();
    scheduleCodeBackgroundRender();
  }

  function findClosedCodeLines(lines) {
    const codeLines = new Array(lines.length).fill(false);
    let fence = null;
    let openingIndex = -1;

    lines.forEach((line, index) => {
      if (!fence) {
        const opening = /^( {0,3})(`{3,}|~{3,})([^\n]*)$/.exec(line);
        if (!opening) return;

        const char = opening[2][0];
        const info = opening[3];
        // CommonMark backtick fences cannot contain a backtick in the info string.
        if (char === '`' && info.includes('`')) return;
        fence = { char, length: opening[2].length };
        openingIndex = index;
        return;
      }

      const closingPattern = new RegExp(`^ {0,3}${fence.char}{${fence.length},} *$`);
      if (!closingPattern.test(line)) return;

      for (let lineIndex = openingIndex; lineIndex <= index; lineIndex += 1) {
        codeLines[lineIndex] = true;
      }
      fence = null;
      openingIndex = -1;
    });

    return codeLines;
  }

  function syncCodeOverlayMetrics() {
    if (!codeOverlay || !editor) return;
    if (editor.clientWidth > 0) {
      codeOverlay.style.width = `${editor.clientWidth}px`;
      if (codeBackground) codeBackground.style.width = `${editor.clientWidth}px`;
    }
    if (editor.clientHeight > 0) {
      codeOverlay.style.height = `${editor.clientHeight}px`;
      if (codeBackground) codeBackground.style.height = `${editor.clientHeight}px`;
    }
  }

  function syncCodeOverlayScroll() {
    if (!codeOverlay || !editor) return;
    syncCodeOverlayMetrics();
    codeOverlay.scrollTop = editor.scrollTop;
    codeOverlay.scrollLeft = editor.scrollLeft;
    if (codeBackground) {
      codeBackground.scrollTop = editor.scrollTop;
      codeBackground.scrollLeft = editor.scrollLeft;
    }
  }

  function scheduleCodeBackgroundRender() {
    if (!codeBackground || !codeOverlay) return;
    if (codeBackgroundFrame !== null) window.cancelAnimationFrame?.(codeBackgroundFrame);

    const render = () => {
      codeBackgroundFrame = null;
      renderCodeBackground();
    };
    codeBackgroundFrame = window.requestAnimationFrame
      ? window.requestAnimationFrame(render)
      : (render(), null);
  }

  function renderCodeBackground() {
    if (!codeBackground || !codeOverlay || !editor) return;

    const overlayRect = codeOverlay.getBoundingClientRect();
    const rowsByBlock = new Map();
    codeOverlay.querySelectorAll('.editor-code-line.in-code').forEach(line => {
      const blockId = line.dataset.codeBlock;
      if (!rowsByBlock.has(blockId)) rowsByBlock.set(blockId, []);
      Array.from(line.getClientRects()).forEach(rect => {
        if (rect.width === 0 || rect.height === 0) return;
        rowsByBlock.get(blockId).push({
          top: rect.top - overlayRect.top + codeOverlay.scrollTop,
          height: rect.height,
        });
      });
    });

    const computedLineHeight = Number.parseFloat(window.getComputedStyle(codeOverlay).lineHeight);
    const rows = Array.from(rowsByBlock.values()).flatMap(blockRows => {
      const orderedRows = blockRows.sort((left, right) => left.top - right.top);
      return orderedRows.map((row, index) => {
        const nextRow = orderedRows[index + 1];
        const height = nextRow
          ? Math.max(row.height, nextRow.top - row.top)
          : Math.max(row.height, Number.isFinite(computedLineHeight) ? computedLineHeight : row.height);
        return { top: row.top, height };
      });
    });

    const contentHeight = Math.max(codeOverlay.scrollHeight, editor.scrollHeight, editor.clientHeight);
    codeBackground.innerHTML = `<div class="editor-code-background-content" style="height:${contentHeight}px">${rows.map(row =>
      `<div class="editor-code-background-row" style="top:${row.top}px;height:${row.height}px"></div>`
    ).join('')}</div>`;
    codeBackground.scrollTop = editor.scrollTop;
    codeBackground.scrollLeft = editor.scrollLeft;
  }

  function refreshCodeOverlay() {
    if (!editor) return;
    flushCodeOverlay(editor.value);
  }

  // ─── Tab tuşu desteği ───
  function onKeyDown(e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey || spansMultipleLines()) {
        shiftSelectedLines(e.shiftKey ? -1 : 1);
      } else {
        insertTextAtCursor(INDENT);
      }
    }
    if (e.key === 'Enter') {
      if (handleAutoList(e)) return;
    }
  }

  function spansMultipleLines() {
    if (!editor || editor.selectionStart === editor.selectionEnd) return false;
    const selected = editor.value.substring(editor.selectionStart, editor.selectionEnd);
    return selected.includes('\n');
  }

  // ─── Seçili satırların girintisini artır/azalt ───
  // direction: 1 girinti ekler, -1 en fazla bir girinti kadar boşluk siler.
  function shiftSelectedLines(direction) {
    if (!editor) return;

    const text = editor.value;
    const selectionStart = editor.selectionStart;
    const selectionEnd = editor.selectionEnd;
    const blockStart = text.lastIndexOf('\n', selectionStart - 1) + 1;
    // Seçim bir satır sonuyla bitiyorsa sonraki satır seçilmiş sayılmaz;
    // aksi hâlde imlecin dokunmadığı satır da girintilenirdi.
    const selectionEndsAtLineStart = selectionEnd > selectionStart && text[selectionEnd - 1] === '\n';
    const lastSelectedOffset = selectionEndsAtLineStart ? selectionEnd - 1 : selectionEnd;
    const blockEndIndex = text.indexOf('\n', lastSelectedOffset);
    const blockEnd = blockEndIndex === -1 ? text.length : blockEndIndex;

    const lines = text.substring(blockStart, blockEnd).split('\n');
    let firstLineDelta = 0;
    let totalDelta = 0;

    const shifted = lines.map((line, index) => {
      if (direction > 0) {
        // Boş satıra girinti eklemek, seçimin altında görünmez boşluk bırakır.
        if (line === '') return line;
        if (index === 0) firstLineDelta = INDENT.length;
        totalDelta += INDENT.length;
        return INDENT + line;
      }

      const removable = line.match(/^(\t| {1,4})/);
      if (!removable) return line;
      if (index === 0) firstLineDelta = -removable[1].length;
      totalDelta -= removable[1].length;
      return line.substring(removable[1].length);
    });

    if (totalDelta === 0) return;

    const nextValue = text.substring(0, blockStart) + shifted.join('\n') + text.substring(blockEnd);
    const nextStart = Math.max(blockStart, selectionStart + firstLineDelta);
    const nextEnd = Math.max(nextStart, selectionEnd + totalDelta);

    editor.value = nextValue;
    editor.setSelectionRange(nextStart, nextEnd);
    editor.focus();
    onInput();
  }

  // ─── Akıllı yapıştırma ───
  // Seçili metin varken bir web adresi yapıştırılırsa Markdown bağlantısı olur.
  function onPaste(e) {
    if (!editor) return;
    const pasted = e.clipboardData?.getData('text/plain');
    if (!pasted || !isWebUrl(pasted)) return;

    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    if (start === end) return;

    const selected = editor.value.substring(start, end);
    if (!selected.trim() || selected.includes('\n') || isWebUrl(selected)) return;

    e.preventDefault();
    const link = `[${selected}](${pasted.trim()})`;
    editor.value = editor.value.substring(0, start) + link + editor.value.substring(end);
    editor.setSelectionRange(start + link.length, start + link.length);
    editor.focus();
    onInput();
  }

  function isWebUrl(value) {
    const candidate = String(value).trim();
    if (!candidate || /\s/.test(candidate)) return false;
    try {
      return ['http:', 'https:'].includes(new URL(candidate).protocol);
    } catch {
      return false;
    }
  }

  // ─── Otomatik liste devamı ───
  function handleAutoList(e) {
    const pos = editor.selectionStart;
    const text = editor.value;
    const lineStart = text.lastIndexOf('\n', pos - 1) + 1;
    const currentLine = text.substring(lineStart, pos);

    const cbMatch = currentLine.match(/^(\s*[-*+])\s\[[ x]\]\s(.*)$/);
    if (cbMatch) {
      if (cbMatch[2].trim() === '') {
        e.preventDefault();
        editor.setSelectionRange(lineStart, pos);
        insertTextAtCursor('\n');
        return true;
      }
      e.preventDefault();
      insertTextAtCursor('\n' + cbMatch[1] + ' [ ] ');
      return true;
    }

    const ulMatch = currentLine.match(/^(\s*)([-*+])\s(.*)$/);
    if (ulMatch) {
      if (ulMatch[3].trim() === '') {
        e.preventDefault();
        editor.setSelectionRange(lineStart, pos);
        insertTextAtCursor('\n');
        return true;
      }
      e.preventDefault();
      insertTextAtCursor('\n' + ulMatch[1] + ulMatch[2] + ' ');
      return true;
    }

    const olMatch = currentLine.match(/^(\s*)(\d+)\.\s(.*)$/);
    if (olMatch) {
      if (olMatch[3].trim() === '') {
        e.preventDefault();
        editor.setSelectionRange(lineStart, pos);
        insertTextAtCursor('\n');
        return true;
      }
      e.preventDefault();
      const nextNum = parseInt(olMatch[2]) + 1;
      insertTextAtCursor('\n' + olMatch[1] + nextNum + '. ');
      return true;
    }

    return false;
  }

  // ─── İmleç pozisyonuna metin ekleme ───
  function insertTextAtCursor(text) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const before = editor.value.substring(0, start);
    const after = editor.value.substring(end);
    editor.value = before + text + after;
    editor.selectionStart = editor.selectionEnd = start + text.length;
    editor.focus();
    onInput();
  }

  // ─── Seçili metni sarmalama (wrap) ───
  // Markdown'da * ve ** aynı karakteri kullanır:
  //   *metin*   = italik     (1 yıldız)
  //   **metin** = kalın      (2 yıldız)
  //   ***metin*** = kalın+italik (3 yıldız)
  // Bu fonksiyon yıldız sayısını doğru sayarak
  // üst üste format eklemeye/çıkarmaya izin verir.
  function wrapSelection(before, after) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = editor.value.substring(start, end);
    const textBefore = editor.value.substring(0, start);
    const textAfter = editor.value.substring(end);

    const char = before[0];
    const wrapLen = before.length;
    const isSameCharWrapper = before === after &&
                              before.split('').every(c => c === char);

    if (isSameCharWrapper) {
      // ── Aynı karakterden oluşan wrapper'lar (*, **, ~~, ==, `) ──

      // Seçimin DIŞINDA kaç tane ardışık wrapper karakter var?
      let countBefore = 0;
      for (let i = textBefore.length - 1; i >= 0; i--) {
        if (textBefore[i] === char) countBefore++;
        else break;
      }
      let countAfter = 0;
      for (let i = 0; i < textAfter.length; i++) {
        if (textAfter[i] === char) countAfter++;
        else break;
      }
      const countOutside = Math.min(countBefore, countAfter);

      if (countOutside > 0) {
        // Seçimin dışında wrapper karakterleri var
        let isActive;
        if (char === '*') {
          // Yıldız: italic(1) ve bold(2) aynı karakteri paylaşır
          if (wrapLen === 1) {
            // İtalik toggle: tek sayıda yıldız varsa italik aktif
            isActive = (countOutside % 2 === 1);
          } else if (wrapLen === 2) {
            // Kalın toggle: 2+ yıldız varsa kalın aktif
            isActive = (countOutside >= 2);
          } else {
            isActive = (countOutside >= wrapLen);
          }
        } else {
          // ~~, ==, ` vb.: basit eşik kontrolü
          isActive = (countOutside >= wrapLen);
        }

        if (isActive) {
          // KALDIR: wrapLen kadar karakter sil her iki taraftan
          const newBefore = textBefore.substring(0, textBefore.length - wrapLen);
          const newAfter = textAfter.substring(wrapLen);
          editor.value = newBefore + selected + newAfter;
          editor.selectionStart = newBefore.length;
          editor.selectionEnd = newBefore.length + selected.length;
        } else {
          // EKLE: wrapLen kadar karakter ekle her iki tarafa
          editor.value = textBefore + before + selected + after + textAfter;
          editor.selectionStart = textBefore.length + wrapLen;
          editor.selectionEnd = textBefore.length + wrapLen + selected.length;
        }
      } else {
        // Seçimin dışında wrapper yok — seçimin İÇİNE bak
        let countInnerStart = 0;
        for (let i = 0; i < selected.length; i++) {
          if (selected[i] === char) countInnerStart++;
          else break;
        }
        let countInnerEnd = 0;
        for (let i = selected.length - 1; i >= 0; i--) {
          if (selected[i] === char) countInnerEnd++;
          else break;
        }
        const countInside = Math.min(countInnerStart, countInnerEnd);

        if (countInside >= wrapLen) {
          // Seçimin içinde yeterli wrapper var
          let isActive;
          if (char === '*') {
            if (wrapLen === 1) isActive = (countInside % 2 === 1);
            else if (wrapLen === 2) isActive = (countInside >= 2);
            else isActive = (countInside >= wrapLen);
          } else {
            isActive = (countInside >= wrapLen);
          }

          if (isActive) {
            // İçeriden wrapLen kadar sil
            const inner = selected.substring(wrapLen, selected.length - wrapLen);
            editor.value = textBefore + inner + textAfter;
            editor.selectionStart = start;
            editor.selectionEnd = start + inner.length;
          } else {
            // İçeride var ama bu format aktif değil — dışına sar
            editor.value = textBefore + before + selected + after + textAfter;
            editor.selectionStart = start + wrapLen;
            editor.selectionEnd = start + wrapLen + selected.length;
          }
        } else {
          // Hiç wrapper yok — ekle
          const content = selected || 'metin';
          editor.value = textBefore + before + content + after + textAfter;
          if (selected) {
            editor.selectionStart = start + wrapLen;
            editor.selectionEnd = start + wrapLen + selected.length;
          } else {
            editor.selectionStart = start + wrapLen;
            editor.selectionEnd = start + wrapLen + 5;
          }
        }
      }
    } else {
      // ── Farklı karakterlerden oluşan wrapper'lar (link, image vb.) ──
      if (textBefore.endsWith(before) && textAfter.startsWith(after)) {
        // Dışarıda var — kaldır
        const newBefore = textBefore.substring(0, textBefore.length - before.length);
        const newAfter = textAfter.substring(after.length);
        editor.value = newBefore + selected + newAfter;
        editor.selectionStart = newBefore.length;
        editor.selectionEnd = newBefore.length + selected.length;
      } else if (selected.startsWith(before) && selected.endsWith(after) &&
                 selected.length >= before.length + after.length) {
        // İçeride var — kaldır
        const inner = selected.substring(before.length, selected.length - after.length);
        editor.value = textBefore + inner + textAfter;
        editor.selectionStart = start;
        editor.selectionEnd = start + inner.length;
      } else {
        // Yok — ekle
        const content = selected || 'metin';
        editor.value = textBefore + before + content + after + textAfter;
        if (selected) {
          editor.selectionStart = start + before.length;
          editor.selectionEnd = end + before.length;
        } else {
          editor.selectionStart = start + before.length;
          editor.selectionEnd = start + before.length + 5;
        }
      }
    }

    editor.focus();
    onInput();
  }

  // ─── Satır başına prefix ekleme ───
  function toggleLinePrefix(prefix) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const text = editor.value;

    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = text.indexOf('\n', end);
    const actualEnd = lineEnd === -1 ? text.length : lineEnd;

    const selectedLines = text.substring(lineStart, actualEnd);
    const lines = selectedLines.split('\n');

    const allHavePrefix = lines.every(line => line.startsWith(prefix));

    let newLines;
    if (allHavePrefix) {
      newLines = lines.map(line => line.substring(prefix.length));
    } else {
      newLines = lines.map(line => prefix + line);
    }

    const replacement = newLines.join('\n');
    editor.value = text.substring(0, lineStart) + replacement + text.substring(actualEnd);

    editor.selectionStart = lineStart;
    editor.selectionEnd = lineStart + replacement.length;
    editor.focus();
    onInput();
  }

  // ─── Markdown format komutları ───
  function bold() { wrapSelection('**', '**'); }
  function italic() { wrapSelection('*', '*'); }
  function strikethrough() { wrapSelection('~~', '~~'); }
  function inlineCode() { wrapSelection('`', '`'); }
  function highlight() { wrapSelection('==', '=='); }

  function setHeading(level) {
    const start = editor.selectionStart;
    const text = editor.value;

    let lineStart = start;
    while (lineStart > 0 && text[lineStart - 1] !== '\n') lineStart--;

    let lineEnd = start;
    while (lineEnd < text.length && text[lineEnd] !== '\n') lineEnd++;

    const line = text.substring(lineStart, lineEnd);
    const hashes = '#'.repeat(level) + ' ';
    const cleanLine = line.replace(/^#{1,6}\s/, '');
    const newLine = hashes + cleanLine;

    const before = text.substring(0, lineStart);
    const after = text.substring(lineEnd);

    editor.value = before + newLine + after;
    editor.selectionStart = editor.selectionEnd = lineStart + newLine.length;
    editor.focus();
    onInput();
  }

  function heading1() { setHeading(1); }
  function heading2() { setHeading(2); }
  function heading3() { setHeading(3); }
  function heading4() { setHeading(4); }
  function heading5() { setHeading(5); }
  function heading6() { setHeading(6); }

  function link() {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = editor.value.substring(start, end);
    if (selected) {
      wrapSelection('[', '](url)');
    } else {
      insertTextAtCursor(`[${t('editor.linkText', 'bağlantı metni')}](url)`);
    }
  }

  function image() {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = editor.value.substring(start, end);
    if (selected) {
      wrapSelection('![', '](url)');
    } else {
      insertTextAtCursor(`![${t('editor.imageAlt', 'açıklama')}](${t('editor.imageUrl', 'görsel-url')})`);
    }
  }

  function codeBlock() {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = editor.value.substring(start, end);
    const before = editor.value.substring(0, start);
    const after = editor.value.substring(end);

    const code = selected || t('editor.codePlaceholder', 'kod buraya');
    const block = '\n```\n' + code + '\n```\n';

    editor.value = before + block + after;
    editor.selectionStart = start + 5;
    editor.selectionEnd = start + 5 + code.length;
    editor.focus();
    onInput();
  }

  function list() { toggleLinePrefix('- '); }
  function quote() { toggleLinePrefix('> '); }
  function orderedList() { toggleLinePrefix('1. '); }
  function checkboxList() { toggleLinePrefix('- [ ] '); }

  function table() {
    openTableDialog();
  }

  // ─── Geri al / ileri al ───
  function createHistorySnapshot() {
    return {
      value: editor.value,
      selectionStart: editor.selectionStart,
      selectionEnd: editor.selectionEnd,
    };
  }

  function recordHistory() {
    const next = createHistorySnapshot();
    if (historyCurrent && next.value === historyCurrent.value) {
      historyCurrent = next;
      return;
    }
    if (historyCurrent) undoStack.push(historyCurrent);
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
    historyCurrent = next;
    redoStack = [];
  }

  function resetHistory() {
    undoStack = [];
    redoStack = [];
    historyCurrent = createHistorySnapshot();
  }

  function restoreHistorySnapshot(snapshot) {
    editor.value = snapshot.value;
    editor.setSelectionRange(
      Math.min(snapshot.selectionStart, snapshot.value.length),
      Math.min(snapshot.selectionEnd, snapshot.value.length),
    );
    historyCurrent = createHistorySnapshot();
    triggerUpdate();
    if (document.body.classList.contains('focus-mode')) applyFocusMode();
    editor.focus();
  }

  function undo() {
    if (!undoStack.length) return false;
    redoStack.push(createHistorySnapshot());
    restoreHistorySnapshot(undoStack.pop());
    return true;
  }

  function redo() {
    if (!redoStack.length) return false;
    undoStack.push(createHistorySnapshot());
    restoreHistorySnapshot(redoStack.pop());
    return true;
  }

  function setupTableDialog() {
    const dialog = document.getElementById('table-dialog');
    const rows = document.getElementById('table-rows');
    if (!dialog || !rows) return;

    document.getElementById('table-dialog-create')?.addEventListener('click', createTableFromDialog);
    document.getElementById('table-dialog-cancel')?.addEventListener('click', closeTableDialog);
    document.getElementById('table-dialog-close')?.addEventListener('click', closeTableDialog);
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) closeTableDialog();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !dialog.classList.contains('hidden')) {
        event.preventDefault();
        closeTableDialog();
      }
    });
  }

  function openTableDialog() {
    const dialog = document.getElementById('table-dialog');
    const rows = document.getElementById('table-rows');
    if (!dialog || !rows) return;
    dialog.classList.remove('hidden');
    rows.focus();
    rows.select();
  }

  function closeTableDialog() {
    document.getElementById('table-dialog')?.classList.add('hidden');
    editor?.focus();
  }

  function createTableFromDialog() {
    const rowsInput = document.getElementById('table-rows');
    const columnsInput = document.getElementById('table-columns');
    const rows = clampTableSize(rowsInput?.value, 2, 20, 3);
    const columns = clampTableSize(columnsInput?.value, 1, 12, 3);
    const english = window.I18n?.getCurrentLang?.() === 'en';
    const headerWord = english ? 'Header' : 'Başlık';
    const cellWord = english ? 'Cell' : 'Hücre';
    const lines = [];

    lines.push(`| ${Array.from({ length: columns }, (_, index) => `${headerWord} ${index + 1}`).join(' | ')} |`);
    lines.push(`| ${Array.from({ length: columns }, () => '---').join(' | ')} |`);
    for (let row = 1; row < rows; row += 1) {
      lines.push(`| ${Array.from({ length: columns }, (_, index) => `${cellWord} ${row}.${index + 1}`).join(' | ')} |`);
    }

    insertTextAtCursor(`\n${lines.join('\n')}\n`);
    closeTableDialog();
  }

  function clampTableSize(value, min, max, fallback) {
    const number = Number.parseInt(value, 10);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, number));
  }

  function horizontalRule() {
    const pos = editor.selectionStart;
    const text = editor.value;
    const before = text.substring(0, pos);
    const after = text.substring(pos);
    const needsNewline = before.length > 0 && !before.endsWith('\n') ? '\n' : '';
    const insertion = needsNewline + '\n---\n\n';
    editor.value = before + insertion + after;
    editor.selectionStart = editor.selectionEnd = pos + insertion.length;
    editor.focus();
    onInput();
  }

  // ─── Focus Mode ───
  function applyFocusMode() {
    if (!document.body.classList.contains('focus-mode')) {
      clearFocusMode();
      return;
    }
    const pos = editor.selectionStart;
    const text = editor.value;

    const previousSeparator = text.lastIndexOf('\n\n', Math.max(0, pos - 1));
    const nextSeparator = text.indexOf('\n\n', pos);
    const activeParagraph = {
      start: previousSeparator + 2,
      end: nextSeparator === -1 ? text.length : nextSeparator,
    };
    renderFocusOverlay(text, activeParagraph);
  }

  function renderFocusOverlay(text, activeParagraph) {
    if (!focusOverlay || (activeParagraph.start === 0 && activeParagraph.end === text.length)) {
      clearFocusMode();
      return;
    }
    document.body.classList.add('focus-overlay-active');
    syncFocusScroll();
    focusBounds = calculateFocusBounds(text, activeParagraph);
    renderFocusMasks(focusBounds);
    focusOverlay.classList.remove('hidden');
  }

  function calculateFocusBounds(text, activeParagraph) {
    const style = window.getComputedStyle(editor);
    const lineHeight = Number.parseFloat(style.lineHeight) || Number.parseFloat(style.fontSize) * 1.7 || 30;
    const linesBefore = countNewlines(text, activeParagraph.start);
    const paragraphLines = countNewlines(text.substring(activeParagraph.start, activeParagraph.end), activeParagraph.end - activeParagraph.start) + 1;
    return { top: linesBefore * lineHeight, bottom: (linesBefore + paragraphLines) * lineHeight };
  }

  function renderFocusMasks(bounds) {
    focusOverlay.replaceChildren();
    const width = editor.clientWidth || focusOverlay.clientWidth;
    const height = editor.clientHeight || focusOverlay.clientHeight;
    const activeTop = Math.min(height, Math.max(0, bounds.top - editor.scrollTop));
    const activeBottom = Math.min(height, Math.max(0, bounds.bottom - editor.scrollTop));
    appendFocusMask(0, 0, width, activeTop);
    appendFocusMask(0, activeBottom, width, height - activeBottom);
  }

  function countNewlines(text, end) {
    let count = 0;
    for (let index = 0; index < end; index++) {
      if (text[index] === '\n') count++;
    }
    return count;
  }

  function appendFocusMask(left, top, width, height) {
    if (width <= 0 || height <= 0) return;
    const mask = document.createElement('span');
    mask.className = 'focus-mask';
    mask.style.left = `${left}px`;
    mask.style.top = `${top}px`;
    mask.style.width = `${width}px`;
    mask.style.height = `${height}px`;
    focusOverlay.append(mask);
  }

  function clearFocusMode() {
    document.body.classList.remove('focus-overlay-active');
    focusBounds = null;
    if (!focusOverlay) return;
    focusOverlay.replaceChildren();
    focusOverlay.classList.add('hidden');
  }

  function syncFocusScroll() {
    if (!focusOverlay || !editor) return;
    syncFocusOverlayMetrics();
  }

  function syncFocusOverlayMetrics() {
    if (!focusOverlay || !editor) return;
    if (editor.clientWidth > 0) focusOverlay.style.width = `${editor.clientWidth}px`;
    if (editor.clientHeight > 0) focusOverlay.style.height = `${editor.clientHeight}px`;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function toggleFocusMode() {
    document.body.classList.toggle('focus-mode');
    const isActive = document.body.classList.contains('focus-mode');
    const btn = document.getElementById('btn-focus');
    if (btn) btn.classList.toggle('active', isActive);
    if (isActive) applyFocusMode();
    else clearFocusMode();
    return isActive;
  }

  function toggleZenMode() {
    document.body.classList.toggle('zen-mode');
    const isActive = document.body.classList.contains('zen-mode');
    const btn = document.getElementById('btn-zen');
    if (btn) btn.classList.toggle('active', isActive);
    if (isActive && window.Find?.isOpen()) window.Find.close();
    return isActive;
  }

  // ─── İçerik getir/set ───
  function getContent() { return editor ? editor.value : ''; }
  function setContent(text) {
    if (editor) {
      editor.value = text;
      resetHistory();
      onInput();
    }
  }
  // Belgenin tamamını tek bir düzenleme adımı olarak değiştirir. Geri alma
  // geçmişi korunur; setContent'ten farkı budur.
  function replaceValue(nextValue, selectionStart, selectionEnd) {
    if (!editor) return;
    editor.value = nextValue;
    const start = Math.min(Math.max(selectionStart ?? nextValue.length, 0), nextValue.length);
    const end = Math.min(Math.max(selectionEnd ?? start, 0), nextValue.length);
    editor.setSelectionRange(start, end);
    onInput();
  }

  function getElement() { return editor; }
  function clear() {
    if (editor) {
      editor.value = '';
      resetHistory();
      onInput();
    }
  }

  return {
    init, getContent, setContent, replaceValue, getElement, clear,
    bold, italic, strikethrough, inlineCode, highlight,
    link, image,
    heading1, heading2, heading3, heading4, heading5, heading6,
    codeBlock, list, quote, orderedList, checkboxList, table, horizontalRule,
    undo, redo,
    toggleFocusMode, toggleZenMode, applyFocusMode, refreshCodeOverlay,
  };
})();
