/* Tauri masaüstü köprüsü. Tarayıcıda çalışırken API sunmaz. */
window.desktopAPI = (function () {
  'use strict';

  const invoke = window.__TAURI__?.core?.invoke;
  if (!invoke) return null;

  return {
    openFile: () => invoke('open_file'),
    openPath: (path) => invoke('open_path', { path }),
    openStartupFile: () => invoke('open_startup_file'),
    saveFile: (content, defaultName) => invoke('save_file', { content, defaultName }),
    saveFileToPath: (content, path) => invoke('save_file_to_path', { content, path }),
    fileMetadata: (path) => invoke('file_metadata', { path }),
    openExternal: (url) => invoke('open_external', { url }),
    onCloseRequested: (handler) => window.__TAURI__?.window?.getCurrentWindow?.().onCloseRequested(handler),
    // Pencere üzerine dosya sürüklenmesi işletim sistemi seviyesinde yakalanır;
    // web görünümünün kendi drop olayları bu modda tetiklenmez.
    onDragDrop: (handler) => window.__TAURI__?.webview?.getCurrentWebview?.().onDragDropEvent(handler),
    quit: () => invoke('quit_app'),
  };
})();
