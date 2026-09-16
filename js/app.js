/* ═══════════════════════════════════
   App Module — Ana uygulama başlatıcı
   Tüm modülleri bağlar ve başlatır
   ═══════════════════════════════════ */

window.App = (function () {
  'use strict';

  let toastTimer = null;
  let displayedWelcome = null;

  function t(key, fallback, variables) {
    let message = window.I18n?.t?.(key) || fallback;
    Object.entries(variables || {}).forEach(([name, value]) => {
      message = message.replaceAll(`{${name}}`, String(value));
    });
    return message;
  }

  // ─── Toast Notification ───
  function showToast(message, duration) {
    duration = duration || 2500;
    const toast = document.getElementById('toast');
    if (!toast) return;

    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.remove('hidden');

    requestAnimationFrame(() => {
      toast.classList.add('visible');
    });

    toastTimer = setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.classList.add('hidden'), 300);
    }, duration);
  }

  // ─── Kısayol handler'larını kaydet ───
  function registerShortcutHandlers() {
    const S = window.Shortcuts;
    const E = window.Editor;
    const P = window.Preview;
    const F = window.FileManager;
    const St = window.Settings;

    if (!S) return;

    // Markdown formatting
    S.registerHandler('bold', () => E && E.bold());
    S.registerHandler('italic', () => E && E.italic());
    S.registerHandler('strikethrough', () => E && E.strikethrough());
    S.registerHandler('highlight', () => E && E.highlight());
    S.registerHandler('code', () => E && E.inlineCode());
    S.registerHandler('codeblock', () => E && E.codeBlock());
    S.registerHandler('link', () => E && E.link());
    S.registerHandler('image', () => E && E.image());
    S.registerHandler('h1', () => E && E.heading1());
    S.registerHandler('h2', () => E && E.heading2());
    S.registerHandler('h3', () => E && E.heading3());
    S.registerHandler('h4', () => E && E.heading4());
    S.registerHandler('h5', () => E && E.heading5());
    S.registerHandler('h6', () => E && E.heading6());
    S.registerHandler('list', () => E && E.list());
    S.registerHandler('orderedList', () => E && E.orderedList());
    S.registerHandler('checkboxList', () => E && E.checkboxList());
    S.registerHandler('quote', () => E && E.quote());
    S.registerHandler('table', () => E && E.table());
    S.registerHandler('horizontalRule', () => E && E.horizontalRule());
    S.registerHandler('undo', () => E && E.undo());
    S.registerHandler('redo', () => E && E.redo());

    // Toggle
    S.registerHandler('find', () => window.Find && window.Find.open());
    S.registerHandler('replace', () => window.Find && window.Find.openWithReplace());
    S.registerHandler('preview', () => {
      if (P) {
        const active = P.toggle();
        showToast(t(active ? 'toast.previewOpened' : 'toast.previewClosed', active ? 'Önizleme açıldı' : 'Önizleme kapatıldı'));
      }
    });
    S.registerHandler('focus', () => {
      if (E) {
        const active = E.toggleFocusMode();
        showToast(t(active ? 'toast.focusOpened' : 'toast.focusClosed', active ? 'Odak modu açıldı' : 'Odak modu kapatıldı'));
      }
    });
    S.registerHandler('zen', () => {
      if (E) {
        const active = E.toggleZenMode();
        showToast(t(active ? 'toast.zenOpened' : 'toast.zenClosed', active ? 'Zen modu açıldı — Esc ile çık' : 'Zen modu kapatıldı'));
      }
    });

    // Dosya
    S.registerHandler('save', () => F && F.saveFile());
    S.registerHandler('open', () => F && F.openFile());
    S.registerHandler('newdoc', () => F && F.newDocument());

    // Uygulama
    S.registerHandler('settings', () => St && St.togglePanel());
    S.registerHandler('fontIncrease', () => changeFontSize(1));
    S.registerHandler('fontDecrease', () => changeFontSize(-1));
  }

  // ─── Yazı boyutu değiştirme ───
  function changeFontSize(delta) {
    const settings = window.Settings ? window.Settings.getSettings() : { fontSize: 18 };
    const current = settings.fontSize || 18;
    const next = Math.min(32, Math.max(12, current + delta));
    if (window.Settings) window.Settings.applyFontSize(next);
    updateFontSizeDisplay(next);
    showToast(t('toast.fontSize', 'Yazı boyutu: {size}px', { size: next }));
  }

  // ─── Font size display güncelle ───
  function updateFontSizeDisplay(size) {
    const display = document.getElementById('font-size-display');
    if (display) display.textContent = size + 'px';
    const slider = document.getElementById('font-size-slider');
    if (slider) slider.value = size;
    const sliderValue = document.getElementById('font-size-value');
    if (sliderValue) sliderValue.textContent = size;
  }

  // ─── Çalışma alanı sekmeleri ───
  function showWorkspace(workspace) {
    const editorTab = document.getElementById('tab-editor');
    const guideTab = document.getElementById('tab-guide');
    const editorPane = document.getElementById('editor-pane');
    const previewPane = document.getElementById('preview-pane');
    const guidePane = document.getElementById('guide-pane');
    const guideContent = document.getElementById('guide-content');
    const isGuide = workspace === 'guide';

    editorTab?.classList.toggle('active', !isGuide);
    editorTab?.setAttribute('aria-selected', String(!isGuide));
    guideTab?.classList.toggle('active', isGuide);
    guideTab?.setAttribute('aria-selected', String(isGuide));
    editorPane?.classList.toggle('hidden', isGuide);
    previewPane?.classList.toggle('hidden', isGuide || !window.Preview?.getVisible());
    guidePane?.classList.toggle('hidden', !isGuide);

    if (isGuide && guideContent && window.MarkdownGuide) {
      window.MarkdownGuide.render(window.I18n?.getCurrentLang() || 'tr', guideContent);
    }
  }

  function setupWorkspaceTabs() {
    document.getElementById('tab-editor')?.addEventListener('click', () => showWorkspace('editor'));
    document.getElementById('tab-guide')?.addEventListener('click', () => showWorkspace('guide'));
    window.Shortcuts?.onChange(() => {
      const guidePane = document.getElementById('guide-pane');
      if (guidePane && !guidePane.classList.contains('hidden')) showWorkspace('guide');
    });
  }

  // ─── Toolbar butonlarına event listener ───
  function setupToolbarButtons() {
    const E = window.Editor;
    const P = window.Preview;
    const F = window.FileManager;
    const St = window.Settings;

    document.getElementById('btn-command-palette')?.addEventListener('click', () => window.CommandPalette?.open());
    window.CommandPalette?.setActions([
      { label: t('palette.new', 'Yeni belge'), keywords: 'new belge', run: () => F?.newDocument() },
      { label: t('palette.open', 'Dosya aç'), keywords: 'open dosya', run: () => F?.openFile() },
      { label: t('palette.save', 'Kaydet'), keywords: 'save kaydet', run: () => F?.saveFile() },
      { label: t('palette.exportHTML', 'HTML dışa aktar'), keywords: 'html export dışa aktar', run: () => F?.exportHTML() },
      { label: t('palette.exportPdf', 'PDF dışa aktar'), keywords: 'pdf export dışa aktar', run: () => F?.exportPdf() },
      { label: t('palette.preview', 'Önizlemeyi aç/kapat'), keywords: 'preview önizleme', run: () => P?.toggle() },
      { label: t('palette.focus', 'Odak modunu aç/kapat'), keywords: 'focus odak', run: () => E?.toggleFocusMode() },
      { label: t('palette.zen', 'Zen modunu aç/kapat'), keywords: 'zen', run: () => E?.toggleZenMode() },
      { label: t('palette.outline', 'İçindekileri aç/kapat'), keywords: 'outline başlık içindekiler', run: () => window.Outline?.toggle() },
      { label: t('palette.guide', 'Markdown rehberini aç'), keywords: 'guide rehber', run: () => showWorkspace('guide') },
      { label: t('palette.settings', 'Ayarları aç/kapat'), keywords: 'settings ayarlar', run: () => St?.togglePanel() },
    ]);

    // Dosya butonları
    document.getElementById('btn-new')?.addEventListener('click', () => F && F.newDocument());
    document.getElementById('btn-open')?.addEventListener('click', () => F && F.openFile());
    document.getElementById('btn-save')?.addEventListener('click', () => F && F.saveFile());
    document.getElementById('btn-export-pdf')?.addEventListener('click', () => F && F.exportPdf());
    document.getElementById('btn-export-html')?.addEventListener('click', () => F && F.exportHTML());

    const recentButton = document.getElementById('btn-recent');
    const recentDropdown = document.getElementById('recent-files-dropdown');
    recentButton?.addEventListener('click', (event) => {
      event.stopPropagation();
      if (!recentDropdown) return;
      const isOpen = recentDropdown.classList.toggle('hidden');
      recentButton.setAttribute('aria-expanded', String(!isOpen));
      if (!isOpen && F?.renderRecentFiles) F.renderRecentFiles(recentDropdown);
    });
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.recent-files-menu')) F?.closeRecentFiles?.();
    });
    // Toggle butonları
    document.getElementById('btn-preview')?.addEventListener('click', () => {
      if (P) {
        const active = P.toggle();
        showToast(t(active ? 'toast.previewOpened' : 'toast.previewClosed', active ? 'Önizleme açıldı' : 'Önizleme kapatıldı'));
      }
    });
    document.getElementById('btn-focus')?.addEventListener('click', () => {
      if (E) {
        const active = E.toggleFocusMode();
        showToast(t(active ? 'toast.focusOpened' : 'toast.focusClosed', active ? 'Odak modu açıldı' : 'Odak modu kapatıldı'));
      }
    });
    document.getElementById('btn-zen')?.addEventListener('click', () => {
      if (E) {
        const active = E.toggleZenMode();
        showToast(t(active ? 'toast.zenOpened' : 'toast.zenClosed', active ? 'Zen modu açıldı' : 'Zen modu kapatıldı'));
      }
    });

    // Font boyut butonları
    document.getElementById('btn-font-increase')?.addEventListener('click', () => changeFontSize(1));
    document.getElementById('btn-font-decrease')?.addEventListener('click', () => changeFontSize(-1));

    // Ayarlar butonu
    document.getElementById('btn-settings')?.addEventListener('click', () => St && St.togglePanel());

    // About modal
    document.getElementById('about-overlay')?.addEventListener('click', closeAboutModal);
    document.getElementById('btn-close-about')?.addEventListener('click', closeAboutModal);

    // Format bar butonları
    const formatActions = {
      h1: () => E && E.heading1(),
      h2: () => E && E.heading2(),
      h3: () => E && E.heading3(),
      h4: () => E && E.heading4(),
      h5: () => E && E.heading5(),
      h6: () => E && E.heading6(),
      bold: () => E && E.bold(),
      italic: () => E && E.italic(),
      strikethrough: () => E && E.strikethrough(),
      highlight: () => E && E.highlight(),
      code: () => E && E.inlineCode(),
      codeblock: () => E && E.codeBlock(),
      link: () => E && E.link(),
      image: () => E && E.image(),
      list: () => E && E.list(),
      orderedList: () => E && E.orderedList(),
      checkboxList: () => E && E.checkboxList(),
      quote: () => E && E.quote(),
      table: () => E && E.table(),
      horizontalRule: () => E && E.horizontalRule(),
    };

    document.querySelectorAll('.fmt-btn[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (formatActions[action]) formatActions[action]();
      });
    });

    // İlk yüklemede font size display güncelle
    const settings = window.Settings ? window.Settings.getSettings() : {};
    updateFontSizeDisplay(settings.fontSize || 18);

    // Dış linkleri yakala
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a.ext-link');
      if (link) {
        e.preventDefault();
        const url = link.href;
        if (window.desktopAPI?.openExternal) {
          window.desktopAPI.openExternal(url);
        } else {
          window.open(url, '_blank');
        }
      }
    });
  }

  // ─── About Modal ───
  function openAboutModal() {
    document.getElementById('about-overlay')?.classList.remove('hidden');
    document.getElementById('about-modal')?.classList.remove('hidden');
  }

  function closeAboutModal() {
    document.getElementById('about-overlay')?.classList.add('hidden');
    document.getElementById('about-modal')?.classList.add('hidden');
  }

  // ─── Hoşgeldin mesajı ───
  function showWelcome() {
    const editor = window.Editor;
    if (!editor) return;
    if (editor.getRecoveryDraft?.()) return;
    const content = editor.getContent();
    if (content.trim() === '') {
      displayedWelcome = window.I18n ? window.I18n.t('welcome') : '# Veyrilo\'ya Hoş Geldiniz!\n\nYazmaya başlayın...';
      editor.setContent(displayedWelcome);
    } else if (window.I18n && window.I18n.isWelcomeContent(content)) {
      // Önceki oturumda kaydedilen varsayılan karşılama metnini de izlemeye al.
      displayedWelcome = content;
    }
  }

  // Dil değişiminde yalnızca uygulamanın kendi varsayılan metnini güncelle.
  // Kullanıcının yazdığı içeriği hiçbir dil değişimi ezmemeli.
  function updateWelcomeLanguage() {
    const editor = window.Editor;
    if (!editor) return;

    const content = editor.getContent();
    const isTrackedWelcome = displayedWelcome !== null && content === displayedWelcome;
    const isSavedWelcome = window.I18n && window.I18n.isWelcomeContent(content);
    if (!isTrackedWelcome && !isSavedWelcome) return;

    displayedWelcome = window.I18n ? window.I18n.t('welcome') : displayedWelcome;
    editor.setContent(displayedWelcome);
  }

  let forceClosing = false;

  function closeWindow() {
    forceClosing = true;
    window.FileManager?.clearRecoveryDraft?.();
    // `window.destroy()` bazı Linux kurulumlarında (XWayland + zorlanmış X11
    // backend) prevent_close sonrası sessizce hiçbir şey yapmıyor. Rust
    // tarafındaki quit komutu süreç sonlandırmayı garanti eder.
    if (window.desktopAPI?.quit) {
      window.desktopAPI.quit();
      return;
    }
    window.__TAURI__?.window?.getCurrentWindow?.().destroy();
  }

  function showCloseDialog() {
    const dialog = document.getElementById('close-dialog');
    const cancelBtn = document.getElementById('close-dialog-cancel');
    const discardBtn = document.getElementById('close-dialog-discard');
    if (!dialog || !cancelBtn || !discardBtn) {
      // Diyalog yoksa veriyi koruyup açık kalmak en güvenlisi.
      return;
    }
    if (!dialog.classList.contains('hidden')) return; // zaten açık

    dialog.classList.remove('hidden');
    discardBtn.focus();

    const cleanup = () => {
      dialog.classList.add('hidden');
      cancelBtn.removeEventListener('click', onCancel);
      discardBtn.removeEventListener('click', onDiscard);
      document.removeEventListener('keydown', onKey, true);
    };
    const onCancel = () => cleanup();
    const onDiscard = () => { cleanup(); closeWindow(); };
    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); onCancel(); }
    };

    cancelBtn.addEventListener('click', onCancel);
    discardBtn.addEventListener('click', onDiscard);
    document.addEventListener('keydown', onKey, true);
  }

  function registerCloseGuard() {
    // Tauri pencere kapatma isteğini yakala. Native dialog (rfd veya
    // window.confirm) ana thread'de iç içe GTK döngüsü açıp uygulamayı
    // dondurabildiği için tamamen uygulama içi HTML diyalog kullanıyoruz.
    // Kapanış her durumda bizim `closeWindow()` (Rust quit) üzerinden olur;
    // Tauri sarmalayıcısının kendi `destroy()` çağrısına güvenmiyoruz.
    window.desktopAPI?.onCloseRequested?.((event) => {
      if (forceClosing) return;
      event.preventDefault();

      if (!window.FileManager?.hasUnsavedChanges?.()) {
        closeWindow();
        return;
      }
      showCloseDialog();
    });

    // Acil çıkış / teşhis: Ctrl+Shift+Q her zaman süreci sonlandırır.
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'Q' || e.key === 'q')) {
        e.preventDefault();
        closeWindow();
      }
    });
  }

  // ─── Sürükle-bırak ile dosya açma ───
  function registerFileDrop() {
    const overlay = document.getElementById('drop-overlay');
    const setOverlayVisible = (visible) => overlay?.classList.toggle('hidden', !visible);

    window.desktopAPI?.onDragDrop?.((event) => {
      const payload = event?.payload || {};
      if (payload.type === 'drop') {
        setOverlayVisible(false);
        window.FileManager?.openDroppedPaths?.(payload.paths);
        return;
      }
      setOverlayVisible(payload.type === 'enter' || payload.type === 'over');
    });
  }

  // ─── Ana başlatma ───
  function init() {
    try {
      if (window.I18n) window.I18n.init();
      if (window.Settings) window.Settings.init();
      if (window.Shortcuts) window.Shortcuts.init();
      if (window.Stats) window.Stats.init();
      if (window.Editor) window.Editor.init();
      if (window.Preview) window.Preview.init();
      if (window.FileManager) window.FileManager.init();
      if (window.Find) window.Find.init();
      if (window.Outline) window.Outline.init();
      if (window.CommandPalette) window.CommandPalette.init();

      registerShortcutHandlers();
      setupToolbarButtons();
      setupWorkspaceTabs();
      registerCloseGuard();
      registerFileDrop();
      showWelcome();
      Promise.resolve(window.FileManager?.openStartupFile?.()).then((opened) => {
        if (!opened) window.FileManager?.offerRecoveryDraft?.();
      });

      if (window.FileManager) {
        document.title = `${window.FileManager.getFileName()} — Veyrilo`;
      } else {
        document.title = 'Veyrilo';
      }

      // Escape ile settings/about kapatma
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if (window.Editor && document.body.classList.contains('zen-mode')) {
            window.Editor.toggleZenMode();
            showToast(t('toast.zenClosed', 'Zen modu kapatıldı'));
          }
          if (window.FileManager) window.FileManager.closeRecentFiles();
          if (window.Settings && window.Settings.isPanelOpen()) {
            window.Settings.closePanel();
          }
          closeAboutModal();
        }
      });

      console.log('%c✨ Veyrilo başlatıldı', 'color: #4a7dff; font-weight: bold; font-size: 14px;');
    } catch (err) {
      console.error('Veyrilo init hatası:', err);
    }
  }

  // ─── DOM hazır olduğunda başlat ───
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { showToast, init, openAboutModal, closeAboutModal, updateWelcomeLanguage, showWorkspace, registerCloseGuard, registerFileDrop };
})();
