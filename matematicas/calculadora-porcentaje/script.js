/* ============================================
   Wapps · matematicas/calculadora-porcentaje/script.js

   Cuatro modos:
     - parte:        ¿Cuánto es X% de Y?        → (Y × X) / 100
     - cual:         ¿Qué % es X de Y?          → (X / Y) × 100
     - aumento:      Aumentar Y en X%           → Y × (1 + X/100)
     - disminucion:  Disminuir Y en X%          → Y × (1 - X/100)
   ============================================ */

(() => {
  'use strict';

  let modo = 'parte';

  const modeBtns = document.querySelectorAll('.mode-btn');
  const modeHint = document.getElementById('mode-hint');
  const input1 = document.getElementById('valor-1');
  const input2 = document.getElementById('valor-2');
  const label1 = document.getElementById('label-1');
  const label2 = document.getElementById('label-2');
  const labelResult = document.getElementById('label-result');
  const resultEl = document.getElementById('resultado');
  const procedureEl = document.getElementById('procedure');
  const procedureFormula = document.getElementById('procedure-formula');
  const procedureSteps = document.getElementById('procedure-steps');

  const btnWhatsApp = document.getElementById('share-whatsapp');
  const btnCopy = document.getElementById('share-copy');
  const feedbackBtns = document.querySelectorAll('[data-feedback]');
  const feedbackThanks = document.querySelector('.feedback-thanks');

  const parse = (str) => window.wapps?.format?.parseCOP(str) ?? Number(str);

  const formatNumber = (n) => {
    if (n === null || n === undefined || isNaN(n) || !isFinite(n)) return '—';
    const rounded = Math.round(n * 10000) / 10000;
    if (Number.isInteger(rounded)) return rounded.toLocaleString('es-CO');
    let decimals = 1;
    while (decimals < 4 && Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals) !== rounded) {
      decimals++;
    }
    return rounded.toLocaleString('es-CO', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: 4
    });
  };

  // ---------- Configuración por modo ----------
  const MODES = {
    parte: {
      hint: '<strong>Ejemplo:</strong> ¿Cuánto es el 15% de 200.000? Ingresa 15 como porcentaje y 200.000 como valor.',
      label1: 'Porcentaje (%)',
      label2: 'Valor',
      labelResult: 'Resultado',
      placeholder1: '15',
      placeholder2: '200000',
      operator: '×',
      compute: (x, y) => (y * x) / 100,
      formula: (x, y) => `Resultado = (${formatNumber(y)} × ${formatNumber(x)}) / 100`,
      steps: (x, y, r) => `= ${formatNumber(y * x)} / 100 = ${formatNumber(r)}`,
      shareInputs: (x, y) => ({
        'Cálculo': `${formatNumber(x)}% de ${formatNumber(y)}`
      })
    },
    cual: {
      hint: '<strong>Ejemplo:</strong> ¿Qué porcentaje es 30 de 200? Ingresa 30 como parte y 200 como total.',
      label1: 'Parte',
      label2: 'Total',
      labelResult: 'Porcentaje',
      placeholder1: '30',
      placeholder2: '200',
      operator: '÷',
      compute: (x, y) => (x / y) * 100,
      formula: (x, y) => `Resultado = (${formatNumber(x)} / ${formatNumber(y)}) × 100`,
      steps: (x, y, r) => `= ${formatNumber(x / y)} × 100 = ${formatNumber(r)}%`,
      shareInputs: (x, y) => ({
        'Cálculo': `${formatNumber(x)} de ${formatNumber(y)}`
      }),
      formatResult: (n) => formatNumber(n) === '—' ? '—' : formatNumber(n) + '%'
    },
    aumento: {
      hint: '<strong>Ejemplo:</strong> Aumentar 500.000 en 10%. Ingresa 10 como porcentaje y 500.000 como valor.',
      label1: 'Porcentaje (%)',
      label2: 'Valor a aumentar',
      labelResult: 'Valor final',
      placeholder1: '10',
      placeholder2: '500000',
      operator: '↑',
      compute: (x, y) => y * (1 + x / 100),
      formula: (x, y) => `Resultado = ${formatNumber(y)} × (1 + ${formatNumber(x)}/100)`,
      steps: (x, y, r) => `= ${formatNumber(y)} × ${formatNumber(1 + x / 100)} = ${formatNumber(r)}`,
      shareInputs: (x, y) => ({
        'Cálculo': `Aumentar ${formatNumber(y)} en ${formatNumber(x)}%`
      })
    },
    disminucion: {
      hint: '<strong>Ejemplo:</strong> Disminuir 500.000 en 10% (descuento). Ingresa 10 como porcentaje y 500.000 como valor.',
      label1: 'Porcentaje (%)',
      label2: 'Valor a disminuir',
      labelResult: 'Valor final',
      placeholder1: '10',
      placeholder2: '500000',
      operator: '↓',
      compute: (x, y) => y * (1 - x / 100),
      formula: (x, y) => `Resultado = ${formatNumber(y)} × (1 − ${formatNumber(x)}/100)`,
      steps: (x, y, r) => `= ${formatNumber(y)} × ${formatNumber(1 - x / 100)} = ${formatNumber(r)}`,
      shareInputs: (x, y) => ({
        'Cálculo': `Disminuir ${formatNumber(y)} en ${formatNumber(x)}%`
      })
    }
  };

  // ---------- Cálculo ----------
  const calcular = () => {
    const x = parse(input1.value);
    const y = parse(input2.value);
    if (x === null || y === null || isNaN(x) || isNaN(y)) return null;

    const cfg = MODES[modo];
    // Casos límite: en modo "cual" no se puede dividir por cero
    if (modo === 'cual' && y === 0) return null;

    const r = cfg.compute(x, y);
    if (!isFinite(r)) return null;

    return {
      x, y, r,
      formula: cfg.formula(x, y),
      pasos: cfg.steps(x, y, r),
      display: cfg.formatResult ? cfg.formatResult(r) : formatNumber(r)
    };
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

    const prev = resultEl.textContent;
    resultEl.textContent = calc.display;
    resultEl.classList.remove('empty');
    procedureFormula.textContent = calc.formula;
    procedureSteps.textContent = calc.pasos;
    procedureEl.hidden = false;

    if (calc.display !== prev) flash(resultEl);
  };

  // ---------- Cambio de modo ----------
  const aplicarModo = (nuevo) => {
    modo = nuevo;
    const cfg = MODES[modo];
    modeHint.innerHTML = cfg.hint;
    label1.textContent = cfg.label1;
    label2.textContent = cfg.label2;
    labelResult.textContent = cfg.labelResult;
    input1.setAttribute('placeholder', cfg.placeholder1);
    input2.setAttribute('placeholder', cfg.placeholder2);
    document.querySelector('.proposition-arrow').textContent = cfg.operator;
    render();
  };

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      aplicarModo(btn.dataset.mode);
    });
  });

  // ---------- Cálculo en vivo ----------
  let timer;
  [input1, input2].forEach(input => {
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        render();
        const calc = calcular();
        if (calc && window.wapps?.analytics) {
          window.wapps.analytics.calculation('calculadora-porcentaje', { modo });
        }
      }, 120);
    });
  });

  // ---------- Compartir ----------
  const buildShareMessage = () => {
    const calc = calcular();
    if (!calc) return null;

    const cfg = MODES[modo];
    const inputs = cfg.shareInputs(calc.x, calc.y);
    const result = { 'Resultado': calc.display };

    if (window.wapps?.share?.buildMessage) {
      return window.wapps.share.buildMessage({
        tool: 'Calculadora de porcentaje',
        inputs, result,
        url: window.location.href
      });
    }
    return `Calculadora de porcentaje — wapps.co\n\n${Object.entries(inputs).map(([k,v]) => `${k}: ${v}`).join('\n')}\n\n✓ Resultado: ${calc.display}\n\n${window.location.href}`;
  };

  btnWhatsApp.addEventListener('click', () => {
    const msg = buildShareMessage();
    if (!msg) { input1.focus(); return; }
    if (window.wapps?.share?.toWhatsApp) {
      window.wapps.share.toWhatsApp(msg);
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    }
    if (window.wapps?.analytics) {
      window.wapps.analytics.share('calculadora-porcentaje', 'whatsapp');
    }
  });

  btnCopy.addEventListener('click', async () => {
    const msg = buildShareMessage();
    if (!msg) { input1.focus(); return; }
    const ok = window.wapps?.share?.copy ? await window.wapps.share.copy(msg) : false;
    if (ok) {
      btnCopy.querySelector('.btn-default').hidden = true;
      btnCopy.querySelector('.btn-success').hidden = false;
      setTimeout(() => {
        btnCopy.querySelector('.btn-default').hidden = false;
        btnCopy.querySelector('.btn-success').hidden = true;
      }, 2000);
      if (window.wapps?.analytics) {
        window.wapps.analytics.share('calculadora-porcentaje', 'copy');
      }
    }
  });

  // ---------- Feedback ----------
  feedbackBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.wapps?.analytics) {
        window.wapps.analytics.feedback('calculadora-porcentaje', btn.dataset.feedback);
      }
      btn.parentElement.style.display = 'none';
      if (feedbackThanks) feedbackThanks.hidden = false;
    });
  });

  // ---------- Inicialización ----------
  resultEl.classList.add('empty');
  aplicarModo('parte');
})();
