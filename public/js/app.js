/* ============================================================================
   app.js — vanilla frontend behaviour (no build step, no external deps)
   ============================================================================ */

(function () {
  'use strict';

  // ---------- Theme switcher ----------
  var toggle = document.getElementById('theme-toggle');
  var label = toggle ? toggle.querySelector('.theme-toggle-label') : null;

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    try {
      localStorage.setItem('theme', theme);
    } catch (e) { /* ignore */ }
    if (label) label.textContent = theme === 'dark' ? 'LIGHT' : 'DARK';
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    });
  }

  // Set the initial label (theme was applied by the inline head script)
  if (label) label.textContent = currentTheme() === 'dark' ? 'LIGHT' : 'DARK';

  // Keep <meta name="theme-color"> in sync
  function syncThemeColor() {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', currentTheme() === 'dark' ? '#2e2d2b' : '#faf9f6');
    }
  }
  if (toggle) toggle.addEventListener('click', syncThemeColor);
  syncThemeColor();
})();
