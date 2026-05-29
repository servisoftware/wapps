/* ============================================
   Wapps · utils/validate.js
   Validaciones reutilizables para inputs de calculadora.
   Expone: window.wapps.validate
   ============================================ */

(() => {
  'use strict';
  window.wapps = window.wapps || {};

  /**
   * Devuelve true si el valor es un número finito.
   * Acepta strings con formato colombiano gracias a parseCOP.
   */
  const isNumber = (v) => {
    const n = (window.wapps.format && window.wapps.format.parseCOP)
      ? window.wapps.format.parseCOP(v)
      : Number(v);
    return n !== null && isFinite(n);
  };

  /** Número mayor que cero */
  const isPositive = (v) => {
    const n = window.wapps.format.parseCOP(v);
    return n !== null && n > 0;
  };

  /** Número en rango [min, max] inclusivo */
  const inRange = (v, min, max) => {
    const n = window.wapps.format.parseCOP(v);
    return n !== null && n >= min && n <= max;
  };

  /**
   * Marca un input como inválido y muestra mensaje.
   * Asume que hay un <span class="field-error"> hermano del input.
   */
  const showError = (input, message) => {
    input.setAttribute('aria-invalid', 'true');
    const errEl = input.parentElement.querySelector('.field-error');
    if (errEl) errEl.textContent = message;
  };

  const clearError = (input) => {
    input.removeAttribute('aria-invalid');
    const errEl = input.parentElement.querySelector('.field-error');
    if (errEl) errEl.textContent = '';
  };

  window.wapps.validate = { isNumber, isPositive, inRange, showError, clearError };
})();
