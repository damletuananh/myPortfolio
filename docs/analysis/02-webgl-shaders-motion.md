# WebGL, Shaders, GSAP & Motion Reverse-Engineering (`meesverberne.com`)

**Audit Date:** 2026-11-15  
**Target:** `https://meesverberne.com/` (plus `/work/`, `/about/`, `/contact/`, `/project/mikki-sindhunata/`, `/404/`)  
**Method:** Direct fetch and full decompilation/analysis of live HTML, CSS (`e62857b0eb72a8ba3ce567f535e34351.css`), and all 38 `<script>` tags / LiteSpeed JS bundles (without Playwright).

---

## 1. Executive Architecture Summary & Critical Discoveries

`meesverberne.com` is a WordPress theme (`meesverberne`) running LiteSpeed Cache + Cloudflare Rocket Loader, structured as an SPA via **Swup v4.4.2**, smoothed with **Lenis**, choreographed with **GSAP 3.12.5** (`ScrollTrigger`, `SplitText`, `DrawSVGPlugin`), and rendered across **four WebGL canvases** powered by **Three.js r126** and **jQuery v1.10.2**.

### Key Non-Obvious Findings (Verified Directly in Live Bundles)
1. **Z-Index & Media Occlusion Architecture:** All DOM content lives inside `#pageContainer` (`z-index: 5`), while the shared media WebGL canvas (`#pageCanvas` inside `.pageCanvasWrapper`) sits **behind** it at `z-index: 3`, and `.backgroundCanvasWrapper` sits at `z-index: 1` (above `.backgrounds` `#22264B` overlays at `z-index: auto`/`0`). Placeholder `.innerCanvas` elements inside `#pageContainer` have transparent backgrounds (`.hide { background: #fff0 }`) and any injected `<video>` inside `.innerCanvas` has **`opacity: 0`** in CSS so the DOM never occludes `#pageCanvas` (`z-index: 3`), while `.innerCanvas` remains clickable/hoverable at `z-index: 5` and text sits cleanly over WebGL media.
2. **`loadCanvas` Does NOT Render on Initial Visit:** Despite initializing at `2900ms`, `loadCanvasFrame` starts `false` and `.loadCanvasWrapper` starts at `opacity: 0`. The initial home reveal is purely CSS/DOM + `preloadPage()` (`600ms` / `2600ms`) + `homeHeaderBlock` GSAP delays. `loadCanvas` renders only during **Swup route transitions** (slate-periwinkle `vec3(0.38, 0.39, 0.52)`) and the **mobile hamburger menu** (dark navy `vec3(0.133, 0.149, 0.294)` = `#22264B`).
3. **Swup Wait Duration Works via Unused `transition-fade` CSS Duration:** CSS defines `#pageContainer.transition-fade { opacity: 1; transition: opacity 0.6s 0s ease-out; }` with **no** `html.is-animating` opacity-0 rule. Swup 4.4.2's `awaitAnimations()` parses `getComputedStyle(el).transitionDuration` (`600ms`) and waits `601ms` (`n + 1` fallback timer) on out/in phases, giving `#loadCanvas` time (`450ms`) to dissolve in before DOM swap.
4. **Why `backgroundCanvas` Is Barely Perceptible (`opacity: 0.03`):** Its fragment shader outputs `vec3(0.9)` pulsing cells and `vec3(0.0)` under the hovered cell (despite a leftover Dutch comment saying `// Rood voor muis, wit anders`), rendered inside `.backgroundCanvasWrapper` with **`mix-blend-mode: difference`** and **`opacity: 0.03`** (plus `filter: contrast(1.8)` at `<= 580px`). Mouse tracking works despite `pointer-events: none !important` because `$(document).on("mousemove.canvas", canvas, fn)` passes an `HTMLElement` (non-string) as the 2nd arg to jQuery 1.10.2 `.on()`, which jQuery treats as `event.data`, binding a document-wide listener.
5. **HTML Attributes vs. Unused/Dead JS Hooks:**
   - `data-marquee-swipe="true"` is present in HTML, **but zero JS swipe/drag code exists** in any bundle.
   - `data-scroll-blur="true"` is present on `footer .marqueeWrapper`, **but unused** in JS and CSS.
   - `SwupScrollPlugin` (`<script>` #9) is loaded on the page, **but never instantiated** in `new Swup(...)`.
   - `$(document).trigger("loadCanvasHeaderBlock")` is fired at `1600ms` by `homeHeaderBlock`, **but nothing listens to it** — `pageCanvas` initializes `.loadCanvasHeaderBlock` via its own `2900ms` timer.
   - **No custom cursor JS** and **no audio/sound JS** exist anywhere on the live site.

---

## 2. Complete Script Inventory & Classification (`https://meesverberne.com/`)

All 6 tested routes (`/`, `/work/`, `/about/`, `/contact/`, `/project/mikki-sindhunata/`, and `/this-page-does-not-exist-404/`) serve the exact same 38 `<script>` tags in `<head>` / bottom of `<body>` (Cloudflare Rocket Loader defers execution via `type="49dcaaea33eec8816f804e3b-text/javascript"`). Zero `<script>` tags appear inside `#pageContainer`.

| # | Tag Type / URL | Size | Classification | Identity / Exact Purpose |
|---|---|---|---|---|
| 1 | Inline `application/ld+json` | 1,877 B | SEO / Schema | Yoast SEO JSON-LD graph |
| 2 | `https://www.googletagmanager.com/gtag/js?id=G-YS6K2PT2H7` | 551,973 B | Analytics | Google Tag Manager / gtag.js |
| 3 | Inline JS (`gtag('config', 'G-1FGWQJWVCW', ...)`) | 175 B | Analytics | GA4 measurement config (`anonymize_ip: true`) |
| 4 | `/wp-content/themes/meesverberne/libjs/jquery.js` | 93,099 B | **Vendor** | **jQuery v1.10.2** |
| 5 | `.../litespeed/js/406259ed2ddb831fda28c5066def4bd4.js?ver=f4bd4` | 23,297 B | **Vendor** | **Swup v4.4.2** (SPA router & transition hooks) |
| 6 | `.../litespeed/js/1c4b2ad9480a33b55a81440d7aaf58a6.js?ver=f58a6` | 2,920 B | **Vendor** | **SwupGaPlugin** |
| 7 | `.../litespeed/js/9e1ecc7b705034e6867002ed9b7633ed.js?ver=633ed` | 6,013 B | **Vendor** | **SwupFormsPlugin** |
| 8 | `.../litespeed/js/ef817d4f6a051e3e368f8d30b18275a8.js?ver=275a8` | 4,391 B | **Vendor** | **SwupHeadPlugin** |
| 9 | `.../litespeed/js/64881678097b392afa34590fb8dc548c.js?ver=c548c` | 9,640 B | **Vendor** | **SwupScrollPlugin** *(loaded, never instantiated)* |
| 10 | `.../litespeed/js/cc3965593ffa38d32d9429c96adf704b.js?ver=f704b` | 10,388 B | **Vendor** | **Lenis** smooth scrolling |
| 11 | `.../litespeed/js/a59b0e1924c76aff9378f9a2d6238a4a.js?ver=38a4a` | 72,214 B | **Vendor** | **GSAP 3.12.5** core |
| 12 | `.../litespeed/js/70695fb20d01fa0cca1df99bab1dcb26.js?ver=dcb26` | 43,380 B | **Vendor** | **GSAP ScrollTrigger 3.12.5** |
| 13 | `.../litespeed/js/e588d3978622cf325160970fa97ec6f2.js?ver=ec6f2` | 15,685 B | **Vendor** | **GSAP SplitText 3.12.5** (Club GSAP) |
| 14 | `.../litespeed/js/f6ec7d4bf3223271367010950b87c247.js?ver=7c247` | 4,489 B | **Vendor** | **GSAP DrawSVGPlugin 3.12.5** (Club GSAP) |
| 15 | `.../litespeed/js/0738bc3247ed0f632b6ba5ef27725689.js?ver=25689` | 7,689 B | **Custom Theme** | Core orchestration: Swup, Lenis, `preloadPage()`, `initPage()`, `setPrimaryBackgrounds()`, `lazyLoadImages()`, `faviconAnimate()`, CF7 validation |
| 16 | `.../litespeed/js/ad4d32a8cf09c9748156c876b8013f92.js?ver=13f92` | 835 B | **Custom Theme** | `initWords()` / `animWords()` (`[data-words]`, `[data-scroll-words]`) |
| 17 | `.../litespeed/js/99de7d965734f122515697c2129e43af.js?ver=e43af` | 1,110 B | **Custom Theme** | `initLetters()` (`[data-letters]` + `.hugeTitle` dynamic `vw` scaling & `.row` height lock) |
| 18 | `.../litespeed/js/cddd0e981fb5c91f256fa597214a6ae8.js?ver=a6ae8` | 629 B | **Custom Theme** | `addInviewClasses()` (`[data-scroll-inview]`, `[data-scroll-direct]`) |
| 19 | `.../litespeed/js/c75916aac88da267c88da565760bb110.js?ver=bb110` | 1,098 B | **Custom Theme** | `changeSpeedElements()` (`[data-scroll-speed]`, `[data-scroll-direction]`, `[data-scroll-position]`) |
| 20 | `.../litespeed/js/4e5426368164583699d455d752d92a87.js?ver=92a87` | 1,666 B | **Custom Theme** | `initMarquees()` (infinite clones, scroll-direction `timeScale` flip, scroll-scrub offset) |
| 21 | `.../litespeed/js/d0c45f8f3731dfeabbda24c197d8bc23.js?ver=8bc23` | 2,917 B | **Custom Theme** | `playVideoCanvasOnScroll()` (`.setVideoOnScroll` & `.playVideoCanvasOnScroll`) |
| 22 | `.../litespeed/js/af13832d23590ae87441d952dc2bb8f8.js?ver=bb8f8` | 3,817 B | **Custom Theme** | Header scroll behavior, progressive backdrop blur, `.MVLogo` bird flapper, mobile `.menuIcon` / `.hamburgerMenu` + SVG draw |
| 23 | `.../litespeed/js/8aacb390f6ca4ef3d33037a1b7877206.js?ver=77206` | 756 B | **Custom Theme** | Footer signature SVG `DrawSVG` reveal |
| 24 | `.../litespeed/js/54b82ca2b6184a31843f46d7c03bc5af.js?ver=bc5af` | 2,366 B | **Custom Theme** | `.homeHeaderBlock` intro choreography & 9-stroke `DrawSVG` signature |
| 25 | `.../litespeed/js/743398e27e9c397e2ae2a287272acf9d.js?ver=acf9d` | 632 B | **Custom Theme** | `.workFeaturedBlock` 2-stroke `DrawSVG` signature |
| 26 | `.../litespeed/js/55b6ca29156a5ede654fa6e72c7e2dba.js?ver=e2dba` | 375 B | **Custom Theme** | `.projectHeaderBlock` `.hugeTitle` reveal |
| 27 | `.../litespeed/js/0a22c322c9f5fd6b6c4f667f1d63c7a5.js?ver=3c7a5` | 903 B | **Custom Theme** | `.aboutHeaderBlock` `.hugeTitle` reveal + `"ME \| ES"` horizontal split |
| 28 | `.../litespeed/js/9a12113a196c3f85b14ebfd1b944dffb.js?ver=4dffb` | 1,239 B | **Custom Theme** | `.aboutBlock` 9-stroke `DrawSVG` signature |
| 29 | `.../litespeed/js/016ab4f503fc25b445905c93d242b9fd.js?ver=2b9fd` | 2,227 B | **Custom Theme** | `.contactBlock` staggered reveal, 2-stroke `DrawSVG`, & `initContactForm()` AJAX submit |
| 30 | `.../litespeed/js/52efc1a0d646e512ea4de645a9823d1e.js?ver=23d1e` | 7,366 B | **Custom Theme (WebGL)** | `initErrorCanvas()` — 404 page WebGL grid distortion + layered `.copyErrorContent` clone |
| 31 | `.../litespeed/js/6389364b4b4a2568e27bb98b58246287.js?ver=46287` | 636,430 B | **Vendor (`async`)** | **Three.js r126** (`var n="126"`, `t.REVISION=n`) |
| 32 | `.../litespeed/js/5e03b684b5b5eab35e30f9697ec00018.js?ver=00018` | 4,054 B | **Custom Theme (`async`, WebGL)** | `initBackgroundObject()` — `#backgroundCanvas` fixed fullscreen noise-grid shader |
| 33 | `.../litespeed/js/bcc49c99cdb4543bfdd590f9dd0ab26d.js?ver=ab26d` | 9,786 B | **Custom Theme (`async`, WebGL)** | `pageCanvas` (`#pageCanvas`) — shared scissored WebGL canvas for all `.innerCanvas` images/videos |
| 34 | `.../litespeed/js/a4f8a847df80d749ac94ca769463e2f3.js?ver=3e2f3` | 5,895 B | **Custom Theme (`async`, WebGL)** | `initLoadObject()` — `#loadCanvas` fullscreen route-transition & mobile-menu dissolve shader |
| 35 | Inline `type="speculationrules"` | 380 B | Infra / Browser | WordPress conservative document prefetch rules |
| 36 | Inline `data-no-optimize="1"` | 8,319 B | Infra / Plugin | LiteSpeed Cache `LazyLoad` (MutationObserver on `[data-lazyloaded]`) |
| 37 | `/cdn-cgi/scripts/7d0fa10a/cloudflare-static/rocket-loader.min.js` | 12,332 B | Infra / CDN | Cloudflare Rocket Loader (`defer`) |
| 38 | `https://static.cloudflareinsights.com/beacon.min.js/...` | 31,853 B | Analytics | Cloudflare Web Analytics RUM beacon (`spa: 2`) |

---

## 3. Global Z-Index & DOM Stacking Architecture

Because `.backgroundContainer` is a child of `body` (`position: relative`) and has **no `position` or `z-index`**, it does **not** isolate a stacking context; its positioned children participate directly in the root stacking order:

```text
z-index: 50    header .menuIcon (fixed, mobile <=580px)
z-index: 49    header .hamburgerMenu (fixed, mobile <=580px, transparent bg; opacity 0->1, delay 0.9s on close)
z-index: 14    .loadCanvasWrapper -> #loadCanvas (fixed, 100vw x 100vh, pointer-events: none)
z-index: 10    header .headerBar (fixed, 100vw x 5.625vw)
z-index: 5     #pageContainer.transition-fade (relative, overflow: hidden, min-height: 100vh)
                 ├─ .blocks > section (transparent bg; .innerCanvas hitboxes + text/UI)
                 └─ footer (z-index: 2 inside #pageContainer, transparent bg)
z-index: 4     .errorCanvasContainer .errorCanvasWrapper (absolute, mix-blend-mode: lighten)
z-index: 3     .backgroundContainer .pageCanvasWrapper -> #pageCanvas (absolute, margin-top: -100px, opacity 0->1 on .inview)
z-index: 1     .backgroundContainer .backgroundCanvasWrapper -> #backgroundCanvas (fixed, 100vw x 100vh, mix-blend-mode: difference, opacity 0->0.03 on .inview)
z-index: auto  .backgroundContainer .backgrounds -> .primaryBackground (absolute #22264B rects)
base           body / .backgroundContainer (background: #D7C6AD)
```

---

## 4. WebGL Systems Deep-Dive (Exact Shaders, Math & Lifecycles)

All 4 WebGL renderers initialize with `{ alpha: true, canvas, precision: "mediump" }` (and `antialias: true` on `pageCanvas` and `errorCanvas`).

### 4.1 `loadCanvas` (`#loadCanvas` / `.loadCanvasWrapper` — Bundle #34)

#### Setup & Timing
- **Globals:** `var loadCanvasFrame = false; var loadCanvas = false;`
- **Initialization:**
  - On `$(document).ready`: `setTimeout(..., 2900)` sets `loadCanvas = true` and calls `initLoadObject()`.
  - Fail-safe if user clicks a Swup link before `2900ms`: `pageContainerWrap.hooks.on('animation:out:start', ...)` immediately checks `if (!loadCanvas)`, runs `initLoadObject()`, and triggers `"animateLoaderInFix"`.
  - **Initial page load behavior:** `animate()` only requests frames while `loadCanvasFrame === true`. Because `loadCanvasFrame` initializes `false` and `.loadCanvasWrapper` starts at CSS `opacity: 0`, **zero frames render on initial load**—there is no WebGL preloader curtain on first entry.
- **Geometry & Camera:** `THREE.PerspectiveCamera(75, 1, 0.1, 1000)` at `z = 1` viewing `THREE.PlaneGeometry(10, 10, 100, 100)` (aspect updates on resize via `camera.aspect = canvas.width / canvas.height`).

#### Responsive Grid Math (`scaleX`, `scaleY`)
```js
function calculateScaleX() {
  var baseGridCountX = ($(window).width() <= 580) ? 15 : 45;
  return canvas.width / baseGridCountX; // Each cell is 45px wide (desktop) or 15px wide (<=580px)
}
function calculateScaleY() {
  return ($(window).width() <= 580) ? 40 : 20; // Fixed 20 rows (desktop) or 40 rows (<=580px)
}
```
> Notice the asymmetry: `scaleX` fixes **cell pixel width** (`45px` desktop, `15px` mobile), whereas `scaleY` fixes **total row count** (`20` desktop, `40` mobile).

#### Exact GLSL Shaders & Uniforms
Uniforms:
- `time`: `0.0` (animated `0 -> 15.0` on enter, `15.0 -> 0.0` on exit)
- `resolution`: `THREE.Vector2(canvas.width, canvas.height)`
- `scaleX`, `scaleY`: computed above
- `color`: `THREE.Vector3(0.38, 0.39, 0.52)` (default muted slate-indigo `~#616385` for page transitions) or `THREE.Vector3(0.133, 0.149, 0.294)` (`#22264B` for mobile hamburger menu)

**Vertex Shader:**
```glsl
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

**Fragment Shader:**
```glsl
precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform float scaleX;
uniform float scaleY;
uniform vec3 color;

float grid(vec2 st, vec2 scale) {
    vec2 gridPos = abs(fract(st * scale - 0.5) - 0.5);
    float lineThickness = 0.0;
    vec2 grid = step(vec2(lineThickness), gridPos);
    return grid.x * grid.y;
}

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
    vec2 st = gl_FragCoord.xy / resolution.xy;
    vec2 scale = vec2(scaleX, scaleY);
    float g = grid(st, scale);

    vec2 gridCoord = floor(st * scale);
    float offset = random(gridCoord);

    float fadeTime = time * 0.2;
    float fadeDelay = offset * 2.0;
    float fade = smoothstep(0.0, 1.0, fadeTime - fadeDelay);

    vec3 color = color;
    float alpha = fade * g;

    if (alpha <= 0.4) {
        discard;
    }

    gl_FragColor = vec4(color, alpha);
}
```
- **Why `alpha <= 0.4` `discard` matters:** As `time` sweeps `0 -> 15.0` (`fadeTime: 0 -> 3.0`), each cell waits up to `fadeDelay = 2.0`, then snaps into visibility only once `fade > 0.4`, producing a crisp digital tile mosaic rather than a soft translucent wash.

#### Two Trigger Modes
1. **Swup Route Transitions (`animation:out:start` / `animateLoaderInFix` & `animation:in:start`):**
   - Out: `loadCanvasFrame = true; animate();`, `.loadCanvasWrapper` -> `opacity: 1` (`0.45s`, `power1.out`), `uniforms.time` -> `15.0` (`0.45s`, `power1.out`), adds `.loaded` to `.loadCanvasWrapper`, adds `html, body.overflow`, calls `scroller.stop()`.
   - In (`animation:in:start`): sets `uniforms.color` to `(0.38, 0.39, 0.52)`, `.backgroundContainer .backgrounds` `opacity: 0` (`0s`), removes `.loaded`, tweens `.loadCanvasWrapper` `opacity -> 0` (`0.9s`, `power1.out`), tweens `uniforms.time -> 0.0` (`0.9s`, `power1.out`, `onComplete`: `scroller.start()`, removes `overflow overflowMenu`, `loadCanvasFrame = false`).
2. **Mobile Hamburger Menu (`animateLoaderIn` / `animateLoaderOut`, dispatched by Bundle #22):**
   - Open (`animateLoaderIn`): sets `uniforms.color` to `(0.133, 0.149, 0.294)` (`#22264B`), `opacity -> 1` and `time -> 15.0` (`0.45s`, `power1.out`).
   - Close (`animateLoaderOut`): calls `animate()`, removes `.loaded`, `opacity -> 0` (`0.9s`, `delay: 0.15s`, `power1.out`), `time -> 0.0` (`0.9s`, `delay: 0.15s`, `power1.out`, `onComplete`: `loadCanvasFrame = false`, resets `color` to `(0.38, 0.39, 0.52)`). Note: `.hamburgerMenu` CSS delays its `opacity: 0` transition by `0.9s` (`transition: opacity 0s 0.9s`) so it disappears right as `#loadCanvas` finishes dissolving out.

---

### 4.2 `backgroundCanvas` (`#backgroundCanvas` / `.backgroundCanvasWrapper` — Bundle #32)

#### Delayed Initialization & CSS Coupling
```js
$(document).ready(function() {
  var delay = ($(".homeHeaderBlock").length > 0) ? 2900 : 900;
  setTimeout(function() {
    $(".backgroundContainer").addClass("inview");
    initBackgroundObject();
  }, delay);
});
```
- Adding `.inview` to `.backgroundContainer` triggers two CSS transitions:
  - `.backgroundCanvasWrapper`: `opacity: 0 -> 0.03` (`transition: opacity 2s 0.3s ease-out`), **`mix-blend-mode: difference`**. On `<= 580px`, `#backgroundCanvas` adds `filter: contrast(1.8)`.
  - `.pageCanvasWrapper`: `opacity: 0 -> 1` (`transition: opacity 0.6s 0.3s ease-out`).
- **Why it isn't re-initialized on Swup:** `.backgroundContainer` sits outside `#pageContainer`, so `#backgroundCanvas` runs continuously across all route transitions. Note: `backgroundCanvas` runs on initial DOM readiness only—it has no resize-aware `setPixelRatio` (uses `renderer.setSize(window.innerWidth, window.innerHeight)` at DPR 1) and increments `uniforms.time.value += 0.4` every RAF tick regardless of viewport width (`<= 580` and `> 580` branches both assign `0.4`).

#### Scale Math & Camera
- Identical `PlaneGeometry(10, 10, 100, 100)`, `PerspectiveCamera(75, aspect, 0.1, 1000)` at `z = 1`, `calculateScaleX()` (`canvas.width / 45` desktop, `canvas.width / 15` `<= 580px`), `calculateScaleY()` (`20` desktop, `40` `<= 580px`).

#### Exact GLSL Shaders & Uniforms
Uniforms: `time` (`0.0`), `resolution`, `mousePos` (`0.5, 0.5`), `scaleX`, `scaleY`.

**Vertex Shader:**
```glsl
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

**Fragment Shader:**
```glsl
precision mediump float;

uniform float time;
uniform vec2 resolution;
uniform vec2 mousePos;
uniform float scaleX;
uniform float scaleY;

float grid(vec2 st, vec2 scale) {
    vec2 grid = fract(st * scale);
    float size = 0.0;
    return step(size, grid.x) * step(size, grid.y);
}

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

bool isUnderMouse(vec2 st, vec2 mouseCoord, vec2 scale) {
    vec2 gridCoord = floor(st * scale);
    vec2 size = vec2(1.0) / scale;
    return abs(gridCoord.x - floor(mouseCoord.x * scale.x)) < size.x &&
           abs(gridCoord.y - floor(mouseCoord.y * scale.y)) < size.y;
}

void main() {
    vec2 st = gl_FragCoord.xy / resolution.xy;

    vec2 scale = vec2(scaleX, scaleY);
    float g = grid(st, scale);

    vec2 gridCoord = floor(st * scale);
    float offset = random(gridCoord);

    float fadeTime = time * 0.2;
    float fade = 0.5 * (1.1 + sin(fadeTime + offset * 6.28318));

    bool underMouse = isUnderMouse(st, mousePos, scale);

    vec3 color = underMouse ? vec3(0.0, 0.0, 0.0) : vec3(0.9);
    float finalFade = underMouse ? 0.9 : fade;

    gl_FragColor = vec4(color, finalFade * g);
}
```

#### Mouse Coordinate Handling & Blend/Opacity Explanation
- **Mouse listener:** `$(document).off("mousemove.canvas", canvas).on("mousemove.canvas", canvas, function(e) { ... })`. Because `canvas` is a DOM node (not a CSS selector string), jQuery v1.10.2 treats `canvas` as `data` and binds directly on `document`, allowing mousemove updates even though `.backgroundContainer *` has `pointer-events: none !important`.
- Coordinates:
  ```js
  var rect = canvas.getBoundingClientRect();
  var mouseX = (e.clientX - rect.left) / rect.width;
  var mouseY = 1.0 - (e.clientY - rect.top) / rect.height;
  material.uniforms.mousePos.value.set(mouseX, mouseY);
  ```
- **Color & Opacity Semantics:**
  - `fade` oscillates smoothly between `0.05` and `1.05` (`0.5 * (1.1 + sin(...))`) at `0.08 rad/frame` (`time += 0.4`, `fadeTime = time * 0.2`).
  - Non-hovered cells draw `vec3(0.9)` (`#e6e6e6`); the single cell satisfying `gridCoord == floor(mousePos * scale)` draws `vec3(0.0)` at `0.9` alpha.
  - Because `.backgroundCanvasWrapper` has **`mix-blend-mode: difference`** and **`opacity: 0.03`**:
    - On `#D7C6AD` (`(0.843, 0.776, 0.678)`), `difference` with `0.9` inverts lightly by `3%` opacity (`~2-3%` subtle shimmering texture), while `0.0` under the cursor creates virtually zero difference (`|bg - 0| = bg`) — making the cursor cell appear as a calm "hole" in the faint grain.
    - On `#22264B` (`(0.133, 0.149, 0.294)`), `difference` with `0.9` yields `(0.767, 0.751, 0.606)` blended at `3%`, brightening the navy subtly in a cellular grid.

---

### 4.3 `pageCanvas` (`#pageCanvas` / `.pageCanvasWrapper` & `.innerCanvas` — Bundle #33)

#### Initialization Delay & Swup Lifecycle
- `var firstLoad = false;`
- On `$(document).on("initPage.pageCanvas", ...)`:
  - If `firstLoad === true` (Swup navigation): `delay = 300ms`.
  - Else (`firstLoad === false`, initial hard load): `delay = 2900ms` if `.homeHeaderBlock` exists, else `600ms`. Sets `firstLoad = true`.
  - After `delay`, if `$(".innerCanvas").length > 0`, calls `init(); animate();`.
- On Swup `animation:out:end`: `clearTimeout(pageCanvasTimeout); $("#pageCanvas").remove(); canvas = ""; renderer = ""; scenes = [];`.

#### Canvas Sizing, Overscan & Scissor Rendering Math
Why `#pageCanvas` is taller than the viewport and shifted up by `-100px`:
1. On `init()`: appends `<canvas id='pageCanvas'></canvas>` to `.pageCanvasWrapper`, sets `#pageCanvas` height to `window.innerHeight + 300`, `currentHeightFix = window.innerHeight + 300`.
2. CSS `.backgroundContainer .pageCanvasWrapper #pageCanvas` applies **`margin-top: -100px`** (`top: 0; position: absolute;`). This gives **100px top overscan** and **200px bottom overscan** (`100 + innerHeight + 200 = innerHeight + 300`).
3. On every `render()` frame:
   - Translates `#pageCanvas` vertically to track scroll: `gsap.to(canvas, 0, { y: window.scrollY });`
   - Disables scissor, clears full buffer, enables `renderer.setScissorTest(true)`.
   - Loops through every scene (`mesh` = `PlaneGeometry(2, 2, 50, 50)`, `PerspectiveCamera(50, 1, 1, 10)` at `z = 2.1`):
     ```js
     const rect = element.getBoundingClientRect();
     const width = rect.right - rect.left;
     const height = rect.bottom - rect.top;
     const left = rect.left;
     const bottom = renderer.domElement.clientHeight - rect.bottom - 100;
     renderer.setViewport(left, bottom, width, height);
     renderer.setScissor(left, bottom, width, height);
     renderer.render(scene, camera);
     ```
   - Note why `- 100` is mathematically exact: because `#pageCanvas` starts `100px` *above* the viewport top (`margin-top: -100px` + `y: window.scrollY`) and has `clientHeight = innerHeight + 300`, its bottom edge in viewport coordinates is `innerHeight + 200`. Distance from canvas bottom (`innerHeight + 200`) to `rect.bottom` is `(innerHeight + 200) - rect.bottom = (innerHeight + 300) - rect.bottom - 100 = clientHeight - rect.bottom - 100`.
   - `updateSize()` only recalculates `currentHeightFix` when `window.innerWidth !== currentWidth` (ignoring mobile URL bar vertical resize jitter!).
   - `renderer.setPixelRatio(window.devicePixelRatio)` is enabled on `pageCanvas` (and `errorCanvas`).

#### Exact GLSL Shaders & Uniforms
Uniforms per `.innerCanvas` scene:
- `u_mouse`: `THREE.Vector2(0.5, 0.5)`
- `u_resolution`: `THREE.Vector2(window.innerWidth, window.innerHeight)`
- `u_gridSize`: `20.0` if `$(el).attr("data-biggerGrid") == "true"` (used on `/about/`), else `15.0`
- `u_strength`: `0` (animates to `0.8` on pointer movement, decays to `0`)
- `u_time`: `0` (animates to `3` on ScrollTrigger enter for tile fade-in)
- `u_texture`: `""` (replaced with `THREE.Texture` or `THREE.VideoTexture` when loaded)
- `u_randomValue`: `43758.5453123 + Math.random() * (103758.5453123 - 43758.5453123)` (per-image seed so each card has a unique tile dissolve pattern!)

**Vertex Shader:**
```glsl
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

**Fragment Shader:**
```glsl
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_gridSize;
uniform float u_strength;
uniform float u_time;
uniform sampler2D u_texture;
uniform float u_randomValue;
varying vec2 vUv;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * u_randomValue);
}

void main() {
    vec2 gridSize = vec2(u_gridSize, u_gridSize);
    vec2 gridCoord = floor(vUv * gridSize) / gridSize;
    vec2 gridCenter = gridCoord + 0.5 / gridSize;

    vec2 mouseDist = (u_mouse - gridCenter) * gridSize;

    float distToMouse = length(mouseDist);
    float effectStrength = 1.0 - smoothstep(0.0, u_gridSize * 0.4, distToMouse);

    vec2 offset = mouseDist * effectStrength * u_strength;

    vec2 distortedUv = vUv;
    if (abs(mouseDist.x) > abs(mouseDist.y)) {
        distortedUv.x += offset.x / gridSize.x;
    } else {
        distortedUv.y += offset.y / gridSize.y;
    }

    float randomness = random(gridCoord);
    float randomDelay = randomness * 1.0;

    float fadeInEffect = smoothstep(0.0, 1.0, u_time - randomDelay);

    distortedUv = clamp(distortedUv, vec2(0.0), vec2(1.0));

    vec4 color = texture2D(u_texture, distortedUv);

    color.rgb = mix(vec3(0.0), color.rgb, fadeInEffect);

    gl_FragColor = vec4(color.rgb, fadeInEffect);
}
```
Notice how the interactive hover works:
1. Radius of influence is `u_gridSize * 0.4` grid cells (`6.0` cells for `15x15`, `8.0` cells for `20x20`).
2. **Axis-snapped block displacement:** Rather than radial distortion, `if (abs(mouseDist.x) > abs(mouseDist.y))` shifts UVs purely horizontally along X, otherwise purely vertically along Y, creating crisp digital block-shearing around the cursor.
3. Because `u_time` animates `0 -> 3` over `2s` (`delay: 0.15s + data-delay`, `ease: "power1.out"`) while `randomDelay` maxes at `1.0`, every tile reaches `fadeInEffect = 1.0` by `u_time = 2.0`, ensuring clean full reveal before the `2s` tween finishes.

#### Mouse Hover Impulse Physics (`u_strength` & `u_mouse`)
On non-touch devices (`!$("html").hasClass("touch")`), delegated events on `.canvasContainer .innerCanvas`:
- `mouseenter`: resets `setStrength = false`.
- `mousemove`:
  - `mouseX = (e.pageX - $(this).offset().left) / $(this).width()`
  - `mouseY = 1.0 - (e.pageY - $(this).offset().top) / $(this).height()`
  - **`delayMove` & `firstMove` timing (Bundle `#33`, `bcc49c99...js`):** `delayMove` starts `true` globally, adding a `0.2s` `delay` to the very first `u_strength` ramp (`delayMove = false` afterward, `0s` delay on all subsequent moves). `firstMove` starts `true`, giving `u_mouse.value` a `0.3s` tween duration on initial entry; `mouseleave` sets `firstMove = false`, so the first `mousemove` after pointer re-entry snaps `u_mouse.value` immediately (`duration = 0`) before resetting `firstMove = true` (`0.3s` on subsequent moves).
  - If `!setStrength`: sets `setStrength = true`, tweens `u_strength -> 0.8` over `0.6s` (`overwrite: true`, `delay`).
  - Tweens `u_mouse.value` over `duration` (`overwrite: true`); in `onComplete()`, sets `setStrength = false` and tweens `u_strength -> 0` over `0.6s` with `delay: 0.3s`! Thus distortion flares up on cursor motion and settles back to crisp rest `0.3s` after the cursor stops moving.
- `mouseleave`: sets `firstMove = false; setStrength = false;`, tweens `u_strength -> 0` over `0.6s` (`overwrite: true`).

#### ScrollTrigger Lazy-Loading, `THREE.VideoTexture` & `loadCanvasHeaderBlock`
Inside `init()`, elements are split into two groups:

1. **Standard `.innerCanvas:not(.loadCanvasHeaderBlock)`:**
   - Adds `.hide` (removes `.homeHeaderBlock` / `.workBlock` `rgba(0,0,0,0.05)` placeholder tint via `background: #fff0`).
   - **ScrollTrigger 1 (Texture Lazy-Load):** `start: "0% 200%"`, `end: "0 200%"` (loads well before entering viewport!). Once per element (`.loaded` guard):
     - If `.video`:
       - Desktop (`window.width() > 1080`): injects `<video class="playVideoCanvasOnScroll" muted playsinline autoplay loop preload="auto"><source src="[data-video]"></video>` inside `.innerCanvas` (CSS keeps `<video>` at `opacity: 0`), creates `new THREE.VideoTexture(videoEl)`.
       - Tablet/Mobile (`<= 1080`): falls back to static `new THREE.TextureLoader().load($(el).attr("data-resp-image"))`.
     - Else: `new THREE.TextureLoader().load($(el).attr("data-image"))`.
     - Sets `texture.generateMipmaps = true; texture.minFilter = THREE.LinearMipmapLinearFilter;`, assigns `u_texture.value = texture`.
   - **ScrollTrigger 2 (Tile Fade-In Reveal):** `start: "0% 90%"`, `end: "0 90%"` (note: no `once: true`, so re-entering from bottom/top replays the `u_time -> 3` tween if reset, though `u_time` stays at `3` unless recreated).
     - Tweens `u_time -> 3` over `2s`, `ease: "power1.out"`, `delay: 0.15 + ($(el).data("delay") || 0)` (e.g. second Mikki image on `/` has `data-delay="0.3"` -> `0.45s` delay).

2. **`loadCanvasHeaderBlock` (Homepage Hero Bird Image `bird-v2.jpg`):**
   - Skips ScrollTriggers completely and runs immediately when `pageCanvas` `init()` executes (`2900ms` after `initPage` on first load, or `300ms` after Swup `page:view`!).
   - Loads `data-image` (or `VideoTexture` if `.video` + `>1080px`), immediately animates `u_time` `0 -> 3` over `2s` (`delay: 0.15s`, `power1.out`), and adds `.hide`.
   - Meanwhile, Bundle #24 (`homeHeaderBlock`) fades `.homeHeaderBlock .canvasContainer` `opacity: 0 -> 1` over `0.9s` (`power2.out`) at `1600ms` after `initPage`. (Bundle #24 also fires `$(document).trigger("loadCanvasHeaderBlock")`, which has no listener in any bundle.)

#### Video Scroll Play/Pause Controller (Bundle #21 — `playVideoCanvasOnScroll()`)
Triggered by `$(document).trigger("initVideoCanvas")` right after all `.innerCanvas` scenes are created (Wait: note that `ScrollTrigger` for `.innerCanvas.video` injects `<video class="playVideoCanvasOnScroll">` *later* when scrolling to `"0% 200%"`, so `.playVideoCanvasOnScroll` elements that are not yet in DOM at `init()` time won't be bound by `playVideoCanvasOnScroll()`—those rely on `autoplay` on the injected `<video>`!).
- For **`.setVideoOnScroll`** (used on `/project/...` case study pages inside `.projectFullscreen169Block`, `.projectImageTextBlock`, `.project5050Block`, `.projectMobileBlock`):
  - `ScrollTrigger` (`start: "0% 150%"`, `end: "150% 0%"`): on first enter injects `<video class="video" muted playsinline loop poster="[data-video-poster]"><source src="[data-video-src or data-video-mobile-src if <=580px]" type="video/mp4"></video>`, adds `.active` after `200ms` (`600ms` at `<=580px`), and calls `.play()` on `onEnter`/`onEnterBack` and `.pause()` on `onLeave`/`onLeaveBack`.
- For **`.playVideoCanvasOnScroll`** (if present in DOM at `initVideoCanvas`): `ScrollTrigger` (`start: "0% 100%"`, `end: "100% 0%"`) calls `.play()` on enter/enterBack and `.pause()` on leave/leaveBack.

---

### 4.4 `errorCanvas` (404 Page — Bundle #30)

- Triggered on `initPage` when `$(".errorBlock").length > 0` after `600ms` delay (`initErrorCanvas()`).
- **DOM Layering Trick:** Clones `.errorBlock .copyErrorContent` into `.errorCanvasContainer` (which holds `.errorCanvasWrapper` at `z-index: 4`, `mix-blend-mode: lighten`) so that `#errorCanvas` blends over/through specific rows of `"Oops! / you've / reached / a dead / end"` (`row:nth-child(3)` `"reached"` has `z-index: 3` in main copy and `opacity: 0` in the clone!).
- **WebGL Setup:** Appends `<canvas id='errorCanvas'>` into `.fixedCanvasWrapper` (`mix-blend-mode: lighten`). Uses the **exact same vertex & fragment shader** as `pageCanvas`, with **`u_gridSize = 25.0`**, texture loaded from `$(".errorCanvasWrapper .innerCanvasFixed").attr("data-image")` (`/wp-content/themes/meesverberne/assets/img/404-v3.jpg`), and `u_time -> 3` over `2s` (`delay: 0.15s`, `power1.out`).
- **Hover:** Same `u_strength: 0 <-> 0.8` & `u_mouse` logic bound to `.errorBlock`.
- **Cleanup:** On Swup `content:replace`, removes `.errorCanvasContainer .copyErrorContent, #errorCanvas` (and attempts to clear globals, though note `var errorScene=""` inside the callback is local-scoped; `animateErrorCanvas()` stops because `$(".errorBlock").length > 0` becomes false).

---

## 5. Swup 4 Page Transitions, Lenis & Full Lifecycle Sequencing

### 5.1 Swup Configuration (Bundle #15)
```js
pageContainerWrap = new Swup({
  containers: ["#pageContainer"],
  animateHistoryBrowsing: true,
  plugins: [
    new SwupHeadPlugin({ persistAssets: true, persistTags: 'style link' }),
    new SwupGaPlugin({ gaMeasurementId: 'G-1FGWQJWVCW' }),
    new SwupFormsPlugin()
  ]
});
```
*(Note: `SwupScrollPlugin` is loaded in `<script>` #9, but omitted from `plugins`.)*

### 5.2 Lenis Configuration (Bundle #15)
```js
scroller = new Lenis({
  duration: 1.5,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 2,
  smoothTouch: false,
  touchMultiplier: 5
});
```
- Starts paused (`scroller.stop()`), runs via `requestAnimationFrame(raf)`, writes native `scrollTop` so GSAP `ScrollTrigger` reacts automatically on scroll, and triggers `$(document).trigger("scrollTrigger", currentScrollY)` on `scroller.on("scroll")`.
- On `window.onbeforeunload`: jumps scroll to `0` (`force: true, duration: 0`) and hides `"header, .blocks, footer, .backgroundContainer"` (`opacity: 0`).

### 5.3 Exact Initial Load Timeline

| Time (Home Desktop) | Time (Subpage Desktop) | Time (`html.touch`) | Bundle | Action |
|---|---|---|---|---|
| `0ms` | `0ms` | `0ms` | HTML / #15 / #22 | `<body class="overflow">` blocks pointer events (`pointer-events: none !important`). `faviconAnimate()` starts `450ms` interval; `MVLogoIconAnimate()` starts `1.2s` 4-frame bird SVG flap. |
| `600ms` | `300ms` | `300ms` | #15 (`preloadPage`) | Calls `initPage()` (removes `html.stopScroll fade`), `initLenis()` (stopped), starts `raf(raf)`. |
| `900ms` | `600ms` | `600ms` | #15 (`initPage` +`300ms`) | Fires `$(document).trigger("initPage")`. Builds `.primaryBackground` `#22264B` rects and fades `.backgroundContainer .backgrounds` to `opacity: 1` (`0.3s`). |
| `900ms` | — | `600ms` | #24 (`homeHeaderBlock`) | Adds `.active` to `.homeHeaderBlock` (`.hugeTitle` `opacity: 1`). Schedules GSAP reveal at `+300ms` (`1200ms`) and `.canvasContainer` fade at `+1600ms` (`2500ms`). |
| `1200ms` | — | `900ms` | #24 | Hero title lines (`0s`, `0.1s` delay), `.tags` (`0.6s`), `.barCode` (`1.05s` / `1.8s` mobile), `.mTag` (`1.2s`), `.drawText` (`1.35s`), `.text` (`1.5s`), `.innerLocation` (`1.8s`), `.extraInfo` (`1.95s`) animate in. |
| `2500ms` | — | `2200ms` | #24 | `.homeHeaderBlock .canvasContainer` fades `opacity: 0 -> 1` (`0.9s`, `power2.out`). |
| `2600ms` | `600ms` | `300ms` | #15 (`preloadPage`) | Removes `.fade` from `.content`, adds `header.active`, removes `html, body.overflow overflowMenu`, calls **`scroller.start()`**. |
| `2900ms` | `900ms` | `2900ms` / `900ms` | #32 (`backgroundCanvas`) | Adds `.inview` to `.backgroundContainer` (`.backgroundCanvasWrapper` fades to `0.03` over `2s 0.3s`, `.pageCanvasWrapper` to `1` over `0.6s 0.3s`) + `initBackgroundObject()`. |
| `2900ms` | `2900ms` | `2900ms` | #34 (`loadCanvas`) | Pre-warms `initLoadObject()` silently (`loadCanvasFrame = false`). |
| `3200ms` | `1200ms` | `2900ms` / `900ms` | #22 (`header`) | Adds `.active` to `.menuIcon`, checks scroll, animates `header .headerBar` to `{ y: 0, opacity: 1 }` (`0.6s`, `power2.out`). |
| `3800ms` | `1200ms` | `3500ms` / `900ms` | #33 (`pageCanvas`) | Calls `init(); animate();` (`2900ms` home / `600ms` subpage after `initPage`). Bird image `u_time: 0 -> 3` (`2s`, `delay: 0.15s`, `power1.out`). |

*(Note: on `/home/`, `.drawText` signature strokes begin at `900 + 300 + 2100 = 3300ms` and finish at `900 + 300 + 5700 + 450 = 7350ms`!)*

### 5.4 Exact Swup Route Transition Sequence
1. **`animation:out:start`:**
   - `#34`: If `!loadCanvas`, initializes `initLoadObject()` + triggers `animateLoaderInFix`. Sets `loadCanvasFrame = true; animate();`, adds `html, body.overflow`, calls `scroller.stop()`, fades `.loadCanvasWrapper` to `opacity: 1` and `uniforms.time -> 15.0` (`0.45s`, `power1.out`), adds `.loaded`.
2. **`animation:out:await` (`601ms`):**
   - Swup reads `transition-duration: 0.6s` on `#pageContainer.transition-fade` and resolves after `601ms` timeout.
3. **`animation:out:end`:**
   - `#15`: Removes `header.scrollDown`, adds `html.stopScroll`, kills **all** ScrollTriggers (`ScrollTrigger.getAll().forEach(trigger => trigger.kill())`).
   - `#22`: Sets `disabledHeaderScroll = true`, removes `header.scrolled`.
   - `#33`: `clearTimeout(pageCanvasTimeout); $("#pageCanvas").remove(); canvas = ""; renderer = ""; scenes = [];`.
4. **Before `content:replace`:**
   - `#15`: Saves `inlineStyles = $("head style")`, adds `html.stopScroll`.
   - `#30`: Removes `.errorCanvasContainer .copyErrorContent, #errorCanvas`.
5. **`page:view`:**
   - `#15`: Calls `dynamicScriptLoad()` (loads any new `<head script>` and `eval`s inline scripts inside `#pageContainer`), restores `inlineStyles`, waits **`100ms`**, then calls `initPage()` and sets/removes `header.secondary` depending on `.blocks section:first-child.setPrimaryBackground`.
   - Inside `initPage()`: checks `window.location.hash` (`150ms` delay), triggers `"initPage"` (`300ms` delay), rebuilds `setPrimaryBackgrounds()` + fades `.backgrounds` to `1` (`300ms` delay), re-binds `lazyLoadImages()`.
   - Because `firstLoad` is now `true`, `#33` (`pageCanvas`) initializes `#pageCanvas` only `300ms` after `initPage` (`700ms` after `page:view`).
6. **`animation:in:start`:**
   - `#15`: Sets `.backgroundContainer` `opacity: 1`.
   - `#17`: Re-locks `.hugeTitle .row` heights to `.line` heights.
   - `#22`: Updates active `header .menu-item` class from `.blocks[data-id]`.
   - `#34`: Resets `uniforms.color` to `(0.38, 0.39, 0.52)`, hides `.backgroundContainer .backgrounds` (`opacity: 0`, `0s`—note `#15`'s `300ms` `setTimeout` fades `.backgrounds` back to `1` after `page:view`), removes `.loaded`, dissolves `.loadCanvasWrapper` `opacity -> 0` and `uniforms.time -> 0.0` over `0.9s` (`power1.out`), then re-enables `scroller.start()`, removes `overflow overflowMenu`, and sets `loadCanvasFrame = false`.
7. **`history:popstate`:** `#15` immediately sets `.blocks, footer, .backgroundContainer` `opacity: 0` before transition.

---

## 6. Theme Inversion (`setPrimaryBackground`) & Scroll Mechanics

### 6.1 Dynamic Theme Inversion (`setPrimaryBackgrounds()`, Bundle #15)
Instead of giving `<section>` elements opaque backgrounds (which would hide `#backgroundCanvas` and `#pageCanvas`), `.setPrimaryBackground` sections (`.clientsBlock`, `footer`, `.errorBlock`) remain background-transparent inside `#pageContainer` (`z-index: 5`), while `setPrimaryBackgrounds()` builds matching `#22264B` proxy blocks inside `.backgroundContainer .backgrounds` (`z-index: 0`):
1. Clears `.backgroundContainer .backgrounds`, iterates `$(".setPrimaryBackground")`, appends `<div class="primaryBackground [full if .blocks.primaryBackgroundFull]" data-index="i">`.
2. `updatePrimaryBackgrounds()` (also bound to `window.resize`) copies exact DOM geometry:
   - `width = $(el).outerWidth()`
   - `height = $(el).outerHeight() + 1` *(+1px prevents hairline gaps between stacked dark sections like `.clientsBlock` -> `footer`!)*
   - `top = $(el).offset().top`, `left = $(el).offset().left`
3. For each `.primaryBackground`, creates a `ScrollTrigger`:
   - `start: "0% " + ($("header .headerBar").outerHeight() / 2)`
   - `end: "100% 0%"`
   - `onEnter` / `onEnterBack` -> `data-active="true"`; `onLeave` / `onLeaveBack` -> `data-active="false"`.
4. `scroller.on("scroll")` checks if `$(".backgroundContainer .backgrounds .primaryBackground[data-active='true']").length > 0` and toggles `header.secondary` (switching logo, nav links, and socials to `#F7A026` amber, and mobile `.menuIcon` to `#D7C6AD` beige with `#22264B` bars).

### 6.2 Viewport Reveal Triggers (`[data-scroll-inview]`, Bundle #18)
- `addInviewClasses()` runs on `initPage` and on horizontal viewport width resize (`currentWidth !== $(window).width()`).
- Creates `ScrollTrigger` on every `[data-scroll-inview]`:
  - If `$(el).data("scroll-direct") == true`: `start: "0% 100%"`, `end: "0 100%"`.
  - Else: `start: "0% 90%"`, `end: "0% 90%"`.
  - `onEnter`: `$(el).addClass("inview")` (one-way; never removed).
- CSS transitions/animations bound to `.inview` handle all section typography, dividers (`width: 0 -> 100%`), `.clientsBlock` parentheses height (`0 -> 9.875vw`), `.lineAnim` (`opacity: 0 -> 1`), and project cards.

### 6.3 Parallax & Horizontal Scroll (`[data-scroll-speed]`, Bundle #19)
- `speedIndicator = ($(window).width() < $(window).height()) ? 30 : 20;`
- For each `[data-scroll-speed]`, creates `ScrollTrigger` (`start: "0% 100%"`, `end: "100% 0%"`, `onUpdate(e)` while `e.isActive == true`):
  - **If `data-scroll-position == "top"`** (hero elements: `"Mees"`, `"Verberne"`, `.innerExtraInfo`, `.location`):
    - Magnitude: `($(window).scrollTop() / (speedIndicator * 2)) * speed`.
    - Sign rule: if `(scrollTop / speedIndicator) * speed < 0`, `position = +abs(...)`; else `position = -abs(...)` (positive `data-scroll-speed` scrolls *up/left* as `scrollTop` rises).
  - **Else (viewport-center-relative, e.g., `"W O RK"`, `"C ON NECT"`, `.innerTag`):**
    ```js
    var position = (($(el).offset().top - $(window).scrollTop() - (($(window).height() / 2) - ($(el).height() / 2))) / speedIndicator) * $(el).data("scroll-speed");
    ```
    Notice `position === 0` precisely when the element is vertically centered in the viewport!
  - Applies `gsap.to(el, 0, { x: position, force3D: true })` if `data-scroll-direction == "horizontal"`, else `{ y: position, force3D: true }`.
  - Examples on `/`: `"W"` (`speed="-0.6"` horizontal), `"O"` (`speed="-1.2"` horizontal), `"ON"` in `CONNECT` (`speed="-1.2"` horizontal), `.innerTag` (`0.5`, `0.8`, `1`, `1.2` horizontal), `.homeHeaderBlock` `.row` (`speed="6"`, `speed="3"`, `position="top"`). Note: at `<= 1080px` CSS forces `.workFeaturedBlock .intro .bigTitle .row:first-child { transform: none !important }`.

---

## 7. Typography, SVG `DrawSVG` & CSS Micro-Animations

### 7.1 `data-words` / `data-scroll-words` (Bundle #16)
- `initWords()` adds `.active` to `[data-words]` and splits with `SplitText 3.12.5`:
  `{ type: "lines, words", wordsClass: "word", linesClass: "line", tag: "span" }`.
- CSS sets `.normalTitle[data-words] .line` to `display: flex !important; justify-content: space-between; overflow: hidden;` and `.word` to `transform: translateY(3.75vw)` (`5.556vw` `<=1080px`, `10.345vw` `<=580px`).
- `[data-scroll-words]` `ScrollTrigger` (`0% 100%` if `data-scroll-direct`, else `0% 90%`) calls `animWords(el)`:
  - Stagger per `.line`: `delay = ($(el).data("words-fast") == true) ? 0.1 : 0.3`.
  - Each `.line`'s `.word` children animate: `gsap.to($(el).find(".word"), 0.6, { y: 0.00, rotate: 0, opacity: 1, delay: delay * i, ease: "power2.out", onComplete: () => $(el).addClass("transformNone") })`.

### 7.2 `data-letters` & `.hugeTitle` Auto-Fit Scaling (Bundle #17)
- `initLetters()` adds `.active` to `[data-letters]` and splits via `SplitText 3.12.5`:
  `{ type: "lines, chars", charsClass: "letter", linesClass: "line", tag: "span" }`.
- **Important:** Individual `.letter` spans are **not** staggered by JS or CSS—the reveal animates the whole `.row .line` masked inside `overflow: hidden` from CSS `translateY(120%)` to `y: 0`. Instead, `SplitText` provides `.letter` DOM granularity + `.line` wrappers used for dynamic `.hugeTitle` width fitting:
  - Resets `.hugeTitle` to `font-size: 16.25vw`, finds minimum `scale = rowWidth / lineWidth` across `.row`s, multiplies `fontSize *= scaleFactor` if `< 1`, locks every `.row` height to `.line.height()`, and calls `ScrollTrigger.update()`.
  - Re-locks `.row` heights on `animation:in:start` and `window.resize`.

### 7.3 `.drawText` / `.drawTextContainer` (`DrawSVGPlugin 3.12.5`)
All stroke SVGs share CSS `fill: none; stroke: #F7A026; stroke-linecap: round; stroke-linejoin: round; stroke-width: 20px;`.

| Location | Bundle | Trigger | Selector & Path Count | Exact GSAP Timeline (`drawSVG`, `duration`, `delay`, `ease`) |
|---|---|---|---|---|
| **Home Hero** `.homeHeaderBlock .drawText` | #24 | `initPage` + `300ms` | 9 `.draw` (`viewBox 3896.29x1133.38`) | Init `0%`; wrapper `opacity:1` at `1.35s`; strokes `1..9`: `(1s, 2.1s, 100%)`, `(0.3s, 3.1s, 100%)`, `(0.45s, 3.4s, -100%)`, `(0s, 3.85s, 100%)`, `(0.3s, 4.05s, 100%)`, `(0.3s, 4.35s, 100%)`, `(0.6s, 4.65s, -100%)`, `(0.45s, 5.25s, 100%)`, `(0.45s, 5.7s, 100%)` — all `power1.in` |
| **About** `.aboutBlock .drawText` | #28 | `ScrollTrigger` `0% 90%`, `once: true` | 9 `.draw` (`viewBox 3896.29x1133.38`) | Init `0%`; wrapper `opacity:1` at `0.15s`; strokes `1..9`: `(1s, 0.3s, 100%)`, `(0.3s, 1.3s, 100%)`, `(0.45s, 1.6s, -100%)`, `(0s, 2.05s, 100%)`, `(0.3s, 2.25s, 100%)`, `(0.3s, 2.55s, 100%)`, `(0.6s, 2.85s, -100%)`, `(0.45s, 3.55s, 100%)`, `(0.45s, 4.0s, 100%)` — all `power1.in` |
| **Work Featured** `.workFeaturedBlock .drawTextContainer` | #25 | `ScrollTrigger` `0% 90%`, `once: true` | 2 `.draw` (`viewBox 1140.4x846.36`) | Init `0%`; container `y:0, opacity:1` (`0s`); stroke 1: `(0.45s, 0.1s, 100%)`; stroke 2: `(0.7s, 0.6s, -100%)` — `power1.in` |
| **Contact** `.contactBlock .drawTextContainer` | #29 | `ScrollTrigger` `0% 90%`, `once: true` | 2 `.draw` (`viewBox 1140.4x846.36`) | Init `0%`; container `y:0, opacity:1` (`0s`); stroke 1: `(0.45s, 0.6s, 100%)`; stroke 2: `(0.7s, 1.1s, -100%)` — `power1.in` |
| **Footer** `footer .drawTextContainer` | #23 | `ScrollTrigger` `0% 100%`, `once: true` | 4 `.draw` (`viewBox 2908.78x992.02`) | Init `0% 0%`; container `y:0, opacity:1` (`0s`); stroke 1: `(0.45s, 0.1s, 100% 0%)`; stroke 2: `(0.7s, 0.6s, -100% 0%)`; stroke 3: `(0.45s, 1.5s, 100% 0%)`; stroke 4: `(0.9s, 2.0s, 100% 0%)` — `power1.in` |
| **Mobile Menu** `.hamburgerMenu .drawTextContainer` | #22 | Click `.menuIcon` open | 4 `.draw` (`viewBox 2908.78x992.02`) | Sequential `gsap.timeline()`: reset `0% 0%` -> stroke 1 `(0.45s, 100% 0%)` -> stroke 2 `(0.7s, -100% 0%)` -> stroke 3 `(0.45s, 100% 0%)` -> stroke 4 `(0.9s, 100% 0%)` — `power1.in`; `drawTextMenu.clear()` on close after `600ms` |

### 7.4 `.lineAnim`, `.blockAnim`, `.barCode` & Page Intro Choreography
- **`.lineAnim`** (Pure CSS + Bundle #18 `.inview`): Starts `opacity: 0`; `.inview` transitions `opacity: 1` (`0.3s 0.3s ease-out`). Child `.innerLine` runs `@keyframes line 2s infinite linear` (growing/shrinking vertically `100% -> 0 -> 100%` between bottom and top).
- **`.blockAnimWrapper` (`style-1-anim` through `style-4-anim`)** (Pure CSS): `1.75vw` square grid of four 50% quadrants (`#22264B`, or `#F7A026` when `.secondary`). Each style sequences staggered `2s infinite linear` `@keyframes` (`blockAnim-height`, `blockAnim-width`, `blockAnim-width-reverse`, and `*-opacity` variants peaking at `0.4` opacity with `0s` / `0.3s` / `0.6s` / `0.9s` / `1.2s` delays).
- **`.barCode`** (Home #24 & Contact #29): Wraps an inline barcode SVG (`viewBox="0 0 190 69"`, `tel:+31628839393`) inside a right-moving marquee (`data-marquee-direction="right"`, `data-marquee-speed="100"`, `data-marquee-scroll-speed="10"`). On Home (`#24`), animates `y: 0, opacity: 1` (`0.6s`, `power2.out`) at `1.05s` (`1.8s` at `<= 580px`).
- **`.aboutHeaderBlock`** (#27): On `initPage`, waits `100ms`, slides `"About"` (`0s`) and `"ME | ES"` (`0.1s`) up (`0.6s`, `power2.out`), then at `delay: 0.6s` splits `.left .innerText` by `-left.position().left` and `.right .innerText` by `+left.position().left` (`0.6s`, `power2.out`), fading in `.animatedText .text` (`0.65s`) and `.tags` (`0.9s`).
- **`.projectHeaderBlock`** (#26): `initPage` + `100ms`: slides `.row:first-child .line` (`0s`) and `.row:last-child .line` (`0.05s`) to `y: 0` (`0.6s`, `power2.out`); CSS `.projectHeaderBlock.active` reveals `.tags`, `.divider`, `.infoItem`, `.year`, `.buttonWrapper`.
- **`.contactBlock`** (#29): Immediately adds `.active inview`, `100ms` timeout reveals title/tags/4 cols (`0s..1.35s`, `0.6s`, `power2.out`), and after `300ms` `initContactForm()` binds AJAX `POST` submission (toggles `.formWrapper.submitted` if response starts with `"Array"`, else highlights invalid fields and calls `scroller.scrollTo(...)`).

---

## 8. Marquee System (`initMarquees()`, Bundle #20)

Triggered on `$(document).off("initPage.marquee").on("initPage.marquee", ...)`:

1. **Responsive Width-Normalized Speed:**
   ```js
   var speed = $(el).attr('data-marquee-speed') * ($(el).find(".itemsContainer").width() / $(window).width());
   if ($(window).width() <= 580) { speed = speed * 0.25; }
   else if ($(window).width() <= 1080) { speed = speed * 0.5; }
   ```
   *(Because GSAP uses `duration: speed`, longer tracks run proportionally slower to maintain constant pixel velocity across varied item counts.)*
2. **Cloning & Base Loop:** Clones `.itemsContainer:first-child` **3 times** (4 copies total) inside `.marqueeScroll`, reads `data-marquee-direction` (`'right'` -> `direction = -1`, else `1`), and creates:
   ```js
   var timeline = gsap.to($(el).find('.itemsContainer'), {
     xPercent: -100, repeat: -1, duration: speed, ease: "linear", paused: true
   }).totalProgress(0.5);
   ```
3. **Scroll-Coupled Play/Pause & Direction Inversion (`ScrollTrigger` `0% 100%` to `100% 0%`):**
   - `onEnter` / `onEnterBack`: `timeline.play()`; `onLeave` / `onLeaveBack`: `timeline.pause()`.
   - `onUpdate(self)`: Whenever scroll direction flips (`self.direction !== direction`), multiplies `direction *= -1` and tweens `timeline`'s `timeScale` to `direction * -1` (when `data-marquee-direction == 'right'`) or `direction` (otherwise), smoothly reversing marquee travel direction on scroll up vs. scroll down!
4. **Scroll-Scrubbed Horizontal Offset (`data-marquee-scroll-speed`):**
   - Creates a separate `gsap.timeline({ scrollTrigger: { trigger: $(el), start: "top bottom", end: "bottom top", scrub: 1 } })`:
   - If `data-marquee-direction == 'left'`: `fromTo($(el), { x: scrollSpeed + "%" }, { x: (scrollSpeed * -1) + "%", ease: "none" })` (e.g. `+5%` to `-5%`).
   - If `data-marquee-direction == 'right'`: `fromTo($(el), { x: (scrollSpeed * -1) + "%" }, { x: scrollSpeed + "%", ease: "none" })` (e.g. `-10%` to `+10%` on `.barCode`).
5. **`data-marquee-swipe`:** Verified across all 38 scripts—`data-marquee-swipe="true"` appears in HTML on tag marquees, **but has zero JS implementation** (no pointer/touch drag or Observer plugin).

---

## 9. Header, Drawer, Favicon & Verified Absent Features

### 9.1 Header Scroll Behavior, Logo Animation & Mobile Drawer (Bundle #22)
- **Header Entrance (`initPage`):** Waits `2300ms` (home) or `600ms` (other routes), adds `.menuIcon.active`, calls `checkHeaderScroll()`, and animates `header .headerBar` to `{ y: 0, opacity: 1 }` (`0.6s`, `power2.out`).
- **Scroll Behavior (`checkHeaderScroll()`):**
  - Adds `header.scrolled` when `currentScrollY > $(".headerBar").height() / 3`.
  - Translates `.headerBar .left` (logo) and `.headerBar .right` (socials) up with scroll (`y: -min(currentScrollY, headerBar.height())`, `0s`), leaving only the centered `.menuContainer` pill pinned!
  - Progressive backdrop blur on `.headerBar .menuContainer .background`: `backdropFilter: "blur(" + Math.min(currentScrollY / 2, 25) + "px)"` (`0s`).
- **`MVLogoIconAnimate()`:** Infinite `1.2s` linear timeline whose `onRepeat` callback (running after the first `1.2s` cycle) schedules `0s` opacity toggles every `0.15s`–`0.3s` across `<g class="MVLogo-1">`..`.MVLogo-4` to animate a 4-frame **hopping/bobbing** pixel bird in the top-left logo (`MVLogo-2`/`-4` extend the legs `y: 99`, `height: 18` and lift the body `9px`, while `MVLogo-3` shifts the body `9px` forward relative to frame 2 back at `y: 45`).
- **Mobile Hamburger Menu (`.menuIcon`):** Toggles `header.open`, `overflowMenu`, `scroller.stop()`/`start()`, `disableMenu` lock (`600ms`), `.hamburgerMenu` 4-stroke `DrawSVG` timeline, and `#loadCanvas` navy backdrop (`animateLoaderIn` / `animateLoaderOut`).

### 9.2 Favicon Animator (`faviconAnimate()`, Bundle #15)
- Cycles `<link id="favicon">` every **`450ms`** through `favicon-1.png` -> `favicon-2.png` -> `favicon-3.png` -> `favicon-2.png`.

### 9.3 Features Confirmed Absent in Live Code
1. **Custom Cursor:** No custom cursor DOM element, CSS cursor element, or JS cursor follower exists (only default `cursor: pointer` / `cursor: default` on buttons/clients).
2. **Audio / Sound:** Zero Web Audio API, `<audio>`, or sound FX logic exists.
3. **Marquee Drag/Swipe:** `data-marquee-swipe="true"` is an inert HTML attribute with no JS handler.
4. **`data-scroll-blur="true"`:** Present on footer `.marqueeWrapper`, with no JS/CSS handler.
5. **Initial WebGL Preloader:** `loadCanvas` never renders during initial boot (`loadCanvasFrame` stays `false` until navigation or mobile menu click).
