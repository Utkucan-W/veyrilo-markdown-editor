/* Klavye ve fareyle erişilebilen hızlı komut listesi. */
window.CommandPalette = (function () {
  'use strict';

  let dialog;
  let input;
  let list;
  let actions = [];
  let filtered = [];
  let activeIndex = 0;
  let lastFocused = null;

  function t(key, fallback) {
    const value = window.I18n?.t?.(key);
    return value && value !== key ? value : fallback;
  }

  function render() {
    if (!list) return;
    list.replaceChildren();
    filtered = actions.filter((action) => {
      const query = input?.value.trim().toLocaleLowerCase() || '';
      return !query || `${action.label} ${action.keywords || ''}`.toLocaleLowerCase().includes(query);
    });
    activeIndex = Math.min(activeIndex, Math.max(0, filtered.length - 1));

    filtered.forEach((action, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'command-palette-item';
      button.setAttribute('role', 'option');
      button.setAttribute('aria-selected', String(index === activeIndex));
      button.textContent = action.label;
      button.addEventListener('click', () => run(index));
      list.appendChild(button);
    });
  }

  function run(index = activeIndex) {
    const action = filtered[index];
    if (!action) return;
    close();
    action.run();
  }

  function onKeyDown(event) {
    if (dialog?.classList.contains('hidden')) {
      if (event.key.toLowerCase() === 'p' && event.ctrlKey && event.shiftKey) {
        event.preventDefault();
        open();
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      activeIndex = Math.min(activeIndex + 1, Math.max(0, filtered.length - 1));
      render();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      render();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      run();
    }
  }

  function init() {
    dialog = document.getElementById('command-palette');
    input = document.getElementById('command-palette-input');
    list = document.getElementById('command-palette-list');
    input?.addEventListener('input', () => { activeIndex = 0; render(); });
    document.addEventListener('keydown', onKeyDown, true);
    dialog?.addEventListener('click', (event) => {
      if (event.target === dialog) close();
    });
  }

  function setActions(nextActions) {
    actions = Array.isArray(nextActions) ? nextActions.filter(action => action && action.label && action.run) : [];
    render();
  }

  function open() {
    if (!dialog) return;
    lastFocused = document.activeElement;
    dialog.classList.remove('hidden');
    input.value = '';
    activeIndex = 0;
    render();
    input.focus();
  }

  function close() {
    if (!dialog) return;
    dialog.classList.add('hidden');
    lastFocused?.focus?.();
    lastFocused = null;
  }

  return { init, setActions, open, close, isOpen: () => !dialog?.classList.contains('hidden'), labels: { title: t('palette.title', 'Komut paleti') } };
})();
