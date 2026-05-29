/* ============================================
   Wapps · main.js
   JavaScript que corre en TODA página: año dinámico del footer,
   navegación móvil (futuro), tracking de página.
   ============================================ */

(() => {
  'use strict';

  // Año dinámico en footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // TODO: cuando integres GA4, importa analytics.js y llama
  // a wapps.analytics.pageview() aquí.
})();
