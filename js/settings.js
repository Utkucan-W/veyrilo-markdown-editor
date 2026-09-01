/* ═══════════════════════════════════
   Settings Module
   Ayarlar paneli yönetimi
   ═══════════════════════════════════ */

window.Settings = (function () {
  'use strict';

  const STORAGE_KEY = 'veyrilo_settings';

  const FONT_FAMILIES = {
    sans: 'system-ui, -apple-system, sans-serif',
    serif: 'Georgia, "Times New Roman", serif',
    mono: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
    segoe: '"Segoe UI", Tahoma, Geneva, sans-serif',
    inter: '"Inter", system-ui, sans-serif',
    roboto: '"Roboto", "Helvetica Neue", sans-serif',
    lora: '"Lora", Georgia, serif',
    firacode: '"Fira Code", "JetBrains Mono", monospace',
    arial: 'Arial, "Helvetica Neue", sans-serif',
    timesNewRoman: '"Times New Roman", Times, serif',
    helvetica: 'Helvetica, Arial, sans-serif',
    verdana: 'Verdana, Geneva, sans-serif',
    tahoma: 'Tahoma, "Segoe UI", sans-serif',
    courierNew: '"Courier New", Courier, monospace',
  };

  const DEFAULTS = {
    fontSize: 18,
    fontFamily: 'sans',
    theme: 'dark',
    lineHeight: '1.6',
    editorWidth: '800px',
    language: 'tr',
    previewMode: 'side',
  };

  let settings = {};
  let settingsPanel, settingsOverlay;

  // ─── Init ───
  function init() {
    settingsPanel = document.getElementById('settings-panel');
    settingsOverlay = document.getElementById('settings-overlay');

    load();
    applyAll();
    setupListeners();
  }

  // ─── localStorage'dan yükleme ───
  function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        settings = { ...DEFAULTS, ...JSON.parse(saved) };
      } else {
        settings = { ...DEFAULTS };
      }
    } catch {
      settings = { ...DEFAULTS };
    }
  }

  // ─── localStorage'a kaydetme ───
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Ayarlar kaydedilemedi:', e);
    }
  }

  // ─── Tüm ayarları uygula ───
  function applyAll() {
    applyFontSize(settings.fontSize);
    applyFontFamily(settings.fontFamily);
    applyTheme(settings.theme);
    applyLineHeight(settings.lineHeight);
    applyEditorWidth(settings.editorWidth);
    applyPreviewMode(settings.previewMode);
    syncUI();
  }

  // ─── Preview Mode ───
  function applyPreviewMode(mode) {
    settings.previewMode = mode;
    document.body.setAttribute('data-preview-mode', mode);
    save();
  }

  // ─── Font Size ───
  function applyFontSize(size) {
    settings.fontSize = size;
    document.documentElement.style.setProperty('--editor-font-size', size + 'px');
    window.Editor?.refreshCodeOverlay?.();
    save();
  }

  // ─── Font Family ───
  function applyFontFamily(familyKey) {
    settings.fontFamily = familyKey;
    const cssValue = FONT_FAMILIES[familyKey] || FONT_FAMILIES.sans;
    document.documentElement.style.setProperty('--editor-font-family', cssValue);
    window.Editor?.refreshCodeOverlay?.();
    save();
  }

  // ─── Theme ───
  function applyTheme(theme) {
    settings.theme = theme;
    document.body.setAttribute('data-theme', theme);
    save();
  }

  // ─── Line Height ───
  function applyLineHeight(height) {
    settings.lineHeight = height;
    document.documentElement.style.setProperty('--editor-line-height', height);
    window.Editor?.refreshCodeOverlay?.();
    save();
  }

  // ─── Editor Width ───
  function applyEditorWidth(width) {
    settings.editorWidth = width;
    document.documentElement.style.setProperty('--editor-max-width', width);
    window.Editor?.refreshCodeOverlay?.();
    save();
  }

  // ─── UI'ı ayarlarla senkronize et ───
  function syncUI() {
    // Font size
    const fontSizeSlider = document.getElementById('font-size-slider');
    const fontSizeValue = document.getElementById('font-size-value');
    if (fontSizeSlider) fontSizeSlider.value = settings.fontSize;
    if (fontSizeValue) fontSizeValue.textContent = settings.fontSize;

    // Font family select
    const fontFamilySelect = document.getElementById('font-family-select');
    if (fontFamilySelect) fontFamilySelect.value = settings.fontFamily;

    // Theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === settings.theme);
    });

    // Line height select
    const lineHeightSelect = document.getElementById('line-height-select');
    if (lineHeightSelect) lineHeightSelect.value = settings.lineHeight;

    // Editor width select
    const editorWidthSelect = document.getElementById('editor-width-select');
    if (editorWidthSelect) editorWidthSelect.value = settings.editorWidth;

    // Preview mode select
    const previewModeSelect = document.getElementById('preview-mode-select');
    if (previewModeSelect) previewModeSelect.value = settings.previewMode || 'side';

    // Language select
    const langSelect = document.getElementById('lang-select');
    if (langSelect) langSelect.value = settings.language || 'tr';
  }

  // ─── Event Listeners ───
  function setupListeners() {
    // Font size slider
    const fontSizeSlider = document.getElementById('font-size-slider');
    if (fontSizeSlider) {
      fontSizeSlider.addEventListener('input', function () {
        const val = parseInt(this.value);
        applyFontSize(val);
        const display = document.getElementById('font-size-value');
        if (display) display.textContent = val;
        const fmtDisplay = document.getElementById('font-size-display');
        if (fmtDisplay) fmtDisplay.textContent = val + 'px';
      });
    }

    // Font family select
    const fontFamilySelect = document.getElementById('font-family-select');
    if (fontFamilySelect) {
      fontFamilySelect.addEventListener('change', function () {
        applyFontFamily(this.value);
      });
    }

    // Theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const theme = this.dataset.theme;
        if (!theme) return;
        applyTheme(theme);
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
      });
    });

    // Line height select
    const lineHeightSelect = document.getElementById('line-height-select');
    if (lineHeightSelect) {
      lineHeightSelect.addEventListener('change', function () {
        applyLineHeight(this.value);
      });
    }

    // Editor width select
    const editorWidthSelect = document.getElementById('editor-width-select');
    if (editorWidthSelect) {
      editorWidthSelect.addEventListener('change', function () {
        applyEditorWidth(this.value);
      });
    }

    // Preview mode select
    const previewModeSelect = document.getElementById('preview-mode-select');
    if (previewModeSelect) {
      previewModeSelect.addEventListener('change', function () {
        applyPreviewMode(this.value);
      });
    }

    // Dil seçimi I18n tarafından da dinlenir; burada bellekteki ayarları
    // güncel tut ki paneli yeniden açmak eski dili geri getirmesin.
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
      langSelect.addEventListener('change', function () {
        settings.language = this.value;
        save();
      });
    }

    // Settings panel kapatma butonu
    const btnClose = document.getElementById('btn-close-settings');
    if (btnClose) {
      btnClose.addEventListener('click', closePanel);
    }

    // Overlay
    if (settingsOverlay) {
      settingsOverlay.addEventListener('click', closePanel);
    }

    // Hakkında butonu
    const btnAbout = document.getElementById('btn-about');
    if (btnAbout) {
      btnAbout.addEventListener('click', function () {
        closePanel();
        setTimeout(() => {
          if (window.App && window.App.openAboutModal) {
            window.App.openAboutModal();
          }
        }, 350);
      });
    }

    // Ayarları sıfırla
    const btnReset = document.getElementById('btn-reset-settings');
    if (btnReset) {
      btnReset.addEventListener('click', function () {
        const confirmText = window.I18n?.t('settings.resetConfirm') || 'Tüm ayarlar varsayılana döndürülecek. Emin misiniz?';
        if (confirm(confirmText)) {
          resetAll();
        }
      });
    }

    // Kısayolları render et
    const shortcutsContainer = document.getElementById('shortcuts-container');
    if (shortcutsContainer && window.Shortcuts) {
      window.Shortcuts.renderShortcutsList(shortcutsContainer);
    }
  }

  // ─── Panel aç/kapat ───
  function togglePanel() {
    if (isPanelOpen()) {
      closePanel();
    } else {
      openPanel();
    }
  }

  function openPanel() {
    if (!settingsPanel || !settingsOverlay) return;

    settingsPanel.classList.remove('hidden');
    settingsOverlay.classList.remove('hidden');

    requestAnimationFrame(() => {
      settingsPanel.classList.add('visible');
      settingsOverlay.classList.add('visible');
    });

    // Kısayolları yeniden render et
    const shortcutsContainer = document.getElementById('shortcuts-container');
    if (shortcutsContainer && window.Shortcuts) {
      window.Shortcuts.renderShortcutsList(shortcutsContainer);
    }

    syncUI();
  }

  function closePanel() {
    if (!settingsPanel || !settingsOverlay) return;

    settingsPanel.classList.remove('visible');
    settingsOverlay.classList.remove('visible');

    setTimeout(() => {
      settingsPanel.classList.add('hidden');
      settingsOverlay.classList.add('hidden');
    }, 300);
  }

  // ─── Tümünü sıfırla ───
  function resetAll() {
    settings = { ...DEFAULTS };
    save();
    applyAll();

    if (window.Shortcuts) {
      window.Shortcuts.resetToDefaults();
      const shortcutsContainer = document.getElementById('shortcuts-container');
      if (shortcutsContainer) {
        window.Shortcuts.renderShortcutsList(shortcutsContainer);
      }
    }

    if (window.I18n) window.I18n.setLanguage(settings.language);

    if (window.App && window.App.showToast) {
      window.App.showToast(window.I18n?.t('settings.resetDone') || 'Tüm ayarlar sıfırlandı');
    }
  }

  // ─── Panel durumu ───
  function isPanelOpen() {
    return settingsPanel && settingsPanel.classList.contains('visible');
  }

  return {
    init, togglePanel, openPanel, closePanel, isPanelOpen,
    applyTheme, applyFontSize,
    getSettings: () => ({ ...settings }),
  };
})();
