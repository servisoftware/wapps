/* ============================================
   Wapps · matematicas/regla-de-tres-simple/script.js
   Lógica de la calculadora de regla de tres simple.

   Dos modos:
     - "directa": X = (B × C) / A    (multiplicar en cruz)
     - "inversa": X = (A × B) / C    (multiplicar en línea)

   Las variables siguen la convención clásica:
     Si A → B
     Si C → X (buscamos X)
   ============================================ */

(() => {
  'use strict';

  // ---------- Estado ----------
  let modo = 'directa'; // 'directa' | 'inversa'

  // ---------- Elementos del DOM ----------
  const modeBtns = document.querySelectorAll('.mode-btn');
  const modeHint = document.getElementById('mode-hint');
  const inputA = document.getElementById('valor-a');
  const inputB = document.getElementById('valor-b');
  const inputC = document.getElementById('valor-c');
  const resultEl = document.getElementById('resultado');
  const procedureEl = document.getElementById('procedure');
  const procedureFormula = document.getElementById('procedure-formula');
  const procedureSteps = document.getElementById('procedure-steps');

  const btnWhatsApp = document.getElementById('share-whatsapp');
  const btnCopy = document.getElementById('share-copy');
  const feedbackBtns = document.querySelectorAll('[data-feedback]');
  const feedbackThanks = document.querySelector('.feedback-thanks');

  // ---------- Helpers ----------
  // parseCOP también sirve para números genéricos al estilo colombiano:
  // acepta "1.500.000,50" y devuelve 1500000.5
  const parse = (str) => window.wapps?.format?.parseCOP(str) ?? Number(str);

  /**
   * Formatea un número al estilo colombiano con hasta 4 decimales.
   * No fuerza decimales si no son necesarios: 22 → "22", 22.5 → "22,5".
   */
  const formatNumber = (n) => {
    if (n === null || n === undefined || isNaN(n) || !isFinite(n)) return '—';

    // Determinar cuántos decimales realmente necesita
    // (hasta 4, sin ceros sobrantes)
    const rounded = Math.round(n * 10000) / 10000;
    if (Number.isInteger(rounded)) return rounded.toLocaleString('es-CO');

    // Encuentra el número mínimo de decimales necesarios
    let decimals = 1;
    while (decimals < 4 && Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals) !== rounded) {
      decimals++;
    }

    return rounded.toLocaleString('es-CO', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: 4
    });
  };

  // ---------- Mensajes contextuales del modo ----------
  const MODE_HINTS = {
    directa: '<strong>Directa:</strong> a mayor valor, mayor resultado. Ej: si 1 kilo cuesta $3.000, ¿cuánto cuestan 5 kilos?',
    inversa: '<strong>Inversa:</strong> a mayor valor, menor resultado. Ej: si 4 obreros tardan 6 días, ¿cuántos días tardarán 8 obreros?'
  };

  const MODE_PLACEHOLDERS = {
    directa: { a: '1', b: '3000', c: '5' },
    inversa: { a: '4', b: '6', c: '8' }
  };

  // ---------- Núcleo: cálculo ----------
  /**
   * Devuelve un objeto con el resultado y el desglose del procedimiento,
   * o null si los inputs no son válidos.
   */
  const calcular = () => {
    const a = parse(inputA.value);
    const b = parse(inputB.value);
    const c = parse(inputC.value);

    // Validación: todos los inputs deben ser números válidos
    if ([a, b, c].some(v => v === null || isNaN(v))) return null;

    let x, formula, pasos;

    if (modo === 'directa') {
      // X = (B × C) / A
      // En directa, A no puede ser 0
      if (a === 0) return null;
      x = (b * c) / a;
      formula = `X = (B × C) / A = (${formatNumber(b)} × ${formatNumber(c)}) / ${formatNumber(a)}`;
      pasos = `= ${formatNumber(b * c)} / ${formatNumber(a)} = ${formatNumber(x)}`;
    } else {
      // X = (A × B) / C
      // En inversa, C no puede ser 0
      if (c === 0) return null;
      x = (a * b) / c;
      formula = `X = (A × B) / C = (${formatNumber(a)} × ${formatNumber(b)}) / ${formatNumber(c)}`;
      pasos = `= ${formatNumber(a * b)} / ${formatNumber(c)} = ${formatNumber(x)}`;
    }

    return { a, b, c, x, formula, pasos };
  };

  // ---------- Render ----------
  const flash = (el) => {
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 300);
  };

  const render = () => {
    const calc = calcular();

    if (!calc) {
      resultEl.textContent = '—';
      resultEl.classList.add('empty');
      procedureEl.hidden = true;
      return;
    }

    const prevText = resultEl.textContent;
    const newText = formatNumber(calc.x);

    resultEl.textContent = newText;
    resultEl.classList.remove('empty');

    procedureFormula.textContent = calc.formula;
    procedureSteps.textContent = calc.pasos;
    procedureEl.hidden = false;

    if (newText !== prevText) flash(resultEl);
  };

  // ---------- Cambio de modo ----------
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modo = btn.dataset.mode;
      modeBtns.forEach(b => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });

      modeHint.innerHTML = MODE_HINTS[modo];

      // Actualizar placeholders con ejemplos relevantes del nuevo modo
      const ph = MODE_PLACEHOLDERS[modo];
      inputA.setAttribute('placeholder', ph.a);
      inputB.setAttribute('placeholder', ph.b);
      inputC.setAttribute('placeholder', ph.c);

      render();
    });
  });

  // ---------- Cálculo en vivo en los inputs ----------
  let timer;
  [inputA, inputB, inputC].forEach(input => {
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        render();
        const calc = calcular();
        if (calc && window.wapps?.analytics) {
          window.wapps.analytics.calculation('regla-de-tres-simple', { modo });
        }
      }, 120);
    });
  });

  // ---------- Compartir ----------
  const buildShareMessage = () => {
    const calc = calcular();
    if (!calc) return null;

    const inputs = {
      'Si': `${formatNumber(calc.a)} equivale a ${formatNumber(calc.b)}`,
      'Entonces': `${formatNumber(calc.c)} equivale a ?`,
      'Tipo': modo === 'directa' ? 'Directa' : 'Inversa'
    };
    const result = { 'Resultado': formatNumber(calc.x) };

    if (window.wapps?.share?.buildMessage) {
      return window.wapps.share.buildMessage({
        tool: 'Regla de tres simple',
        inputs,
        result,
        url: window.location.href
      });
    }

    return `Regla de tres simple — wapps.co\n\n${Object.entries(inputs).map(([k,v]) => `${k}: ${v}`).join('\n')}\n\n✓ Resultado: ${formatNumber(calc.x)}\n\n${window.location.href}`;
  };

  btnWhatsApp.addEventListener('click', () => {
    const msg = buildShareMessage();
    if (!msg) { inputA.focus(); return; }
    if (window.wapps?.share?.toWhatsApp) {
      window.wapps.share.toWhatsApp(msg);
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    }
    if (window.wapps?.analytics) {
      window.wapps.analytics.share('regla-de-tres-simple', 'whatsapp');
    }
  });

  btnCopy.addEventListener('click', async () => {
    const msg = buildShareMessage();
    if (!msg) { inputA.focus(); return; }

    const ok = window.wapps?.share?.copy ? await window.wapps.share.copy(msg) : false;
    if (ok) {
      btnCopy.querySelector('.btn-default').hidden = true;
      btnCopy.querySelector('.btn-success').hidden = false;
      setTimeout(() => {
        btnCopy.querySelector('.btn-default').hidden = false;
        btnCopy.querySelector('.btn-success').hidden = true;
      }, 2000);
      if (window.wapps?.analytics) {
        window.wapps.analytics.share('regla-de-tres-simple', 'copy');
      }
    }
  });

  // ---------- Feedback 👍 / 👎 ----------
  feedbackBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const value = btn.dataset.feedback;
      if (window.wapps?.analytics) {
        window.wapps.analytics.feedback('regla-de-tres-simple', value);
      }
      btn.parentElement.style.display = 'none';
      if (feedbackThanks) feedbackThanks.hidden = false;
    });
  });

  // ---------- Inicialización ----------
  resultEl.classList.add('empty');
  render();
})();
