/* ============================================
   Wapps · tributarias/_shared/tarifas.js

   Constantes tributarias que se actualizan año a año.
   ESTE ES EL ÚNICO ARCHIVO QUE DEBES EDITAR cuando salgan
   las resoluciones DIAN o cambios normativos anuales.

   Convención: el año actual es el "vigente". Los anteriores
   se mantienen aquí como referencia histórica para
   calculadoras que necesiten valores retroactivos.

   Fuentes:
     UVT 2026 → Resolución DIAN 000238 del 15 de diciembre de 2025
     UVT 2025 → Resolución DIAN 000193 del 7 de noviembre de 2024
     UVT 2024 → Resolución DIAN 187 de 2023

   Expone: window.wapps.tarifas
   ============================================ */

(() => {
  'use strict';
  window.wapps = window.wapps || {};

  /**
   * UVT por año. Cuando salga la resolución de un nuevo año,
   * agrega la línea con el valor oficial.
   */
  const UVT = {
    2026: 52374,
    2025: 49799,
    2024: 47065,
    2023: 42412,
    2022: 38004,
    2021: 36308,
    2020: 35607
  };

  // Año más reciente disponible
  const VIGENTE = Math.max(...Object.keys(UVT).map(Number));

  /**
   * IVA en Colombia (tarifas vigentes).
   * Se mantienen aquí por si llegan a cambiar en una reforma.
   */
  const IVA = {
    general: 19,    // tarifa general
    reducida: 5,    // tarifa especial (algunos productos)
    exenta: 0       // exentos (libros, canasta básica, exportaciones)
  };

  /**
   * Salario mínimo legal mensual vigente (SMMLV) en pesos colombianos.
   * Se actualiza cada año por decreto presidencial (diciembre).
   * Auxilio de transporte va aparte.
   */
  const SMMLV = {
    2026: 1623500,  // estimado - actualizar cuando salga el decreto
    2025: 1423500,
    2024: 1300000,
    2023: 1160000
  };

  const AUX_TRANSPORTE = {
    2026: 200000,   // estimado - actualizar cuando salga el decreto
    2025: 200000,
    2024: 162000,
    2023: 140606
  };

  // ---------- Helpers ----------

  /**
   * Devuelve el valor de la UVT para un año dado (default: vigente).
   * @param {number} [year]
   */
  const uvt = (year) => UVT[year ?? VIGENTE];

  /**
   * Convierte un valor en UVT a pesos colombianos.
   * @param {number} uvts - número de UVTs
   * @param {number} [year] - año de la UVT a aplicar (default: vigente)
   */
  const uvtAPesos = (uvts, year) => {
    const v = uvt(year);
    if (!v) return null;
    return uvts * v;
  };

  /**
   * Convierte un valor en pesos a UVT.
   * @param {number} pesos
   * @param {number} [year]
   */
  const pesosAUvt = (pesos, year) => {
    const v = uvt(year);
    if (!v || v === 0) return null;
    return pesos / v;
  };

  /**
   * Lista de años disponibles, en orden descendente (más reciente primero).
   */
  const aniosDisponibles = () => Object.keys(UVT).map(Number).sort((a, b) => b - a);

  window.wapps.tarifas = {
    UVT, IVA, SMMLV, AUX_TRANSPORTE,
    VIGENTE,
    uvt, uvtAPesos, pesosAUvt, aniosDisponibles
  };
})();
