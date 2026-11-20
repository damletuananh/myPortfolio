"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const MOSAIC_VERTEX_SHADER = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const MOSAIC_FRAGMENT_SHADER = `
  precision mediump float;

  uniform vec2 u_mouse;
  uniform vec2 u_resolution;
  uniform float u_gridSize;
  uniform float u_strength;
  uniform float u_time;
  uniform sampler2D u_texture;
  uniform float u_randomValue;
  uniform vec2 u_aspect;
  uniform float u_hasTexture;
  varying vec2 vUv;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * u_randomValue);
  }

  vec2 applyObjectCover(vec2 uv, float planeAspect, float mediaAspect) {
    vec2 scale = vec2(1.0);
    if (mediaAspect > planeAspect) {
      scale.x = planeAspect / mediaAspect;
    } else if (mediaAspect < planeAspect) {
      scale.y = mediaAspect / planeAspect;
    }
    return (uv - 0.5) * scale + 0.5;
  }

  void main() {
    float safePlaneAspect = max(u_aspect.x, 0.001);
    float safeMediaAspect = max(u_aspect.y, 0.001);

    vec2 gridSize = vec2(u_gridSize, u_gridSize);
    vec2 gridCoord = floor(vUv * gridSize) / gridSize;
    vec2 gridCenter = gridCoord + 0.5 / gridSize;

    vec2 mouseDist = (u_mouse - gridCenter) * gridSize;
    vec2 aspectCorrection = safePlaneAspect >= 1.0
      ? vec2(1.0, 1.0 / safePlaneAspect)
      : vec2(safePlaneAspect, 1.0);

    float distToMouse = length(mouseDist * aspectCorrection);
    float effectStrength = 1.0 - smoothstep(0.0, u_gridSize * 0.4, distToMouse);

    vec2 offset = mouseDist * effectStrength * u_strength;

    vec2 distortedUv = vUv;
    if (abs(mouseDist.x * aspectCorrection.x) > abs(mouseDist.y * aspectCorrection.y)) {
      distortedUv.x += offset.x / gridSize.x;
    } else {
      distortedUv.y += offset.y / gridSize.y;
    }

    float randomness = random(gridCoord);
    float randomDelay = randomness * 1.0;
    float fadeInEffect = smoothstep(0.0, 1.0, u_time - randomDelay);

    distortedUv = clamp(distortedUv, vec2(0.0), vec2(1.0));
    vec2 coverUv = applyObjectCover(distortedUv, safePlaneAspect, safeMediaAspect);

    vec4 texColor = texture2D(u_texture, coverUv);
    vec3 rgb = mix(vec3(0.0), texColor.rgb, fadeInEffect);
    float alpha = fadeInEffect * u_hasTexture * texColor.a;

    gl_FragColor = vec4(rgb, alpha);
    #include <colorspace_fragment>
    if (texColor.a < 0.999) {
      gl_FragColor.rgb *= texColor.a;
    }
  }
`;

export interface MosaicUniforms {
  [uniform: string]: THREE.IUniform<unknown>;
  u_mouse: THREE.IUniform<THREE.Vector2>;
  u_resolution: THREE.IUniform<THREE.Vector2>;
  u_gridSize: THREE.IUniform<number>;
  u_strength: THREE.IUniform<number>;
  u_time: THREE.IUniform<number>;
  u_texture: THREE.IUniform<THREE.Texture>;
  u_randomValue: THREE.IUniform<number>;
  u_aspect: THREE.IUniform<THREE.Vector2>;
  u_hasTexture: THREE.IUniform<number>;
}

export function createMosaicUniforms(
  fallbackTexture: THREE.Texture,
  gridSize: number,
  resolutionW: number,
  resolutionH: number,
  planeAspect: number
): MosaicUniforms {
  return {
    u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
    u_resolution: { value: new THREE.Vector2(resolutionW, resolutionH) },
    u_gridSize: { value: gridSize },
    u_strength: { value: 0.0 },
    u_time: { value: 0.0 },
    u_texture: { value: fallbackTexture },
    u_randomValue: {
      value: 43758.5453123 + Math.random() * (103758.5453123 - 43758.5453123),
    },
    u_aspect: { value: new THREE.Vector2(Math.max(planeAspect, 0.001), 1.0) },
    u_hasTexture: { value: 0.0 },
  };
}

export function bindMosaicHover(
  hitTarget: HTMLElement,
  coordElement: HTMLElement,
  uniforms: MosaicUniforms
): () => void {
  let needsSnapOnEntry = true;
  let isStrengthRamping = false;
  let firstMoveDelayPending = true;
  let decayTween: gsap.core.Tween | null = null;

  const isTouchMode = () =>
    document.documentElement.classList.contains("touch");

  const onMouseEnter = () => {
    if (isTouchMode()) return;
    isStrengthRamping = false;
    firstMoveDelayPending = true;
  };

  const onMouseMove = (e: MouseEvent) => {
    if (isTouchMode()) return;
    const rect = coordElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const mouseX = (e.clientX - rect.left) / rect.width;
    const mouseY = 1.0 - (e.clientY - rect.top) / rect.height;

    const mouseDuration = needsSnapOnEntry ? 0 : 0.3;
    needsSnapOnEntry = false;

    const strengthDelay = firstMoveDelayPending ? 0.2 : 0;
    firstMoveDelayPending = false;

    if (decayTween) {
      decayTween.kill();
      decayTween = null;
    }

    if (!isStrengthRamping) {
      isStrengthRamping = true;
      gsap.to(uniforms.u_strength, {
        value: 0.8,
        duration: 0.6,
        delay: strengthDelay,
        ease: "power2.out",
        overwrite: true,
      });
    }

    gsap.to(uniforms.u_mouse.value, {
      x: mouseX,
      y: mouseY,
      duration: mouseDuration,
      ease: "power2.out",
      overwrite: true,
      onComplete: () => {
        isStrengthRamping = false;
        decayTween = gsap.to(uniforms.u_strength, {
          value: 0.0,
          duration: 0.6,
          delay: 0.3,
          ease: "power2.out",
          overwrite: "auto",
        });
      },
    });
  };

  const onMouseLeave = () => {
    needsSnapOnEntry = true;
    isStrengthRamping = false;
    firstMoveDelayPending = true;
    if (decayTween) {
      decayTween.kill();
      decayTween = null;
    }
    gsap.killTweensOf(uniforms.u_mouse.value);
    gsap.to(uniforms.u_strength, {
      value: 0.0,
      duration: 0.6,
      ease: "power2.out",
      overwrite: true,
    });
  };

  hitTarget.addEventListener("mouseenter", onMouseEnter, { passive: true });
  hitTarget.addEventListener("mousemove", onMouseMove, { passive: true });
  hitTarget.addEventListener("mouseleave", onMouseLeave, { passive: true });

  return () => {
    hitTarget.removeEventListener("mouseenter", onMouseEnter);
    hitTarget.removeEventListener("mousemove", onMouseMove);
    hitTarget.removeEventListener("mouseleave", onMouseLeave);
    if (decayTween) {
      decayTween.kill();
      decayTween = null;
    }
    gsap.killTweensOf(uniforms.u_mouse.value);
    gsap.killTweensOf(uniforms.u_strength);
  };
}

interface PagePlaneItem {
  element: HTMLElement;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  geometry: THREE.PlaneGeometry;
  material: THREE.ShaderMaterial;
  uniforms: MosaicUniforms;
  dispose: () => void;
}

export function PageCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const emptyTextureRef = useRef<THREE.DataTexture | null>(null);
  const scenesRef = useRef<PagePlaneItem[]>([]);
  const dimensionsRef = useRef({
    width: 1,
    height: 1,
    canvasHeight: 301,
  });
  const ensureLoopRef = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        precision: "mediump",
      });
    } catch {
      return;
    }

    rendererRef.current = renderer;
    renderer.setClearColor(0x000000, 0);

    const emptyTexture = new THREE.DataTexture(
      new Uint8Array([0, 0, 0, 0]),
      1,
      1
    );
    emptyTexture.needsUpdate = true;
    emptyTextureRef.current = emptyTexture;

    const applySize = () => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      const canvasH = h + 300;
      dimensionsRef.current = { width: w, height: h, canvasHeight: canvasH };

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, canvasH, true);
      renderer.setClearColor(0x000000, 0);
      renderer.setScissorTest(false);
      renderer.clear();

      for (const item of scenesRef.current) {
        item.uniforms.u_resolution.value.set(w, h);
      }
    };

    applySize();

    const syncScrollTransform = () => {
      canvas.style.transform = `translate3d(0, ${window.scrollY}px, 0)`;
    };
    syncScrollTransform();

    const onResize = () => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      const widthChanged = w !== dimensionsRef.current.width;
      const heightChanged = h !== dimensionsRef.current.height;
      const isTouchOnly = document.documentElement.classList.contains("touch");
      // Handle desktop height-only resizes cleanly while avoiding small mobile URL-bar jitter
      const isDesktopHeightResize = !isTouchOnly && w > 1080 && heightChanged;
      const isLargeHeightShift =
        Math.abs(h - dimensionsRef.current.height) > 160;

      if (widthChanged || isDesktopHeightResize || isLargeHeightShift) {
        applySize();
      }
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", syncScrollTransform, { passive: true });

    let isRunning = false;

    const renderFrame = () => {
      const scenes = scenesRef.current;
      if (scenes.length === 0) {
        renderer.setClearColor(0x000000, 0);
        renderer.setScissorTest(false);
        renderer.clear();
        gsap.ticker.remove(renderFrame);
        isRunning = false;
        return;
      }

      syncScrollTransform();

      const { width: vw, canvasHeight } = dimensionsRef.current;

      renderer.setClearColor(0x000000, 0);
      renderer.setScissorTest(false);
      renderer.clear();
      renderer.setScissorTest(true);

      for (const item of scenes) {
        if (
          item.uniforms.u_hasTexture.value < 0.5 ||
          item.uniforms.u_time.value <= 0.001
        ) {
          continue;
        }

        const rect = item.element.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;

        if (
          w <= 0 ||
          h <= 0 ||
          rect.bottom < -100 ||
          rect.top > canvasHeight - 100 ||
          rect.right < 0 ||
          rect.left > vw
        ) {
          continue;
        }

        const left = rect.left;
        const bottom = canvasHeight - (rect.bottom + 100);

        const scissorLeft = Math.max(0, left);
        const scissorBottom = Math.max(0, bottom);
        const scissorRight = Math.min(vw, left + w);
        const scissorTop = Math.min(canvasHeight, bottom + h);
        const scissorW = scissorRight - scissorLeft;
        const scissorH = scissorTop - scissorBottom;

        if (scissorW <= 0 || scissorH <= 0) {
          continue;
        }

        item.uniforms.u_aspect.value.x = w / h;

        renderer.setViewport(left, bottom, w, h);
        renderer.setScissor(scissorLeft, scissorBottom, scissorW, scissorH);
        renderer.render(item.scene, item.camera);
      }
    };

    ensureLoopRef.current = () => {
      if (!isRunning && scenesRef.current.length > 0) {
        isRunning = true;
        gsap.ticker.add(renderFrame);
      }
    };

    ensureLoopRef.current();

    return () => {
      gsap.ticker.remove(renderFrame);
      isRunning = false;
      ensureLoopRef.current = () => {};
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", syncScrollTransform);

      for (const item of scenesRef.current) {
        item.dispose();
      }
      scenesRef.current = [];

      emptyTexture.dispose();
      emptyTextureRef.current = null;
      renderer.dispose();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    const renderer = rendererRef.current;
    const emptyTexture = emptyTextureRef.current;
    if (!renderer || !emptyTexture) return;

    let cancelled = false;
    let rafHandle = 0;

    const teardownScenes = () => {
      for (const item of scenesRef.current) {
        item.dispose();
      }
      scenesRef.current = [];
      if (rendererRef.current) {
        rendererRef.current.setClearColor(0x000000, 0);
        rendererRef.current.setScissorTest(false);
        rendererRef.current.clear();
      }
    };

    const buildSceneForElement = (
      el: HTMLElement,
      navRevealOffset = 0
    ): PagePlaneItem => {
      let disposed = false;
      let videoBound = false;
      const triggers: ScrollTrigger[] = [];
      const ownedTextures: THREE.Texture[] = [];
      let createdVideoEl: HTMLVideoElement | null = null;
      let boundVideoEl: HTMLVideoElement | null = null;
      let bgObserver: MutationObserver | null = null;
      let revealFallbackTimer: number | null = null;

      const onVideoData = () => {
        if (disposed || videoBound || !boundVideoEl) return;
        if (
          boundVideoEl.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
          boundVideoEl.videoWidth <= 0
        ) {
          return;
        }
        videoBound = true;
        boundVideoEl.removeEventListener("loadeddata", onVideoData);
        boundVideoEl.removeEventListener("canplay", onVideoData);

        const vidTex = new THREE.VideoTexture(boundVideoEl);
        vidTex.colorSpace = THREE.SRGBColorSpace;
        vidTex.generateMipmaps = true;
        vidTex.minFilter = THREE.LinearMipmapLinearFilter;
        vidTex.magFilter = THREE.LinearFilter;
        ownedTextures.push(vidTex);

        uniforms.u_texture.value = vidTex;
        uniforms.u_aspect.value.y =
          boundVideoEl.videoWidth / Math.max(boundVideoEl.videoHeight, 1);
        uniforms.u_hasTexture.value = 1.0;
        el.classList.add("hide");
        triggerPendingReveal();
      };

      const onVideoError = () => {
        if (disposed) return;
        loadImageTexture(true);
      };

      const imageSrc =
        el.getAttribute("data-image-src") ??
        el.getAttribute("data-image") ??
        "";
      const respImageSrc =
        el.getAttribute("data-resp-image-src") ??
        el.getAttribute("data-resp-image") ??
        "";
      const videoSrc =
        el.getAttribute("data-video-src") ??
        el.getAttribute("data-video") ??
        "";
      const biggerGrid =
        (el.getAttribute("data-bigger-grid") ??
          el.getAttribute("data-biggerGrid")) === "true";
      const delayAttr = parseFloat(el.getAttribute("data-delay") ?? "0") || 0;
      const isHeaderHero = el.classList.contains("loadCanvasHeaderBlock");

      const rect = el.getBoundingClientRect();
      const { width: vw, height: vh } = dimensionsRef.current;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, 1, 1, 10);
      camera.position.z = 2.1;

      const geometry = new THREE.PlaneGeometry(2, 2, 50, 50);
      const uniforms = createMosaicUniforms(
        emptyTexture,
        biggerGrid ? 20.0 : 15.0,
        vw,
        vh,
        rect.width / Math.max(rect.height, 1)
      );

      const material = new THREE.ShaderMaterial({
        vertexShader: MOSAIC_VERTEX_SHADER,
        fragmentShader: MOSAIC_FRAGMENT_SHADER,
        uniforms,
        transparent: true,
        depthWrite: false,
      });

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const hitTarget =
        (el.classList.contains("mouseTrigger")
          ? el
          : el.closest<HTMLElement>(".mouseTrigger")) ?? el;
      const cleanupHover = bindMosaicHover(hitTarget, el, uniforms);

      let hasStartedLoad = false;
      let hasRevealed = false;
      let pendingReveal = false;
      let imageLoaded = false;

      const isAboveFold = isHeaderHero || rect.top < window.innerHeight * 0.95;

      const runRevealTween = () => {
        if (disposed || hasRevealed) return;
        hasRevealed = true;
        const navOffset = isAboveFold ? navRevealOffset : 0;
        gsap.to(uniforms.u_time, {
          value: 3.0,
          duration: 2.0,
          delay: 0.15 + delayAttr + navOffset,
          ease: "power1.out",
          overwrite: "auto",
        });
      };

      const triggerPendingReveal = () => {
        if (disposed || hasRevealed || !pendingReveal) return;
        if (uniforms.u_hasTexture.value < 0.5) return;
        runRevealTween();
      };

      const triggerReveal = () => {
        if (disposed || hasRevealed) return;
        if (uniforms.u_hasTexture.value < 0.5) {
          pendingReveal = true;
          return;
        }
        runRevealTween();
      };

      const textureLoader = new THREE.TextureLoader();

      const loadImageTexture = (asFallback = false) => {
        if (disposed || imageLoaded) return;
        const isCompact = window.innerWidth <= 1080;
        const chosenSrc =
          isCompact && respImageSrc
            ? respImageSrc
            : imageSrc || respImageSrc;
        if (!chosenSrc) return;

        imageLoaded = true;
        textureLoader.load(
          chosenSrc,
          (tex) => {
            if (disposed) {
              tex.dispose();
              return;
            }
            // If VideoTexture already took over, keep video unless fallback
            if (
              !asFallback &&
              (videoBound ||
                (boundVideoEl &&
                  boundVideoEl.readyState >=
                    HTMLMediaElement.HAVE_CURRENT_DATA &&
                  boundVideoEl.videoWidth > 0))
            ) {
              tex.dispose();
              return;
            }
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.generateMipmaps = true;
            tex.minFilter = THREE.LinearMipmapLinearFilter;
            tex.magFilter = THREE.LinearFilter;
            ownedTextures.push(tex);

            uniforms.u_texture.value = tex;
            const img = tex.image as HTMLImageElement | undefined;
            if (img && img.width && img.height) {
              uniforms.u_aspect.value.y = img.width / img.height;
            }
            uniforms.u_hasTexture.value = 1.0;
            el.classList.add("hide");
            triggerPendingReveal();
          },
          undefined,
          () => {
            imageLoaded = false;
          }
        );
      };

      const loadMedia = () => {
        if (disposed || hasStartedLoad) return;
        hasStartedLoad = true;
        el.classList.add("loaded");

        const shouldUseVideo = window.innerWidth > 1080 && Boolean(videoSrc);
        if (shouldUseVideo) {
          // Load poster image immediately so frame never flashes black while video buffers
          if (imageSrc) {
            loadImageTexture(false);
          }

          let videoEl = el.querySelector("video");
          if (!videoEl) {
            videoEl = document.createElement("video");
            videoEl.className = "playVideoCanvasOnScroll";
            videoEl.muted = true;
            videoEl.playsInline = true;
            videoEl.autoplay = true;
            videoEl.loop = true;
            videoEl.preload = "auto";
            videoEl.src = videoSrc;
            el.appendChild(videoEl);
            createdVideoEl = videoEl;
          } else {
            videoEl.muted = true;
            videoEl.playsInline = true;
            videoEl.loop = true;
            videoEl.preload = "auto";
            if (!videoEl.getAttribute("src") && !videoEl.currentSrc) {
              videoEl.src = videoSrc;
            }
          }

          boundVideoEl = videoEl;
          videoEl.addEventListener("loadeddata", onVideoData);
          videoEl.addEventListener("canplay", onVideoData);
          videoEl.addEventListener("error", onVideoError);

          if (videoEl.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            onVideoData();
          } else {
            videoEl.load();
          }

          videoEl.play().catch(() => {});

          const playTrigger = ScrollTrigger.create({
            trigger: el,
            start: "0% 120%",
            end: "120% 0%",
            onEnter: () => boundVideoEl?.play().catch(() => {}),
            onEnterBack: () => boundVideoEl?.play().catch(() => {}),
            onLeave: () => boundVideoEl?.pause(),
            onLeaveBack: () => boundVideoEl?.pause(),
          });
          triggers.push(playTrigger);
        } else {
          loadImageTexture(false);
        }
      };

      const scheduleRevealWhenBgReady = () => {
        const bgContainer = document.querySelector(".backgroundContainer");
        if (!bgContainer || bgContainer.classList.contains("inview")) {
          triggerReveal();
          return;
        }
        bgObserver = new MutationObserver(() => {
          if (bgContainer.classList.contains("inview")) {
            bgObserver?.disconnect();
            bgObserver = null;
            if (revealFallbackTimer !== null) {
              window.clearTimeout(revealFallbackTimer);
              revealFallbackTimer = null;
            }
            triggerReveal();
          }
        });
        bgObserver.observe(bgContainer, {
          attributes: true,
          attributeFilter: ["class"],
        });
        revealFallbackTimer = window.setTimeout(() => {
          bgObserver?.disconnect();
          bgObserver = null;
          triggerReveal();
        }, 3100);
      };

      if (isHeaderHero) {
        loadMedia();
        scheduleRevealWhenBgReady();
      } else {
        const loadTrigger = ScrollTrigger.create({
          trigger: el,
          start: "0% 200%",
          end: "0% 200%",
          once: true,
          onEnter: loadMedia,
          onEnterBack: loadMedia,
        });
        triggers.push(loadTrigger);

        const revealTrigger = ScrollTrigger.create({
          trigger: el,
          start: "0% 90%",
          end: "0% 90%",
          once: true,
          onEnter: scheduleRevealWhenBgReady,
          onEnterBack: scheduleRevealWhenBgReady,
        });
        triggers.push(revealTrigger);

        if (rect.top < window.innerHeight * 2.0) {
          loadMedia();
        }
        if (rect.top < window.innerHeight * 0.9) {
          scheduleRevealWhenBgReady();
        }
      }

      const dispose = () => {
        disposed = true;
        videoBound = false;
        cleanupHover();
        gsap.killTweensOf(uniforms.u_time);
        el.classList.remove("hide", "loaded");

        if (bgObserver) {
          bgObserver.disconnect();
          bgObserver = null;
        }
        if (revealFallbackTimer !== null) {
          window.clearTimeout(revealFallbackTimer);
          revealFallbackTimer = null;
        }

        for (const t of triggers) {
          t.kill();
        }

        if (boundVideoEl) {
          boundVideoEl.removeEventListener("loadeddata", onVideoData);
          boundVideoEl.removeEventListener("canplay", onVideoData);
          boundVideoEl.removeEventListener("error", onVideoError);
          boundVideoEl.pause();
          if (createdVideoEl) {
            createdVideoEl.removeAttribute("src");
            createdVideoEl.load();
            createdVideoEl.remove();
          }
          boundVideoEl = null;
          createdVideoEl = null;
        }

        for (const tex of ownedTextures) {
          tex.dispose();
        }
        geometry.dispose();
        material.dispose();
      };

      return {
        element: el,
        scene,
        camera,
        geometry,
        material,
        uniforms,
        dispose,
      };
    };

    const queryCanvasElements = () =>
      Array.from(
        document.querySelectorAll<HTMLElement>(
          ".innerCanvas:not(.errorCanvasWrapper .innerCanvas)"
        )
      ).filter(
        (el) =>
          el.getClientRects().length > 0 &&
          window.getComputedStyle(el).display !== "none"
      );

    const isSameElementList = (elements: HTMLElement[]) => {
      const existing = scenesRef.current;
      return (
        existing.length === elements.length &&
        existing.every((item, idx) => item.element === elements[idx])
      );
    };

    const rebuildScenes = (navRevealOffset = 0) => {
      if (cancelled) return;
      const elements = queryCanvasElements();

      if (isSameElementList(elements) && navRevealOffset === 0) {
        ScrollTrigger.refresh();
        ensureLoopRef.current();
        return;
      }

      teardownScenes();
      scenesRef.current = elements.map((el) =>
        buildSceneForElement(el, navRevealOffset)
      );
      ScrollTrigger.refresh();
      ensureLoopRef.current();
    };

    if (!document.documentElement.classList.contains("is-changing")) {
      rafHandle = requestAnimationFrame(() => rebuildScenes(0));
    }

    const onPageReady = (event: Event) => {
      cancelAnimationFrame(rafHandle);
      const detail = (
        event as CustomEvent<{ source?: string; revealOffset?: number }>
      ).detail;
      const navOffset =
        detail?.source === "nav"
          ? typeof detail.revealOffset === "number"
            ? detail.revealOffset
            : 0.35
          : 0;
      rebuildScenes(navOffset);
    };

    const pageContainer = document.getElementById("pageContainer");
    const domObserver = pageContainer
      ? new MutationObserver(() => {
          if (document.documentElement.classList.contains("is-changing")) {
            return;
          }
          if (isSameElementList(queryCanvasElements())) {
            return;
          }
          cancelAnimationFrame(rafHandle);
          rafHandle = requestAnimationFrame(() => rebuildScenes(0));
        })
      : null;

    domObserver?.observe(pageContainer!, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style"],
    });
    window.addEventListener("portfolio:page-ready", onPageReady);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafHandle);
      domObserver?.disconnect();
      window.removeEventListener("portfolio:page-ready", onPageReady);
      teardownScenes();
    };
  }, [pathname]);

  return (
    <div className="pageCanvasWrapper">
      <canvas ref={canvasRef} id="pageCanvas" />
    </div>
  );
}

export default PageCanvas;
