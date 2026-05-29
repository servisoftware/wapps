/* ============================================
   Wapps · utils/share.js
   Compartir un resultado por WhatsApp, o copiar al portapapeles.
   Expone: window.wapps.share
   ============================================ */

(() => {
  'use strict';
  window.wapps = window.wapps || {};

  /**
   * Abre WhatsApp con un mensaje pre-armado.
   * En móvil abre la app; en escritorio abre web.whatsapp.com.
   * @param {string} text
   */
  const toWhatsApp = (text) => {
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener');
  };

  /**
   * Copia un texto al portapapeles. Devuelve una promesa boolean.
   */
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback para navegadores antiguos
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    }
  };

  /**
   * Arma un mensaje estándar para compartir un resultado.
   *   buildMessage({
   *     tool: 'Calculadora de IVA',
   *     inputs: { 'Monto sin IVA': '$1.000.000', 'Tarifa': '19%' },
   *     result: { 'Total con IVA': '$1.190.000' },
   *     url: window.location.href
   *   })
   */
  const buildMessage = ({ tool, inputs = {}, result = {}, url }) => {
    const lines = [`*${tool}* — wapps.co`, ''];
    for (const [k, v] of Object.entries(inputs)) lines.push(`${k}: ${v}`);
    if (Object.keys(result).length) {
      lines.push('');
      for (const [k, v] of Object.entries(result)) lines.push(`✓ ${k}: ${v}`);
    }
    if (url) lines.push('', `Calcúlalo tú: ${url}`);
    return lines.join('\n');
  };

  window.wapps.share = { toWhatsApp, copy, buildMessage };
})();
