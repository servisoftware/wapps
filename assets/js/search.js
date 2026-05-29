/* ============================================
   Wapps · search.js
   Buscador del landing. Filtra sobre el catálogo de
   herramientas y abre la URL de la elegida.

   El catálogo está en este mismo archivo (constante TOOLS)
   para evitar una request HTTP extra. Cuando publiques una
   herramienta nueva, agrégala aquí con su URL real y
   cambia "available" a true.
   ============================================ */

(() => {
  'use strict';

  // ---------- Catálogo de herramientas ----------
  // Sincronizar con la lista de 100 calculadoras del proyecto.
  // Por ahora todas tienen available: false y URL apuntando a su carpeta.
  const TOOLS = [
    // Financieras
    { name: 'Calculadora de préstamos', tag: 'Financiera', keywords: 'prestamo crédito cuota interes amortizacion', url: '/financieras/calculadora-prestamos/', available: false },
    { name: 'Interés compuesto', tag: 'Financiera', keywords: 'interes compuesto ahorro inversion rendimiento', url: '/financieras/interes-compuesto/', available: false },
    { name: 'Punto de equilibrio', tag: 'Financiera', keywords: 'punto equilibrio costos fijos variables breakeven', url: '/financieras/punto-de-equilibrio/', available: false },
    { name: 'Margen de utilidad', tag: 'Financiera', keywords: 'margen utilidad ganancia rentabilidad', url: '/financieras/margen-utilidad/', available: false },
    { name: 'TIR', tag: 'Financiera', keywords: 'tir tasa interna retorno proyecto inversion', url: '/financieras/tir/', available: false },
    { name: 'VPN', tag: 'Financiera', keywords: 'vpn valor presente neto proyecto', url: '/financieras/vpn/', available: false },

    // Tributarias
    { name: 'Calculadora de IVA', tag: 'Tributaria', keywords: 'iva impuesto valor agregado 19 5 incluido', url: '/tributarias/calculadora-iva/', available: true },
    { name: 'Retención en la fuente', tag: 'Tributaria', keywords: 'retencion fuente retefuente honorarios servicios', url: '/tributarias/retencion-fuente/', available: false },
    { name: 'ICA', tag: 'Tributaria', keywords: 'ica industria comercio municipio', url: '/tributarias/calculadora-ica/', available: false },
    { name: 'Conversor UVT', tag: 'Tributaria', keywords: 'uvt valor pesos cuanto vale', url: '/tributarias/conversor-uvt/', available: false },
    { name: 'Honorarios bruto a neto', tag: 'Tributaria', keywords: 'honorarios bruto neto retencion independiente', url: '/tributarias/honorarios-bruto-neto/', available: false },

    // Matemáticas
    { name: 'Regla de tres simple', tag: 'Matemática', keywords: 'regla tres simple proporcion directa inversa', url: '/matematicas/regla-de-tres-simple/', available: false },
    { name: 'Porcentajes', tag: 'Matemática', keywords: 'porcentaje porciento sacar', url: '/matematicas/calculadora-porcentaje/', available: false },
    { name: 'Promedio', tag: 'Matemática', keywords: 'promedio media aritmetica', url: '/matematicas/promedio/', available: false },

    // Técnicas
    { name: 'Conversor de longitud', tag: 'Técnica', keywords: 'metros pies pulgadas centimetros', url: '/tecnicas/conversor-longitud/', available: false },
    { name: 'Conversor de temperatura', tag: 'Técnica', keywords: 'celsius fahrenheit kelvin grados', url: '/tecnicas/conversor-temperatura/', available: false },
    { name: 'Cálculo de pintura', tag: 'Técnica', keywords: 'pintura galones metros pared', url: '/tecnicas/calculo-pintura/', available: false },

    // Operativas
    { name: 'Precio de venta sugerido', tag: 'Operativa', keywords: 'precio venta margen costo poner precio', url: '/operativas/precio-venta-sugerido/', available: false },
    { name: 'Salario neto', tag: 'Operativa', keywords: 'salario neto descuentos nomina cuanto queda', url: '/operativas/salario-neto/', available: false },
    { name: 'Prima de servicios', tag: 'Operativa', keywords: 'prima servicios junio diciembre', url: '/operativas/prima-servicios/', available: false },
    { name: 'Cesantías', tag: 'Operativa', keywords: 'cesantias cuanto me corresponde', url: '/operativas/cesantias/', available: false }
    // TODO: agregar el resto de las 100 herramientas a medida que se construyan
  ];

  // Normaliza texto (quita tildes, pasa a minúsculas) para que
  // "préstamo" coincida con "prestamo" al buscar.
  const normalize = (str) => (str || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const searchInput = document.getElementById('search-input');
  const resultsBox = document.getElementById('search-results');

  if (!searchInput || !resultsBox) return;

  const escapeHtml = (str) => String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const render = (matches, query) => {
    if (!query) {
      resultsBox.hidden = true;
      resultsBox.innerHTML = '';
      return;
    }

    if (matches.length === 0) {
      resultsBox.innerHTML = `
        <div class="search-empty">
          No encontramos "${escapeHtml(query)}". ¿Quieres
          <a href="mailto:hola@wapps.co?subject=Sugerencia%20de%20herramienta">sugerirla</a>?
        </div>
      `;
      resultsBox.hidden = false;
      return;
    }

    resultsBox.innerHTML = matches.slice(0, 8).map((tool) => `
      <a href="${tool.url}" class="search-result" role="option" tabindex="0">
        <span class="search-result-name">${escapeHtml(tool.name)}${tool.available ? '' : ' <span style="color: var(--color-text-soft); font-weight: 400; font-size: 0.85em;">· próximamente</span>'}</span>
        <span class="search-result-tag">${escapeHtml(tool.tag)}</span>
      </a>
    `).join('');
    resultsBox.hidden = false;
  };

  const filter = (query) => {
    const q = normalize(query).trim();
    if (!q) return [];
    return TOOLS.filter(t => normalize(`${t.name} ${t.tag} ${t.keywords}`).includes(q));
  };

  let debounceTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      render(filter(e.target.value), e.target.value);
    }, 80);
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search')) resultsBox.hidden = true;
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      resultsBox.hidden = true;
      searchInput.blur();
    }
  });

  searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim()) {
      render(filter(searchInput.value), searchInput.value);
    }
  });
})();
