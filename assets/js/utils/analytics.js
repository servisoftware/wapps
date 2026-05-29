/* ============================================
   Wapps · utils/analytics.js
   Wrapper de Google Analytics 4. Centraliza el envío de eventos
   para no salpicar gtag() por todo el código.

   TODO: cuando crees la cuenta de GA4, pega el snippet de gtag
   en el <head> de las páginas y reemplaza 'G-XXXXXXXXXX' con el
   measurement ID.

   Expone: window.wapps.analytics
   ============================================ */

(() => {
  'use strict';
  window.wapps = window.wapps || {};

  const isEnabled = () => typeof window.gtag === 'function';

  const pageview = (path) => {
    if (!isEnabled()) return;
    window.gtag('event', 'page_view', {
      page_path: path || window.location.pathname
    });
  };

  /**
   * Llamar cuando el usuario calcula algo:
   *   wapps.analytics.calculation('calculadora-iva', { tarifa: 19 })
   * Nunca pasar datos personales o cifras monetarias del usuario.
   */
  const calculation = (toolSlug, metadata = {}) => {
    if (!isEnabled()) return;
    window.gtag('event', 'calculation_completed', {
      tool: toolSlug,
      ...metadata
    });
  };

  /** Cuando el usuario comparte el resultado */
  const share = (toolSlug, channel) => {
    if (!isEnabled()) return;
    window.gtag('event', 'share', { tool: toolSlug, method: channel });
  };

  /** Para el feedback 👍 / 👎 */
  const feedback = (toolSlug, value) => {
    if (!isEnabled()) return;
    window.gtag('event', 'feedback', { tool: toolSlug, value });
  };

  window.wapps.analytics = { pageview, calculation, share, feedback };
})();
