/* ============================================
   Wapps · tributarias/calculadora-iva/script.js
   Lógica de la calculadora de IVA.

   Dos modos:
     - "agregar": el usuario tiene un precio sin IVA y quiere sumarlo
     - "quitar":  el usuario tiene un precio con IVA incluido y quiere
                  separar la base y el IVA

   Tarifas: 19%, 5%, 0%, o personalizada (0–100).
   ============================================ */

(() => {
  'use strict';

  // ---------- Estado ----------
  let modo = 'agregar';   // 'agregar' | 'quitar'
  let tarifa = 19;        // porcentaje (0–100)

  // ---------- Elementos del DOM ----------
  const modeBtns = document.querySelectorAll('.mode-btn');
  const inputMonto = document.getElementById('monto');
  const montoLabel = document.getElementById('monto-label');
  const chips = document.querySelectorAll('.chip');
  const tarifaCustomWrapper = document.getElementById('tarifa-custom');
  const inputTarifaCustom = document.getElementById('tarifa-personalizada');

  const labelBase = document.getElementById('label-base');
  const labelIva = document.getElementById('label-iva');
  const labelTotal = document.getElementById('label-total');
  const resBase = document.getElementById('result-base');
  const resIva = document.getElementById('result-iva');
  const resTotal = document.getElementById('result-total');
  const formulaNote = document.getElementById('formula-note');

  const btnWhatsApp = document.getElementById('share-whatsapp');
  const btnCopy = document.getElementById('share-copy');
  const feedbackBtns = document.querySelectorAll('[data-feedback]');
  const feedbackThanks = document.querySelector('.feedback-thanks');

  // Helpers de formato (window.wapps.format viene de /assets/js/utils/format.js)
  const fCOP = (n) => window.wapps?.format?.formatCOP(n) ?? `$${n}`;
  const parseCOP = (str) => window.wapps?.format?.parseCOP(str) ?? Number(str);

  // ---------- Núcleo: cálculo ----------
  /**
   * Devuelve { base, iva, total } según el modo y la tarifa actual.
   * Si el monto es inválido o cero, devuelve ceros.
   */
  const calcular = () => {
    const monto = parseCOP(inputMonto.value);

    if (monto === null || isNaN(monto) || monto <= 0) {
      return { base: 0, iva: 0, total: 0 };
    }

    if (modo === 'agregar') {
      // El usuario tiene la base. Le sumamos el IVA.
      const base = monto;
      const iva = monto * (tarifa / 100);
      const total = base + iva;
      return { base, iva, total };
    } else {
      // El usuario tiene un precio que YA incluye el IVA.
      // Despejamos la base: base = total / (1 + tarifa/100)
      // Caso especial: tarifa 0 → base = total, IVA = 0
      const total = monto;
      const base = tarifa === 0 ? total : total / (1 + tarifa / 100);
      const iva = total - base;
      return { base, iva, total };
    }
  };

  // ---------- Render ----------
  const flash = (el) => {
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 250);
  };

  const actualizarLabels = () => {
    // Cambia los textos de inputs/resultados según el modo.
    if (modo === 'agregar') {
      montoLabel.textContent = 'Precio sin IVA';
      inputMonto.setAttribute('placeholder', '1.000.000');
      labelBase.textContent = 'Precio sin IVA';
      labelTotal.textContent = 'Total con IVA';
      formulaNote.innerHTML = 'Fórmula: <code>IVA = monto × (tarifa / 100)</code>';
    } else {
      montoLabel.textContent = 'Precio con IVA incluido';
      inputMonto.setAttribute('placeholder', '1.190.000');
      labelBase.textContent = 'Precio sin IVA (base)';
      labelTotal.textContent = 'Total con IVA';
      formulaNote.innerHTML = 'Fórmula: <code>base = total / (1 + tarifa/100)</code>';
    }
    labelIva.textContent = `IVA (${tarifa}%)`;
  };

  const render = () => {
    const { base, iva, total } = calcular();

    // Solo flash si los valores cambian respecto al estado anterior
    const prevBase = resBase.textContent;
    const newBase = fCOP(base);

    resBase.textContent = newBase;
    resIva.textContent = fCOP(iva);
    resTotal.textContent = fCOP(total);

    if (newBase !== prevBase && base > 0) {
      flash(resTotal);
    }
  };

  // ---------- Modo (Sumar / Sacar) ----------
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modo = btn.dataset.mode;
      modeBtns.forEach(b => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      actualizarLabels();
      render();
    });
  });

  // ---------- Selector de tarifa (chips) ----------
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      // Reset visual de todos
      chips.forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-checked', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-checked', 'true');

      const value = chip.dataset.tarifa;

      if (value === 'otra') {
        // Mostrar input personalizado y leer su valor (si lo hay)
        tarifaCustomWrapper.hidden = false;
        inputTarifaCustom.focus();
        const v = parseFloat(inputTarifaCustom.value);
        tarifa = isNaN(v) ? 0 : v;
      } else {
        tarifaCustomWrapper.hidden = true;
        tarifa = parseFloat(value);
      }

      actualizarLabels();
      render();
    });
  });

  // Cambios en la tarifa personalizada
  inputTarifaCustom.addEventListener('input', () => {
    let v = parseFloat(inputTarifaCustom.value);
    if (isNaN(v)) v = 0;
    if (v < 0) v = 0;
    if (v > 100) v = 100;
    tarifa = v;
    actualizarLabels();
    render();
  });

  // ---------- Input principal: cálculo en vivo ----------
  // Pequeño debounce para no re-renderizar en cada keystroke.
  let inputTimer;
  inputMonto.addEventListener('input', () => {
    clearTimeout(inputTimer);
    inputTimer = setTimeout(() => {
      render();
      // Analytics: registramos uso solo cuando hay un cálculo real.
      // NO enviamos cifras del usuario; solo tarifa y modo.
      const { total } = calcular();
      if (total > 0 && window.wapps?.analytics) {
        window.wapps.analytics.calculation('calculadora-iva', { tarifa, modo });
      }
    }, 150);
  });

  // ---------- Compartir ----------
  /**
   * Arma un mensaje legible con el cálculo actual.
   * Usa wapps.share.buildMessage cuando esté disponible.
   */
  const buildShareMessage = () => {
    const { base, iva, total } = calcular();
    if (total <= 0) return null;

    const inputs = modo === 'agregar'
      ? { 'Precio sin IVA': fCOP(base), 'Tarifa': `${tarifa}%` }
      : { 'Precio con IVA': fCOP(total), 'Tarifa': `${tarifa}%` };

    const result = modo === 'agregar'
      ? { 'IVA': fCOP(iva), 'Total con IVA': fCOP(total) }
      : { 'Base (sin IVA)': fCOP(base), 'IVA': fCOP(iva) };

    if (window.wapps?.share?.buildMessage) {
      return window.wapps.share.buildMessage({
        tool: 'Calculadora de IVA',
        inputs,
        result,
        url: window.location.href
      });
    }

    // Fallback si share.js no estuviera disponible
    return `Calculadora de IVA — wapps.co\n\n${Object.entries(inputs).map(([k,v]) => `${k}: ${v}`).join('\n')}\n\n${Object.entries(result).map(([k,v]) => `✓ ${k}: ${v}`).join('\n')}\n\n${window.location.href}`;
  };

  btnWhatsApp.addEventListener('click', () => {
    const msg = buildShareMessage();
    if (!msg) {
      // No hay cálculo aún; pone foco amable en el input
      inputMonto.focus();
      return;
    }
    if (window.wapps?.share?.toWhatsApp) {
      window.wapps.share.toWhatsApp(msg);
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    }
    if (window.wapps?.analytics) {
      window.wapps.analytics.share('calculadora-iva', 'whatsapp');
    }
  });

  btnCopy.addEventListener('click', async () => {
    const msg = buildShareMessage();
    if (!msg) { inputMonto.focus(); return; }

    const ok = window.wapps?.share?.copy
      ? await window.wapps.share.copy(msg)
      : false;

    if (ok) {
      // Feedback visual del botón: "Copiar resultado" → "✓ Copiado"
      btnCopy.querySelector('.btn-default').hidden = true;
      btnCopy.querySelector('.btn-success').hidden = false;
      setTimeout(() => {
        btnCopy.querySelector('.btn-default').hidden = false;
        btnCopy.querySelector('.btn-success').hidden = true;
      }, 2000);

      if (window.wapps?.analytics) {
        window.wapps.analytics.share('calculadora-iva', 'copy');
      }
    }
  });

  // ---------- Feedback 👍 / 👎 ----------
  feedbackBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const value = btn.dataset.feedback;
      if (window.wapps?.analytics) {
        window.wapps.analytics.feedback('calculadora-iva', value);
      }
      // Ocultar botones, mostrar agradecimiento
      btn.parentElement.style.display = 'none';
      if (feedbackThanks) feedbackThanks.hidden = false;
    });
  });

  // ---------- Inicialización ----------
  actualizarLabels();
  render();
})();
