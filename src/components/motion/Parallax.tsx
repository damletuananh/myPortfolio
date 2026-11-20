"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface ParallaxProps {
  children: React.ReactNode;
  speed?: number;
  direction?: "vertical" | "horizontal";
  position?: "top" | "center";
  className?: string;
  style?: React.CSSProperties;
}

export function Parallax({
  children,
  speed = 0.3,
  direction = "vertical",
  position = "center",
  className = "",
  style,
}: ParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || speed === 0) return;

    const resolveTrigger = (): HTMLElement => {
      if (el.offsetHeight >= 4) return el;
      const canvasChild = el.querySelector<HTMLElement>(".canvasContainer");
      if (canvasChild && canvasChild.offsetHeight >= 4) return canvasChild;
      const firstSizedChild = Array.from(el.children).find(
        (child): child is HTMLElement =>
          child instanceof HTMLElement && child.offsetHeight >= 4
      );
      if (firstSizedChild) return firstSizedChild;
      return el.closest<HTMLElement>("section") ?? el;
    };

    const getSpeedIndicator = () =>
      window.innerWidth < window.innerHeight ? 30 : 20;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 581px)", () => {
        const triggerEl = resolveTrigger();
        const prop = direction === "horizontal" ? "x" : "y";

        if (position === "top") {
          const applyTop = () => {
            const scrollY = Math.max(
              0,
              window.scrollY || window.pageYOffset || 0
            );
            const pos = -(scrollY / (getSpeedIndicator() * 2)) * speed;
            gsap.set(el, {
              [prop]: pos,
              force3D: true,
            });
          };

          applyTop();

          ScrollTrigger.create({
            trigger: triggerEl,
            start: "top bottom",
            end: "bottom top",
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (self.isActive) {
                applyTop();
              }
            },
            onRefresh: applyTop,
          });
        } else {
          const getHalfTravel = () =>
            ((window.innerHeight * 0.5) / getSpeedIndicator()) * speed;

          gsap.fromTo(
            el,
            { [prop]: () => getHalfTravel() },
            {
              [prop]: () => -getHalfTravel(),
              ease: "none",
              force3D: true,
              scrollTrigger: {
                trigger: triggerEl,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
                invalidateOnRefresh: true,
              },
            }
          );
        }
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [speed, direction, position]);

  return (
    <div
      ref={containerRef}
      className={className || undefined}
      style={style}
      data-scroll-speed={speed}
      data-scroll-direction={direction === "horizontal" ? "horizontal" : undefined}
      data-scroll-position={position === "top" ? "top" : undefined}
    >
      {children}
    </div>
  );
}

export default Parallax;
