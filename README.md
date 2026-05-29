# Wapps

Calculadoras y herramientas web gratuitas para pequeños empresarios,
emprendedores y contadores en Colombia.

## Estructura

```
wapps/
├── index.html                 → Landing principal
├── 404.html
├── robots.txt, sitemap.xml, favicon.svg
├── _template.html             → Plantilla maestra para nuevas calculadoras
│
├── assets/
│   ├── css/                   → 5 archivos: base, layout, components, landing, tool-page
│   └── js/
│       ├── main.js, search.js → JS de páginas principales
│       └── utils/             → format, validate, share, analytics (compartidos por todas las herramientas)
│
├── financieras/, tributarias/, matematicas/, tecnicas/, operativas/
│   ├── index.html             → Landing de la categoría
│   ├── _shared/               → Estilos y JS específicos de la categoría
│   └── slug-de-cada-calculadora/
│       ├── index.html         → Placeholder hoy; el día que se construya, copiar de _template.html
│       └── script.js          → Lógica de esa calculadora
```

## Cómo construir una calculadora nueva

1. Abre el `index.html` del placeholder en la carpeta de la calculadora.
2. Sigue las instrucciones del comentario del encabezado (referencia
   `/_template.html`).
3. Cuando esté lista:
   - Quita el `<meta name="robots" content="noindex">` del placeholder.
   - Cambia su card en `/[categoria]/index.html` para que ya no diga "Próximamente".
   - Agrega la URL al `sitemap.xml`.
   - Agrégala al array `TOOLS` en `/assets/js/search.js`.

## Stack

- HTML semántico + CSS responsivo (mobile-first) + JavaScript vanilla.
- Fuente display: Fraunces (Google Fonts). Body: stack del sistema.
- Sin frameworks. Sin build step (por ahora — evaluar Eleventy cuando
  haya 5+ calculadoras y la duplicación de header/footer sea molesta).

## Convenciones

- URLs en español, con guiones, sin tildes ni mayúsculas.
- Carpetas que empiezan con `_` no son páginas públicas.
- Cada herramienta debe incluir: calculadora, qué es, fórmula, ejemplo,
  FAQ, herramientas relacionadas, feedback. Las tributarias y de nómina,
  además: nota de validación con fuente oficial + "actualizado para [año]".

## Deploy

Cualquier hosting estático funciona: Netlify, Vercel, Cloudflare Pages,
GitHub Pages. La estructura de carpetas con `index.html` adentro produce
URLs limpias sin extensión.
