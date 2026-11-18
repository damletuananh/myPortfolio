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

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 581px)", () => {
        const offset = speed * 120;
        const prop = direction === "horizontal" ? "x" : "y";

        if (position === "top") {
          gsap.fromTo(
            el,
            { [prop]: 0 },
            {
              [prop]: -offset,
              ease: "none",
              force3D: true,
              scrollTrigger: {
                trigger: el,
                start: "top top",
                end: "bottom top",
                scrub: true,
                invalidateOnRefresh: true,
              },
            }
          );
        } else {
          gsap.fromTo(
            el,
            { [prop]: offset * 0.5 },
            {
              [prop]: -offset * 0.5,
              ease: "none",
              force3D: true,
              scrollTrigger: {
                trigger: el,
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
