"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import {
  CurtainController,
  CurtainVariant,
  useTransitionNav,
} from "@/components/providers/TransitionProvider";

const VERTEX_SHADER = `
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;

  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_scale;
  uniform vec3 u_color;

  float grid(vec2 st, vec2 scale) {
    vec2 gridPos = abs(fract(st * scale - 0.5) - 0.5);
    float lineThickness = 0.0;
    vec2 g = step(vec2(lineThickness), gridPos);
    return g.x * g.y;
  }

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float g = grid(st, u_scale);

    vec2 gridCoord = floor(st * u_scale);
    float offset = random(gridCoord);

    float fadeTime = u_time * 0.2;
    float fadeDelay = offset * 2.0;
    float fade = smoothstep(0.0, 1.0, fadeTime - fadeDelay);

    float alpha = fade * g;
    if (alpha <= 0.4) {
      discard;
    }

    gl_FragColor = vec4(u_color, alpha);
  }
`;

function computeScale(width: number): [number, number] {
  const isMobile = width <= 580;
  return [isMobile ? width / 15 : width / 45, isMobile ? 40 : 20];
}

function setColorForVariant(target: THREE.Color, variant: CurtainVariant) {
  if (variant === "menu") {
    target.setRGB(0.133, 0.149, 0.294);
  } else {
    target.setRGB(0.38, 0.39, 0.52);
  }
}

export function LoadCanvas() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { registerCurtainController } = useTransitionNav();

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        precision: "mediump",
        powerPreference: "high-performance",
      });
    } catch {
      renderer = null;
    }

    const width = window.innerWidth || 1;
    const height = window.innerHeight || 1;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 1;

    const [sx, sy] = computeScale(width);

    const uniforms = {
      u_time: { value: 0.0 },
      u_resolution: { value: new THREE.Vector2(width, height) },
      u_scale: { value: new THREE.Vector2(sx, sy) },
      u_color: { value: new THREE.Color(0.38, 0.39, 0.52) },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
    });

    const geometry = new THREE.PlaneGeometry(20, 20);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    if (renderer) {
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(1);
      renderer.setSize(width, height, false);
      renderer.clear();
    }

    let loadCanvasFrame = false;
    let rafId = 0;
    let resolvePending: (() => void) | null = null;

    const flushPending = () => {
      if (resolvePending) {
        const fn = resolvePending;
        resolvePending = null;
        fn();
      }
    };

    const renderLoop = () => {
      if (!loadCanvasFrame || !renderer) {
        rafId = 0;
        return;
      }
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(renderLoop);
    };

    const startLoop = () => {
      if (!renderer || loadCanvasFrame) return;
      loadCanvasFrame = true;
      rafId = requestAnimationFrame(renderLoop);
    };

    const stopLoop = () => {
      loadCanvasFrame = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      if (renderer) {
        renderer.setClearColor(0x000000, 0);
        renderer.clear();
      }
    };

    const onResize = () => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      if (renderer) {
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(1);
        renderer.setSize(w, h, false);
        if (!loadCanvasFrame) {
          renderer.clear();
        }
      }
      uniforms.u_resolution.value.set(w, h);
      const [nx, ny] = computeScale(w);
      uniforms.u_scale.value.set(nx, ny);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (loadCanvasFrame && renderer) {
        renderer.render(scene, camera);
      }
    };

    window.addEventListener("resize", onResize);

    const controller: CurtainController = {
      closeCurtain: (variant: CurtainVariant) => {
        flushPending();
        gsap.killTweensOf(wrapper);
        gsap.killTweensOf(uniforms.u_time);

        setColorForVariant(uniforms.u_color.value, variant);
        wrapper.classList.add("loaded");
        startLoop();

        return new Promise<void>((resolve) => {
          resolvePending = resolve;

          gsap.to(wrapper, {
            opacity: 1,
            duration: 0.45,
            ease: "power1.out",
            overwrite: "auto",
          });

          gsap.to(uniforms.u_time, {
            value: 15.0,
            duration: 0.45,
            ease: "power1.out",
            overwrite: "auto",
            onComplete: () => {
              if (resolvePending === resolve) {
                resolvePending = null;
              }
              resolve();
            },
          });
        });
      },

      openCurtain: (variant: CurtainVariant) => {
        flushPending();
        gsap.killTweensOf(wrapper);
        gsap.killTweensOf(uniforms.u_time);

        wrapper.classList.remove("loaded");
        startLoop();

        const delay = variant === "menu" ? 0.15 : 0.0;

        return new Promise<void>((resolve) => {
          resolvePending = resolve;

          gsap.to(wrapper, {
            opacity: 0,
            duration: 0.9,
            delay,
            ease: "power1.out",
            overwrite: "auto",
          });

          gsap.to(uniforms.u_time, {
            value: 0.0,
            duration: 0.9,
            delay,
            ease: "power1.out",
            overwrite: "auto",
            onComplete: () => {
              stopLoop();
              setColorForVariant(uniforms.u_color.value, "nav");
              if (resolvePending === resolve) {
                resolvePending = null;
              }
              resolve();
            },
          });
        });
      },
    };

    const unregister = registerCurtainController(controller);

    return () => {
      unregister();
      flushPending();
      stopLoop();
      gsap.killTweensOf(wrapper);
      gsap.killTweensOf(uniforms.u_time);
      window.removeEventListener("resize", onResize);
      geometry.dispose();
      material.dispose();
      renderer?.dispose();
    };
  }, [registerCurtainController]);

  return (
    <div
      ref={wrapperRef}
      className="loadCanvasWrapper"
      style={{ opacity: 0, transition: "none" }}
    >
      <canvas ref={canvasRef} id="loadCanvas" />
    </div>
  );
}

export default LoadCanvas;
