# 01 — DOM, CSS & Design System Reverse-Engineering (`https://meesverberne.com`)

> Audited directly from live HTML routes, unified stylesheet [`e62857b0eb72a8ba3ce567f535e34351.css?ver=aedb3`](https://meesverberne.com/wp-content/litespeed/css/e62857b0eb72a8ba3ce567f535e34351.css?ver=aedb3) (250,663 B minified: custom theme CSS occupies bytes 0–237,144 and WordPress/Gutenberg CSS occupies bytes 237,144–250,663), and live DOM-state LiteSpeed JavaScript bundles without Playwright.

---

## 1. Route Map & Document Shell Architecture

### 1.1 Discovered Routes
All 5 audited core/project routes return HTTP 200 (plus `/project/iglo/` and `/project/carchallenge/`, while unknown routes return HTTP 404), served with the exact same single LiteSpeed-combined CSS bundle and **zero inline `<style>` tags**:

| Route | HTTP Status | WordPress `data-id` | Sections (`<section>` inside `.blocks`) |
| --- | --- | --- | --- |
| `/` | 200 | `2` | `.homeHeaderBlock`, `.workFeaturedBlock`, `.clientsBlock.setPrimaryBackground` |
| `/work/` | 200 | `44` | `.workBlock` |
| `/about/` | 200 | `46` | `.aboutHeaderBlock`, `.aboutBlock`, `.servicesBlock`, `.awwwardsBlock` |
| `/contact/` | 200 | `48` | `.contactBlock` |
| `/project/mikki-sindhunata/` | 200 | `564` | `.projectHeaderBlock`, `.projectFullscreen169Block`, `.projectTextBlock`, `.project5050Block`, `.projectImageTextBlock`, `.project5050Block`, `.projectMobileBlock`, `.projectAwardsBlock`, `.workFeaturedBlock` ("NEXT") |
| `/<nonexistent>` (404) | 404 | `""` | `.errorBlock.setPrimaryBackground` (inside `.blocks.primaryBackgroundFull`; compact `<footer class="setPrimaryBackground">` with only `.copyFooter.smaller`) |

**Complete project slug inventory linked from `/`, `/work/`, and `/project/mikki-sindhunata/` (23 `/project/<slug>/` routes, 27 unique internal routes total):**
- Core nav (`#menu-main-menu`): `/` (*Index*), `/work/` (*Work*), `/about/` (*About*), `/contact/` (*Contact*)
- Featured / Case Studies: `/project/mikki-sindhunata/`, `/project/iglo/`, `/project/carchallenge/`, `/project/lucky-done-gone/`, `/project/milka-x-bloomon/`, `/project/lisette-donkersloot/`, `/project/de-honneurs/`, `/project/david-van-dartel/`, `/project/van-pepijn/`, `/project/i-am-college/`, `/project/easy-culi/`, `/project/rollende-keukens/`, `/project/since-88/`, `/project/snackspert/`, `/project/stoer-bikes/`, `/project/nederland-heeft-alles/`, `/project/press-play/`, `/project/robert-van-hemert/`, `/project/maeson/`, `/project/caron/`, `/project/makers-avenue/`, `/project/xperienceclub/`, `/project/young-perfect/`

Also probed live: `/project/iglo/` (200) and `/project/carchallenge/` (200). Notice `projectHeaderBlock`, `projectFullscreen169Block`, `projectTextBlock`, `project5050Block`, `projectImageTextBlock`, `projectMobileBlock`, `projectAwardsBlock`, and trailing `.workFeaturedBlock` ("NEXT") represent the full project block taxonomy.

---

### 1.2 Page Shell, Swup Transition Markup & Z-Index Stacking Order

```html
<!DOCTYPE html>
<html lang="en-US" class="no-js overflow">
<head>
  <meta charset="UTF-8">
  <link data-optimized="2" rel="stylesheet" href="https://meesverberne.com/wp-content/litespeed/css/e62857b0eb72a8ba3ce567f535e34351.css?ver=aedb3" />
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link id="favicon" rel="icon" href="https://meesverberne.com/wp-content/themes/meesverberne/favicon-1.png" type="image/png">
  <!-- ... -->
</head>
<body class="overflow">
  <header>...</header>

  <div id="pageContainer" class="pageContainer transition-fade lessPadding">
    <div class="blocks" data-id="2"> <!-- on 404: class="blocks primaryBackgroundFull" data-id="" -->
      <section class="...">...</section>
    </div>
    <footer class="setPrimaryBackground" data-scroll-inview>...</footer>
  </div>

  <div class="backgroundContainer">
    <div class="errorCanvasContainer">
      <div class="errorCanvasWrapper">
        <span class="innerCanvasFixed" data-image="/wp-content/themes/meesverberne/assets/img/404-v3.jpg"></span>
        <div class="fixedCanvasWrapper"></div>
      </div>
    </div>
    <div class="pageCanvasWrapper"><!-- JS injects <canvas id="pageCanvas"> --></div>
    <div class="backgroundCanvasWrapper">
      <canvas id="backgroundCanvas"></canvas>
    </div>
    <div class="backgrounds"><!-- JS injects .primaryBackground[.full] divs --></div>
  </div>

  <div class="loadCanvasWrapper">
    <canvas id="loadCanvas"></canvas>
  </div>
  <!-- Note: live WP template emits one extra trailing </div> before <script> tags -->
</body>
</html>
```

#### Key Structural Observations
1. **No `<main>` or `<nav>` elements**: WordPress nav (`ul#menu-main-menu.menu`) lives in `<header>` inside `.headerBar > .contentWrapper > .center > .menuContainer > .innerContainer > .menu-main-menu-container`; sections sit inside `#pageContainer > .blocks`.
2. **Swup Setup & `transition-fade` Behavior**:
   - **Zero `data-barba` or `data-swup` attributes exist in HTML**.
   - **Swup** is instantiated on `#pageContainer`:
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
   - Notice `<footer>` sits **inside** `#pageContainer`, so it is swapped per route (allowing 404 to render `<footer class="setPrimaryBackground">` with only `.copyFooter.smaller`), while `<header>`, `.backgroundContainer`, and `.loadCanvasWrapper` sit **outside** `#pageContainer` and persist across route changes.
   - CSS rules on `#pageContainer` and Swup state classes:
     ```css
     html.stopScroll, html.stopScroll body { overflow: hidden }
     html.is-changing { pointer-events: none }
     html.overflow, body.overflow { overflow: hidden }
     html.overflow *, body.overflow * { pointer-events: none!important }
     html.overflowMenu, body.overflowMenu { overflow: hidden }
     html #pageContainer, body #pageContainer { position: relative; z-index: 5; overflow: hidden; min-height: 100vh }
     html.lenis #pageContainer { height: auto }
     html #pageContainer { height: 0 }
     #pageContainer { width: 100vw }
     #pageContainer.transition-fade { opacity: 1; transition: opacity 0.6s 0s ease-out }
     html body, body body { opacity: 1; pointer-events: inherit; transition: opacity 0.3s, pointer-events 0.3s }
     html body.fadeOut, body body.fadeOut { opacity: 0; pointer-events: none }
     ```
   - Notice CSS has **zero `html.is-animating` rule** fading `#pageContainer.transition-fade` to `opacity: 0`. Instead, Swup detects `#pageContainer.transition-fade`'s `0.6s` `transition-duration`, while `#loadCanvas` (inside `.loadCanvasWrapper`) executes a `0.45s` pixelated-tile curtain-in on `animation:out:start` (`uniforms.color = vec3(0.38, 0.39, 0.52)`) and `0.9s` curtain-out on `animation:in:start` (only `history:popstate` calls `gsap.to(".blocks, footer, .backgroundContainer", 0, { opacity: 0 })`).
3. **Viewport Z-Index Layering Stack**:
   - `body` / `.backgroundContainer` (base beige `#D7C6AD`)
   - `.backgroundContainer .backgrounds` (`position: absolute; z-index: auto` — `#22264B` `.primaryBackground` blocks)
   - `.backgroundContainer .backgroundCanvasWrapper` (`position: fixed; z-index: 1; mix-blend-mode: difference; opacity: 0 -> .03` when `.inview`)
   - `.backgroundContainer .errorCanvasContainer .copyErrorContent` (`position: absolute; z-index: 2` — 404 rows 1, 2, 4, 5 & marquees)
   - `.backgroundContainer .pageCanvasWrapper` (`position: absolute; z-index: 3; opacity: 0 -> 1` when `.inview`)
   - `.backgroundContainer .errorCanvasWrapper` (`position: absolute; z-index: 4; mix-blend-mode: lighten` — 404 interactive bird over dark BG & rows 1, 2, 4, 5)
   - `#pageContainer` (`position: relative; z-index: 5` — DOM text, row 3 of 404, 404 CTA button, `footer` at `z-index: 2` inside `#pageContainer`)
   - `header .headerBar` (`position: fixed; z-index: 10`)
   - `.loadCanvasWrapper` (`position: fixed; z-index: 14` — page-transition & mobile menu `#22264B` WebGL grid wipe)
   - `header .hamburgerMenu` (`<=580px`: `position: fixed; z-index: 49` over `.loadCanvasWrapper`)
   - `header .menuIcon` (`<=580px`: `position: fixed; z-index: 50`)
   - Hover tooltips (`.toolTipWrapper`: `z-index: auto` inside inline context with `.toolTipItem { z-index: 1 }`).

---

## 2. Color System & `.setPrimaryBackground` Theme Inversion

### 2.1 Custom Properties (`--*`) Audit
**The custom theme portion of `e62857b0eb72a8ba3ce567f535e34351.css` (bytes 0–237,144) defines ZERO CSS custom properties (`--*`).**
All `--wp--*` / `--wp-*` variables in the bundle start at byte 237,144 (`:root{--wp-block-synced-color:#7a00df;...}`) from WordPress core/Gutenberg global styles and are unused by any custom layout or component selector. All theme colors are raw hardcoded hex/rgb values.

### 2.2 Complete Theme Color Palette

| Role | Hex / Value | Exact Usages in Custom CSS |
| --- | --- | --- |
| **Warm Sand (Canvas / Primary Light BG)** | `#D7C6AD` | `html, body` background, `.backgroundContainer` background, form autofill inset `box-shadow`, `.button.secondary:hover` background, mobile `<=580px` `header.secondary/open .menuIcon` & `::before`/`::after`, `.menuIcon .hamburger .bars .bar` (default), `.hamburgerMenu .mainMenu li.active a` & `a:hover`, `.hamburgerMenu .socials a:hover`, `.copyErrorContent .tags` color & `.tags .icon .innerIcon::before/::after` |
| **Deep Navy (Primary Ink / Dark BG)** | `#22264B` | `html, body` text color, `.text p a` color, `.lineAnim .innerLine`, `.button` border/text/`:before` slide fill, `.button.primary` bg, `.button.wpcf7-submit:hover` bg/border, `.button.icon .innerIcon` cross bars, `.textLink` & `:after`, `form .field` input/textarea text, border-bottom & placeholder, `header .headerBar` logo fill, links, `:before` underline & socials, mobile `.menuIcon` default bg/bars & `.secondary/open` bar color, `.backgroundContainer .backgrounds .primaryBackground` bg, `.blockAnimWrapper .blockAnim` bg, `.toolTipIcon .toolTipWrapper` bg & caret `:after`, `.contactBlock .formWrapper .successMessage` bg, `.workFeaturedBlock`/`.workBlock`/`.servicesBlock`/`.awwwardsBlock`/`.aboutBlock`/`.projectHeaderBlock`/`.projectAwardsBlock` lines, crosses, row hover fill & icons |
| **Warm Amber / Gold (Accent & Secondary Ink)** | `#F7A026` | `::-webkit-scrollbar-thumb`, `.button.secondary` bg & border, `.button.wpcf7-submit` bg & border, `.textLink.secondary` & `:after`, `header.scrolled/sticky` nav pill text, underline `:before` & `1px` `li:after` divider (`opacity:.2`), `header.secondary` SVG logo fill, nav text/underline & socials, mobile `<=580px` `.menuIcon:hover` bg/bars & `.hamburgerMenu` links/socials/SVG `drawTextContainer` stroke, `footer` text, `.divider`, marquee `+` icons, `.drawTextContainer` stroke & `.MVLogo` fill, `.homeHeaderBlock .drawText` SVG stroke, `.workFeaturedBlock .drawTextContainer` SVG stroke, `.aboutBlock .drawText` SVG stroke, `.contactBlock .drawTextContainer` SVG stroke & `.successMessage` text, `.clientsBlock` text, laurel SVGs, `.lineAnim .innerLine`, `.innerClient:after` underline & `.blockAnimWrapper.secondary .blockAnim` |
| **Off-White (Hover Ink / Light Tooltip)** | `#F4F4F4` | `.button:hover`, `.button.wpcf7-submit:hover`, `.toolTipIcon .toolTipWrapper` text, `.toolTipIcon .toolTipWrapper.light` bg & `:after` caret, `.clientsBlock .clients .toolTipIcon`, `.workBlock .clients .client:hover` text & cross icon, `.servicesBlock .services .service:hover` text |
| **Pure White** | `#fff` | `::selection` text, `.button.primary` text, `.button.secondary` text, `.button:hover.icon .innerIcon` cross bars, `.projectMobileBlock .cols .col` device frame card background (overridden inline on `mikki-sindhunata` via `style="background:#1e1e1e"`) |
| **Deep Slate Navy (404 Title)** | `#1b1e3e` | `.copyErrorContent .backgroundTitle .errorTitle` color (dark silhouette over `#22264B`) |
| **Midnight Scrollbar Track** | `#0c0f24` | `::-webkit-scrollbar-track` background |
| **Validation Error Red** | `#e02727` | `form .field input.invalid, form .field textarea.invalid` border-color |
| **Translucent Pill / Selection Backdrop** | `rgb(0 0 0 / .3)` | `::selection` background; `header.scrolled/sticky .headerBar .center .menuContainer .background` |
| **Pre-Canvas Placeholder** | `rgb(0 0 0 / .05)` | `.homeHeaderBlock ... .innerCanvas` & `.workBlock ... .innerCanvas` before `.hide` |
| **Tooltip Drop Shadow** | `0 .3125vw .3125vw rgb(0 0 0 / .1)` | `.toolTipIcon .toolTipWrapper` (`<=1080`: `.463vw`, `<=580`: `.862vw`) |
| **Transparent** | `#fff0` | `*` tap-highlight, `form input/textarea` bg, `.menuContainer .background` default bg, `.innerCanvas.hide` bg |

*(Note: WebGL shaders in Bundle `#34` [`a4f8a847df80d749ac94ca769463e2f3.js`] also use `vec3(0.38, 0.39, 0.52)` [`~#616385` muted slate blue] for Swup page transition tiles and `vec3(0.133, 0.149, 0.294)` [`#22264B`] for the mobile menu wipe.)*

---

### 2.3 How `.setPrimaryBackground` Theme Inversion Works (CSS + JS)

There is **NO CSS rule targeting `.setPrimaryBackground`** anywhere in `e62857b0eb72a8ba3ce567f535e34351.css`. Instead, inversion uses a decoupled background overlay + header state mechanism:

1. **HTML Markers**:
   - Sections that invert the canvas to deep navy (`#22264B`) carry class `.setPrimaryBackground`:
     - `<section class="clientsBlock setPrimaryBackground">`
     - `<footer class="setPrimaryBackground">`
     - `<section class="errorBlock setPrimaryBackground">` (inside `<div class="blocks primaryBackgroundFull">`)
2. **Underlying CSS Targets**:
   ```css
   .backgroundContainer { background: #D7C6AD }
   .backgroundContainer .backgrounds { pointer-events: none; height: 100%; left: 0; position: absolute; top: 0; width: 100vw; min-height: 100vh; opacity: 0 }
   .backgroundContainer .backgrounds .primaryBackground { position: absolute; background: #22264B }
   .backgroundContainer .backgrounds .primaryBackground.full { min-height: 100vh }
   ```
   And the section/footer rules themselves explicitly hardcode `#F7A026` foreground ink (`color: #F7A026` on `.clientsBlock` and `footer`) and `.blockAnimWrapper.secondary .blockAnim { background: #F7A026 }`.
3. **JS Synchronization (Bundle `#15` — `0738bc3247ed0f632b6ba5ef27725689.js`)**:
   - `setPrimaryBackgrounds()` empties `.backgroundContainer .backgrounds`, finds every `.setPrimaryBackground` element, and appends `<div class="primaryBackground" data-index="i">` (adding `.full` if `$(".blocks").hasClass("primaryBackgroundFull")`).
   - `updatePrimaryBackgrounds()` (also bound to `window` resize) copies exact box geometry into `.backgroundContainer .backgrounds`:
     - `width`: `$(el).outerWidth()`
     - `height`: `$(el).outerHeight() + 1` (1px overlap prevents subpixel `#D7C6AD` hairline seams between adjacent dark sections like `.clientsBlock` and `footer`!)
     - `top`: `$(el).offset().top`, `left`: `$(el).offset().left`
   - ScrollTrigger watches each `.primaryBackground`:
     ```js
     ScrollTrigger.create({
       trigger: $(el),
       start: "0% " + ($("header .headerBar").outerHeight() / 2),
       end: "100% 0%",
       onEnter() { $(el).attr("data-active", "true") },
       onEnterBack() { $(el).attr("data-active", "true") },
       onLeave() { $(el).attr("data-active", "false") },
       onLeaveBack() { $(el).attr("data-active", "false") }
     });
     ```
   - On page init/view (`if ($(".blocks section:first-child").hasClass("setPrimaryBackground"))`) and on Lenis `scroller.on("scroll")`: if any `.primaryBackground[data-active='true']` exists, JS adds `secondary` to `<header>`, turning the fixed header's SVG logo fill, nav link text/underline, social icons, and mobile menu icon to the `#F7A026` / `#D7C6AD` secondary palette.

---

## 3. Typography System & Fluid `vw` Design Grid

### 3.1 `@font-face` Manifest & Icon Font

Base path: `/wp-content/themes/meesverberne/assets/fonts/`

| `font-family` | Weight | Style | Display | Source Files |
| --- | --- | --- | --- | --- |
| `'Doner Display'` | `100` | `normal` | `swap` | `Doner-ThinDisplay.woff2`, `.woff` |
| `'Doner Display'` | `400` | `normal` | `swap` | `Doner-RegularDisplay.woff2`, `.woff` |
| `'Doner Display'` | `400` | `italic` | `swap` | `Doner-RegularDisplayItalic.woff2`, `.woff` |
| `'Doner Display'` | `500` | `normal` | `swap` | `Doner-MediumDisplay.woff2`, `.woff` |
| `'Doner Display'` | `900` | `normal` | `swap` | `Doner-BlackDisplay.woff2`, `.woff` |
| `'Doner Text'` | `500` | `normal` | `swap` | `Doner-MediumText.woff2`, `.woff` |
| `'Doner Text'` | `500` | `italic` | `swap` | `Doner-MediumTextItalic.woff2`, `.woff` |
| `'Brittany Signature'` | `400` | `normal` | `swap` | `BrittanySignatureRegular.woff2`, `.woff` |
| `'icomoon'` | `400` | `normal` | `block` | `icomoon.eot/ttf/woff/svg?uyyy2g` |

- **`Brittany Signature` note**: Declared in `@font-face`, but never applied to any CSS selector; handwritten signatures (`.drawText` / `.drawTextContainer`) are instead rendered as inline `<svg>` strokes animated via GSAP `DrawSVG`.
- **`icomoon` glyphs** (`[class^="icon-"], [class*=" icon-"] { font-family:'icomoon'!important }`):
  `.icon-quote` (`\e900`), `.icon-twitter` (`\e901`), `.icon-linkedin` (`\e902`), `.icon-instagram` (`\e903`), `.icon-chevron-right` (`\e905`), `.icon-chevron-left` (`\e906`), `.icon-chevron-down` (`\e907`), `.icon-chevron-up` (`\e908`).

### 3.2 Viewport-Proportional Artboard Math
All `vw` values in CSS map directly to three reference artboard widths:
- **Desktop (`> 1080px`)**: `1600px` artboard (`1vw = 16px`). Uses a **12-column `inline-block` grid** inside `.contentWrapper` (`padding: 0 2.5vw` = `40px` left/right; `95vw` = `1520px` content area = 12 cols of `7vw` [`112px`] + 11 gutters of `1vw` [`16px`]; adjacent pairs sum cleanly to `8vw` multiples minus `1vw`: `8vw, 15vw, 16vw, 23vw, 24vw, 31vw, 32vw, 39vw, 47vw, 48vw, 56vw, 63vw, 71vw, 72vw, 79vw, 87vw, 95vw`). Because columns use `display: inline-block` rather than `flex`/`grid`, server HTML removes whitespace between adjacent column elements so widths never wrap!
- **Tablet (`<= 1080px`)**: `1080px` artboard (`1vw = 10.8px`), preserving identical px sizes at `1080px` (e.g., `1.296vw * 10.8 = 14px`, `14.815vw * 10.8 = 160px`, `.contentWrapper` transitions to `%`-based inner columns within `3.704vw` side padding).
- **Mobile (`<= 580px`)**: `580px` artboard (`1vw = 5.8px`, i.e., 2x mobile retina), e.g., `3.448vw * 5.8 = 20px` body, `15.517vw * 5.8 = 90px` `.bigTitle`, `8.621vw * 5.8 = 50px` `.normalTitle`.

### 3.3 Complete Responsive Type, Tag, Button & Form Scale Table

| Token / Selector | Family / Weight / Transform | Desktop (`>1080px`, `vw` / `@1600px` / `@1440px`) | Tablet (`<=1080px`, `vw` / `@1080px` / `@768px`) | Mobile (`<=580px`, `vw` / `@580px` / `@390px`) |
| --- | --- | --- | --- | --- |
| **Body** (`html, body`, `.text p`) | `Doner Text`, `500`, `none` | `0.875vw` (`14px` / `12.6px`), lh `1.125vw` (`18px` / `16.2px`) | `1.296vw` (`14px` / `9.95px`), lh `1.667vw` (`18px` / `12.8px`) | `3.448vw` (`20px` / `13.45px`), lh `4.138vw` (`24px` / `16.1px`) |
| **`.hugeTitle`** (CSS base -> JS override) | `Doner Display`, `900`, `uppercase` | CSS `18vw` (`288px`), lh `.78`; **JS (Bundle `#17` — `99de7d96...js`)** resets to `16.25vw` (`260px`) & scales down via `rowWidth / lineWidth` if line overflows | CSS `18vw` (`194.4px`), lh `.78`; JS `<=16.25vw` (`175.5px`) | CSS `18vw` (`104.4px` / `70.2px`), lh `.78`; JS `<=16.25vw` |
| **`.bigTitle`** | `Doner Display`, `900`, `uppercase` | `10vw` (`160px` / `144px`), lh `7.5vw` (`120px`) | `14.815vw` (`160px` / `113.8px`), lh `11.111vw` (`120px`) | `15.517vw` (`90px` / `60.5px`), lh `12.759vw` (`74px`) |
| **`footer .topFooter .bigTitle`** | `Doner Display`, `900`, `uppercase` | inherits `.bigTitle` (`10vw`) | inherits `.bigTitle` (`14.815vw`) | `13.793vw` (`80px` / `53.8px`) |
| **`.normalTitle`** | `Doner Display`, `900`, `uppercase` | `4.375vw` (`70px` / `63px`), lh `3.5vw` (`56px`) | `4.63vw` (`50px` / `35.6px`), lh `3.704vw` (`40px`) | `8.621vw` (`50px` / `33.6px`), lh `6.897vw` (`40px`) |
| **`.quoteTitle`** | `Doner Text`, `500`, `uppercase` | `2.25vw` (`36px` / `32.4px`), lh `1` | `3.333vw` (`36px` / `25.6px`), lh `1` | `6.207vw` (`36px` / `24.2px`), lh `1` (`.clientsBlock`: `1.2`) |
| **`.textTitle`** | `Doner Display`, `400`, `none` | `2vw` (`32px` / `28.8px`), lh `1.22` | `2.963vw` (`32px` / `22.8px`), lh `1.22` | `5.517vw` (`32px` / `21.5px`), lh `1.22` |
| **`.smallTitle`** (`<h2 class="smallTitle">`) | **No CSS `font-size` rule** (inherits `Doner Text`, browser `h2` `700` bold) | `0.875vw` (`14px`), mb `1.25vw` (`20px`) | `1.296vw` (`14px`), mb `1.852vw` (`20px`) | `3.448vw` (`20px`), mb `3.448vw` (`20px`) |
| **404 `.errorTitle`** | `Doner Display`, `900`, `uppercase` | `13.75vw` (`220px`), lh `.78`, `.row` h `11.5625vw` (`185px`) | inherits `13.75vw` (`148.5px`) | inherits `13.75vw` (`79.75px`) |
| **Mobile Menu `.mainMenu`** | `Doner Display`, `900`, `uppercase` | hidden (`display: none`) | hidden (`display: none`) | `15.517vw` (`90px` / `60.5px`), lh `13.793vw` (`80px`), li `h: 11.897vw` |
| **Tags** (`.tags .tag`, `.itemIntro .tag`) | inherits body (`Doner Text`, `500`, original HTML casing e.g. `Freelance`) | inherits `0.875vw` (`14px`) | inherits `1.296vw` (`14px`) | inherits `3.448vw` (`20px`) |
| **Client Rows** (`.workBlock .clients .client`) | `Doner Text`, `500` | inherits `0.875vw` (`14px`) | `1.111vw` (`12px`) | `3.448vw` (`20px`) |
| **`.clientsBlock .clientWrapper`** | `Doner Text`, `500` | inherits `0.875vw` (`14px`) | inherits `1.296vw` (`14px`) | `2.241vw` (`13px` / `8.74px`), lh `1.5` |
| **`.awardCompany`** | `Doner Text`, `700` | `0.75vw` (`12px`) | `1.111vw` (`12px`) | `2.069vw` (`12px`) |
| **Tooltips** (`.label` / `.info` / `.toolTipIcon`) | `Doner Text` / `icomoon` | icon `.875vw` (`.small` `.625vw`); `.label` `.6875vw` (`11px`); `.info` `.875vw` (`14px`) | icon `1.296vw` (`.926vw`); `.label` `1.019vw`; `.info` `1.296vw` | icon `2.414vw` (`1.37931034vw`); `.label` `1.897vw`; `.info` `2.414vw` |
| **`.button` (default / `.primary` / `.secondary`)** | `Doner Text`, `500`, `uppercase` | `h/lh: 3.125vw` (`50px`), `p: 0 1.875vw` (`30px`), `radius: 3.125vw` | `h/lh: 4.63vw` (`50px`), `p: 0 2.778vw` (`30px`), `radius: 4.63vw` | `h/lh: 8.621vw` (`50px`), `p: 0 5.172vw` (`30px`), `radius: 8.621vw` |
| **`.button.small`** | `Doner Text`, `500`, `uppercase` | `h/lh: 2.125vw` (`34px`), `p: 0 1.25vw` (`20px`) | `h/lh: 3.14814815vw` (`34px`), `p: 0 1.852vw` (`20px`) | `h/lh: 6.897vw` (`40px`), `p: 0 3.448vw` (`20px`) |
| **`.button.wpcf7-submit`** | `Doner Display`, `500`, `uppercase` | `0.875vw` (`14px`), `min-w: 15vw` (`240px`), `radius: 1.5625vw!important` | `1.296vw` (`14px`), `min-w: 22.221vw`, `radius: 2.315vw!important` | `2.414vw` (`14px`), `min-w: 41.379vw`, `radius: 4.31vw!important` |
| **Form `input, textarea`** (`form .field`) | `Doner Display` (placeholder `#22264B`) | `2vw` (`32px`), `pb: .625vw`, `textarea h: 12.5vw` (`200px`), `.field mb: 2.1875vw`, `.submitField mt: -.9375vw` | `2.963vw` (`32px`), `pb: .926vw`, `textarea h: 18.519vw`, `.field mb: 3.241vw`, `.submitField mt: -1.389vw` | `5.517vw` (`32px`), `pb: 1.724vw`, `textarea h: 34.483vw`, `.field mb: 6.034vw`, `.submitField mt: -2.586vw` |

#### `.hugeTitle`, `.normalTitle[data-words]`, & Text Helpers
- **`.hugeTitle .row`**: `display: block; white-space: nowrap; padding: 0 .625vw; width: calc(100% + 1.25vw); margin-left: -.625vw; overflow: hidden` (`<=1080`: `.926vw`/`1.852vw`; `<=580`: `1.724vw`/`3.448vw`). `.row .line` starts at `margin-top: .875vw` (`<=1080`: `.74074074vw`, `<=580`: `.69vw`) and `transform: translateY(120%)`. Split via GSAP `SplitText` (`type: "lines, chars", charsClass: "letter", linesClass: "line", tag: "span"`) in Bundle `#17` (`99de7d96...js`), which explicitly sets each `.row`'s height to `.line` height (`$(el).find(".line").height()`).
- **`.normalTitle[data-words]`**: Split via GSAP `SplitText` (`type: "lines, words", wordsClass: "word", linesClass: "line", tag: "span"`). `.line` uses `display: flex!important; justify-content: space-between; overflow: hidden; padding: 0 .625vw; margin-left: -.625vw` (`<=1080`: `.926vw`; `<=580`: `1.724vw`) to justify-stretch words edge-to-edge (e.g., `"a wwward s"` on About)! `.word` starts at `margin-top: .125vw; transform: translateY(3.75vw)` (`<=1080`: `.185vw` / `5.556vw`; `<=580`: `.345vw` / `10.345vw`).
- **`.contentWrapper` containers**:
  - Default: `margin: 0 auto; padding: 0 2.5vw` (`<=1080`: `0 3.704vw`; `<=580`: `0 5.172vw`)
  - `.small`: `padding: 0 10.5vw` (`<=1080`: `0 14.815vw`; `<=580`: `0 5.172vw`)
  - `.smaller`: `padding: 0 25vw` (`<=1080`: `0 14.815vw`; `<=580`: `0 5.172vw`)
- **Section spacing** (`html .blocks section`): `margin: 10vw 0` (`<=1080`: `14.814vw 0`; `<=580`: `27.586vw 0`); `:first-child`: `margin-top: 0; padding-top: 5.625vw` (`<=1080`: `8.333vw`; `<=580`: `22.414vw`). Also `html .text.justify` switches to `text-align: left` at `<=580px`.

---

## 4. Layout & Grid Specifications by Header, Footer & Section Block

### 4.1 `<header>`, `.menuContainer`, `.menuIcon` & `.hamburgerMenu`
- **Desktop / Tablet `<header>`**:
  - `.headerBar`: `height: 5.625vw; position: fixed; top: 0; left: 0; width: 100vw; z-index: 10; line-height: 5.625vw; opacity: 0; pointer-events: none; transform: translateY(-3.125vw)` (`<=1080`: `height/lh: 8.333vw; translateY(-4.63vw)`). Revealed by GSAP (Bundle `#22` — `af13832d23590ae87441d952dc2bb8f8.js`, `y: 0, opacity: 1`) after preloader delay (`2300ms` home / `600ms` other routes).
  - Inside `.headerBar .contentWrapper`, 3 inline-block columns (`vertical-align: top`):
    - Desktop: `.left`, `.center`, `.right` all `33.3333%` (`<=1080`: `30%` / `40%` / `30%`).
    - `.left .logo`: `width: 4.8125vw; margin-top: 1.25vw` (`<=1080`: `7.13vw; mt: 1.852vw`) housing animated 4-frame `<svg viewBox="0 0 189 117" class="MVLogo">`.
    - `.center .menuContainer`: `display: inline-block; vertical-align: middle; padding: 1.25vw 1.875vw; border-radius: 1.875vw; height: 3.125vw; overflow: hidden; position: relative; pointer-events: all` (`<=1080`: `p: 1.852vw 2.778vw; radius: 2.778vw; h: 4.63vw`).
      - `.background`: `position: absolute; inset: 0; width: 100%; height: 100%; background: #fff0; transition: background 0.3s ease-out`. On scroll (Bundle `#22` — `af13832d...js`), GSAP dynamically updates inline `backdrop-filter: blur(0..25px)` (`currentScrollY / 2` capped at `25px`).
      - `.innerContainer li`: `display: inline-block; float: left; padding: 0 .625vw; line-height: .875vw; text-transform: uppercase; position: relative`. `li:after` is `width: 1px; height: 0; background: #F7A026; opacity: .2; right: 0; top: 0` (grows to `height: 100%` when `header.scrolled/sticky`). `li a:before` is `height: 1px; width: 0; bottom: .0625vw; right: 0; left: auto; background: #22264B` — expands `left: 0; width: 100%` on `:hover` or `li.active` (`li.active` sets `pointer-events: none`).
    - `.right` socials: `text-align: right`, `a { font-size: 1.25vw; margin-right: .625vw }` (`<=1080`: `1.852vw; mr: .926vw`).
  - **Scroll & Inversion States**:
    - `header.scrolled` (toggled when `currentScrollY > .headerBar.height() / 3`, while `.left`/`.right` translate up by `-currentScrollY`) / `header.sticky` (static legacy fallback selector): sets `.center` & nav links & underline `:before` to `#F7A026`, `.menuContainer .background` to `rgb(0 0 0 / .3)`, and `li:after` height to `100%`.
    - `header.secondary` (over `.setPrimaryBackground` sections): switches logo SVG `path`/`rect` fill, `.center`, nav links, `:before`, and `.right a` to `#F7A026`.
- **Mobile (`<= 580px`) Header, `.menuIcon` & `.hamburgerMenu`**:
  - `.headerBar`: switches to `position: absolute` (scrolls away with page), `height/lh: 22.414vw; translateY(-8.621vw)`; `.left .logo` `width: 15.517vw; mt: 5.172vw`; `.center` (`display: none`); `.right` `width: 33.3333%; text-align: center`, `a { font-size: 4.138vw; mr: 3.448vw }`.
  - `.menuIcon` (`display: none` above `580px`): `display: block; position: fixed; top: 3.621vw; left: 81.034vw; width: 13.793vw; height: 13.793vw; background: #22264B; z-index: 50; cursor: pointer; opacity: 0; translateY(-3.448vw)` (`.active` brings it to `opacity: 1; translateY(0)`). Features 4 corner/edge sliding border bars (`.menuIcon:before`, `:after`, `.hamburger:before`, `.hamburger:after`, `0.862vw` thick) driven by `@keyframes animBarFirst..Fourth` (`4s infinite linear` staggered `1s/3s/2s/4s`). Hover shifts to `#F7A026` bg + `#22264B` bars; `header.secondary .menuIcon` & `header.open .menuIcon` invert to `#D7C6AD` bg + `#22264B` bars. Inside `.bars` (`w: 5.172vw; h: 3.448vw`), 3 horizontal `2px` `.bar` lines cross to X (`rotate(45deg)` / `width: 0` / `rotate(-45deg)`) when `.open`.
  - `.hamburgerMenu`: `position: fixed; inset: 0; width: 100vw; height: 100%; z-index: 49; opacity: 0; pointer-events: none` (visible when `header.open`). Center-aligned vertically via `.menuContainer { top: 50%; transform: translateY(-50%); padding: 22.414vw 0 }`: `.mainMenu li` (`height: 11.897vw; overflow: hidden; mb: 3.448vw`, links `#F7A026`, `.active` `#D7C6AD`, slide in from `translateY(12.069vw)` staggered `0.3s, 0.35s, 0.4s, 0.45s`), `.socials` (`pt: 5.172vw; delay .9s`), and `.drawTextContainer` (`width: 40.345vw; mt: 5.172vw`, `<svg viewBox="0 0 2908.78 992.02">`, stroke `#F7A026`, `stroke-width: 20px`).

### 4.2 `<footer>` (`.setPrimaryBackground`)
- Outer padding `1.25vw 0` (`<=1080`: `1.852vw 0`; `<=580`: `3.448vw 0 13.793vw`), `color: #F7A026`, `z-index: 2` (inside `#pageContainer`).
- `.divider`: `height: 1px; background: #F7A026; width: 0 -> 100%` when `.inview`; `mb: 1.25vw`.
- `.topFooter` (omitted on `/404`):
  - `.canvasContainer`: centered behind text (`left: 50%; transform: translateX(-50%); top: -7.5vw; w: 31.25vw; h: 41.875vw` | `.smaller` on work/about/contact/project: `h: 34.375vw; top: -1.25vw` | `<=1080`: `46.297vw × 62.037vw; top: -9.722vw` & `.smaller`: `h: 50.927vw; top: -1.852vw` | `<=580`: `68.965vw × 92.414vw; top: -19.483vw` & `.smaller`: `h: 75.862vw; top: -3.448vw`). Note `.topFooter .contentWrapper` has `pointer-events: none` (with `a { pointer-events: all }`) so hover events reach the WebGL bird behind!
  - `.tags` marquee (`mb: 4.375vw` | `6.481vw` | `13.793vw`), `.bigTitle` (`"C" "ON" "NECT"`, where `.row { display: inline-block; vertical-align: top; overflow: hidden }` — unlike `.hugeTitle .row { display: block }` — keeping all 3 chunks on one horizontal baseline across breakpoints; `.row:first-child w: 12.5vw`, `:nth-child(2) ml: 20.75vw`, `:last-child float: right; ml: 0`), `.textColumns` (`mb: 8.4375vw` -> col widths `8vw` / `16vw` / `15vw (ml: 32vw)` / `16vw (ml: 8vw, right-aligned)` | `<=1080`: `10% / 40% / 20% / 30%` | `<=580`: col 1 hidden, cols 2–4 `100%` centered).
- `.copyFooter` (`mt: -1.5vw`; `.smaller` on `/404`: `mt: -2.625vw` | `<=1080`: `-2.222vw` / `-3.889vw` | `<=580`: `-4.138vw` / `-7.241vw`):
  - 3 inline-block bottom-aligned `33.3333%` columns (`<=580`: all `100%` centered): `.left .socials`, `.center` (`.drawTextContainer` `w: 14.625vw; mb: 2.5vw` + `.logo` `.MVLogo` `w: 4.8125vw`), `.right .text`.

### 4.3 Home Route (`/`) Blocks
1. **`.homeHeaderBlock`** (`data-scroll-inview`):
   - `.intro`: centered `<h1 class="hugeTitle">` (`Mees` / `Verberne` with `data-letters` + `data-scroll-speed="6"/"3"`), `.tags` (`Freelance + Creative + Developer + Designer +` inside `.marqueeWrapper` > `.marquee`).
   - `.columns` (`min-height: 41.875vw; mt: 1.25vw` | `<=1080`: `62.037vw` | `<=580`: `pb: 17.241vw`, absolute positioning yields to stacked/offset layout):
     - `.lines`: 4 `.lineAnim` markers at `(left:0, top:5.9375vw)`, `(right:0, top:5.9375vw)`, `(left:0, top:30vw)`, `(right:0, top:30vw)` (`<=580`: `.lines { display: none }`).
     - `.canvasContainer` (centered hero bird `#bird-v2.jpg` -> `#pageCanvas`): `w: 31.75vw; h: 41.875vw; left: 50%; translateX(-50%)` (`<=1080`: `w: 47.036vw; h: 62.037vw; ml: -12.037vw` shifted left; `<=580`: `w: 87.584vw; h: 115.517vw; left: -48.276vw`). `.innerCanvas.loadCanvasHeaderBlock` starts with `background: rgb(0 0 0 / .05)` and transitions to `#fff0` on `.hide`.
     - `.barCode`: `left: 0; top: 13.75vw; width: 11.875vw` (`<=1080`: `left: 3.704vw; bottom: 3.704vw; w: 17.593vw`; `<=580`: `position: relative; left: 25.862vw; w: 60.345vw`).
     - `.extraInfo`: `left: 16vw; top: 26.125vw; width: 11.875vw` (`<=1080`: `left: 3.704vw; top: 5.556vw; w: 17.593vw`; `<=580`: `display: none`).
     - `.contentContainer`: `left: 57.75vw; top: 3.75vw; width: 23.5vw` (`<=1080`: `right: 0; top: 5.556vw; w: 33.334vw`; `<=580`: `pl: 25.862vw; pt: 12.069vw; pr: 3.448vw; w: 100%`) containing `.mTag` (`"M./"`), `.drawText` (`w: 27.5vw; translateX(-7.8125vw); mt: -1.5vw; svg viewBox="0 0 3896.29 1133.38"`), and `.text.justify` (3 `<p>`, last `<p>` hidden on `<=580`).
     - `.location`: `right: 0; top: 16vw; width: 8.25vw; text-align: right` (`display: none` at `<=1080` and `<=580`).

2. **`.workFeaturedBlock`** (also reused at bottom of Project pages with `.bigTitle.smaller` for `"N" "E" "XT"`):
   - `.intro` (`mb: 2.5vw`): `.left` (`16vw`, `.blockAnimWrapper.style-1-anim`), `.bigTitle` (`71vw`, with `.row { display: inline-block; vertical-align: top; overflow: hidden }` across desktop/tablet/mobile — unlike `.hugeTitle .row { display: block }` — keeping `"W" "O" "RK"` and `"N" "E" "XT"` on one horizontal baseline; `.row:first-child w: 12.5vw`, `:nth-child(2) ml: 20.75vw`, `:last-child float: right; ml: 0`), `.right` (`8vw`, `.blockAnimWrapper.style-2-anim`). (`<=1080`: `10% / 80% / 10%`, `.smaller`: `70%`; `<=580`: `15% / 85%`, `.right` hidden, `.smaller`: `100%`).
   - `.items` (`width: calc(100% + 1vw); margin-left: -.5vw`):
     - Default `.item`: `width: calc(100% - 1vw); margin: 0 .5vw 10vw`.
     - `.item.half`: `calc(50% - 1vw)` (`<=580`: `calc(100% - 2.759vw)`).
     - `.item.bigger`: `width: 63vw` (`<=1080`: `calc(70% - 1.481vw)`) with `.canvasContainer { height: 47.25vw }` (`<=1080`: `51.759vw`), paired inline with `.contentContainer.smaller` (`width: 31vw`, `<=1080`: `calc(30% - 1.481vw)`).
     - `.item.extraPadding`: `width: calc(50% - 9vw); margin-left: 8vw` (`<=1080`: `calc(50% - 5.37vw); ml: 4.63vw`), containing absolutely-positioned `.blockAnimWrapper` (`left: -8vw; top: 2vw`, hidden `<=1080`) and `.canvasContainer { height: 29.25vw }`.
     - Modifiers: `.smallMarginBottom` (`mb: 1.25vw`), `.positionTop` (`mt: 14.375vw`), `.noMargin` (`mb: 0`).
     - `.canvasWrappers` (`calc(100% + 1vw); ml: -.5vw`) houses 2 side-by-side `calc(50% - 1vw)` `.canvasContainer`s (`height: 35.25vw` | `<=1080`: `36.389vw` | `<=580`: `71.724vw`, where `:nth-child(2)` is `display: none`!). `.canvasWrappers.single .canvasContainer.full` spans `100%`.
     - **`.itemIntro.style-*` column math (Desktop `12-col` grid inside item)**:
       - `style-1` (5 parts over 95vw item): `8vw | 15vw | 49vw (center) | 15vw | 8vw (right)`
       - `style-2` (4 parts over 47vw half item): `8vw | 8vw (right) | 23vw (center) | 8vw (right)`
       - `style-3` / `style-4` (3 parts over 39vw extraPadding item): `8vw | 23vw (center) | 8vw (right)`
       - `style-5` (4 parts over 63vw bigger item): `8vw | 16vw | 15vw (center) | 24vw (right)`
       - `style-5-2` (3 parts over 63vw bigger item — used on Project "NEXT"): `24vw | 15vw (center) | 24vw (right)`
       - `style-5-3` (4 parts over 63vw): `16vw | 16vw | 15vw (center) | 16vw (right)`
       - `style-5-4` (5 parts over 63vw): `16vw | 8vw | 15vw (center) | 8vw (right) | 16vw (right)`
       - `style-6` (5 parts over 95vw highlight item): `15vw | 16vw | 33vw (center) | 16vw (right) | 15vw (right)`
       - At `<=1080px`: evenly divided (`20%` for 5 parts, `25%` for 4 parts, `33.3333%` for 3 parts).
       - At `<=580px`: desktop `.itemIntro` sets `display: none` and `.itemIntro.resp` (`display: block`) activates a `.marqueeWrapper > .marquee` horizontal ticker!
     - Inline `.contentContainer` (between item 02 & 03: `w: calc(50% - 1vw); pl: 8vw; mt: 2vw` with `.normalTitle` + `.text.bigContainerText { pl: 16vw; mt: 5vw }`) and `.contentContainer.smaller` (between item 05 & 06: `w: 31vw`, bird `.canvasContainer` `15vw × 15vw`, `.lineAnim { right: 0 }`, `.drawTextContainer { left: 10.625vw; top: 5vw; width: 10.375vw }`; hidden on `<=580` with `.hideResp`).
     - `.titleWrapper` (`mt: 1.5625vw`): `.num` (`w: 1.875vw; mt: .25vw`), `.textTitle` (hover underline `:before` grows from right to left), `.toolTipIcon`.
     - `.buttons` (`mt: 5vw`): `.left` (`8vw`, `.style-1-anim`), `.buttonWrapper` (`79vw`, `.button.full.icon`), `.right` (`8vw`, `.style-3-anim`).

3. **`.clientsBlock.setPrimaryBackground`**:
   - `padding: 5vw 0!important; margin: 0!important; color: #F7A026` (`<=1080`: `7.407vw 0!important`; `<=580`: `13.793vw 0!important`).
   - `.intro` (`mb: 5vw`): `.left` (`8vw`, `.blockAnimWrapper.style-4-anim.secondary` — hidden `<=1080`, `10%` wide at `<=580`), `.bigTitle` (`87vw`, `"CLI" "ENTS"`), `.centerContent` (`position: absolute; top: 50%; left: 50%; translate(-50%,-50%); width: 20.3125vw` — hidden `<=580`, housing 2 animated height-reveal laurel SVGs `leftIcon`/`rightIcon` `viewBox="0 0 40 159"`, width `2.5vw`, height `0 -> 9.875vw`).
   - `.textColumns` (`p: 0 8vw; mb: 5vw`): 4 columns `16vw` (`pr: 8vw`) / `24vw` (`pr: 1vw`) / `24vw` / `15vw` (`pl: 8vw`, rotating `+`).
   - `.clients` (`p: 0 8vw; mb: 3.125vw; w: calc(100% + 1.875vw); ml: -.9375vw; text-align: center`): wraps alternating `.quoteTitle` featured clients & `.row` comma-separated regular clients inside `.clientWrapper` (`margin: 0 .9375vw`, staggered `0.15s..1.15s` `nth-child(1..21)` reveal delays!), bordered bottom-left & bottom-right by `#F7A026` `.lineAnim`s. Hovering `.client.hover` reveals `#F7A026` underline (`bottom: .1875vw`) + `.toolTipIcon.small` `.toolTipWrapper.light` (`#F4F4F4` bg, `#22264B` ink); disabled (`pointer-events: none` / tooltips hidden) on `<=580px` & `html.touch`.

### 4.4 Work Route (`/work/`) — `.workBlock`
- Starts `opacity: 0` (`.inview { opacity: 1 }`).
- `.intro`: centered `<h2 class="bigTitle">` (`"Work"`).
- `.items.featured`: 2-up grid `width: calc(50% - 1vw); mb: 10vw` (`<=1080`: `mb: 7.407vw`; `<=580`: `100%`) with `.canvasContainer` `height: 35.25vw` (`36.389vw` | `71.724vw`).
- `.items` (regular): 3-up grid `width: calc(33.3333% - 1vw); mb: 5vw` (`<=1080`: **2-up** `calc(50% - 1.481vw)`; `<=580`: **1-up** `calc(100% - 2.759vw)`), `.canvasContainer` `height: 23.25vw` (`36.389vw` | `71.724vw`).
- **`.workBlock` `.itemIntro` widths** (scaled down to fit `47vw`/`31vw` cards — note different math from `.workFeaturedBlock`!):
  - `style-1`: `8 | 8 | 15 | 8 | 8` | `style-2`/`style-3`: `16 | 15 | 16` | `style-4`: `8 | 16 | 15 | 8` | `style-5`: `8 | 15 | 16 | 8` | `style-6`: `8 | 15 | 8`
  - `<=1080`: `20%` (`style-1`), `25%` (`style-4, style-5`), `33.3333%` (`style-2, style-3, style-6`); `<=580`: `.itemIntro.resp` marquee.
- `.clients`: 2 equal columns `calc(50% - 1vw); margin: 0 .5vw; border-top: 1px solid #22264B` (`<=580`: stacked 1-up, removes duplicate middle border on `:first-child .client:last-child`). Each `.client` row (`padding: 1.375vw 0 1.25vw; border-bottom: 1px solid #22264B`) animates a `#22264B` `:before` bottom-up background curtain (`height: 0 -> 100%`), shifts `.clientTitle` `pl: 1vw`, `.year` `pr: 1vw`, and switches text & cross icon to `#F4F4F4`. Columns inside row: `.clientTitle` (`16vw`), `.type` (`23vw`: `7vw + 9vw icon + 7vw`), `.year` (`8vw`, right).

### 4.5 About Route (`/about/`) — `.aboutHeaderBlock`, `.aboutBlock`, `.servicesBlock`, `.awwwardsBlock`
1. **`.aboutHeaderBlock`**:
   - Centered `<h1 class="hugeTitle">` (`About` / `<span class="left"><span class="innerText">ME</span></span><span class="right"><span class="innerText">ES</span></span>`), `.animatedText` (`position: absolute; bottom: .75vw; left: 50%; translateX(-50%); width: 22.9375vw; height: 12.9375vw` | `<=1080`: `33.982vw × 11.019vw; bottom: 1.111vw` | `<=580`: relative flow, `w: 100%; mt: 6.897vw`) centered in the split gap of `"ME ES"`, followed by `.tags` marquee.
2. **`.aboutBlock`** (`min-height: 44.375vw` | `65.741vw` | `122.414vw`):
   - `.intro`: `.drawText` (`w: 27.5vw; mt: -3.4375vw` | `<=1080`: `40.741vw; mt: -7.87vw` | `<=580`: `75.862vw; mt: -14.655vw`, `#F7A026` SVG stroke `viewBox="0 0 3896.29 1133.38"`) layered over full-width `.canvasContainer` (`top: 3.4375vw; h: 40.875vw`, `#bird-about-v3.jpg` with `data-biggerGrid="true"`).
   - `.introText` (`mt: 11.25vw; p: 0 8vw`): 2 cols (`8vw` `"M./"` + `15vw` bio blurb; `<=580`: `20%` / `80%`, `mt: 41.379vw; p: 0`).
   - `.aboutContent` (`mt: 8.125vw; p: 0 8vw`): `.normalTitle` (`w: 39vw`, `"Since 2015..."`, `[data-words][data-scroll-words][data-words-fast="true"]`) + `.textRows` (`w: 40vw; pl: 17vw`), housing 2 `.textContainer`s (`mb: 13.75vw`) with rotating `+` icon at `left: -8vw` and 2 `.lineAnim` markers (`left: -64vw` & `right: -8vw`, hidden `<=580`).
3. **`.servicesBlock`**:
   - `.tableHeader`: `.blockAnimWrapper.style-2-anim` at `top: -6.25vw` (`<=1080`: `-9.259vw`; `<=580`: `-17.241vw`), header `.cols` (`48vw | 39vw | 8vw` -> `<=1080`: `50% | 40% | 10%` -> `<=580`: `100%`, cols 2–3 hidden), `.divider` (`1px solid #22264B`, `width: 0 -> 100%`).
   - `.services .service` (`p: 1vw 0`): 3 columns `8vw` (`01..04`) | `39vw` (`.textTitle`, `pr: 7vw`) | `40vw` (`.text.justify`, `pl: 1vw`) -> `<=1080`: `10% | 40% | 50%` -> `<=580`: stacked `100%` (`p: 6.897vw 0`). Hover sweeps `#22264B` `:before` overlay bottom-up (`height: 0 -> 100%`), shifts text to `#F4F4F4`, and indents column padding by `1vw` (`1.481vw` | `3.448vw`).
4. **`.awwwardsBlock`**:
   - `.cols` (`p: 0 8vw` | `<=1080/580`: `0`): 2 equal `39vw` columns (`<=1080`: `50%`; `<=580`: `100%`). Col 1 holds justified `.normalTitle` (`"a wwward s"`) + `.text.justify` (`mt: 1.875vw; pl: 16vw`); Col 2 (right-aligned) renders `.awwwardsLogo` (`w: 4.1875vw` | `6.204vw` | `11.552vw`, `viewBox="0 0 68 49"`) + circular flickering `.dot` (`1vw × 1vw` | `1.481vw` | `2.759vw`, `#22264B`, `animation: flicker 2s infinite linear`).

### 4.6 Contact Route (`/contact/`) — `.contactBlock`
- `.intro`: `<h1 class="hugeTitle">` (`Contact`) + `.tags` marquee.
- `.cols` (`mt: 5vw`): 4 inline-block columns (`24vw` | `16vw` | `39vw` | `16vw` | `<=1080`: `28% | 22% | 35% | 15%`):
  - **Col 1** (`mt: 9.375vw`): intro text (`pr: 9vw`) + `15vw × 15vw` bird `.canvasContainer` with `.drawTextContainer` (`w: 10.375vw; left: 10.625vw; top: 5vw`) — `.canvasContainer` hidden at `<=580`.
  - **Col 2**: address + `mailto:` + `tel:` links + rotating `.barCode` (`w: 11.875vw`). At `<=580px`, `.cols` switches to `display: table` and Col 2 switches to **`display: table-footer-group`** (pushing it below the form), hiding `<p>:first-child` and `.barCode`.
  - **Col 3 (`.formWrapper`)**: WordPress Contact Form 7 (`#wpcf7-f306-o1`) with 3 `.field` rows + `.submitField` (`input.button.secondary.wpcf7-submit`, `value="Send"`). Hides `.wpcf7-not-valid-tip`, `.wpcf7-spinner`, `.wpcf7-response-output` (`display: none!important`). On submit success (Bundle `#29` — `016ab4f503fc25b445905c93d242b9fd.js`), `.formWrapper.submitted` fades `form` to `opacity: 0` (`pointer-events: none`) and reveals absolutely-positioned `.successMessage` (`padding: 1.875vw; background: #22264B; color: #F7A026`).
  - **Col 4**: `.blockAnimWrapper.style-1-anim` (`mb: 8.125vw`) + `.location` coordinates (`hidden <=580`).

### 4.7 Project Case-Study Blocks (`/project/<slug>/`)

| Block | Layout & Sizing (`Desktop` -> `<=1080` -> `<=580`) | Key Child Selectors & Behavior |
| --- | --- | --- |
| **`.projectHeaderBlock`** | `mb: 2.5vw!important` (`3.704vw` \| `6.897vw`). Starts inactive until `.active`: `.hugeTitle` -> `opacity: 1`, `.divider` `w: 0 -> 100%` | `.tags.style-4` (`16\|24\|15\|24\|16`), `.style-3` (`16\|24\|15\|40`), `.style-2` (`40\|15\|40`) -> `<=1080`: `20%`/`25%`/`33.3333%` -> `<=580`: switches to `.tags.resp` marquee. `.projectInfo` (`mt: 5vw`): `.info` (`72vw`, 3 `33.3333%` `.infoItem`s), `.year` (`7vw`), `.buttonWrapper` (`16vw`, `.button.small.primary`) + top/bottom `1px #22264B` `.divider`. (`<=1080`: `.info` `100%`, `.year`/`.button` `50%`; `<=580`: `.infoItem` stacks `100%` with `.infoLabel { float: right }`). |
| **`.projectFullscreen169Block`** | `margin: 1vw 0!important` (`1.481vw` \| `2.759vw`) | `.imageWrapper { padding-bottom: 56.25%; opacity: 0 }` (16:9 box; `.inview` -> `opacity: 1`), absolute `.innerImage` + `.setVideoOnScroll video { object-fit: cover }`. |
| **`.projectTextBlock`** | Inside `.contentWrapper.smaller` (`p: 0 25vw`). `margin: 5vw 0!important` (`<=1080`: **`13.793vw 0!important`**! *See §7 quirk*). | `<h2 class="smallTitle">` (`mb: 1.25vw` -> `3.448vw`) + `.text.justify`, staggered fade-up `translateY(3.125vw -> 0)` (`0.15s` / `0.3s` delay) on `.inview`. |
| **`.projectImageTextBlock`** | `margin: 1vw 0!important` (`1.481vw` \| `2.759vw`). Media col `63vw` + `.textCol` `32vw` (`pl: 9vw`, or `.right` `pr: 9vw`) -> `<=1080`: `50%/50%` (or `.noText` `66.6666%` + `.noTextCol` `33.3333%`) -> `<=580`: `100%`, `.noTextCol { display: none }`. | `.imageWrapper { height: 47.25vw }` (`<=1080`: `36.389vw`; `<=580`: `67.758vw`) + `.smallTitle` (`0.3s` delay) + `.text` (`0.45s` delay). |
| **`.project5050Block`** | `margin: 1vw 0!important`. `.col:first-child` `48vw; pr: 1vw`, `.col:last-child` `47vw` -> `<=1080`: `calc(50% - 1.481vw)` -> `<=580`: `calc(100% - 2.759vw)`, col 1 `mb: 2.759vw`. | `.imageWrapper { height: 35.3125vw }` (`<=1080`: `36.389vw`; `<=580`: `71.724vw`), both fade in `0.6s 0.3s` on `.inview`. |
| **`.projectMobileBlock`** | `margin: 1vw 0!important`. 3 cards `calc(33.3333% - 1vw)`, `bg: #fff`, `h: 53.125vw` -> `<=1080`: `h: 55.554vw` -> **`<=580`: 2-up `calc(50% - 2.759vw)`, `h: 77.5845vw`, `:nth-child(3) { display: none }`**. | Centered rounded phone screen `.imageWrapper { w: 19.0625vw; h: 33.875vw; radius: 1.25vw }` (`<=1080`: `18.241vw × 32.408vw; r: 1.852vw`; `<=580`: `33.966vw × 60.345vw; r: 1.724vw`). Card fade delays: `0.15s / 0.3s / 0.45s`; inner screen delays: `0.45s / 0.6s / 0.75s`. |
| **`.projectAwardsBlock`** | Inside `.contentWrapper.small`. `margin: 5vw 0!important` (`7.407vw` \| `13.793vw`). Left col `56vw` (`.normalTitle`), right col `23vw` -> `<=1080`: `60% / 40%` -> `<=580`: `100% / 100%`. | `.award` (`mb: 1vw`): `.awardTitle` (`15vw`) + `.awardCompany` (`8vw`, `.75vw`, bold, center) framed by `.leftIcon` / `.rightIcon` (`w: .5vw`, `h: 0 -> 1.875vw` [`2.778vw` \| `5.172vw`] on `.inview`), `<svg viewBox="0 0 40 159">` filled `#22264B`. |

### 4.8 404 Page Architecture (`.errorBlock` & Dual-Layer `.copyErrorContent`)
1. `<div class="blocks primaryBackgroundFull">` + `<section class="errorBlock setPrimaryBackground">` fills viewport with `#22264B`.
2. `.copyErrorContent` contains `<div class="errorTitle">` with 5 rows (`Oops!` / `you've` / `reached` / `a dead` / `end`), `.errorCanvasWrapper.mouseTrigger`, `.buttonWrapper` (`Back to home` `.button.secondary`), and 2 `.tags` marquees (`top: 22.75vw` left & `.tags.second top: 45.875vw` right | `<=1080`: `25.37vw` / `48.334vw` | `<=580`: `24.138vw` / `80.69vw`).
3. **Z-Sandwich Cloning (Bundle `#30` — `52efc1a0d646e512ea4de645a9823d1e.js`)**: On page init, JS clones `.errorBlock .copyErrorContent` into `.backgroundContainer .errorCanvasContainer` (`z-index: 2`):
   - Inside `#pageContainer .errorBlock` (`z-index: 5`), CSS hides rows `1, 2, 4, 5` (`opacity: 0`) and `.tags` (`display: none`), leaving ONLY **row 3 (`reached`) and `.buttonWrapper`** floating **above** the WebGL bird!
   - Inside `.backgroundContainer .errorCanvasContainer` (`z-index: 2`), CSS hides **row 3 (`opacity: 0`)** and **`.buttonWrapper` (`opacity: 0!important; pointer-events: none!important`)**, rendering rows `1, 2, 4, 5` + `.tags` (`#D7C6AD`) **under** `.errorCanvasWrapper` (`z-index: 4; mix-blend-mode: lighten`)!

---

## 5. Canvas Containers, Primitives & Interactive Components

### 5.1 Canvas Wrappers & `.hide` / `.loaded` Lifecycle
- **`.backgroundContainer`** (`background: #D7C6AD`): `* { overflow: hidden; pointer-events: none!important }`. When `.backgroundContainer.inview` is added (Bundle `#32` — `5e03b684b5b5eab35e30f9697ec00018.js` at `2900ms` delay on `/` when `.homeHeaderBlock` is present, `900ms` on subpages):
  - `.backgroundCanvasWrapper` transitions `opacity: 0 -> .03` (`transition: opacity 2s 0.3s ease-out`), composited with `mix-blend-mode: difference` (`position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: 1`). **Mobile `<=580px` special rule**: `#backgroundCanvas { height: 100vh!important; filter: contrast(1.8) }`.
  - `.pageCanvasWrapper` transitions `opacity: 0 -> 1` (`transition: opacity 0.6s 0.3s ease-out; z-index: 3; position: absolute; width: 100vw; height: 100%`). `#pageCanvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; margin-top: -100px }` (100px vertical overscan for WebGL plane clipping).
- **`.loadCanvasWrapper`**: `position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: 14; pointer-events: none; opacity: 0`. `#loadCanvas { position: absolute; inset: 0; width: 100%; height: 100% }`.
  - **`.loaded` state class**: **Zero CSS rules target `.loaded`**! Added purely as a JS state flag on two targets: (a) `.loadCanvasWrapper` in Bundle `#34` (`a4f8a847df80d749ac94ca769463e2f3.js`) during transition/menu open/close, and (b) `.canvasContainer .innerCanvas:not(.loadCanvasHeaderBlock)` in Bundle `#33` (`bcc49c99cdb4543bfdd590f9dd0ab26d.js`) inside `ScrollTrigger` (`start: "0% 200%"`) as an idempotency guard so WebGL textures/videos load once.
- **`.errorCanvasWrapper`**: `position: absolute; top: 0; left: 0; width: 100vw; height: 64.0625vw; z-index: 4; mix-blend-mode: lighten; pointer-events: all; transition: opacity 0.6s ease-out` (`<=580`: `top: 25.862vw`). Holds `.innerCanvasFixed` and `.fixedCanvasWrapper` (`mix-blend-mode: lighten`, both `position: absolute; inset: 0; width: 100%; height: 100%`).
- **`.innerCanvas` & `.hide` state class**:
  - `.homeHeaderBlock .innerCanvas` & `.workBlock .innerCanvas` carry `background: rgb(0 0 0 / .05); transition: background 0.9s 0.3s ease-out`.
  - `.innerCanvas.hide { background: #fff0 }` (applied by Bundle `#33` [`bcc49c99...js`] to every `.innerCanvas` once WebGL/texture is initialized so the `5%` black placeholder backdrop clears seamlessly). (Also `.workFeaturedBlock .items .contentContainer.smaller.hideResp { display: none }` at `<=580px`).

### 5.2 `.marqueeWrapper` & `.marquee`
- Everywhere on desktop/tablet/mobile tags (`.homeHeaderBlock .tags`, `footer .tags`, `.aboutHeaderBlock .tags`, `.contactBlock .tags`, `.copyErrorContent .tags`, `.barCode a .marquee`):
  - `.marquee { white-space: nowrap; display: block }` (inside `.barCode`, adds `height: 4.3125vw` [`6.389vw` | `11.897vw`], `transform: translateX(0)!important` override at `<=580px`).
  - `.marquee .itemsContainer { display: inline-block }`.
  - **Mobile project card tags** (`.workFeaturedBlock .itemIntro.resp`, `.workBlock .itemIntro.resp`, `.projectHeaderBlock .tags.resp`, visible `<=580px`): wrapped in `.marqueeWrapper { display: block; opacity: 0; transition: opacity 0.45s ... }` -> `.marqueeWrapper.inview { opacity: 1 }`.
  - **JS runtime (Bundle `#20` — `4e5426368164583699d455d752d92a87.js`)**: Clones `.itemsContainer:first-child` 3 times into `.marqueeScroll` (4 copies total), animates GSAP `xPercent: -100` paused via ScrollTrigger (with `speed * 0.5` at `<=1080px`, `speed * 0.25` at `<=580px`, scroll-direction reversal, and `data-marquee-scroll-speed` scrub `x` parallax).

### 5.3 `.lineAnim`
- `.lineAnim`: `position: absolute; top: 0; left: 0; width: 2px; height: .875vw; opacity: 0; transition: opacity 0.3s 0.3s ease-out` (`<=1080`: `1.296vw`; `<=580`: `3.448vw`). `.inview { opacity: 1 }`.
- `.innerLine`: `position: absolute; inset: 0; width: 100%; height: 100%; background: #22264B` (`#F7A026` inside `.clientsBlock`), `will-change: transform; animation: line 2s infinite linear`.

### 5.4 `.blockAnimWrapper` & `.blockAnim` (2x2 Quadrant Loaders)
- Container: `1.75vw × 1.75vw` (`28px` | `<=1080`: `2.593vw` | `<=580`: `4.828vw`), `position: relative`.
- 4 quadrant children `.blockAnim`: `position: absolute; width: 50%; height: 50%; background: #22264B` (`.secondary .blockAnim` = `#F7A026` in `.clientsBlock`):
  - `:nth-child(1)` anchored bottom-right at center (`right: 50%; bottom: 50%`)
  - `:nth-child(2)` anchored bottom-left at center (`left: 50%; bottom: 50%`)
  - `:nth-child(3)` anchored top-right at center (`right: 50%; top: 50%`)
  - `:nth-child(4)` anchored top-left at center (`left: 50%; top: 50%`)
- 4 Choreography variants (`2s infinite linear`):
  - `.style-1-anim`: child 1 `height` (`0.6s`), child 2 `width-opacity` (`0s`), child 3 `display: none`, child 4 `width-reverse` (`0.3s`)
  - `.style-2-anim`: child 1/4 `display: none`, child 2 `width` (`0.3s`), child 3 `height-opacity` (`0s`)
  - `.style-3-anim`: child 1/4 `display: none`, child 2 `width-reverse` (`0.6s`), child 3 `height-reverse-opacity` (`0.3s`)
  - `.style-4-anim`: child 2 `display: none`, child 1 `width-reverse` (`1.2s`), child 3 `height-reverse-opacity` (`0.6s`), child 4 `height` (`0.9s`)

### 5.5 `.drawText` / `.drawTextContainer`, `.barCode`, `.textLink`, `.button`, `.toolTipIcon`
- **`.drawText` / `.drawTextContainer`**: Container holds inline `<svg>` with `.draw` paths/lines (`fill: none; stroke: #F7A026; stroke-linecap: round; stroke-linejoin: round; stroke-width: 20px`, `25px` on mobile `.homeHeaderBlock`), hidden at `opacity: 0` until GSAP `drawSVG` plays. Sizes:
  - Signature `"Mees Verberne"` (`viewBox="0 0 3896.29 1133.38"`): `.homeHeaderBlock` (`w: 27.5vw; translateX(-7.8125vw); mt: -1.5vw`), `.aboutBlock` (`w: 27.5vw; mt: -3.4375vw`).
  - Arrow/circle callout (`viewBox="0 0 1140.4 846.36"`): `.workFeaturedBlock` & `.contactBlock` bird card (`w: 10.375vw; left: 10.625vw; top: 5vw`).
  - Footer/Menu handwriting (`viewBox="0 0 2908.78 992.02"`): `footer` (`w: 14.625vw` | `21.667vw` | `40.345vw`), `.hamburgerMenu` (`w: 40.345vw`).
- **`.barCode`**: Wraps a `190×69` (`viewBox="0 0 190 69"`) SVG barcode filled `#22264B` inside `<a href="tel:+31628839393"> > .marqueeWrapper > .marquee` (`height: 4.3125vw` | `6.389vw` | `11.897vw`) + `.label` (`+31 (0)6 28839393`). Hover reduces anchor `opacity` to `.6`.
- **`.textLink`**: `color: #22264B` (`.secondary`: `#F7A026`); `:after` underline `height: 1px; width: 100%; bottom: .125vw` (`<=1080`: `.185vw`; `<=580`: `.345vw`); `:hover:after` collapses to `width: 0; left: auto; right: 0` (disabled on `html.touch`).
- **`.button`**: `border: 1px solid #22264B; color: #22264B; overflow: hidden; text-transform: uppercase`. Hover fills via `:before { width: 120%; height: 0 -> 100%; background: #22264B; z-index: -1 }` from bottom-up (`top: auto; bottom: 0`), flipping text to `#F4F4F4` (`.primary` starts pre-filled `#22264B` with `#fff` ink and un-fills on hover; `.secondary` omits `:before` and transitions `#F7A026/#fff` -> `#D7C6AD/#22264B`). `.button.icon .icon` (`w/h: .875vw` | `1.296vw` | `2.414vw`) hosts a `2px` `#22264B` (`#fff` on hover) cross rotating continuously (`rotate 4s infinite linear`). Hover effects are neutralised under `html.touch`.
- **`.toolTipIcon`**: Inline `.icon-quote` trigger (`z-index` local context, `.toolTipWrapper` `position: absolute; left: 50%; transform: translateX(-50%); bottom: 1.875vw -> 2.1875vw` on hover, `.small` `1.25vw -> 1.5625vw`; `max-width: 16.875vw`, `.3125vw` radius, `#22264B` bg / `#F4F4F4` ink or `.light` `#F4F4F4` bg / `#22264B` ink, rotated `-45deg` `.625vw` caret `:after`). Hidden in touch/hover-disabled contexts (`html.touch` on work/clients, `<=580px` on `.clientsBlock`).

---

## 6. Complete `@keyframes` Reference (All 19 Declarations)

| Keyframe | Scope / Status | Exact Stops & Usage |
| --- | --- | --- |
| `flicker` | Active | `0%, .9%, 5%, 9.9%, 15% { opacity: 1 } 1%, 4.9%, 10%, 14.9% { opacity: 0 }` — used on `.awwwardsBlock .dot` (`2s infinite linear`). |
| `line` | Active | `0% { height: 100%; bottom: 0; top: auto } 25% { height: 0 } 50% { height: 0; bottom: auto; top: 0 } 75% { height: 100% }` — used on `.lineAnim .innerLine` (`2s infinite linear`). |
| `rotate` | Active | `0% { transform: rotate(0deg) } 100% { transform: rotate(360deg) }` — used on all spinning `+` crosses (`4s infinite linear`). |
| `plusIcon` | **Unused** | `0%/50%/100% { width: 2px } 16.6666%/33.3333% { width: 100% }` (no CSS consumer). |
| `plusIconBar` | **Unused** | `0%/50%/100% { height: 100% } 16.6666%/33.3333% { height: 2px }` (no CSS consumer). |
| `rotateReverse` | **Unused** | `0% { transform: rotate(0deg) } 100% { transform: rotate(-360deg) }` (no CSS consumer). |
| `grain` | **Unused** | 10-step `translate()` jitter (`0%,100%` to `90%`), unreferenced in theme CSS (grain is instead WebGL/shader-rendered in `#backgroundCanvas`). |
| `animBarFirst` | `<=580px` Active | Left vertical edge bar of `.menuIcon` sliding top-to-bottom (`calc(100% - 1.724vw)` -> `0` -> `calc(100% - 1.724vw)`), `4s 1s infinite linear`. |
| `animBarSecond` | `<=580px` Active | Right vertical edge bar of `.menuIcon` sliding bottom-to-top, `4s 3s infinite linear`. |
| `animBarThird` | `<=580px` Active | Top horizontal edge bar of `.menuIcon` sliding right-to-left (note `25%/75%/100%` contain negative `height: -.862vw`), `4s 2s infinite linear`. |
| `animBarFourth` | `<=580px` Active | Bottom horizontal edge bar of `.menuIcon` sliding left-to-right, `4s 4s infinite linear`. |
| `blockAnim-height` & `blockAnim-height-opacity` | Active | `0%,70% { h: 0; opacity: 0 } 10% { h: 50%; opacity: 0 } 20%,50% { h: 50%; opacity: 1 (or .4) } 60% { h: 0; opacity: 1 (or .4) }` |
| `blockAnim-height-reverse` & `blockAnim-height-reverse-opacity` | Active | `0%,70% { h: 0; opacity: 0 } 10% { h: 0; opacity: 1 (or .4) } 20%,50% { h: 50%; opacity: 1 (or .4) } 60% { h: 50%; opacity: 0 }` |
| `blockAnim-width` & `blockAnim-width-opacity` | Active | `0%,70% { w: 0; opacity: 0 } 10% { w: 50%; opacity: 0 } 20%,50% { w: 50%; opacity: 1 (or .4) } 60% { w: 0; opacity: 1 (or .4) }` |
| `blockAnim-width-reverse` & `blockAnim-width-reverse-opacity` | Active | `0%,70% { w: 0; opacity: 0 } 10% { w: 0; opacity: 1 (or .4) } 20%,50% { w: 50%; opacity: 1 (or .4) } 60% { w: 50%; opacity: 0 }` |

---

## 7. Notable Quirks & Implementation Pitfalls to Watch During Rebuild

1. **Duplicate `@media (max-width: 1080px)` Bug in `.projectTextBlock`**: The production stylesheet (`e62857b0eb72a8ba3ce567f535e34351.css`) accidentally emits mobile rules in a *second* consecutive `@media all and (max-width:1080px)` block immediately after the tablet block (byte offsets `211,398` and `211,884`), causing `.projectTextBlock` on tablets (`581px..1080px`) to receive `margin: 13.793vw 0!important` and `.smallTitle { mb: 3.448vw; translateY(8.621vw) }` instead of `7.407vw` / `1.852vw` / `4.63vw`. For intentional responsive fidelity, keep the `580px` block under `<=580px`; for 1:1 pixel match at `581px..1080px`, note the live override.
2. **Inline-Block Whitespace Sensitivity**: Columns across `.headerBar`, `footer`, `.workFeaturedBlock`, `.workBlock`, `.servicesBlock`, `.awwwardsBlock`, `.contactBlock`, `.project*Block` use `display: inline-block` summing tightly to `95vw` (`100vw - 5vw` `.contentWrapper` padding) or `100%`. In JSX/React, any stray space between adjacent `<div className="col">` siblings will cause the last column to wrap onto a new row unless converted to CSS `grid`/`flex` with equivalent `vw` tracks or stripped of inter-element whitespace.
3. **Scroll-Coupled Canvas Clipping (`#pageCanvas`)**: WebGL media previews are NOT DOM `<img>` overlays over canvases — `.innerCanvas` is an empty measurement rect (eventually `.hide` -> `background: #fff0`) whose bounding box drives quads inside `#pageCanvas` (`margin-top: -100px; height: 100vh + 300px`), while `.innerCanvas video` uses `opacity: 0` because the `<video>` element is only a `THREE.VideoTexture` source!
4. **`.smallTitle` Styling Gap**: `.projectTextBlock` and `.projectImageTextBlock` use `<h2 class="smallTitle">`, which has no font-size/font-family rule of its own in CSS — it relies purely on inherited `Doner Text` body size (`0.875vw` / `1.296vw` / `3.448vw`) plus user-agent `<h2>` `font-weight: 700` (which matches `"bold"` even though `Doner Text` only ships `500` `.woff2` files, causing synthetic bold or `500` fallback depending on browser).
5. **`.setPrimaryBackground` 1px Anti-Seam**: `updatePrimaryBackgrounds()` sets `height: $(el).outerHeight() + 1` on `.primaryBackground` overlays so `#22264B` never shows a subpixel `#D7C6AD` line between `.clientsBlock` and `<footer>`.
