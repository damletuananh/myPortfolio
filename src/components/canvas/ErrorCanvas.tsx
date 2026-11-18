"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import * as THREE from "three";
import gsap from "gsap";
import { NOT_FOUND_BIRD_MEDIA } from "@/data/portfolio";
import {
  MOSAIC_FRAGMENT_SHADER,
  MOSAIC_VERTEX_SHADER,
  bindMosaicHover,
  createMosaicUniforms,
} from "./PageCanvas";

function detect404Active(): boolean {
  if (typeof document === "undefined") return false;
  return Boolean(
    document.querySelector(
      ".errorBlock, .errorCanvasTriggerHost, .errorCanvasWrapper .innerCanvas"
    )
  );
}

export function ErrorCanvas() {
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let rafId = 0;
    const sync = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const next = detect404Active();
        setIsActive((prev) => (prev === next ? prev : next));
      });
    };

    sync();
    window.addEventListener("portfolio:page-ready", sync);

    const observeTarget =
      document.getElementById("pageContainer") ?? document.body;
    const observer = new MutationObserver(sync);
    observer.observe(observeTarget, { childList: true, subtree: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("portfolio:page-ready", sync);
      observer.disconnect();
    };
  }, [pathname]);

  useEffect(() => {
    if (!isActive) return;

    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

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

    const measureWrapper = () => {
      const rect = wrapper.getBoundingClientRect();
      const vw = window.innerWidth || 1;
      const w = rect.width > 0 ? rect.width : vw;
      const h = rect.height > 0 ? rect.height : vw * 0.640625;
      return { w, h };
    };

    const { w: initW, h: initH } = measureWrapper();
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(initW, initH, false);
    renderer.clear();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 1, 10);
    camera.position.z = 2.1;

    const emptyTexture = new THREE.DataTexture(
      new Uint8Array([0, 0, 0, 0]),
      1,
      1
    );
    emptyTexture.needsUpdate = true;

    const uniforms = createMosaicUniforms(
      emptyTexture,
      25.0,
      initW,
      initH,
      initW / Math.max(initH, 1)
    );

    const material = new THREE.ShaderMaterial({
      vertexShader: MOSAIC_VERTEX_SHADER,
      fragmentShader: MOSAIC_FRAGMENT_SHADER,
      uniforms,
      transparent: true,
      depthWrite: false,
    });

    const geometry = new THREE.PlaneGeometry(2, 2, 50, 50);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let disposed = false;
    let loadedTexture: THREE.Texture | null = null;

    const customNode = document.querySelector<HTMLElement>(
      ".errorCanvasWrapper .innerCanvas, .errorCanvasTriggerHost"
    );
    const dataImage =
      customNode?.getAttribute("data-image-src") ??
      customNode?.getAttribute("data-image");
    const dataResp =
      customNode?.getAttribute("data-resp-image-src") ??
      customNode?.getAttribute("data-resp-image");

    const isCompact = window.innerWidth <= 1080;
    const src = isCompact
      ? dataResp || NOT_FOUND_BIRD_MEDIA.respImageSrc || dataImage || NOT_FOUND_BIRD_MEDIA.imageSrc
      : dataImage || NOT_FOUND_BIRD_MEDIA.imageSrc;

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(src, (tex) => {
      if (disposed) {
        tex.dispose();
        return;
      }
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      loadedTexture = tex;

      uniforms.u_texture.value = tex;
      const img = tex.image as HTMLImageElement | undefined;
      if (img && img.width && img.height) {
        uniforms.u_aspect.value.y = img.width / img.height;
      }
      uniforms.u_hasTexture.value = 1.0;

      gsap.to(uniforms.u_time, {
        value: 3.0,
        duration: 2.0,
        delay: 0.15,
        ease: "power2.out",
        overwrite: "auto",
      });
    });

    const hitTarget =
      document.querySelector<HTMLElement>(".errorBlock") ??
      document.querySelector<HTMLElement>(".errorCanvasTriggerHost") ??
      wrapper;

    const cleanupHover = bindMosaicHover(hitTarget, canvas, uniforms);

    const onResize = () => {
      const { w, h } = measureWrapper();
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      renderer.clear();
      uniforms.u_resolution.value.set(w, h);
      uniforms.u_aspect.value.x = w / Math.max(h, 1);
    };

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(wrapper);
    window.addEventListener("resize", onResize);

    let rafId = 0;
    const renderLoop = () => {
      if (disposed) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        uniforms.u_aspect.value.x = rect.width / rect.height;
      }
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(renderLoop);
    };

    rafId = requestAnimationFrame(renderLoop);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      cleanupHover();
      gsap.killTweensOf(uniforms.u_time);
      resizeObserver.disconnect();
      window.removeEventListener("resize", onResize);
      loadedTexture?.dispose();
      emptyTexture.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div ref={wrapperRef} className="errorCanvasWrapper">
      <div id="error-canvas-mount" className="fixedCanvasWrapper">
        <canvas ref={canvasRef} id="errorCanvas" />
      </div>
    </div>
  );
}

export default ErrorCanvas;
