"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface DrawSvgProps {
  children: React.ReactNode;
  active?: boolean;
  triggerOnScroll?: boolean;
  delay?: number;
  duration?: number;
  stagger?: number;
  className?: string;
}

function measureShapeLength(el: SVGElement): number {
  const geom = el as unknown as { getTotalLength?: () => number };
  if (typeof geom.getTotalLength === "function") {
    try {
      const len = geom.getTotalLength();
      if (Number.isFinite(len) && len > 0) return len;
    } catch {
      // Fallback for unrendered/detached SVG geometry
    }
  }
  return 1000;
}

export function DrawSvg({
  children,
  active = false,
  triggerOnScroll = false,
  delay = 0.1,
  duration = 0.95,
  stagger,
  className = "",
}: DrawSvgProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      const targets = Array.from(
        container.querySelectorAll<SVGElement>(
          "path, line, polyline, circle, ellipse, polygon, .draw"
        )
      ).filter((el, idx, arr) => {
        if (arr.indexOf(el) !== idx) return false;
        const geom = el as unknown as { getTotalLength?: () => number };
        return typeof geom.getTotalLength === "function";
      });

      if (targets.length === 0) return;

      const lengths = targets.map((el) => measureShapeLength(el));
      const weights = lengths.map((len) => Math.sqrt(Math.max(len, 1)));
      const totalWeight = Math.max(
        weights.reduce((acc, w) => acc + w, 0),
        1
      );

      targets.forEach((el, idx) => {
        const len = lengths[idx];
        const isReverse = el.getAttribute("data-reverse") === "true";
        gsap.set(el, {
          strokeDasharray: len,
          strokeDashoffset: isReverse ? -len : len,
        });
      });

      gsap.set(container, { opacity: 0 });

      const buildTimeline = () => {
        const tl = gsap.timeline({ delay });
        tl.to(
          container,
          {
            opacity: 1,
            duration: 0.08,
            ease: "power2.out",
          },
          0
        );

        const totalBudget = Math.max(0.7, Math.min(duration, 1.1));

        if (targets.length === 1) {
          const singleDur =
            parseFloat(targets[0].getAttribute("data-duration") || "") ||
            totalBudget;
          tl.to(
            targets[0],
            {
              strokeDashoffset: 0,
              duration: singleDur,
              ease: "power2.out",
            },
            0
          );
          return tl;
        }

        if (stagger !== undefined) {
          const perStrokeDur = Math.max(
            0.25,
            (totalBudget - stagger * (targets.length - 1)) / targets.length
          );
          targets.forEach((el, idx) => {
            const customDur = parseFloat(el.getAttribute("data-duration") || "");
            const strokeDur = Number.isFinite(customDur)
              ? customDur
              : perStrokeDur;
            tl.to(
              el,
              {
                strokeDashoffset: 0,
                duration: strokeDur,
                ease: "power2.out",
              },
              idx * stagger
            );
          });
          return tl;
        }

        // Compress multi-stroke calligraphy cleanly inside ~0.95s total budget
        const staggerSpan = totalBudget * 0.68;
        let cumWeight = 0;

        targets.forEach((el, idx) => {
          const customDur = parseFloat(el.getAttribute("data-duration") || "");
          const weight = weights[idx];
          const startAt = (cumWeight / totalWeight) * staggerSpan;
          cumWeight += weight;

          const isLast = idx === targets.length - 1;
          const computedDur = isLast
            ? Math.max(0.24, totalBudget - startAt)
            : Math.min(
                totalBudget - startAt,
                Math.max(0.22, (weight / totalWeight) * totalBudget * 1.55)
              );

          const strokeDur = Number.isFinite(customDur) ? customDur : computedDur;

          tl.to(
            el,
            {
              strokeDashoffset: 0,
              duration: strokeDur,
              ease: "power2.out",
            },
            startAt
          );
        });

        return tl;
      };

      if (triggerOnScroll) {
        const tl = buildTimeline();
        tl.pause();
        const triggerPlay = () => {
          tl.play();
        };

        ScrollTrigger.create({
          trigger: container,
          start: "top 95%",
          once: true,
          onEnter: triggerPlay,
          onEnterBack: triggerPlay,
        });

        const rect = container.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
          triggerPlay();
        }
      } else if (active) {
        buildTimeline();
      }
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [active, triggerOnScroll, delay, duration, stagger]);

  return (
    <div
      ref={containerRef}
      className={className || undefined}
      style={{ opacity: 0 }}
    >
      {children}
    </div>
  );
}

export default DrawSvg;
