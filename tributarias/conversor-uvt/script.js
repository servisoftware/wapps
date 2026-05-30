/* ============================================
   Wapps · tributarias/conversor-uvt/script.js

   Conversión UVT ↔ Pesos
     - uvt-pesos:  UVT × valor_uvt(año) = pesos
     - pesos-uvt:  pesos / valor_uvt(año) = UVT

   Lee los valores de UVT desde window.wapps.tarifas
   (cargado por /tributarias/_shared/tarifas.js).
   ============================================ */

(() => {
  'use strict';

  let modo = 'uvt-pesos'; // 'uvt-pesos' | 'pesos-uvt'
  let anio = null;        // se inicializa con el año vigente

  // ---------- DOM ----------
  const modeBtns = document.querySelectorAll('.mode-btn');
  const anioSelect = document.getElementById('anio');
  const anioHint = document.getElementById('anio-hint');
  const valorInput = document.getElementById('valor-input');
  const labelInput = document.getElementById('label-input');
  const inputUnit = document.getElementById('input-unit');
  const resultEl = document.getElementById('resultado');
  const resultLabel = document.getElementById('result-label');
  const resultFormula = document.getElementById('result-formula');
  const refTableBody = document.getElementById('ref-table-body');
  const historicBody = document.getElementById('historic-body');
  const uvtVigenteEl = document.getElementById('uvt-vigente');

  const btnWhatsApp = document.getElementById('share-whatsapp');
  const btnCopy = document.getElementById('share-copy');
  const feedbackBtns = document.querySelectorAll('[data-feedback]');
  const feedbackThanks = document.querySelector('.feedback-thanks');

  // ---------- Helpers de formato ----------
  const parse = (str) => window.wapps?.format?.parseCOP(str) ?? Number(str);

  const formatCOP = (n) => {
    if (n === null || isNaN(n)) return '—';
    return '$' + Math.round(n).toLocaleString('es-CO');
  };

  const formatUVT = (n) => {
    if (n === null || isNaN(n) || !isFinite(n)) return '—';
    // Para UVT mostramos hasta 2 decimales si no es entero
    const rounded = Math.round(n * 100) / 100;
    if (Number.isInteger(rounded)) {
      return rounded.toLocaleString('es-CO') + ' UVT';
    }
    return rounded.toLocaleString('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' UVT';
  };

  // ---------- Acceso a tarifas (cargado por tarifas.js) ----------
  const tarifas = window.wapps?.tarifas;
  if (!tarifas) {
    console.error('No se cargó window.wapps.tarifas. Verifica que tarifas.js esté importado.');
    return;
  }

  // ---------- Inicializar selector de año ----------
  const anios = tarifas.aniosDisponibles();
  anio = tarifas.VIGENTE;

  anios.forEach((y) => {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y === tarifas.VIGENTE ? `${y} (vigente)` : y;
    if (y === tarifas.VIGENTE) opt.selected = true;
    anioSelect.appendChild(opt);
  });

  // Mostrar UVT vigente en el header
  uvtVigenteEl.textContent = formatCOP(tarifas.uvt(tarifas.VIGENTE));

  // ---------- Cálculo ----------
  const calcular = () => {
    const v = parse(valorInput.value);
    if (v === null || isNaN(v) || v < 0) return null;

    const valorUvt = tarifas.uvt(anio);
    if (!valorUvt) return null;

    if (modo === 'uvt-pesos') {
      const pesos = v * valorUvt;
      return {
        valor: v,
        valorUvt,
        resultado: pesos,
        display: formatCOP(pesos),
        formula: `${v.toLocaleString('es-CO')} UVT × ${formatCOP(valorUvt)} = ${formatCOP(pesos)}`
      };
    } else {
      if (valorUvt === 0) return null;
      const uvts = v / valorUvt;
      return {
        valor: v,
        valorUvt,
        resultado: uvts,
        display: formatUVT(uvts),
        formula: `${formatCOP(v)} / ${formatCOP(valorUvt)} = ${formatUVT(uvts)}`
      };
    }
  };

  // ---------- Render principal ----------
  const flash = (el) => {
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 300);
  };

  const render = () => {
    const calc = calcular();
    if (!calc) {
      resultEl.textContent = '—';
      resultFormula.textContent = '';
      return;
    }
    const prev = resultEl.textContent;
    resultEl.textContent = calc.display;
    resultFormula.textContent = calc.formula;
    if (prev !== calc.display) flash(resultEl);
  };

  // ---------- Actualizar UI según modo ----------
  const aplicarModo = () => {
    if (modo === 'uvt-pesos') {
      labelInput.textContent = 'Cantidad en UVT';
      inputUnit.textContent = 'UVT';
      resultLabel.textContent = 'Equivalente en pesos';
      valorInput.setAttribute('placeholder', '100');
    } else {
      labelInput.textContent = 'Cantidad en pesos';
      inputUnit.textContent = 'COP';
      resultLabel.textContent = 'Equivalente en UVT';
      valorInput.setAttribute('placeholder', '1.000.000');
    }
    render();
  };

  // ---------- Tabla de referencia rápida ----------
  // Valores típicos en UVT y sus conceptos asociados
  const REFERENCIAS = [
    { uvts: 1, concepto: '1 UVT' },
    { uvts: 10, concepto: 'Sanción mínima por extemporaneidad' },
    { uvts: 27, concepto: 'Tope para retención en compras' },
    { uvts: 100, concepto: 'Tope frecuente en topes pequeños' },
    { uvts: 1400, concepto: 'Tope declaración renta (consignaciones/ingresos)' },
    { uvts: 3500, concepto: 'Tope responsable de IVA / ingresos brutos' },
    { uvts: 4500, concepto: 'Tope declaración renta (patrimonio/consumos)' }
  ];

  const renderRefTable = () => {
    const valorUvt = tarifas.uvt(tarifas.VIGENTE);
    refTableBody.innerHTML = REFERENCIAS.map(ref => `
      <tr>
        <td>${ref.uvts.toLocaleString('es-CO')} UVT</td>
        <td>${formatCOP(ref.uvts * valorUvt)}</td>
        <td>${ref.concepto}</td>
      </tr>
    `).join('');
  };

  // ---------- Tabla histórica ----------
  const renderHistoricTable = () => {
    const aniosOrdenados = tarifas.aniosDisponibles(); // descendente
    historicBody.innerHTML = aniosOrdenados.map((y, idx) => {
      const valor = tarifas.uvt(y);
      const anterior = aniosOrdenados[idx + 1];
      let variacion = '—';
      if (anterior) {
        const valorAnterior = tarifas.uvt(anterior);
        const pct = ((valor - valorAnterior) / valorAnterior) * 100;
        variacion = `+${pct.toFixed(2)}%`;
      }
      const isCurrentClass = y === tarifas.VIGENTE ? 'is-current' : '';
      return `
        <tr class="${isCurrentClass}">
          <td>${y}</td>
          <td>${formatCOP(valor)}</td>
          <td>${variacion}</td>
        </tr>
      `;
    }).join('');
  };

  // ---------- Eventos ----------
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modo = btn.dataset.mode;
      modeBtns.forEach(b => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      aplicarModo();
    });
  });

  anioSelect.addEventListener('change', () => {
    anio = parseInt(anioSelect.value, 10);
    anioHint.textContent = anio === tarifas.VIGENTE
      ? 'Año vigente.'
      : `Se aplicará UVT del año ${anio} (${formatCOP(tarifas.uvt(anio))}).`;
    render();
  });

  let timer;
  valorInput.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      render();
      const calc = calcular();
      if (calc && window.wapps?.analytics) {
        window.wapps.analytics.calculation('conversor-uvt', { modo, anio });
      }
    }, 120);
  });

  // ---------- Compartir ----------
  const buildShareMessage = () => {
    const calc = calcular();
    if (!calc) return null;

    const inputs = modo === 'uvt-pesos'
      ? { 'Cantidad': formatUVT(calc.valor), 'Año': anio }
      : { 'Cantidad': formatCOP(calc.valor), 'Año': anio };

    const result = { 'Equivalente': calc.display };

    if (window.wapps?.share?.buildMessage) {
      return window.wapps.share.buildMessage({
        tool: 'Conversor UVT',
        inputs, result,
        url: window.location.href
      });
    }
    return `Conversor UVT — wapps.co\n\n${Object.entries(inputs).map(([k,v]) => `${k}: ${v}`).join('\n')}\n\n✓ Equivalente: ${calc.display}\n\n${window.location.href}`;
  };

  btnWhatsApp.addEventListener('click', () => {
    const msg = buildShareMessage();
    if (!msg) { valorInput.focus(); return; }
    if (window.wapps?.share?.toWhatsApp) {
      window.wapps.share.toWhatsApp(msg);
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    }
    if (window.wapps?.analytics) {
      window.wapps.analytics.share('conversor-uvt', 'whatsapp');
    }
  });

  btnCopy.addEventListener('click', async () => {
    const msg = buildShareMessage();
    if (!msg) { valorInput.focus(); return; }
    const ok = window.wapps?.share?.copy ? await window.wapps.share.copy(msg) : false;
    if (ok) {
      btnCopy.querySelector('.btn-default').hidden = true;
      btnCopy.querySelector('.btn-success').hidden = false;
      setTimeout(() => {
        btnCopy.querySelector('.btn-default').hidden = false;
        btnCopy.querySelector('.btn-success').hidden = true;
      }, 2000);
      if (window.wapps?.analytics) {
        window.wapps.analytics.share('conversor-uvt', 'copy');
      }
    }
  });

  feedbackBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.wapps?.analytics) {
        window.wapps.analytics.feedback('conversor-uvt', btn.dataset.feedback);
      }
      btn.parentElement.style.display = 'none';
      if (feedbackThanks) feedbackThanks.hidden = false;
    });
  });

  // ---------- Inicialización ----------
  renderRefTable();
  renderHistoricTable();
  aplicarModo();
})();
