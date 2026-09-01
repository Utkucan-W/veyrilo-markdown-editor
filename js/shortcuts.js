/* ═══════════════════════════════════
   Shortcuts Module
   Kısayol yönetimi ve key capture
   ═══════════════════════════════════ */

window.Shortcuts = (function () {
  'use strict';

  // Varsayılan kısayol tanımları (Apostrophe/GNOME uyumlu)
  const DEFAULT_SHORTCUTS = {
    // ── Metin Biçimlendirme ──
    bold:          { key: 'b', ctrl: true, shift: false, alt: false, i18nKey: 'shortcut.bold' },
    italic:        { key: 'i', ctrl: true, shift: false, alt: false, i18nKey: 'shortcut.italic' },
    strikethrough: { key: 'd', ctrl: true, shift: false, alt: false, i18nKey: 'shortcut.strikethrough' },
    highlight:     { key: 'm', ctrl: true, shift: true,  alt: false, i18nKey: 'shortcut.highlight' },
    // ── Kod ──
    code:          { key: 'e', ctrl: true, shift: false, alt: false, i18nKey: 'shortcut.code' },
    codeblock:     { key: 'e', ctrl: true, shift: true,  alt: false, i18nKey: 'shortcut.codeblock' },
    // ── Bağlantı & Medya ──
    link:          { key: 'k', ctrl: true, shift: false, alt: false, i18nKey: 'shortcut.link' },
    image:         { key: 'g', ctrl: true, shift: true,  alt: false, i18nKey: 'shortcut.image' },
    // ── Yapı ──
    h1:            { key: '1', ctrl: true, shift: false, alt: false, i18nKey: 'shortcut.h1' },
    h2:            { key: '2', ctrl: true, shift: false, alt: false, i18nKey: 'shortcut.h2' },
    h3:            { key: '3', ctrl: true, shift: false, alt: false, i18nKey: 'shortcut.h3' },
    h4:            { key: '4', ctrl: true, shift: false, alt: false, i18nKey: 'shortcut.h4' },
    h5:            { key: '5', ctrl: true, shift: false, alt: false, i18nKey: 'shortcut.h5' },
    h6:            { key: '6', ctrl: true, shift: false, alt: false, i18nKey: 'shortcut.h6' },
    list:          { key: 'l', ctrl: true, shift: true,  alt: false, i18nKey: 'shortcut.list' },
    orderedList:   { key: 'o', ctrl: true, shift: true,  alt: false, i18nKey: 'shortcut.orderedList' },
    checkboxList:  { key: 'x', ctrl: true, shift: true,  alt: false, i18nKey: 'shortcut.checkboxList' },
    quote:         { key: 'q', ctrl: true, shift: true,  alt: false, i18nKey: 'shortcut.quote' },
    table:         { key: 't', ctrl: true, shift: true,  alt: false, i18nKey: 'shortcut.table' },
    horizontalRule:{ key: '-', ctrl: true, shift: true,  alt: false, i18nKey: 'shortcut.horizontalRule' },
    undo:          { key: 'z', ctrl: true, shift: false, alt: false, i18nKey: 'shortcut.undo' },
    redo:          { key: 'y', ctrl: true, shift: false, alt: false, i18nKey: 'shortcut.redo' },
    // ── Görünüm ──
    find:          { key: 'f', ctrl: true, shift: false, alt: false, i18nKey: 'shortcut.find' },
    replace:       { key: 'h', ctrl: true, shift: false, alt: false, i18nKey: 'shortcut.replace' },
    preview:       { key: 'p', ctrl: true, shift: false, alt: false, i18nKey: 'shortcut.preview' },
    focus:         { key: 'f', ctrl: true, shift: true,  alt: false, i18nKey: 'shortcut.focus' },
    zen:           { key: 'f11', ctrl: false, shift: false, alt: false, i18nKey: 'shortcut.zen' },
    // ── Dosya ──
    save:          { key: 's', ctrl: true, shift: false, alt: false, i18nKey: 'shortcut.save' },
    open:          { key: 'o', ctrl: true, shift: false, alt: false, i18nKey: 'shortcut.open' },
    newdoc:        { key: 'n', ctrl: true, shift: false, alt: false, i18nKey: 'shortcut.newdoc' },
    // ── Uygulama ──
    settings:      { key: ',', ctrl: true, shift: false, alt: false, i18nKey: 'shortcut.settings' },
    fontIncrease:  { key: '=', ctrl: true, shift: false, alt: false, i18nKey: 'shortcut.fontIncrease' },
    fontDecrease:  { key: '-', ctrl: true, shift: false, alt: false, i18nKey: 'shortcut.fontDecrease' },
  };

  // Bazı editörlerde kalın için kullanılan yaygın alternatif. Ana kısayol
  // ayarlardan değiştirilebilir; bu alternatif geriye dönük olarak sabit
  // desteklenir.
  const SHORTCUT_ALIASES = {
    bold: [{ key: 'b', ctrl: true, shift: true, alt: false }],
  };

  let shortcuts = {};
  let handlers = {};
  const changeListeners = [];

  function notifyChange() {
    updateToolbarTitles();
    changeListeners.forEach((listener) => listener());
  }

  // Format çubuğundaki başlıklar, Ayarlar'da değiştirilen kısayolu daima
  // göstermeli. Çeviri metnindeki varsayılan kombinasyonu yalnızca etiket
  // olarak kullanıp güncel kombinasyonla değiştiriyoruz.
  function updateToolbarTitles() {
    document.querySelectorAll('.fmt-btn[data-action][data-i18n-title]').forEach((button) => {
      const actionId = button.dataset.action;
      const combo = shortcuts[actionId];
      if (!combo) return;

      const translationKey = button.dataset.i18nTitle;
      const translatedTitle = window.I18n?.t(translationKey) || button.title || actionId;
      const label = translatedTitle.replace(/\s*\([^)]*\)\s*$/, '');
      button.title = `${label} (${keyComboToString(combo)})`;
    });
  }

  // ─── Key string'e dönüştürme ───
  function keyComboToString(combo) {
    const parts = [];
    if (combo.ctrl) parts.push('Ctrl');
    if (combo.alt) parts.push('Alt');
    if (combo.shift) parts.push('Shift');

    let keyLabel = combo.key.length === 1 ? combo.key.toUpperCase() : combo.key;
    // Özel tuş isimleri
    const keyNames = {
      ',': ',',
      '.': '.',
      '/': '/',
      '[': '[',
      ']': ']',
      'arrowup': '↑',
      'arrowdown': '↓',
      'arrowleft': '←',
      'arrowright': '→',
      'enter': 'Enter',
      'escape': 'Esc',
      'backspace': '⌫',
      'delete': 'Del',
      'tab': 'Tab',
      ' ': 'Space',
    };
    if (keyNames[combo.key.toLowerCase()]) {
      keyLabel = keyNames[combo.key.toLowerCase()];
    }
    parts.push(keyLabel);
    return parts.join('+');
  }

  // ─── Event'ten combo çıkarma ───
  function eventToCombo(e) {
    // Shift ile basılan noktalama tuşları e.key'de '_' veya '+' olarak gelir.
    // Fiziksel tuş kodu, Ctrl+Shift+- ve Ctrl+Shift+= gibi kısayolları
    // klavye düzeninden bağımsız olarak kararlı biçimde tanımlar.
    const physicalKeys = {
      Minus: '-',
      Equal: '=',
    };
    const key = physicalKeys[e.code] || e.key.toLowerCase();
    return {
      key,
      ctrl: e.ctrlKey || e.metaKey,
      shift: e.shiftKey,
      alt: e.altKey,
    };
  }

  // ─── Combo eşleşme kontrolü ───
  function matchesCombo(shortcut, combo) {
    return (
      shortcut.key === combo.key &&
      shortcut.ctrl === combo.ctrl &&
      shortcut.shift === combo.shift &&
      shortcut.alt === combo.alt
    );
  }

  function matchesAction(actionId, shortcut, combo) {
    if (matchesCombo(shortcut, combo)) return true;
    const aliasMatches = (SHORTCUT_ALIASES[actionId] || []).some((alias) => matchesCombo(alias, combo));
    if (!aliasMatches) return false;

    // Kullanıcının başka bir aksiyona verdiği birincil kombinasyon, alias'tan
    // öncelikli olmalıdır.
    return !Object.entries(shortcuts).some(([id, otherShortcut]) => (
      id !== actionId && matchesCombo(otherShortcut, combo)
    ));
  }

  // ─── Çakışma kontrolü ───
  function findConflict(actionId, newCombo) {
    for (const [id, sc] of Object.entries(shortcuts)) {
      if (id === actionId) continue;
      if (
        matchesCombo(sc, newCombo) ||
        (SHORTCUT_ALIASES[id] || []).some((alias) => matchesCombo(alias, newCombo))
      ) {
        return id;
      }
    }
    return null;
  }

  // ─── localStorage'dan yükleme ───
  function load() {
    try {
      const saved = localStorage.getItem('markedit_shortcuts');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge saved with defaults
        shortcuts = { ...structuredClone(DEFAULT_SHORTCUTS) };
        for (const [id, combo] of Object.entries(parsed)) {
          if (shortcuts[id]) {
            shortcuts[id].key = combo.key;
            shortcuts[id].ctrl = combo.ctrl;
            shortcuts[id].shift = combo.shift;
            shortcuts[id].alt = combo.alt;
          }
        }
      } else {
        shortcuts = structuredClone(DEFAULT_SHORTCUTS);
      }
    } catch {
      shortcuts = structuredClone(DEFAULT_SHORTCUTS);
    }
  }

  // ─── localStorage'a kaydetme ───
  function save() {
    try {
      const toSave = {};
      for (const [id, sc] of Object.entries(shortcuts)) {
        toSave[id] = { key: sc.key, ctrl: sc.ctrl, shift: sc.shift, alt: sc.alt };
      }
      localStorage.setItem('markedit_shortcuts', JSON.stringify(toSave));
    } catch (e) {
      console.warn('Kısayollar kaydedilemedi:', e);
    }
  }

  // ─── Handler kaydetme ───
  function registerHandler(actionId, fn) {
    handlers[actionId] = fn;
  }

  // ─── Keyboard event listener ───
  function handleKeyDown(e) {
    const combo = eventToCombo(e);

    // Sadece modifier tuşları basılmışsa atla
    if (['control', 'shift', 'alt', 'meta'].includes(combo.key)) return;

    for (const [actionId, sc] of Object.entries(shortcuts)) {
      if (matchesAction(actionId, sc, combo)) {
        e.preventDefault();
        e.stopPropagation();
        if (handlers[actionId]) {
          handlers[actionId]();
        }
        return;
      }
    }
  }

  // ─── Kısayolları UI'da render etme ───
  function renderShortcutsList(container) {
    container.innerHTML = '';

    for (const [actionId, sc] of Object.entries(shortcuts)) {
      const item = document.createElement('div');
      item.className = 'shortcut-item';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'shortcut-name';
      // Çeviriyi i18n üzerinden al
      nameSpan.textContent = window.I18n ? window.I18n.t(sc.i18nKey) : sc.label;

      const keyBtn = document.createElement('button');
      keyBtn.className = 'shortcut-key';
      keyBtn.textContent = keyComboToString(sc);
      keyBtn.title = window.I18n ? window.I18n.t('settings.shortcutsHint') : 'Değiştirmek için tıklayın';

      keyBtn.addEventListener('click', function () {
        startKeyCapture(actionId, keyBtn, container);
      });

      item.appendChild(nameSpan);
      item.appendChild(keyBtn);
      container.appendChild(item);
    }
  }

  // ─── Key Capture başlat ───
  function startKeyCapture(actionId, buttonEl, container) {
    // Zaten recording modunda başka bir buton varsa iptal et
    const existing = container.querySelector('.recording');
    if (existing) {
      existing.classList.remove('recording');
      existing.textContent = keyComboToString(shortcuts[existing.dataset.actionId]);
    }

    buttonEl.classList.add('recording');
    buttonEl.textContent = '...';
    buttonEl.dataset.actionId = actionId;

    function captureHandler(e) {
      e.preventDefault();
      e.stopPropagation();

      const combo = eventToCombo(e);

      // Sadece modifier tuşları basılmışsa bekle
      if (['control', 'shift', 'alt', 'meta'].includes(combo.key)) return;

      // En az bir modifier gerekli (F1-F12 veya Escape hariç)
      if (!combo.ctrl && !combo.alt && !combo.shift && !combo.key.startsWith('f') && combo.key !== 'escape') {
        showToast(window.I18n?.t('shortcut.modifierRequired') || 'Modifier tuşu gerekli');
        return;
      }

      // Escape ile iptal
      if (combo.key === 'escape') {
        buttonEl.classList.remove('recording');
        buttonEl.textContent = keyComboToString(shortcuts[actionId]);
        document.removeEventListener('keydown', captureHandler, true);
        return;
      }

      // Çakışma kontrolü
      const conflict = findConflict(actionId, combo);
      if (conflict) {
        const conflictName = window.I18n ? window.I18n.t(shortcuts[conflict].i18nKey) : conflict;
        const conflictMessage = window.I18n?.t('shortcut.conflict') || '{name} ile çakışıyor';
        showToast(conflictMessage.replace('{name}', conflictName));
        return;
      }

      // Atama yap
      shortcuts[actionId].key = combo.key;
      shortcuts[actionId].ctrl = combo.ctrl;
      shortcuts[actionId].shift = combo.shift;
      shortcuts[actionId].alt = combo.alt;
      save();
      notifyChange();

      buttonEl.classList.remove('recording');
      buttonEl.textContent = keyComboToString(shortcuts[actionId]);

      document.removeEventListener('keydown', captureHandler, true);
    }

    document.addEventListener('keydown', captureHandler, true);
  }

  // ─── Toast helper (app.js'te override edilecek) ───
  function showToast(msg) {
    if (window.App && window.App.showToast) {
      window.App.showToast(msg);
    } else {
      console.log(msg);
    }
  }

  // ─── Kısayolları sıfırla ───
  function resetToDefaults() {
    shortcuts = structuredClone(DEFAULT_SHORTCUTS);
    save();
    notifyChange();
  }

  // ─── Init ───
  function init() {
    load();
    document.addEventListener('keydown', handleKeyDown);
    updateToolbarTitles();
  }

  return {
    init,
    registerHandler,
    renderShortcutsList,
    updateToolbarTitles,
    resetToDefaults,
    onChange: (listener) => {
      if (typeof listener === 'function') changeListeners.push(listener);
    },
    getShortcuts: () => shortcuts,
    getComboString: (actionId) => shortcuts[actionId] ? keyComboToString(shortcuts[actionId]) : '',
  };
})();
