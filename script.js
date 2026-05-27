/* ============================================
   Wapps · Script principal
   Vanilla JS, sin dependencias.
   ============================================ */

(() => {
  'use strict';

  // ---------- Año dinámico en footer ----------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Catálogo de herramientas (placeholder) ----------
  // Cuando construyas cada herramienta, agrégala aquí con su URL real.
  // El campo "available" indica si ya está lista (true) o "próximamente" (false).
  const tools = [
    // Financieras
    { name: 'Calculadora de préstamos', tag: 'Financiera', keywords: 'prestamo crédito credito cuota interes amortizacion', url: '#proximas', available: false },
    { name: 'Interés compuesto', tag: 'Financiera', keywords: 'interes compuesto ahorro inversion rendimiento', url: '#proximas', available: false },
    { name: 'Punto de equilibrio', tag: 'Financiera', keywords: 'punto equilibrio costos fijos variables breakeven', url: '#proximas', available: false },
    { name: 'Margen de utilidad', tag: 'Financiera', keywords: 'margen utilidad ganancia rentabilidad', url: '#proximas', available: false },
    { name: 'Flujo de caja', tag: 'Financiera', keywords: 'flujo caja cash flow proyeccion ingresos egresos', url: '#proximas', available: false },
    { name: 'Valor presente / futuro', tag: 'Financiera', keywords: 'valor presente futuro vpn descuento tasa', url: '#proximas', available: false },
    { name: 'TIR (tasa interna de retorno)', tag: 'Financiera', keywords: 'tir tasa interna retorno proyecto inversion', url: '#proximas', available: false },
    { name: 'VPN (valor presente neto)', tag: 'Financiera', keywords: 'vpn valor presente neto proyecto inversion descuento', url: '#proximas', available: false },

    // Tributarias
    { name: 'Calculadora de IVA', tag: 'Tributaria', keywords: 'iva impuesto valor agregado 19 5 incluido', url: '#proximas', available: false },
    { name: 'Retención en la fuente', tag: 'Tributaria', keywords: 'retencion fuente reteica retefuente honorarios servicios compras', url: '#proximas', available: false },
    { name: 'ICA (industria y comercio)', tag: 'Tributaria', keywords: 'ica industria comercio reteica municipio', url: '#proximas', available: false },
    { name: 'Régimen simple vs ordinario', tag: 'Tributaria', keywords: 'regimen simple ordinario tributacion impuesto', url: '#proximas', available: false },
    { name: 'Renta presuntiva', tag: 'Tributaria', keywords: 'renta presuntiva patrimonio', url: '#proximas', available: false },
    { name: 'Facturación electrónica', tag: 'Tributaria', keywords: 'facturacion electronica dian factura', url: '#proximas', available: false },

    // Matemáticas
    { name: 'Regla de tres', tag: 'Matemática', keywords: 'regla tres simple compuesta proporcion', url: '#proximas', available: false },
    { name: 'Porcentajes', tag: 'Matemática', keywords: 'porcentaje porciento descuento aumento', url: '#proximas', available: false },
    { name: 'Estadística básica', tag: 'Matemática', keywords: 'estadistica promedio media mediana moda desviacion', url: '#proximas', available: false },
    { name: 'Conversiones', tag: 'Matemática', keywords: 'conversion unidades medidas', url: '#proximas', available: false },
    { name: 'Descuentos sucesivos', tag: 'Matemática', keywords: 'descuento sucesivo cadena rebaja', url: '#proximas', available: false },

    // Físicas / técnicas
    { name: 'Conversor de unidades', tag: 'Técnica', keywords: 'conversor unidades metros pies kilos libras litros galones', url: '#proximas', available: false },
    { name: 'Cálculos de construcción', tag: 'Técnica', keywords: 'construccion cemento ladrillo pintura area', url: '#proximas', available: false },
    { name: 'Electricidad básica', tag: 'Técnica', keywords: 'electricidad voltios amperios potencia watts kwh', url: '#proximas', available: false },

    // Operativas
    { name: 'Calculadora de nómina', tag: 'Operativa', keywords: 'nomina salario prestaciones cesantias prima vacaciones', url: '#proximas', available: false },
    { name: 'Inventarios simples', tag: 'Operativa', keywords: 'inventario stock rotacion punto reorden', url: '#proximas', available: false },
    { name: 'Cotizaciones', tag: 'Operativa', keywords: 'cotizacion presupuesto cliente', url: '#proximas', available: false },
    { name: 'Precio de venta sugerido', tag: 'Operativa', keywords: 'precio venta margen costo iva sugerido', url: '#proximas', available: false }
  ];

  // ---------- Normalizar texto (quita tildes, pasa a minúsculas) ----------
  // Importante para que "préstamo" y "prestamo" coincidan.
  const normalize = (str) => {
    return (str || '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  // ---------- Buscador ----------
  const searchInput = document.getElementById('search-input');
  const resultsBox = document.getElementById('search-results');

  if (searchInput && resultsBox) {

    // Renderiza la lista de resultados
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

      resultsBox.innerHTML = matches
        .slice(0, 8) // máximo 8 resultados visibles
        .map((tool, i) => `
          <a href="${tool.url}" class="search-result" role="option" tabindex="0" data-idx="${i}">
            <span class="search-result-name">${escapeHtml(tool.name)}${tool.available ? '' : ' <span style="color: var(--color-text-soft); font-weight: 400; font-size: 0.85em;">· próximamente</span>'}</span>
            <span class="search-result-tag">${escapeHtml(tool.tag)}</span>
          </a>
        `).join('');

      resultsBox.hidden = false;
    };

    // Escapa HTML para evitar inyecciones (siempre escapar contenido dinámico)
    const escapeHtml = (str) => {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    // Filtrado: busca el query en nombre, tag y keywords
    const filter = (query) => {
      const q = normalize(query).trim();
      if (!q) return [];

      return tools.filter(tool => {
        const haystack = normalize(`${tool.name} ${tool.tag} ${tool.keywords}`);
        return haystack.includes(q);
      });
    };

    // Debounce sencillo para no filtrar en cada tecla
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      const query = e.target.value;
      debounceTimer = setTimeout(() => {
        const matches = filter(query);
        render(matches, query);
      }, 80);
    });

    // Cerrar resultados al hacer click fuera
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search')) {
        resultsBox.hidden = true;
      }
    });

    // Cerrar con Escape
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        resultsBox.hidden = true;
        searchInput.blur();
      }
    });

    // Reabrir al hacer focus si hay texto
    searchInput.addEventListener('focus', () => {
      if (searchInput.value.trim()) {
        const matches = filter(searchInput.value);
        render(matches, searchInput.value);
      }
    });
  }

})();
