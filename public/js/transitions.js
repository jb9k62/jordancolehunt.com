/* ============================================================================
   transitions.js — view transition lifecycle (cross-document, progressive).
   No GSAP dependency. Kept minimal: purely a no-op helper for pageshow.
   ============================================================================ */

(function () {
  'use strict';

  // Nothing to tear down on navigation; the View Transitions API is handled
  // by CSS. Retain a pageshow hook for any future re-init work.
  window.addEventListener('pageshow', function (/* event */) {
    // placeholder for future per-navigation re-initialisation
  });
})();
