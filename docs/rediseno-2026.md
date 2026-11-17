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

## 8. Iteración 2: pantalla de inicio del Ocean, entrada a islas, pergamino y navegación flotante

### Ocean
- **Pantalla de inicio** (`ocean/ui/StartScreen.jsx`). Agrega `ui.started` al store. Hasta elegir una opción, el barco no responde (`sim.step`, `useKeyboard`) y no se puede atracar en las islas.
  - **⛵ Navegar**: arranca la exploración.
  - **🎮 Jugar**: despliega Combate y Carrera (fácil, medio o difícil).
- **Instrucciones**: aparecen **siempre** después de elegir. En Jugar, el modo se inicia debajo del modal, pero queda en pausa hasta cerrarlo, porque `step()` pausa todo mientras hay un modal abierto.
- **Entrada a la isla** (`enterIsland` + `CameraRig`): la cámara hace zoom ×2.6, orbita unos 35° y baja; recién entonces se abre el modal. Al cerrarlo, la cámara vuelve. El juego queda pausado durante el zoom.
  - Con `prefers-reduced-motion: reduce` el modal se abre directo.
  - En la pantalla de inicio la cámara deriva lentamente.
- **Modal pergamino** (`.scroll-dialog`):
  - Papel color pergamino con varillas de madera.
  - Al abrir, la varilla inferior baja mientras el `clip-path` revela el papel (unos 0.75 s). Al cerrar, se enrolla.
  - Usa `@starting-style` y `transition-behavior: allow-discrete` (con `display`/`overlay`). Con reduced-motion hace solo un fade.
- Ya no se usa el aviso de "primera visita" (`ocean_help_seen`).
- **Ajuste posterior**:
  - El zoom de la cámara dura unos 1.6 s, con más órbita y más zoom.
  - El pergamino se desenrolla en 1.6 s y se enrolla en 0.8 s.
  - **Fuertes**: los GLB de Kenney tienen la cara almenada a lo largo de X local (muro y ventana miden 2.0, el portón 4.0); Z es la profundidad del adarve. El fuerte del puerto suponía lo contrario, así que sus muros quedaban perpendiculares. El fuerte redondo, al ser un anillo de piezas rectas, dejaba huecos.
  - Ahora **los dos fuertes son cuadrados** y salen de un mismo constructor (`ocean/scene/fortLayout.js`):
    - rotación de cada pieza `atan2(nx, nz)` según la normal del lado;
    - en los lados sin portón, las piezas se estiran en X para igualar el largo;
    - una torre en cada esquina.
  - Un test verifica que cada lado es continuo, sin huecos ni solapamientos.
- **Iteración 3**:
  - **Torres**: miden 1.9× la altura del muro y su diámetro coincide con el espesor del muro. Los muros solo ocupan el tramo entre torres (con un 15% de solape para ocultar la junta), así que ya no las atraviesan.
  - **Cañones**: los ubica el mismo constructor, afuera y en la arena, a mitad de camino entre el portón y cada esquina, apuntando hacia afuera. El fuerte de "Jugar" tiene cañones al frente y atrás; el del puerto, solo al frente.
  - **Fuerte del puerto**: una esquina sobresalía 1.46 unidades del borde de la isla, y por eso parecía flotar. Se calculó contra el perfil real de la isla: escala 0.4 y desplazado 2 en z (donde la isla es más ancha). Todas las esquinas quedan a ≥1.4 dentro de la costa sin esconder el fuerte en las nubes.
  - **Isla de juego**: el modal tiene pestañas "Combate" y "Carrera" (patrón WAI-ARIA tabs, la selección sigue al foco y la pestaña activa se marca con un borde en un pseudo-elemento). Carrera ofrece fácil, medio y difícil con el mejor tiempo de cada una.
  - **Barco "inundado"**: la flotación tomaba el agua a solo 1 unidad del centro, pero el casco escalado mide unas ±3.2 unidades, así que proa y popa quedaban bajo la ola. Ahora toma muestras en proa, popa y ambos costados según el tamaño real del casco y se apoya en ese plano. Además, nunca queda debajo del promedio de sus extremos, la inclinación está limitada y el escorado en las curvas bajó de 0.25 a 0.12 rad.
  - **Zoom a "Acerca de mí" y "CV y links"**: la cámara gira hacia la derecha (`diveTurn: -1` en `ISLANDS`) y deshace el giro con el mismo sentido al salir.

### Sitio profesional
- **Navegación flotante** (`SectionNav`):
  - Una flecha ↓ transparente, centrada, que lleva a la sección siguiente. Se oculta en Contacto para no tapar el formulario.
  - Un botón "volver al inicio" abajo a la derecha cuando no estás en el home. Reemplaza al del footer.
- **Header**:
  - El badge "Disponible" pasa al hero.
  - El nav inline aparece desde `xl` (1280 px); por debajo se usa el popover.
  - Los íconos sociales del header se muestran solo desde `2xl`.
  - Verificado en ES y EN a 360, 400, 768, 1024, 1280, 1366, 1440 y 1920 px: sin superposiciones ni overflow.
- **Scrollspy**: había un bug con dos links resaltados a la vez. Se corrigió:
  - El resaltado visual lo pinta una sola fuente: `:target-current` nativo o, si no hay soporte, la clase de fallback.
  - `aria-current` sale siempre del IntersectionObserver.

### Verificación
- 25 tests OK. Los 8 nuevos cubren:
  - el bloqueo de controles antes de iniciar;
  - Navegar, Jugar y la pausa debajo de las instrucciones;
  - el comportamiento con reduced-motion;
  - el StartScreen;
  - el SectionNav.
- Lighthouse sin cambios: `/` mobile 98/100/100/100 y desktop 100/100/100/100.
- Nota: el Chrome headless de esta máquina reporta `prefers-reduced-motion: reduce` (puede venir de *Configuración de Windows → Accesibilidad → Efectos de animación*). Las animaciones se verificaron emulando `no-preference`. Si ese ajuste está desactivado en tu Windows, en tu navegador vas a ver la versión sin animaciones, que es lo esperado.

## 9. Iteración 4: easter egg de paletas y Lighthouse de todas las pantallas

### Cubos del hero (`site/sections/HeroArt.jsx`, `site/palette.js`)
- Antes se compararon dos opciones en un prototipo (cambio de paleta y "puerta al Océano"); se eligió el **cambio de paleta**.
- Cada cubo es un `<button aria-pressed>`.
  - **Hover** (solo con puntero fino y sin reduced-motion): el cubo se inclina en 3D hacia el puntero y su sombra se desplaza.
  - **Click o Enter**: el cubo se enciende con un barrido de colores (`hue-rotate`); otro click lo apaga.
- **Primera vez con los 3 encendidos**: un círculo crece desde los cubos y repinta el sitio con la paleta **Matrix**. La animación es una View Transition con `clip-path`, más lenta y con destello, acompañada de una onda expansiva y 22 chispas. Luego aparece el selector con las 4 paletas (Violeta, Matrix, Sunset, Océano), hecho con radios nativos en `fieldset` + `legend`.
- **Después**: elegir una paleta la aplica con el círculo creciendo desde el chip. Volver a encender los 3 cubos pasa a la paleta siguiente.
- La paleta elegida y el desbloqueo se guardan en `localStorage` y se aplican antes del primer pintado.
- Con reduced-motion el cambio es instantáneo. El estado se anuncia por `role="status"`.

### Implementación de las paletas
- Los tokens de acento de Tailwind (`primary-container`, `inverse-primary`, `accent-*`) pasan a ser variables CSS en formato RGB: `rgb(var(--c-…) / <alpha-value>)`. Los valores de cada paleta están en `site.css` bajo `html[data-palette]`.
- Cada paleta mantiene AA:
  - texto blanco sobre `primary` ≥4.5:1;
  - `accent-text` ≥4.5:1 sobre las tarjetas oscuras.
- También se pasaron a variables los colores fijos de `site.css`: scrollspy, foco, hover de tarjetas, cursor, selección y las líneas del gráfico de telemetría.

### Otros
- El azul legado `#2b77e7` (Ocean/Classic) daba 4.29:1 sobre blanco. Se oscureció a `#2971db` (4.69:1).

### Lighthouse (`vite preview`, Lighthouse 12.6)

| Pantalla | Perf | A11y | BP | SEO | LCP | TBT | CLS | Peso |
|---|---|---|---|---|---|---|---|---|
| `/` mobile | 98 | 100 | 100 | 100 | 2.2 s | 70 ms | 0 | 235 KiB |
| `/` desktop | 100 | 100 | 100 | 100 | 0.5 s | 0 ms | 0 | 358 KiB |
| `/ocean` mobile | 36 | 100 | 100 | 100 | 18.4 s | 2640 ms | 0 | 2644 KiB |
| `/ocean` desktop | 58 | 100 | 100 | 100 | 3.3 s | 510 ms | 0.002 | 2684 KiB |
| `/classic` mobile | 38 | 100 | 100 | 100 | 11.3 s | 2190 ms | 0.001 | 1928 KiB |
| `/classic` desktop | 72 | 100 | 100 | 100 | 2.1 s | 360 ms | 0.001 | 1928 KiB |

Las variantes 3D tienen performance baja por diseño: three.js/r3f (~250 KB gzip) más modelos GLB y escena WebGL. Por eso son opcionales y se cargan con lazy loading; la home no las descarga.

## 10. Pendientes / ideas

- Ocean/Classic: optimizar modelos GLB (Draco/meshopt), mostrar una pantalla de carga liviana mientras baja three.js y bajar el DPR en mobile.
- Cargar solo el diccionario del idioma activo (hoy ES y EN viajan juntos en el entry, unos 70 KB sin comprimir).
- Las capturas de los proyectos sin imagen (Inova Glass, embarazo, incendios) usan mockups: se pueden reemplazar por screenshots reales si se pueden publicar.
- El HTML original de Stitch (`index copy.html`) quedó fuera del commit, como referencia local.
