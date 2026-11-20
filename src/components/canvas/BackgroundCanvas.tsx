"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const VERTEX_SHADER = `
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;

  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform vec2 u_scale;
  uniform float u_size;

  float grid(vec2 st, vec2 scale, float size) {
    vec2 cell = fract(st * scale);
    return step(size, cell.x) * step(size, cell.y);
  }

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  bool isUnderMouse(vec2 st, vec2 mouseCoord, vec2 scale) {
    if (
      mouseCoord.x < 0.0 ||
      mouseCoord.y < 0.0 ||
      mouseCoord.x > 1.0 ||
      mouseCoord.y > 1.0
    ) {
      return false;
    }
    vec2 gridCoord = floor(st * scale);
    vec2 mouseCell = floor(mouseCoord * scale);
    return abs(gridCoord.x - mouseCell.x) < 0.5 &&
           abs(gridCoord.y - mouseCell.y) < 0.5;
  }

  void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float g = grid(st, u_scale, u_size);

    vec2 gridCoord = floor(st * u_scale);
    float offset = random(gridCoord);

    float fadeTime = u_time * 0.2;
    float fade = 0.5 * (1.1 + sin(fadeTime + offset * 6.28318));

    bool underMouse = isUnderMouse(st, u_mouse, u_scale);

    vec3 color = underMouse ? vec3(0.0, 0.0, 0.0) : vec3(0.9);
    float finalFade = underMouse ? 0.9 : fade;

    gl_FragColor = vec4(color, finalFade * g);
  }
`;

function computeGridScale(width: number): [number, number] {
  const isMobile = width <= 580;
  const scaleX = isMobile ? width / 15 : width / 45;
  const scaleY = isMobile ? 40 : 20;
  return [scaleX, scaleY];
}

export function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        precision: "mediump",
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    const width = window.innerWidth || 1;
    const height = window.innerHeight || 1;

    // Intentional DPR = 1 so gl_FragCoord aligns 1:1 with u_resolution in CSS pixels
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(1);
    renderer.setSize(width, height, false);
    renderer.clear();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 1;

    const [initScaleX, initScaleY] = computeGridScale(width);

    const uniforms = {
      u_time: { value: 0.0 },
      u_resolution: { value: new THREE.Vector2(width, height) },
      u_mouse: { value: new THREE.Vector2(-1.0, -1.0) },
      u_scale: { value: new THREE.Vector2(initScaleX, initScaleY) },
      u_size: { value: 0.0 },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
    });

    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const plane = new THREE.Mesh(planeGeometry, material);
    scene.add(plane);

    const clearMouse = () => {
      uniforms.u_mouse.value.set(-1.0, -1.0);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (document.documentElement.classList.contains("touch")) {
        clearMouse();
        return;
      }
      const vw = window.innerWidth || 1;
      const vh = window.innerHeight || 1;
      const mouseX = e.clientX / vw;
      const mouseY = 1.0 - e.clientY / vh;
      uniforms.u_mouse.value.set(mouseX, mouseY);
    };

    const onMouseOut = (e: MouseEvent) => {
      if (!e.relatedTarget) {
        clearMouse();
      }
    };

    const onResize = () => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      renderer.setPixelRatio(1);
      renderer.setSize(w, h, false);
      uniforms.u_resolution.value.set(w, h);
      const [sx, sy] = computeGridScale(w);
      uniforms.u_scale.value.set(sx, sy);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    document.addEventListener("mousemove", onMouseMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", clearMouse, {
      passive: true,
    });
    document.addEventListener("mouseout", onMouseOut, { passive: true });
    window.addEventListener("blur", clearMouse);
    window.addEventListener("resize", onResize);

    let rafId = 0;
    let lastTime = performance.now();

    const animate = (now: number) => {
      const deltaSec = Math.min((now - lastTime) * 0.001, 0.05);
      lastTime = now;
      // Matches live += 0.4 per 60fps tick (24 units/s) across all refresh rates
      uniforms.u_time.value += deltaSec * 24.0;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", onMouseMove);
      document.documentElement.removeEventListener("mouseleave", clearMouse);
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("blur", clearMouse);
      window.removeEventListener("resize", onResize);
      planeGeometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="backgroundCanvasWrapper">
      <canvas ref={canvasRef} id="backgroundCanvas" />
    </div>
  );
}

export default BackgroundCanvas;
