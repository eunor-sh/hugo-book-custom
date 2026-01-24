'use strict';

(function () {
  const root = document.documentElement;
  const toggle = document.querySelector('#mode');
  const storageKey = 'book-theme';
  const prefersDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  if (!toggle) {
    return;
  }

  function applyTheme(theme) {
    if (theme === 'auto') {
      const isDark = prefersDark && prefersDark.matches;
      root.setAttribute('data-theme', isDark ? 'dark' : 'light');
      toggle.checked = !!isDark;
      return;
    }

    const safeTheme = theme === 'dark' ? 'dark' : 'light';
    root.setAttribute('data-theme', safeTheme);
    toggle.checked = safeTheme === 'dark';
  }

  const defaultTheme = root.getAttribute('data-theme') || 'light';
  const savedTheme = localStorage.getItem(storageKey);
  const initialTheme = savedTheme || defaultTheme;

  applyTheme(initialTheme);

  if (defaultTheme === 'auto' && !savedTheme && prefersDark) {
    prefersDark.addEventListener('change', () => applyTheme('auto'));
  }

  toggle.addEventListener('change', () => {
    const nextTheme = toggle.checked ? 'dark' : 'light';
    localStorage.setItem(storageKey, nextTheme);
    applyTheme(nextTheme);
  });
})();
