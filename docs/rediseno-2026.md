# Rediseño 2026: versión profesional (Stitch → React) + Ocean lazy

Rama: `redesign` (creada desde `ocean`). Fecha: 2026-11-17.

## 1. Objetivo

- Llevar a React el diseño generado con Stitch (HTML estático de unas 2.100 líneas con Tailwind por CDN, Material Symbols y JS vanilla) como **nueva home `/`**, con buenas prácticas y usando **el contenido real** del proyecto.
- Mantener el **modo Ocean** (three.js) como variante accesible por botón, en **`/ocean`**, cargado con **lazy loading**.
- Conservar la home 3D clásica (avión + isla) en **`/classic`**.
- No perder información: todo el contenido sigue saliendo de `src/i18n/{es,en}.json` y `src/constants`.

## 2. Qué se tomó del diseño de Stitch y qué no

| Del HTML de Stitch | Decisión | Motivo |
|---|---|---|
| Estética terminal/dark, tokens de color, tipografías (Space Grotesk, Inter, JetBrains Mono), layout de secciones | **Se adopta** | Es el valor del diseño. Los tokens pasan a `tailwind.config.js`. |
| Testimonios de "Ing. Eduardo M." y "Luciana R." | **Se elimina** y se reemplaza por el formulario de contacto real (EmailJS) | Son personas y citas inventadas. Publicarlas sería falso. |
| Métricas como "-40% de error" o "<200 ms de latencia", y "Liderazgo técnico" | **Se elimina** | No están en el CV. Los textos salen del CV y de las traducciones existentes. |
| Experiencia (San José como "secundario", JOVIN con Spring Boot) | **Se corrige** con `experiences.*` | Contradecía el CV: el nivel es primario y el stack de JOVIN fue MEAN (OcularVet). |
| 4 proyectos con imágenes `lh3.googleusercontent.com/aida-public` | **Se muestran los 7 proyectos reales**, con capturas reales o mockups SVG/CSS propios | Las imágenes son generadas por IA, externas y expiran. |
| Links genéricos `github.com` / `linkedin.com` | **Links reales** (`socialLinks`) | |
| Tailwind CDN + 3 hojas de Google Fonts + Material Symbols | Tailwind compilado, fuentes self-hosted con `@fontsource`, íconos SVG inline | Se eliminan requests bloqueantes de terceros y una fuente de íconos de cientos de KB. |
| `::-webkit-scrollbar { display: none }` | **Se elimina**; se usa `scrollbar-color` | Ocultar la scrollbar perjudica la accesibilidad. |
| `text-muted #60606B` | Se sube a `#8B8B96`; se agrega `accent-lilac` para texto violeta chico | `#60606B` daba ~3.3:1 de contraste (falla WCAG AA). |
| Cursor custom (`left/top` + listeners por elemento) | Se reimplementa | Ver la sección 5. |
| Acordeón con `onclick` inline, filtros con `classList` | `<details>` nativo; filtros con estado React y `aria-pressed` | |
| Sin menú móvil ni selector de idioma | Se agregan: popover nativo y toggle ES/EN | |

## 3. Arquitectura

```
src/
  App.jsx                 rutas: / (estático), /ocean y /classic (lazy), redirects
  routes.js               loadOcean/loadClassic compartidos por lazy() y por el prefetch
  hooks/useMediaQuery.js  extraído de Ocean.jsx (lo reusan Ocean, Header y SitePage)
  hooks/useSiteTheme.js   alterna html.theme-site (oscuro) entre variantes
  legacyFonts.js          Poppins/Work Sans, importadas solo desde Ocean y Classic
  pages/Classic.jsx       envuelve Home + Navbar viejo (/classic)
  site/
    SitePage.jsx          compone la página; scroll + foco al #hash; cursor lazy
    site.css              tema del documento, scrollspy, acordeón, popover, motion
    sections.js           SECTION_IDS y filterProjects (datos puros)
    layout/Header.jsx     nav con scrollspy, popover móvil, idioma, CV, botón Océano
    layout/Footer.jsx     footer y OceanPromo
    sections/             Hero, HeroArt, Expertise, Work, Experience, Contact
    components/           Icon (SVG inline), CustomCursor
    hooks/                useScrollSpy, useContactForm
```

**Rutas**

| Ruta | Qué renderiza |
|---|---|
| `/` | `SitePage`, importado de forma estática (es la ruta de entrada y su LCP es texto) |
| `/ocean` | `lazy(loadOcean)` |
| `/classic` | `lazy(loadClassic)` |
| `/about` | Redirige a `/#experience` |
| `/projects` | Redirige a `/#work` |
| `/contact` | Redirige a `/#contact` |
| `*` | Redirige a `/` |

Los links de "ver página completa" de las islas del Ocean y los links del Navbar clásico apuntan ahora a esas secciones. El menú del Ocean suma "↩ Versión profesional".

**Se eliminaron** `pages/About|Projects|Contact`, `components/CTA|Footer|Alert`, `hooks/useAlert` y las claves i18n `cta` y `alert`, que quedaron sin uso. **Se conservan** `AboutContent` y `ProjectsContent`, porque los usan las islas del Ocean.

## 4. Datos e i18n

- Se agrega el namespace `site.*` en ES y EN. Hay un test que verifica la paridad de claves entre ambos.
- En `constants/index.js`, cada proyecto tiene `category` (`realtime | mobile | data | web`), `stack`, `featured` (Tenlek) e `imageSize` (para evitar CLS). Se agregan `projectCategories`, `expertise` y `contactEmail`.
- Los contadores de los filtros se **calculan**; no están hardcodeados como en Stitch.
- Imágenes convertidas a WebP de 1200 px:

| Imagen | Antes | Después |
|---|---|---|
| `tenlek` | 590 KB | 99 KB |
| `LernaCourses` | 466 KB | 97 KB |
| `consigna1` | 544 KB | 63 KB |
| `sanjose` | 207 KB | 27 KB |
| `AgileFlow2` | 54 KB | 14 KB |

## 5. Criterios técnicos (guías *modern-web-guidance*, leídas offline)

- **Acordeón** (`ui-components/accordion`): `<details>`/`<summary>` nativos, sin headings dentro de `summary` (JAWS y TalkBack los descartan) y **no exclusivo**. El marcador es un `::before` con máscara que rota. La animación usa `::details-content` + `interpolate-size` solo con `prefers-reduced-motion: no-preference`, como mejora progresiva.
- **Scrollspy** (`ui-components/scrollspy`): `scroll-target-group: auto` + `:target-current` donde está soportado, con fallback a IntersectionObserver. `aria-current` se sincroniza en ambos casos y las secciones llevan `tabindex="-1"`.
- **Nav responsive** (`ui-components/navbar`): un solo `<nav>`. Debajo de `lg`, la lista es `popover="auto"` controlada por `popovertarget`, así Esc y click afuera son nativos.
- **Fuentes** (`visually-stable-font-fallbacks`): se usa `font-size-adjust: from-font`. Además, un plugin de Vite precarga las 2 fuentes del hero. Esto llevó el **CLS mobile de 0.108 a 0**.
- **Imágenes** (`optimize-image-priority`): el LCP es texto, así que no se usa `fetchpriority`. Las imágenes bajo el fold usan `loading="lazy"` con `width`/`height`.
- **Tema** (`browser-ui-theming`): se configuran `color-scheme: dark`, `accent-color`, `scrollbar-color` y `::selection`. Los campos usan `:user-invalid` y el `textarea` tiene `resize: vertical`.
- **Motion** (`ui-behaviors/motion`): todo movimiento espacial queda dentro de `prefers-reduced-motion: no-preference`. Las transiciones de color se mantienen.
- **Cards** (`ui-components/card`): cada card es un `<article>`. Si el proyecto tiene link, el link va en el heading y se estira sobre la card.
- **Prefetch** (`improve-next-page-load-performance`): las speculation rules no sirven en una SPA. En su lugar, `import()` se dispara por intención (`pointerenter`/`focus` sobre los links al Océano).
- **Cursor custom**:
  - Su chunk es lazy y se descarga en `requestIdleCallback`, solo con `(hover:hover) and (pointer:fine)` y sin reduced-motion.
  - Mueve los elementos con `transform: translate3d` (sin layout) y usa un solo loop de rAF que se detiene en reposo.
  - Usa delegación de eventos y conserva el cursor nativo visible.
- **Formulario**: `@emailjs/browser` se importa recién al enviar. El estado se anuncia en `role="status"` y, si el envío falla, se muestra el email directo.
- **React Router**: se activan los flags `v7_startTransition` y `v7_relativeSplatPath`.

## 6. Paso a paso realizado

1. Creación de la rama `redesign` y medición del **baseline** (build + Lighthouse del `/` anterior, que era Ocean).
2. Lectura offline de las guías de `.claude/skills/modern-web-guidance/guides/`.
3. Dependencias: `@fontsource(-variable)` para las fuentes y `vitest`, `jsdom` y Testing Library para los tests.
4. Tokens Tailwind, `index.html` (meta, OG, `theme-color`, sin Google Fonts) y `robots.txt`.
5. Datos: proyectos, especialidades, i18n `site.*` y conversión de imágenes.
6. Componentes del sitio y hooks.
7. Routing, redirects, prefetch, links de vuelta desde Ocean y Classic, y borrado de archivos huérfanos.
8. Tests, lint y build.
9. Lighthouse y ajustes: precarga de fuentes por el CLS y contraste de los violetas.

## 7. Resultados

### Lighthouse (`vite preview`, Chrome headless, Lighthouse 12.6)

| Página | Perf | A11y | BP | SEO | FCP | LCP | TBT | CLS | Peso |
|---|---|---|---|---|---|---|---|---|---|
| `/` **antes** (Ocean), mobile | 35 | 100 | 100 | 90 | 4.4 s | 18.4 s | 2870 ms | 0.015 | 2543 KiB |
| `/` **antes** (Ocean), desktop | 62 | 100 | 100 | 90 | 0.9 s | 3.1 s | 410 ms | 0.002 | 2543 KiB |
| `/` **nuevo**, mobile | **98** | **100** | **100** | **100** | 1.7 s | 2.3 s | 30–50 ms | **0** | **231 KiB** |
| `/` **nuevo**, desktop | **100** | **100** | **100** | **100** | 0.4 s | 0.5 s | 0 ms | 0 | 353 KiB |
| `/ocean`, mobile (referencia) | 37 | 100 | 100 | 100 | 4.0 s | 18.5 s | 2410 ms | 0 | 2678 KiB |

El peso de `/` en mobile bajó de 2543 KiB a 231 KiB (−91%).

### Bundle

- El entry (`index-*.js`) pesa 274 KB (93 KB gzip); antes pesaba 237 KB (84 KB gzip). Incluye el sitio nuevo completo.
- **three.js y r3f** (`Loader-*.js`, 905 KB / 246 KB gzip) y `Ocean-*.js` (107 KB) **ya no se descargan en `/`**. Se verificó en el navegador que no se piden al cargar y sí al pasar el mouse por "Océano 3D".
- Chunks lazy adicionales: `CustomCursor` (2.4 KB), EmailJS (3.6 KB) y `Classic` (30 KB).

### Tests

- `npm test`: **17 tests OK**. Cubren:
  - paridad de claves ES/EN;
  - un único `h1` y todas las secciones;
  - links a `/ocean`;
  - cambio de idioma y `<html lang>`;
  - los 7 proyectos reales sin testimonios;
  - filtros (`aria-pressed`, conteos, live region);
  - acordeón nativo;
  - formulario (éxito y error);
  - rutas lazy y redirects.
- `npm run lint`: sin errores ni warnings.
- E2E manual con puppeteer:
  - prefetch por hover;
  - navegación a `/ocean` (canvas OK, tema claro restaurado);
  - `/about` → `/#experience`, con scroll y foco en la sección;
  - `/classic` sin errores de consola;
  - mobile a 400 px sin overflow horizontal, con el menú popover funcionando.

## 8. Pendientes / ideas

- Cargar solo el diccionario del idioma activo (hoy ES y EN viajan juntos en el entry, unos 70 KB sin comprimir).
- Las capturas de los proyectos sin imagen (Inova Glass, embarazo, incendios) usan mockups: se pueden reemplazar por screenshots reales si se pueden publicar.
- El HTML original de Stitch (`index copy.html`) quedó fuera del commit, como referencia local.
