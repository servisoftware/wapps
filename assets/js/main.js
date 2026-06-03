/* ============================================
   Wapps · main.js
   JavaScript común a TODA página: año dinámico del footer,
   pageview de Analytics si está disponible.
   ============================================ */

(() => {
  'use strict';

  // ---------- Año dinámico en footer ----------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Pageview automático para GA4 ----------
  // El snippet de GA4 (en el <head>) ya hizo el config inicial, pero
  // dejamos este disparo explícito para SPA-like navegaciones futuras
  // y para consolidar el flujo en nuestro wrapper.
  if (window.wapps && window.wapps.analytics && window.wapps.analytics.pageview) {
    window.wapps.analytics.pageview();
  }
})();
