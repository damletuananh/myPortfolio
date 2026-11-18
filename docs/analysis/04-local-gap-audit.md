# Local Codebase Gap & Root-Cause Audit (`D:\Workspace\myPortfolio`)

> **Scope & Verification:** Static and visual audit of every file in `src/`, root config files (`package.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`), local `.playwright-mcp/` logs, and the 9 screenshots in the repository root (`meesverberne-home.png`, `meesverberne-full.png`, `my-portfolio-home.png`, `my-portfolio-home-v2.png`, `my-portfolio-bg-matrix.png`, `my-portfolio-work.png`, `my-portfolio-mosaic-hover.png`, `my-portfolio-clients.png`, `my-portfolio-full.png`), cross-checked against the verified live findings in `01-dom-css-design-system.md`, `02-webgl-shaders-motion.md`, and `03-live-ux-storytelling.md`.
> Static checks run on current local state: `npx tsc --noEmit` and `npm run lint` both exited `0` (clean types/lint), confirming that all defects below are **runtime, architectural, shader, CSS, and fidelity bugs**.

---

## 1. Executive Summary — Top Critical Root Causes

| Severity | Area | File(s) & Lines | Root Cause & Impact |
| :--- | :--- | :--- | :--- |
| **P0** | **WebGL Mosaic Invisible (Frustum Clipping)** | `src/components/canvas/ThreeCanvas.tsx:93-101, 212, 250-251` | `camera.far` is hardcoded to `1000`, while `cameraZ = innerHeight / 2 / tan(22.5°)`. On **any viewport taller than `828.4px`** (including all `1352x877` screenshots where `cameraZ ≈ 1058.6`, and `1080p` where `cameraZ ≈ 1303.7`), every mesh at `z = 0` sits **beyond `camera.far`** and is 100% clipped by WebGL. Live `#pageCanvas` instead uses a single scissor-tested renderer (`PerspectiveCamera(50, 1, 1, 10)` at `z = 2.1`) with `-100px` top overscan (`innerHeight + 300`). |
| **P0** | **WebGL Mosaic Occluded by DOM** | `ThreeCanvas.tsx:274`, `src/app/page.tsx:25`, `WorkSection.tsx:168-181` | `#pageCanvas` sits at `z-10`, while the entire DOM wrapper sits at `z-20` and every project card renders an opaque `<img className="w-full h-full object-cover ...">` inside `z-20`. The WebGL canvas is physically buried behind the DOM `<img>` and opaque sections. (Live keeps `#pageContainer` at `z-index: 5`, `#pageCanvas` at `z-index: 3`, `.innerCanvas.hide` transparent `#fff0`, and `<video>` at `opacity: 0`). |
| **P0** | **WebGL `u_scrollVelocity` Explosion** | `ThreeCanvas.tsx:16, 213-214, 228-229` | Vertex shader adds `sin(uv.x * PI) * u_scrollVelocity * 0.02` in unit-plane space (`[-0.5, 0.5]`) **before** `mesh.scale.set(rect.width, rect.height, 1)` (`~400px`), fed by raw px scroll delta (`20–100px`). If visible, a normal scroll warps planes hundreds of pixels off-card. (Live `#pageCanvas` has zero scroll vertex distortion). |
| **P0** | **Background Matrix Buried Below Fold & Wrong Blending** | `BackgroundCanvas.tsx:95-101, 175`, `AboutSection.tsx:27`, `ClientsSection.tsx:19`, `Footer.tsx:38` | `BackgroundCanvas` sits at `z-0` with dark navy/amber direct colors (`#22264b` / `#f7a026`) and `0.04` border cutouts, while `AboutSection` (`bg-[#d7c6ad]`), `ClientsSection` (`bg-[#22264b]`), and `Footer` (`bg-[#22264b]`) apply opaque backgrounds inside `z-20`, completely erasing the grid from the bottom half of the site (`my-portfolio-clients.png`). Live `#backgroundCanvas` needs no theme uniforms: it draws `vec3(0.9)` + single-cell `vec3(0.0)` hover under `mix-blend-mode: difference` + `opacity: 0.03` (`z-index: 1`) **above** `.backgrounds .primaryBackground` (`#22264B` overlays with `+1px` anti-seam at `z-index: 0`). |
| **P0** | **HiDPI `gl_FragCoord` vs CSS `resolution` Mismatch** | `BackgroundCanvas.tsx:20, 39, 81, 126-127, 136-137` | `renderer.setPixelRatio(Math.min(dpr, 1.5))` scales the physical canvas buffer, but `uniforms.resolution` is set to CSS pixels (`window.innerWidth/Height`). On any `dpr > 1` display, `st = gl_FragCoord.xy / resolution.xy` exceeds `1.0` (up to `1.5`), shifting cursor glow away from the mouse and scaling cell density by `dpr`. |
| **P0** | **Hero & Footer Display Type Clipping & Font Mismatch** | `Hero.tsx:108-123`, `Footer.tsx:96-98`, `layout.tsx:5-9` | Extended-width `Syne` at `text-[17vw]`/`text-[18vw]` with `overflow-hidden` / `whitespace-nowrap` physically slices **`VERBERNE` → `VERBE`** (`my-portfolio-bg-matrix.png`) and **`CONNECT` → `CONN` + clipped `E` stem** (`my-portfolio-full.png`), while lacking `Doner Display` / `Doner Text` + `.hugeTitle` `16.25vw` auto-fit scaling (`SplitText` + `.row` height locking). |
| **P0** | **Homepage Structure & Missing Multi-Page / Storytelling Architecture** | `src/app/`, `page.tsx`, `Header.tsx`, `Hero.tsx`, `WorkSection.tsx`, `AboutSection.tsx`, `ClientsSection.tsx`, `Footer.tsx` | Local `/` crams `AboutSection` onto the homepage (live `/` has strictly 3 sections + `footer`; About/Services/Awwwards belong on `/about/`), returns 404 on `/work`, `/about`, `/contact`, `/project/[slug]`, and lacks `not-found.tsx` (`errorCanvas`), Swup + `#loadCanvas` transitions, scroll-collapsing frosted pill header + mobile drawer, horizontal `W O RK` drift, asymmetric 6-item Work cadence (`VideoTexture`, tooltips, manifesto, `"tit bird"` Easter egg), all 3 bird photos, barcode phone link, `drawText` SVGs, `lineAnim`/`blockAnim`, and `450ms` animated favicon. |
| **P1** | **Global `ScrollTrigger.kill()` Collision & Missing Cleanup** | `Hero.tsx:81`, `WorkSection.tsx:112`, `Footer.tsx:12-32` | Both `Hero` and `WorkSection` run `ScrollTrigger.getAll().forEach((t) => t.kill())` on unmount without `gsap.context()`, destroying sibling components' triggers (e.g. `Footer`). `Footer.tsx` has **zero** `useEffect` cleanup at all. |
| **P2** | **Dead/Leak-Prone `CustomCursor` & `ThreeCanvas` Leaks** | `CustomCursor.tsx:5-99`, `ThreeCanvas.tsx:196-198, 260-268` | Live `meesverberne.com` has **zero custom cursor** (`CustomCursor.tsx` should be removed entirely—it adds visual clutter, uncleaned anonymous hover listeners, and first-frame mount drops). `ThreeCanvas` also leaks per-card mouse listeners and GPU textures on unmount. |

---

## 2. Build, Config & Log Baseline

- **`package.json` (`1-31`)**: `next: "16.4.6"`, `react: "19.3.0"`, `three: "^0.187.0"`, `gsap: "^3.15.1"`, `lenis: "^1.3.27"`, `lucide-react: "^1.73.0"`, `tailwindcss: "4.3.3"`, `@tailwindcss/turbopack: "4.3.3"`.
- **`next.config.ts` (`3-15`)**: Enables `cacheComponents: true` and `partialPrefetching: true` (valid Next 16.4.6 options verified in `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md`). Note: when adding dynamic routes like `/project/[slug]`, `cacheComponents: true` requires proper `<Suspense>` boundaries / `'use cache'` usage.
- **`tsconfig.json` (`1-34`)** & **`eslint.config.mjs` (`1-18`)**: Strict TS + Next core-web-vitals/TS ESLint rules. Both `npx tsc --noEmit` and `npm run lint` pass with exit code `0`.
- **`.playwright-mcp/` logs**:
  - `.playwright-mcp/console-2026-11-14T20-13-50-893Z.log:3-5` shows an earlier run logged `THREE.Clock` deprecation warnings (subsequently replaced by `performance.now()`) and a `404` on `https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80`, matching the broken image icon in Project 01 of `my-portfolio-full.png`.
  - `.playwright-mcp/console-2026-11-15T05-13-44-339Z.log:1-2` (captured around the latest `my-portfolio-bg-matrix.png` / `my-portfolio-mosaic-hover.png` run) shows zero console errors—proving the broken WebGL effects fail **silently**.

---

## 3. WebGL Audit: `ThreeCanvas.tsx` & `WorkSection.tsx`

### 3.1 Why `ThreeCanvas` Renders Nothing Visible & Diverges from Live `#pageCanvas`

1. **Wrong Rendering Architecture — 3D Frustum Planes (`camera.far = 1000` Clipping) vs Live Scissor Rendering (`ThreeCanvas.tsx:93-101, 204-216, 250-251`)**:
   - Local `ThreeCanvas.tsx` attempts to position 3D meshes (`PlaneGeometry(1, 1, 32, 32)` scaled by `rect.width, rect.height` at `z = 0`) in front of a fullscreen perspective camera:
     ```ts
     const fov = 45;
     const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 10, 1000);
     const cameraZ = window.innerHeight / 2 / Math.tan(((fov / 2) * Math.PI) / 180);
     camera.position.set(0, 0, cameraZ);
     ```
     Since $\tan(22.5^\circ) \approx 0.41421356$, any viewport height $H > 2 \times 1000 \times 0.41421356 = 828.43\text{px}$ pushes `cameraZ` beyond `camera.far` (`1000`):
     - At screenshot height `877px`: `cameraZ = 1058.63 > 1000`.
     - At `900px`: `cameraZ = 1086.40 > 1000`.
     - At `1080px`: `cameraZ = 1303.68 > 1000`.
     Because every plane mesh sits at `z = 0` (`ThreeCanvas.tsx:212`), its distance exceeds `1000` and **WebGL clips 100% of every plane on all standard desktop viewports**. (`handleResize` at lines 250-252 also never updates `camera.far`).
   - **Live `#pageCanvas` architecture (`02` §4.3):** Live avoids 3D rect projection entirely. It mounts `#pageCanvas` inside `.pageCanvasWrapper` (`z-index: 3`, `position: absolute`) with `height = window.innerHeight + 300`, CSS `margin-top: -100px` (`100px` top overscan + `200px` bottom overscan), and `gsap.to(canvas, 0, { y: window.scrollY })`. A single `WebGLRenderer` uses **`renderer.setScissorTest(true)`** with `setViewport(left, bottom, width, height)` / `setScissor(...)` (`bottom = clientHeight - rect.bottom - 100`) to render each `.innerCanvas` scene (`PlaneGeometry(2, 2, 50, 50)`, `PerspectiveCamera(50, 1, 1, 10)` at `z = 2.1`), recalculating canvas height only on horizontal width changes (`window.innerWidth !== currentWidth`) to prevent mobile URL-bar jitter.

2. **DOM `z-index` Occlusion & Opaque `<img>` Double-Render (`ThreeCanvas.tsx:274`, `page.tsx:25`, `WorkSection.tsx:168-181`)**:
   - `ThreeCanvas` renders `#pageCanvas` inside `<div className="fixed inset-0 pointer-events-none z-10 ...">` (`ThreeCanvas.tsx:274`).
   - `page.tsx:25` wraps `<Header />`, `<main>` (including `<WorkSection />`), and `<Footer />` in `<div className="relative z-20 flex flex-col min-h-screen">`.
   - Inside `WorkSection.tsx:168-181`, each project card renders `.webgl-plane` (`opacity-0`) alongside an **opaque** `<img src={project.image} className="w-full h-full object-cover grayscale contrast-105 group-hover:grayscale-0 group-hover:scale-105 ..." />` and `bg-[#22264b]/5` (`line 168`).
   - Because `z-20 > z-10`, the opaque `<img>` sits **in front of `#pageCanvas`**, hiding 100% of WebGL output even if frustum clipping were fixed.
   - **Live stacking (`01` §1.2/§5.1, `02` §1/§3):** `#pageContainer` sits at `z-index: 5` **above** `#pageCanvas` (`z-index: 3`), while `.innerCanvas` containers have transparent backgrounds (`.innerCanvas.hide { background: #fff0 }`, cleared from `rgb(0 0 0 / 0.05)` placeholder once WebGL loads) and injected `<video>` elements stay at `opacity: 0` in CSS—so DOM never occludes `#pageCanvas` (`z-index: 3`), while `.innerCanvas` remains hoverable at `z-index: 5` and titles/tooltips float cleanly on top.

3. **Hit-Testing & Scale Mismatch on `.webgl-plane` (`WorkSection.tsx:168-188`)**:
   - In CSS painting order inside `.relative` (`WorkSection.tsx:168`), `.webgl-plane` (`position: absolute`) sits over the static `<img>`, **except** in the top-right corner where the hover badge `<div className="absolute top-4 right-4 ...">` (line 184, later in DOM order, missing `pointer-events-none`) intercepts pointer events and fires premature `mouseleave`.
   - Meanwhile, the visible `<img>` scales on hover (`group-hover:scale-105` at line 180) while `.webgl-plane` does not (`inset-0`).

### 3.2 Shader, Texture & Lifecycle Bugs in `ThreeCanvas.tsx`

- **Vertex Shader Scroll Distortion Bug (`ThreeCanvas.tsx:16, 213-214, 228-229`)**:
  - `pos.y += sin(uv.x * 3.14159) * u_scrollVelocity * 0.02;` mutates `pos.y` in normalized `1x1` unit geometry space **prior** to `mesh.scale.set(rect.width, rect.height, 1)`. Fed by raw pixels/frame (`currentScrollY - lastScrollY`), a `50px` scroll delta adds `+1.0` to `pos.y` (`100%` of plane height ≈ `400px` vertical warp!). Live `#pageCanvas` uses a pure passthrough vertex shader (`vUv = uv; gl_Position = ...`) with zero scroll warp.
- **Shader Fidelity vs. Live `#pageCanvas` (`ThreeCanvas.tsx:22-74, 136-194`)**:
  - *Note on verified live logic:* Live `#pageCanvas` (`02` §4.3) actually **does** use `vec2(u_gridSize, u_gridSize)`, continuous `vUv`, and axis-snapped displacement (`if (abs(mouseDist.x) > abs(mouseDist.y)) { distortedUv.x += ... } else { distortedUv.y += ... }`)—those three constructs in `ThreeCanvas.tsx` came from the live shader.
  - **Actual shader bugs & unauthorized additions in `ThreeCanvas.tsx`:**
    1. **Dead `u_time` / `random()` (`lines 28-35, 135, 139, 233`)**: `u_time`, `u_randomValue`, and `random()` are declared and updated every frame (`line 233`) yet **never used in `fragmentShader` `main()`**—completely omitting live's tile-by-tile entrance reveal (`smoothstep(0.0, 1.0, u_time - random(gridCoord) * 1.0)`, `color.rgb = mix(vec3(0.0), color.rgb, fadeInEffect)`, `gl_FragColor = vec4(color.rgb, fadeInEffect)` driven by `ScrollTrigger` at `start: "0% 90%"`, `u_time: 0 -> 3` over `2s`).
    2. **Wrong `u_gridSize` & Falloff (`lines 48, 138, 171, 180`)**: Uses `u_gridSize = 16.0` (live uses `15.0` default, `20.0` for `data-biggerGrid="true"` on `/about/`, `25.0` on 404 `#errorCanvas`), `u_gridSize * 0.45` falloff (live `0.4`), and `u_strength -> 0.85` (live `0.8`).
    3. **Unauthorized RGB Split & Amber Glow (`lines 61-70`)**: Injects chromatic aberration (`split = u_strength * 0.015`) and amber hover tint (`vec3(0.12, 0.08, 0.02)`), neither of which exists in live `#pageCanvas`.
    4. **Missing `0.3s` Idle Decay (`lines 157-194`)**: Live tweens `u_mouse` over `0.3s` (`0s` on first move after re-entry) and decays `u_strength -> 0` over `0.6s` (`delay: 0.3s`) on `u_mouse` `onComplete()`, letting tiles settle back to sharp rest when the pointer pauses. Local `ThreeCanvas.tsx` holds `u_strength` at `0.85` indefinitely until `mouseleave`.
- **Texture Loading, Color Space, CORS, Lazy Loading & Video Gaps (`ThreeCanvas.tsx:113-143`)**:
  - **No `THREE.VideoTexture` / `<video>` Support**: Live renders looping muted autoplay `.mp4` videos via `THREE.VideoTexture` on desktop (`>1080px`) with `data-resp-image` fallback at `<=1080px`, plus viewport play/pause (`ScrollTrigger`). Local `ThreeCanvas.tsx` only reads `data-image`.
  - **No `ScrollTrigger` Lazy Loading (`start: "0% 200%"`)**: Local loads every texture eagerly on mount instead of lazy-loading with `.loaded` guard, and uses `generateMipmaps = false` (`line 126`, live sets `true` + `LinearMipmapLinearFilter`).
  - **No `THREE.SRGBColorSpace`**: `texture.colorSpace` stays at Three.js `0.187.0` default (`NoColorSpace`).
  - **CORS Cache Conflict & Silent Errors**: Three.js `0.187.0` `Loader` defaults `crossOrigin` to `'anonymous'` (`node_modules/three/build/three.core.js:45250`), while `WorkSection.tsx:177` renders `<img src={project.image}>` without `crossOrigin="anonymous"`; `textureLoader.load(src)` (`line 125`) has no `onError` handler.
- **One-Time DOM Query & Resource Leaks (`ThreeCanvas.tsx:116, 196-198, 260-268`)**:
  - `document.querySelectorAll(".webgl-plane")` runs once on mount (misses dynamic/route-changed planes).
  - Cleanup (`lines 260-268`) never removes per-element mouse listeners (`lines 196-198`) and never disposes `THREE.Texture` instances. `targetStrength` (`lines 80, 153`) is dead code.

---

## 4. WebGL Audit: `BackgroundCanvas.tsx` & Theme Layering

1. **HiDPI `gl_FragCoord` Coordinate Scaling Bug (`BackgroundCanvas.tsx:20, 39, 81, 126-127, 136-137`)**:
   - Line 20 sets `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))`.
   - Lines 39 & 137 set `uniforms.resolution` to CSS pixels (`window.innerWidth`, `window.innerHeight`) **unscaled by `pixelRatio`**.
   - Line 81 computes `vec2 st = gl_FragCoord.xy / resolution.xy;`. Because `gl_FragCoord` is in physical drawing-buffer pixels (`width * dpr`), `st` ranges from `0.0` to `1.5` on Retina/scaled screens while `mousePos` (lines 126-127) ranges `0.0` to `1.0`.
   - **Impact:** On any `dpr > 1` display, mouse hover cells miss the pointer position and grid density increases by `dpr`. (Live `#backgroundCanvas` does not call `setPixelRatio`, keeping `canvas.width === innerWidth`, while `onResize` at lines 133-142 also forgets to sync `setPixelRatio`).

2. **Opaque Section Backgrounds Bury `BackgroundCanvas` (`BackgroundCanvas.tsx:175` vs DOM Sections)**:
   - `BackgroundCanvas` sits at `z-0`, while `AboutSection.tsx:27` (`bg-[#d7c6ad]`), `ClientsSection.tsx:19` (`bg-[#22264b]`), and `Footer.tsx:38` (`bg-[#22264b]`) sit inside `page.tsx:25` (`z-20`) with 100% opaque backgrounds, burying the matrix grid from `AboutSection` down (`my-portfolio-clients.png`).
   - **Live `.setPrimaryBackground` Architecture (`01` §2.3, `02` §4.2 & §6.1):** Live sections inside `#pageContainer` (`z-index: 5`) remain **background-transparent**. A controller reads `.setPrimaryBackground` sections (`.clientsBlock`, `footer`, `.errorBlock`) and injects matching `#22264B` `<div class="primaryBackground">` rectangles (`height: outerHeight + 1` to eliminate subpixel `#D7C6AD` seams) into `.backgroundContainer .backgrounds` (`z-index: 0`), **underneath** `.backgroundCanvasWrapper` (`z-index: 1`). Because `.backgroundCanvasWrapper` renders with **`mix-blend-mode: difference`** and **`opacity: 0.03`** (plus `filter: contrast(1.8)` on `<= 580px`), `#backgroundCanvas` requires **zero theme uniforms**—it outputs `vec3(0.9)` pulsing cells (`0.5 * (1.1 + sin(...))`) and a single hovered cell `vec3(0.0)` at `0.9` alpha, staying harmoniously visible over both `#D7C6AD` sand and `#22264B` navy!
   - By contrast, local `BackgroundCanvas.tsx:95-103` draws direct navy (`#22264b`) & amber (`#f7a026`) cells across a `3.5`-cell radius at up to `0.55` alpha without `mix-blend-mode: difference` or `opacity: 0.03`, giving stark amber glow on beige and `0%` contrast on navy.

3. **Grid Parameters, Border Cutouts, Camera Init & Delayed Reveal (`BackgroundCanvas.tsx:23, 26-35, 60-65, 125-130`)**:
   - **Border cutout lines (`lines 60-65`)**: Local sets `float border = 0.04; return step(border, grid.x) * step(border, grid.y);`, cutting a `4%` gap along left/bottom cell edges (`my-portfolio-bg-matrix.png`), whereas live sets `float size = 0.0` (seamless edge-to-edge cells visible in `meesverberne-home.png`).
   - **Scale divergence (`lines 26-35`)**: Local sets `baseGridCountX = isMobile ? 18 : 45` (`1352 / 45 = 30.04` columns across `1352px`) and `scaleY = isMobile ? 35.0 : 22.0`, whereas live uses `isMobile ? 15 : 45` (still `30` columns across `1352px` in `meesverberne-home.png`) and `scaleY = isMobile ? 40 : 20`.
   - **Camera & intro (`line 23`)**: Initializes `PerspectiveCamera(75, 1, 0.1, 1000)` with `aspect = 1` instead of `innerWidth / innerHeight`, starts `mousePos` at `(-10, -10)` (live starts at `(0.5, 0.5)`), omits `.inview` delayed fade-in (`2900ms` home / `900ms` subpages, `opacity: 0 -> 0.03` over `2s 0.3s`), and lacks `mouseleave` reset when cursor leaves the viewport.

---

## 5. Scroll, GSAP, Marquee & Cursor Bugs

1. **Destructive Global `ScrollTrigger.kill()` (`Hero.tsx:80-82`, `WorkSection.tsx:111-113`)**:
   - Both components call `ScrollTrigger.getAll().forEach((t) => t.kill())` on unmount without `gsap.context(..., ref)`. Under React 19 Strict Mode, HMR, or route changes, one component unmounting wipes out **every** ScrollTrigger across the entire page.
   - `Hero.tsx:32-53` also targets global selectors `".hero-line-inner"` and `".hero-fade"` without container scoping and never reverts those timelines on unmount.
2. **Missing Cleanup & Broken Scroll Trigger in `Footer.tsx` (`12-32, 108-113`)**:
   - `Footer.tsx:12-32` registers a `ScrollTrigger` animation on `titleRef` with **zero cleanup return function**, leaking duplicate triggers on every remount/HMR.
   - `Footer.tsx:109` calls native `window.scrollTo({ top: 0, behavior: "smooth" })`, bypassing Lenis.
3. **Isolated `SmoothScroll.tsx` (`13-39`)**:
   - Creates `const lenis = new Lenis(...)` locally inside `useEffect` without exposing it via React Context (`scroller.stop()` / `scroller.start()` / `scroller.scrollTo()`). Also uses `duration: 1.2, wheelMultiplier: 1, touchMultiplier: 2` vs live `duration: 1.5, wheelMultiplier: 2, touchMultiplier: 5`, and omits the initial `2.6s` home scroll-lock (`overflow` / `scroller.stop()`).
4. **`Marquee.tsx` Ignores `speed` & Lacks Scroll Coupling (`5-29`, `globals.css:67-102`)**:
   - `speed?: string` is declared on `MarqueeProps` (`Marquee.tsx:8`) and never destructured or applied.
   - Uses static CSS `25s linear infinite` keyframes that pause on hover (`globals.css:99-102`), missing live's width-normalized GSAP loop (`4` cloned `.itemsContainer`s, `speed * 0.5` tablet / `0.25` mobile), scroll-direction `timeScale` inversion, and `data-marquee-scroll-speed` scroll-scrubbed `x` offset (`02` §8).
5. **Unauthenticated & Leaky `CustomCursor.tsx` (`5-99`)**:
   - **Should be removed entirely:** Verified against live CSS and all 38 scripts (`02` §9.3, `03`), `meesverberne.com` has **zero custom cursor** implementation.
   - **Active defects in local implementation:** Attaches unremovable anonymous arrow listeners once on mount (`lines 41-51`, `67-73` memory leak), misses dynamically mounted DOM nodes, flickers on nested `.group` hover (`article.group` + inner links), and unmounts `dotRef`/`ringRef` until after first `mousemove` (`if (!isVisible) return null` at `line 76`).

---

## 6. CSS, Typography, Components & Route Gaps

1. **Invalid & Dead CSS in `src/app/globals.css`**:
   - Lines 20-21: `selection-background-color: var(--accent-orange);` and `selection-color: var(--text-navy);` inside `html, body` are **non-existent CSS properties** (ignored by browsers; only `::selection` on lines 24-27 applies).
   - Lines 105-131: `.animate-flicker` and `.animate-spin-slow` are defined and unused across the entire app.
   - `:root` variables (`lines 5-9`) are ignored by components that hardcode Tailwind `bg-[#d7c6ad]`, `bg-[#22264b]`, `text-[#f7a026]` on sections instead of `.backgrounds .primaryBackground` + `header.secondary`.
2. **Font Family Mismatch, Missing `vw` Grid & Display Clipping (`layout.tsx:5-15`, `Hero.tsx`, `WorkSection.tsx`, `ClientsSection.tsx`, `Footer.tsx`)**:
   - `layout.tsx:5` loads Google `Syne` (`700`, `800`) and `Plus_Jakarta_Sans`, whereas live loads `Doner Display` (`100/400/400i/500/900`), `Doner Text` (`500/500i`), and `icomoon` (`01` §3.1) across a strict `12-column` `vw` grid calibrated to `1600px` (`>1080px`), `1080px` (`<=1080px`), and `580px` (`<=580px`).
   - Because `Syne` is much wider, `Hero.tsx:118` (`text-[17vw] whitespace-nowrap`) clips **`VERBERNE` → `VERBE`** (`my-portfolio-bg-matrix.png`), and `Footer.tsx:96` (`text-[18vw]`) clips **`CONNECT` → `CONN` + clipped `E` stem** (`my-portfolio-full.png`). Missing live `.hugeTitle` `18vw -> 16.25vw` `SplitText` shrink-to-fit (`rowWidth / lineWidth` + `.row` height locking, `02` §7.2).
   - `WorkSection.tsx:131-138` stacks `W / O / RK` vertically (`flex-col`), whereas live `.workFeaturedBlock .intro .bigTitle .row` uses `display: inline-block; vertical-align: top` on a single horizontal baseline (`W` `-0.6` horizontal, `O` `-1.2` horizontal, `RK` right-aligned).
   - `ClientsSection.tsx:27-29` inserts a literal `CLI<br />ENTS` line break, losing live's split `"CLI"` / `"ENTS"` framing the animated `.centerContent` laurel quote parentheses (`("Thank you to all my clients...")`).
3. **Header Scroll-Collapse, Bird Logo & Mobile Drawer Gaps (`Header.tsx:18-88`)**:
   - **Missing scroll-collapse (`header.scrolled`)**: Local merely tints a full-width beige bar (`bg-[#d7c6ad]/85`, clashing over `#22264b` sections). Live translates `.left` and `.right` off-top (`y: -min(scrollY, headerBar.height)`), collapses `.center .menuContainer` into a floating dark-glass pill (`rgb(0 0 0 / 0.3)` + `backdrop-filter: blur(min(scrollY / 2, 25)px)`) with `#F7A026` text & `li:after` dividers, and applies `header.secondary` over `.setPrimaryBackground`.
   - **Missing `MVLogo` & `icomoon` socials**: Local shows an orange dot + `INDEX`, green-dot `"AVAILABLE FOR Q1/Q2"` pill, and `LN / GH` instead of the 4-frame **hopping/bobbing** pixel bird `<svg class="MVLogo">` (`MVLogo-1..4`) and Instagram/LinkedIn icons.
   - **Mobile navigation dead-end (`line 37`)**: `<nav className="hidden md:flex">` hides all nav links below `768px` with zero menu trigger. Live (`<= 580px`) pins a fixed `53.8x53.8px` (`13.793vw`) `.menuIcon` with 4 animated edge bars (`animBarFirst..Fourth`) opening a full-screen `#22264B` `.hamburgerMenu` (over `#loadCanvas`) with `15.517vw` stacked links + live `"Mees V."` SVG draw.
4. **Homepage Composition & Missing Multi-Page / Storytelling Architecture**:
   - **Wrong homepage section count (`page.tsx:34-36`):** `AboutSection` is mounted on `/`; live `/` has strictly `.homeHeaderBlock`, `.workFeaturedBlock`, `.clientsBlock.setPrimaryBackground`, and `footer`.
   - **Missing routes & `#loadCanvas` transitions (`src/app/`):** `/work`, `/about`, `/contact`, `/project/[slug]`, and `not-found.tsx` (`errorCanvas` with `404-v3.jpg` + `.copyErrorContent` z-sandwich at `u_gridSize = 25.0`) are all absent, as is `#loadCanvas` (note: live `#loadCanvas` is **not** an initial-load preloader—`loadCanvasFrame` starts `false`; it renders only during Swup route transitions in `vec3(0.38, 0.39, 0.52)` / `#616385` with `alpha <= 0.4` `discard` and mobile menu toggle in `#22264B`).
   - **Missing Hero & Storytelling Elements:**
     - **3+1 Bird Photographs:** Hero upright bird (`bird-v2.jpg`), mid-work mini bird (`bird-small-v2.jpg`) + `"tit bird" = "Mees"` Easter egg, upside-down nocturnal footer bird (`footer-bird-v2.jpg`), plus `/about/` (`bird-about-v3.jpg`, `u_gridSize = 20.0`) and 404 (`404-v3.jpg`).
     - **SVG `DrawSVG` Signatures & Micro-Details:** 6 calibrated stroke sequences (`Creative Developer`, `Mees`, `Mees V.`, arrow callout), `.barCode` SVG (`+31 (0)6 28839393`) inside a right-scrolling marquee, `.lineAnim` corner ticks, `.blockAnimWrapper` 2x2 quadrant loaders (`style-1-anim`..`style-4-anim`), `data-words` line-staggered reveal (`0.1s` / `0.3s`), `450ms` animated favicon (`favicon-1..3.png`), `2.6s` initial home scroll lock + `600ms–3800ms` staggered choreography.
     - **Asymmetric Work & Client Features:** Single-baseline `W O RK`, 6 asymmetric project items (`highlight` dual video/img, `half` + `EXTENSIVE EXPERIENCE IN THE DIGITAL WORLD` manifesto, `extraPadding` staggered `.positionTop` pair, `bigger` Milka + mini-bird, closing `ALL PROJECTS +`), `.itemIntro` (`style-1..6` + mobile `.resp` marquees), `.toolTipIcon` speech-bubble credits (projects + 13 `.client.hover` agency tooltips in `clientsBlock`), and conversational Q&A form + bird-in-inbox confirmation on `/contact/`.
5. **Broken / Inconsistent Copy & Dead Links**:
   - `Footer.tsx:49` links `mailto:contact@example.com` while line `52` displays `hello@creative-dev.com`.
   - `WorkSection.tsx:33, 46, 59, 72` set `link: "#"` and `<article>` is not clickable; uses 4 generic grayscale Unsplash stock photos instead of real projects/videos.
   - `Header.tsx:69, 78` & `Footer.tsx:61, 69, 77` point to generic `linkedin.com` / `github.com` / `instagram.com` homepages.
   - `page.tsx:32` sets Ho Chi Minh City coordinates (`/ 10.8230989 // 106.6296638`) and `Footer.tsx:88` shows `GMT+7 (ICT)` instead of Venray, NL (`/ 51.5270258 // 5.9753635`, `info@meesverberne.com`, `+31 6 28839393`).
   - `Header.tsx:65` (`AVAILABLE FOR Q1/Q2`) vs `Hero.tsx:98` (`AVAILABLE '26`).

---

## 7. Visual Comparison: Screenshots (`meesverberne-*.png` vs `my-portfolio-*.png`)

| Comparison Pair | Exact Visual Discrepancies Observed |
| :--- | :--- |
| **`meesverberne-home.png` vs `my-portfolio-bg-matrix.png` (and earlier `my-portfolio-home.png` / `v2`)** | • **Typography & Clipping:** Live shows `MEES` centered above full-width `VERBERNE` cleanly inside margins; local `my-portfolio-bg-matrix.png` clips `VERBERNE` to `VERBE` (earlier `my-portfolio-home.png` clipped `CREATIVE DEVELOPER` to `CREAT DEVELO`).<br>• **Header:** Live has hopping pixel bird icon (left), centered `INDEX / WORK / ABOUT / CONTACT`, and IG/LI icons (right). Local has orange dot + `INDEX`, green-dot `"AVAILABLE FOR Q1/Q2"` pill, and `LN / GH`, plus an extra SaaS status bar above the H1.<br>• **Hero Editorial Composition:** Live places the `+ Freelance + Creative + Developer + Designer` marquee **immediately under `VERBERNE`**, followed by `.barCode` `+31 (0)6 28839393` (left), WebGL bird portrait `bird-v2.jpg` + `M./` + orange script `"Creative Developer"` signature (center), and 3 bio paragraphs + `/ 51.5270258 // 5.9753635` (right). Local has no bird art, no barcode, a fake circle `"M./"` badge, a squiggle labeled `"VERIFIED SIGNATURE"`, and pushes the marquee to the bottom.<br>• **Matrix Background:** Live (`1352x877`) renders `30` seamless columns (`1352 / 45`) × `20` rows at `opacity: 0.03` (`mix-blend-mode: difference`) with zero border gaps; local (`30` × `22` cells) cuts `4%` tile border gaps across every square and renders a stray orange custom-cursor dot over the `R`. |
| **`meesverberne-home.png` / `full.png` vs `my-portfolio-work.png` & `my-portfolio-mosaic-hover.png`** | • **Section Heading:** Local stacks `W` / `O` / `RK` vertically (`flex-col`) across 3 giant rows instead of horizontal single-baseline drift (`W   O   RK`).<br>• **Cards & WebGL Hover:** Local uses uniform `aspect-[4/3]` 2-col cards with unrelated grayscale Unsplash stock photos, numbered metadata ribbons, and pill tags (`WEBGL`, `THREE.JS`). In `my-portfolio-mosaic-hover.png` (with the orange cursor directly over Project 01's retro computer), **zero WebGL mosaic displacement appears**—only the DOM `<img>` grayscale-to-color hover transition—confirming `ThreeCanvas` occlusion + far-plane clipping. (Earlier `my-portfolio-full.png` also shows a broken `<img>` icon on Project 01). |
| **`my-portfolio-clients.png` & `my-portfolio-full.png` vs `meesverberne-full.png`** | • **Misplaced & Occluded `AboutSection`:** `my-portfolio-clients.png` is actually scrolled to `AboutSection` (`'26` + 3 service cards), which shouldn't exist on `/` at all and whose opaque `bg-[#d7c6ad]` completely hides `BackgroundCanvas` (`0` grid cells visible).<br>• **`ClientsSection` & `Footer`:** Local hardcodes an abrupt horizontal switch to `bg-[#22264b]` (erasing the matrix grid) instead of `.backgrounds .primaryBackground` overlays beneath `mix-blend-mode: difference`; splits `"CLIENTS"` mid-word into `CLI` / `ENTS` without laurel parentheses or agency tooltips; renders a generic 8-box client grid; omits the upside-down nocturnal footer bird + bottom pixel bird; and clips `"CONNECT"` in `Footer` to **`CONN` + clipped `E` stem** (`my-portfolio-full.png`).<br>• **Note on `meesverberne-full.png`:** Below-fold sections on the live target appear blank beige in the un-scrolled full-page capture because its elements (`lineAnim`, `.innerCanvas`, `[data-scroll-inview]`) wait for scroll-triggered visibility reveals (`ScrollTrigger` + `u_time`). |

---

## 8. Prioritized Remediation Blueprint

1. **Rebuild `ThreeCanvas` as Scissored `#pageCanvas` (`z-index: 3`) + Clean `.innerCanvas` Placeholders (P0):**
   - Replace `z-10` 3D plane projection with live's scissor/viewport loop (`PerspectiveCamera(50, 1, 1, 10)` at `z = 2.1`, `PlaneGeometry(2, 2, 50, 50)`, `height = innerHeight + 300`, `margin-top: -100px`, `y: scrollY` sync, horizontal-only resize).
   - Keep `#pageContainer` at `z-index: 5`, remove opaque DOM `<img>` over `.innerCanvas`, make `.innerCanvas.hide` transparent (`#fff0`), and set `<video>` to `opacity: 0` inside `.innerCanvas`.
   - Restore the true fragment shader: `u_gridSize` (`15.0` / `20.0` / `25.0`), `0.4` radius, `0.8` max strength, `u_time` (`0 -> 3`) `fadeInEffect` tile dissolve on `ScrollTrigger`, `0.3s` idle decay, zero RGB split/amber tint, plus `THREE.VideoTexture` (`>1080px`) with `data-resp-image` fallback, `ScrollTrigger` lazy-load (`start: "0% 200%"`), `SRGBColorSpace`, and proper listener/texture cleanup.
2. **Fix `BackgroundCanvas` & Implement `.setPrimaryBackground` Overlays (P0):**
   - Match live shader (`vec3(0.9)` + single-cell `vec3(0.0)` hover, `size = 0.0`, `width / 45` or `/ 15` × `20` or `40`, `(0.5, 0.5)` initial mouse, DPR-consistent `resolution` so `gl_FragCoord` never drifts on HiDPI), `mix-blend-mode: difference`, `opacity: 0.03` (`z-index: 1`), and `.inview` delay (`2900ms` home / `900ms` subpages).
   - Remove opaque `bg-[#d7c6ad]` / `bg-[#22264b]` from DOM sections; drive `#22264B` `.primaryBackground` (`height + 1px`) overlays inside `.backgrounds` (`z-index: 0`) + `header.secondary` scroll trigger.
3. **Remove `CustomCursor.tsx`, Scope GSAP & Share Lenis (P1):**
   - Delete `CustomCursor.tsx` (unauthenticated + leaky).
   - Wrap all GSAP/ScrollTrigger effects in `gsap.context(..., ref)` (`ctx.revert()` on unmount), share Lenis via React Context (`duration: 1.5`, `wheelMultiplier: 2`, `2.6s` initial home scroll lock), and implement GSAP scroll-coupled `Marquee` (`timeScale` direction flip + `data-marquee-scroll-speed` scrub).
4. **Restore Typography, Header Chrome, Storytelling Assets & Full App Router (P1):**
   - Load `Doner Display`, `Doner Text`, and `icomoon` over the `1600px` / `1080px` / `580px` 12-column `vw` grid; implement `.hugeTitle` `16.25vw` auto-fit + `.row` height locking, single-baseline `W O RK` & `C ON NECT`, and `[data-words]` line-staggered reveals.
   - Build scroll-collapsing frosted pill header + hopping `MVLogo` + mobile `<= 580px` `.menuIcon`/`.hamburgerMenu`, `#loadCanvas` route/menu dissolve curtain (`vec3(0.38, 0.39, 0.52)` / `#22264B` with `alpha <= 0.4` `discard`), all 6 `DrawSVG` stroke signatures, `.barCode`, `.lineAnim`, `.blockAnim`, `.toolTipIcon` speech bubbles, all bird visuals + Venray metadata + `450ms` favicon, move About/Services/Awwwards off `/` onto `/about`, and implement `/work`, `/contact`, `/project/[slug]`, and `not-found.tsx` (`errorCanvas`).
