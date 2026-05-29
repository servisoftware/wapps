/* ============================================
   Wapps · utils/format.js
   Funciones de formato para usar en TODAS las herramientas.
   Expone: window.wapps.format
   ============================================ */

(() => {
  'use strict';
  window.wapps = window.wapps || {};

  /**
   * Formatea un número como pesos colombianos.
   * @param {number} value
   * @param {object} [opts] { decimals: 0, withSymbol: true }
   * @returns {string}
   *
   * Ejemplos:
   *   formatCOP(1500000)  → "$1.500.000"
   *   formatCOP(0.95, { decimals: 2 }) → "$0,95"
   */
  const formatCOP = (value, opts = {}) => {
    const { decimals = 0, withSymbol = true } = opts;
    if (value === null || value === undefined || isNaN(value)) return '—';
    const formatted = new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
    return withSymbol ? `$${formatted}` : formatted;
  };

  /**
   * Formatea un número genérico al estilo colombiano (puntos como
   * separador de miles, coma como decimal).
   */
  const formatNumber = (value, decimals = 0) => {
    if (value === null || value === undefined || isNaN(value)) return '—';
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  };

  /**
   * Formatea un porcentaje. percent debe estar en escala 0-100, no 0-1.
   *   formatPercent(19) → "19%"
   *   formatPercent(7.5, 1) → "7,5%"
   */
  const formatPercent = (percent, decimals = 0) => {
    if (percent === null || percent === undefined || isNaN(percent)) return '—';
    return `${formatNumber(percent, decimals)}%`;
  };

  /**
   * Convierte un string formateado al estilo colombiano de vuelta a
   * número plano. Útil para leer inputs donde el usuario escribió "1.500.000".
   *   parseCOP("$1.500.000")  → 1500000
   *   parseCOP("19,5")        → 19.5
   */
  const parseCOP = (str) => {
    if (typeof str !== 'string') return Number(str);
    const cleaned = str.replace(/[\s$]/g, '').replace(/\./g, '').replace(',', '.');
    const n = parseFloat(cleaned);
    return isNaN(n) ? null : n;
  };

  window.wapps.format = { formatCOP, formatNumber, formatPercent, parseCOP };
})();
