/* ═══════════════════════════════════
   File Module
   Dosya aç, kaydet, yeni belge
   ═══════════════════════════════════ */

window.FileManager = (function () {
  'use strict';

  let currentFileName = 'belge.md';
  let currentFilePath = null;
  let lastSavedContent = null;
  let recentFiles = [];
  const RECENT_STORAGE_KEY = 'markedit_recent_files';
  const MAX_RECENT_FILES = 8;

  function t(key, fallback) {
    const value = window.I18n?.t?.(key);
    return value && value !== key ? value : fallback;
  }

  function message(key, fallback, variables) {
    let value = t(key, fallback);
    Object.entries(variables || {}).forEach(([name, replacement]) => {
      value = value.replaceAll(`{${name}}`, String(replacement));
    });
    return value;
  }

  function confirmReplacingDocument() {
    if (!hasUnsavedChanges()) return true;
    return confirm(t(
      'file.unsavedChanges',
      'Kaydedilmemiş değişiklikler var. Yeni belge açarsanız değişiklikler kaydedilmeyecek.',
    ));
  }

  function init() {
    // Her uygulama açılışında yeni belge başlatılır. Son açılan dosyalar
    // menüsü ayrı tutulur ve buradan istenen dosya yeniden açılabilir.
    currentFileName = 'belge.md';
    currentFilePath = null;
    lastSavedContent = null;
    loadRecentFiles();
    renderRecentFiles();
    updateTitle();
  }

  // ─── Yeni Belge ───
  function newDocument() {
    if (!confirmReplacingDocument()) return;

    if (window.Editor) {
      window.Editor.clear();
    }

    currentFileName = 'belge.md';
    currentFilePath = null;
    lastSavedContent = '';
    saveFileName();
    updateTitle();

    showToast(t('file.newCreated', 'Yeni belge oluşturuldu'));
  }

  // Uygulama içindeki hazır Markdown belgelerini aç.
  function openContent(content, fileName) {
    if (window.Editor) window.Editor.setContent(content);
    currentFileName = fileName;
    currentFilePath = null;
    lastSavedContent = content;
    saveFileName();
    updateTitle();
  }

  // ─── Dosya Aç ───
  function openFile() {
    if (window.desktopAPI?.openFile) {
      openFileWithDesktopApp();
      return;
    }

    if (!confirmReplacingDocument()) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.markdown,.txt,.text';

    input.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (evt) {
        if (window.Editor) {
          window.Editor.setContent(evt.target.result);
        }

        currentFileName = file.name;
        currentFilePath = file.path || null;
        lastSavedContent = evt.target.result;
        rememberRecentFile(file);
        saveFileName();
        updateTitle();
        showToast(message('file.opened', '"{name}" dosyası açıldı', { name: file.name }));
      };

      reader.onerror = function () {
        showToast(t('file.readError', 'Dosya okunamadı'));
      };

      reader.readAsText(file);
    });

    input.click();
  }

  // ─── Dosya Kaydet (Markdown) ───
  function saveFile() {
    const content = window.Editor ? window.Editor.getContent() : '';
    if (window.desktopAPI?.saveFile) {
      if (currentFilePath && window.desktopAPI.saveFileToPath) {
        saveFileToCurrentPath(content);
      } else {
        saveFileWithDesktopApp(content);
      }
      return;
    }
    exportContent(content, 'md', 'text/markdown', 'Markdown Dosyası', currentFileName);
  }

  async function openFileWithDesktopApp() {
    if (!confirmReplacingDocument()) return;
    try {
      const file = await window.desktopAPI.openFile();
      if (!file) return;
      window.Editor?.setContent(file.content);
      currentFileName = file.name;
      currentFilePath = file.path || null;
      lastSavedContent = file.content;
      rememberRecentFile(file);
      saveFileName();
      updateTitle();
      showToast(message('file.opened', '"{name}" dosyası açıldı', { name: file.name }));
    } catch {
      showToast(t('file.readError', 'Dosya okunamadı'));
    }
  }

  async function openStartupFile() {
    if (!window.desktopAPI?.openStartupFile) return;

    try {
      const file = await window.desktopAPI.openStartupFile();
      if (!file) return;
      window.Editor?.setContent(file.content);
      currentFileName = file.name;
      currentFilePath = file.path || null;
      lastSavedContent = file.content;
      rememberRecentFile(file);
      saveFileName();
      updateTitle();
      showToast(message('file.opened', '"{name}" dosyası açıldı', { name: file.name }));
    } catch {
      showToast(t('file.readError', 'Dosya okunamadı'));
    }
  }

  async function openRecentFile(path) {
    if (!path || !window.desktopAPI?.openPath) {
      showToast(t('recent.unavailable', 'Bu dosya doğrudan açılamıyor'));
      return;
    }
    if (!confirmReplacingDocument()) return;

    try {
      const file = await window.desktopAPI.openPath(path);
      if (!file) return;
      window.Editor?.setContent(file.content);
      currentFileName = file.name;
      currentFilePath = file.path || path;
      lastSavedContent = file.content;
      rememberRecentFile(file);
      saveFileName();
      updateTitle();
      closeRecentFilesMenu();
      showToast(message('file.opened', '"{name}" dosyası açıldı', { name: file.name }));
    } catch {
      forgetRecentFile(path);
      showToast(t('recent.missing', 'Dosya bulunamadı'));
    }
  }

  // ─── Sürükle-bırak ile açma ───
  // Pencereye bırakılan ilk desteklenen dosya açılır; ikili dosyaların
  // editöre yüklenmesini engellemek için uzantı süzülür.
  const SUPPORTED_EXTENSIONS = ['md', 'markdown', 'mdown', 'mkd', 'txt', 'text'];

  function isSupportedPath(path) {
    const name = String(path).split(/[\\/]/).pop() || '';
    const dot = name.lastIndexOf('.');
    if (dot <= 0) return false;
    return SUPPORTED_EXTENSIONS.includes(name.slice(dot + 1).toLowerCase());
  }

  async function openDroppedPaths(paths) {
    const candidates = Array.isArray(paths) ? paths.filter(Boolean) : [];
    if (!candidates.length) return false;

    const path = candidates.find(isSupportedPath);
    if (!path) {
      showToast(t('drop.unsupported', 'Yalnızca Markdown ve metin dosyaları açılabilir'));
      return false;
    }
    if (!window.desktopAPI?.openPath) {
      showToast(t('recent.unavailable', 'Bu dosya doğrudan açılamıyor'));
      return false;
    }
    if (!confirmReplacingDocument()) return false;

    try {
      const file = await window.desktopAPI.openPath(path);
      if (!file) return false;
      window.Editor?.setContent(file.content);
      currentFileName = file.name;
      currentFilePath = file.path || path;
      lastSavedContent = file.content;
      rememberRecentFile(file);
      saveFileName();
      updateTitle();
      showToast(message('file.opened', '"{name}" dosyası açıldı', { name: file.name }));
      return true;
    } catch {
      showToast(t('file.readError', 'Dosya okunamadı'));
      return false;
    }
  }

  function loadRecentFiles() {
    try {
      const saved = localStorage.getItem(RECENT_STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      recentFiles = Array.isArray(parsed)
        ? parsed.filter(file => file && file.name && file.path).slice(0, MAX_RECENT_FILES)
        : [];
    } catch {
      recentFiles = [];
    }
  }

  function saveRecentFiles() {
    try {
      localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recentFiles));
    } catch (e) {
      console.warn('Son açılan dosyalar kaydedilemedi:', e);
    }
  }

  function rememberRecentFile(file) {
    if (!file?.path || !file?.name) return;
    recentFiles = [
      { name: file.name, path: file.path, openedAt: Date.now() },
      ...recentFiles.filter(item => item.path !== file.path),
    ].slice(0, MAX_RECENT_FILES);
    saveRecentFiles();
    renderRecentFiles();
  }

  function forgetRecentFile(path) {
    recentFiles = recentFiles.filter(file => file.path !== path);
    saveRecentFiles();
    renderRecentFiles();
  }

  function renderRecentFiles(container) {
    const target = container || document.getElementById('recent-files-dropdown');
    if (!target) return;
    target.replaceChildren();

    if (!recentFiles.length) {
      const empty = document.createElement('p');
      empty.className = 'recent-files-empty';
      empty.textContent = window.I18n?.t('recent.empty') || 'Henüz açılan dosya yok';
      target.appendChild(empty);
      return;
    }

    recentFiles.forEach(file => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'recent-file-item';
      item.setAttribute('role', 'menuitem');
      item.title = file.path;

      const name = document.createElement('strong');
      name.textContent = file.name;
      const path = document.createElement('small');
      path.textContent = file.path;
      item.append(name, path);
      item.addEventListener('click', () => openRecentFile(file.path));
      target.appendChild(item);
    });
  }

  function closeRecentFilesMenu() {
    const dropdown = document.getElementById('recent-files-dropdown');
    const button = document.getElementById('btn-recent');
    dropdown?.classList.add('hidden');
    button?.setAttribute('aria-expanded', 'false');
  }

  async function saveFileWithDesktopApp(content) {
    try {
      const saved = await window.desktopAPI.saveFile(content, currentFileName);
      if (!saved) return;
      const file = typeof saved === 'string' ? { name: saved } : saved;
      currentFileName = file.name;
      currentFilePath = file.path || null;
      lastSavedContent = content;
      rememberRecentFile(file);
      saveFileName();
      updateTitle();
      showToast(message('file.saved', '"{name}" kaydedildi', { name: file.name }));
    } catch {
      showToast(t('file.saveError', 'Dosya kaydedilemedi'));
    }
  }

  async function saveFileToCurrentPath(content) {
    try {
      const saved = await window.desktopAPI.saveFileToPath(content, currentFilePath);
      if (!saved) return;
      currentFileName = saved.name;
      currentFilePath = saved.path || currentFilePath;
      lastSavedContent = content;
      rememberRecentFile(saved);
      saveFileName();
      updateTitle();
      showToast(message('file.saved', '"{name}" kaydedildi', { name: saved.name }));
    } catch {
      showToast(t('file.saveError', 'Dosya kaydedilemedi'));
    }
  }

  // ─── HTML Olarak Aktar ───
  function exportHTML() {
    const content = window.Editor ? window.Editor.getContent() : '';
    const htmlContent = window.Preview?.renderToSafeHtml(content) || '';

    const language = escapeHtml(document.documentElement.lang || 'tr');
    const htmlDoc = `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(currentFileName.replace(/\.[^/.]+$/, ""))}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #333; }
    pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
    code { font-family: ui-monospace, monospace; background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
    img { max-width: 100%; height: auto; }
    blockquote { border-left: 4px solid #ccc; margin: 0; padding-left: 16px; color: #666; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; }
    th { background: #f4f4f4; }
  </style>
</head>
<body>
${htmlContent}
</body>
</html>`;

    const suggestedName = currentFileName.replace(/\.[^/.]+$/, "") + '.html';
    exportContent(htmlDoc, 'html', 'text/html', 'HTML Dosyası', suggestedName);
  }

  // ─── PDF olarak aktar ───
  async function exportPdf() {
    const content = window.Editor ? window.Editor.getContent() : '';
    const html = window.Preview?.renderToSafeHtml(content);

    if (!html) {
      showToast(t('pdf.converterUnavailable', 'PDF oluşturmak için Markdown dönüştürücü hazır değil'));
      return;
    }

    const printContainer = document.getElementById('pdf-export-container');
    if (!printContainer || typeof window.print !== 'function') {
      showToast(t('pdf.unavailable', 'PDF yazdırma özelliği kullanılamıyor'));
      return;
    }

    printContainer.innerHTML = html;
    printContainer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('pdf-printing');

    let cleaned = false;
    let fallbackCleanupTimer = null;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      if (fallbackCleanupTimer) window.clearTimeout(fallbackCleanupTimer);
      printContainer.replaceChildren();
      printContainer.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('pdf-printing');
    };

    window.addEventListener('afterprint', cleanup, { once: true });
    const nextFrame = (callback) => {
      if (typeof window.requestAnimationFrame === 'function') {
        window.requestAnimationFrame(callback);
      } else {
        window.setTimeout(callback, 0);
      }
    };
    nextFrame(() => nextFrame(() => {
      showToast(t('pdf.printHint', 'Yazdır penceresinden PDF olarak kaydedebilirsin'));
      // Bazı WebView sürümleri afterprint olayını göndermeyebilir.
      fallbackCleanupTimer = window.setTimeout(cleanup, 30000);
      try {
        window.print();
      } catch (error) {
        cleanup();
        showToast(String(error || t('pdf.unavailable', 'PDF yazdırma özelliği kullanılamıyor')));
      }
    }));
  }

  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[char]);
  }

  // ─── Ortak Dışa Aktarma Mantığı ───
  function exportContent(content, ext, mimeType, description, suggestedName) {
    if ('showSaveFilePicker' in window) {
      saveWithFilePicker(content, ext, mimeType, description, suggestedName);
    } else {
      saveWithDownload(content, mimeType, suggestedName);
    }
  }

  // ─── Modern File System Access API ───
  async function saveWithFilePicker(content, ext, mimeType, description, suggestedName) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: suggestedName,
        types: [
          {
            description: description,
            accept: { [mimeType]: ['.' + ext] },
          },
        ],
      });

      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();

      if (ext === 'md') {
        currentFileName = handle.name;
        lastSavedContent = content;
        saveFileName();
        updateTitle();
      }
      showToast(message('file.saved', '"{name}" kaydedildi', { name: handle.name }));
    } catch (e) {
      if (e.name !== 'AbortError') {
        saveWithDownload(content, mimeType, suggestedName);
      }
    }
  }

  // ─── Fallback: Blob ile indirme ───
  function saveWithDownload(content, mimeType, suggestedName) {
    const blob = new Blob([content], { type: mimeType + ';charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = suggestedName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
    showToast(message('file.exported', '"{name}" indirildi', { name: suggestedName }));
  }

  // ─── Dosya adı saklama ───
  function saveFileName() {
    try {
      localStorage.setItem('markedit_filename', currentFileName);
    } catch (e) {
      // Sessizce devam et
    }
  }

  // ─── Başlık güncelle ───
  function updateTitle() {
    document.title = `${currentFileName} — Veyrilo`;
    const documentName = document.getElementById('document-name');
    if (documentName) documentName.textContent = currentFileName;
  }

  function hasUnsavedChanges() {
    const content = window.Editor?.getContent?.() || '';
    if (lastSavedContent === null) {
      // Henüz kaydedilmemiş belge: yalnızca uygulamanın kendi karşılama
      // metni duruyorsa değişiklik sayılmaz, kullanıcı bir şey yazmışsa sayılır.
      if (window.I18n?.isWelcomeContent?.(content)) return false;
      return content.length > 0;
    }
    return content !== lastSavedContent;
  }

  // ─── Toast ───
  function showToast(msg) {
    if (window.App && window.App.showToast) {
      window.App.showToast(msg);
    }
  }

  // ─── Dosya adı getir ───
  function getFileName() {
    return currentFileName;
  }

  return {
    init,
    newDocument,
    openContent,
    openFile,
    openStartupFile,
    openRecentFile,
    openDroppedPaths,
    isSupportedPath,
    renderRecentFiles,
    closeRecentFiles: closeRecentFilesMenu,
    getRecentFiles: () => recentFiles.map(file => ({ ...file })),
    saveFile,
    exportPdf,
    exportHTML,
    getFileName,
    hasUnsavedChanges,
  };
})();
