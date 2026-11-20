"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function getSpeedIndicator(): number {
  return window.innerWidth < window.innerHeight ? 30 : 20;
}

export interface SplitTitleProps {
  lines: string[];
  variant?: "huge" | "big";
  tag?: "h1" | "h2" | "div";
  className?: string;
  immediate?: boolean;
  delay?: number;
  align?: "left" | "center" | "right";
  lineSpeeds?: number[];
  scrollPosition?: "top" | "center";
}

export function SplitTitle({
  lines,
  variant = "huge",
  tag = "h1",
  className = "",
  immediate = false,
  delay = 0,
  align,
  lineSpeeds,
  scrollPosition = "top",
}: SplitTitleProps) {
  const titleRef = useRef<HTMLElement>(null);

  const linesKey = lines.join("\u001F");
  const lineSpeedsKey = lineSpeeds ? lineSpeeds.join(",") : "";

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;

    let rafId = 0;
    let resizeObserver: ResizeObserver | null = null;
    let disposed = false;

    const fitAndLockRows = () => {
      if (disposed || !el) return;
      const rows = Array.from(el.querySelectorAll<HTMLElement>(":scope > .row"));
      const isMobile = window.innerWidth <= 580;

      if (variant === "huge") {
        el.style.fontSize = "16.25vw";
        for (const row of rows) {
          row.style.height = "";
          const inner = row.querySelector<HTMLElement>(".lineInner");
          if (inner) {
            inner.style.transform = "";
            inner.style.transformOrigin = "";
          }
        }

        let minScale = 1;
        for (const row of rows) {
          const inner = row.querySelector<HTMLElement>(".lineInner");
          if (!inner) continue;
          const cs = getComputedStyle(row);
          const padX =
            parseFloat(cs.paddingLeft || "0") +
            parseFloat(cs.paddingRight || "0");
          const rowWidth = Math.min(
            row.clientWidth - padX,
            window.innerWidth - padX
          );
          const lineWidth = inner.scrollWidth;
          if (rowWidth > 0 && lineWidth > rowWidth) {
            const safetyFactor = isMobile ? 0.985 : 0.992;
            const ratio = (rowWidth / lineWidth) * safetyFactor;
            if (ratio < minScale) minScale = ratio;
          }
        }

        if (minScale < 1) {
          el.style.fontSize = `${(16.25 * minScale).toFixed(4)}vw`;
        }

        const computedAlign = align || getComputedStyle(el).textAlign;
        const origin =
          computedAlign === "center"
            ? "center bottom"
            : computedAlign === "right"
              ? "right bottom"
              : "left bottom";

        for (const row of rows) {
          const line = row.querySelector<HTMLElement>(".line");
          const inner = row.querySelector<HTMLElement>(".lineInner");
          if (!line || !inner) continue;

          const cs = getComputedStyle(row);
          const padX =
            parseFloat(cs.paddingLeft || "0") +
            parseFloat(cs.paddingRight || "0");
          const padBottom = Math.max(0, parseFloat(cs.paddingBottom || "0"));
          const rowWidth = Math.min(
            row.clientWidth - padX,
            window.innerWidth - padX
          );
          const lineWidth = inner.scrollWidth;

          if (rowWidth > 0 && lineWidth > rowWidth) {
            const safetyFactor = isMobile ? 0.985 : 0.992;
            const scale = (rowWidth / lineWidth) * safetyFactor;
            inner.style.transformOrigin = origin;
            inner.style.transform = `scale(${scale.toFixed(4)})`;
          }

          const lineCs = getComputedStyle(line);
          const mt = Math.max(0, parseFloat(lineCs.marginTop || "0"));
          const h =
            inner.getBoundingClientRect().height ||
            line.getBoundingClientRect().height;
          if (h > 0) {
            // Preserve bottom stroke/descender clearance especially on <= 580px viewports
            const bottomSafety = isMobile
              ? Math.max(4, Math.ceil(h * 0.08))
              : Math.max(2, Math.ceil(h * 0.025));
            row.style.height = `${Math.ceil(h + mt + padBottom + bottomSafety)}px`;
          }
        }
      } else {
        for (const row of rows) {
          const line = row.querySelector<HTMLElement>(".line");
          const inner = row.querySelector<HTMLElement>(".lineInner");
          if (!line || !inner) continue;
          row.style.height = "";
          const cs = getComputedStyle(row);
          const padBottom = Math.max(0, parseFloat(cs.paddingBottom || "0"));
          const lineCs = getComputedStyle(line);
          const mt = Math.max(0, parseFloat(lineCs.marginTop || "0"));
          const h =
            inner.getBoundingClientRect().height ||
            line.getBoundingClientRect().height;
          if (h > 0) {
            const bottomSafety = isMobile ? 3 : 1;
            row.style.height = `${Math.ceil(h + mt + padBottom + bottomSafety)}px`;
          }
        }
      }
    };

    const scheduleFit = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        fitAndLockRows();
        ScrollTrigger.refresh();
      });
    };

    fitAndLockRows();
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!disposed) scheduleFit();
      });
    }

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        scheduleFit();
      });
      resizeObserver.observe(el);
    }

    window.addEventListener("resize", scheduleFit);
    window.addEventListener("portfolio:page-ready", scheduleFit);

    const ctx = gsap.context(() => {
      const lineEls = el.querySelectorAll<HTMLElement>(":scope > .row > .line");
      gsap.set(el, { opacity: 1 });
      gsap.set(lineEls, { y: "105%" });

      if (immediate) {
        gsap.to(lineEls, {
          y: "0%",
          duration: 1.0,
          stagger: 0.12,
          ease: "power3.out",
          delay,
        });
      } else {
        gsap.to(lineEls, {
          y: "0%",
          duration: 1.0,
          stagger: 0.12,
          ease: "power3.out",
          delay,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true,
          },
        });
      }

      const parsedLineSpeeds = lineSpeedsKey
        ? lineSpeedsKey
            .split(",")
            .map((v) => (v.trim() === "" ? undefined : Number(v)))
        : undefined;

      if (parsedLineSpeeds && parsedLineSpeeds.length > 0) {
        const mm = gsap.matchMedia();
        mm.add("(min-width: 581px)", () => {
          const rows = Array.from(
            el.querySelectorAll<HTMLElement>(":scope > .row")
          );
          rows.forEach((row, index) => {
            const speed = parsedLineSpeeds[index];
            if (speed === undefined || Number.isNaN(speed) || speed === 0) {
              return;
            }

            if (scrollPosition === "top") {
              gsap.fromTo(
                row,
                { y: 0 },
                {
                  y: () =>
                    -(
                      (Math.max(el.offsetHeight, window.innerHeight * 0.55) /
                        (getSpeedIndicator() * 2)) *
                      speed
                    ),
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
              const getDelta = () =>
                ((window.innerHeight * 0.5) / getSpeedIndicator()) * speed;
              gsap.fromTo(
                row,
                { y: () => getDelta() },
                {
                  y: () => -getDelta(),
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
        });
      }
    }, titleRef);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", scheduleFit);
      window.removeEventListener("portfolio:page-ready", scheduleFit);
      ctx.revert();
    };
  }, [
    linesKey,
    variant,
    immediate,
    delay,
    align,
    lineSpeedsKey,
    scrollPosition,
  ]);

  const Tag = tag;
  const baseClass = variant === "big" ? "bigTitle" : "hugeTitle";

  return (
    <Tag
      ref={titleRef as React.RefObject<HTMLHeadingElement & HTMLDivElement>}
      className={`${baseClass} ${className}`.trim()}
      style={align ? { textAlign: align } : undefined}
    >
      {lines.map((line, index) => (
        <span
          key={index}
          className="row"
          data-scroll-speed={lineSpeeds?.[index]}
          data-scroll-position={
            lineSpeeds?.[index] !== undefined ? scrollPosition : undefined
          }
        >
          <span className="line">
            <span className="lineInner" style={{ display: "inline-block" }}>
              {line}
            </span>
          </span>
        </span>
      ))}
    </Tag>
  );
}

export interface BigDriftSegment {
  text: string;
  speed?: number;
  className?: string;
}

export interface BigDriftTitleProps {
  segments?: Array<BigDriftSegment | string>;
  parts?: string[];
  partSpeeds?: Record<number, number>;
  driftSpeed?: number;
  tag?: "h1" | "h2" | "div";
  className?: string;
  delay?: number;
}

export function BigDriftTitle({
  segments,
  parts,
  partSpeeds,
  driftSpeed,
  tag = "h2",
  className = "",
  delay = 0,
}: BigDriftTitleProps) {
  const containerRef = useRef<HTMLElement>(null);

  const rawItems = segments ?? parts ?? [];
  const normalizedSegments: BigDriftSegment[] = rawItems.map((item, idx) => {
    const base: BigDriftSegment =
      typeof item === "string" ? { text: item } : item;
    const speedFromMap = partSpeeds?.[idx];
    const resolvedSpeed =
      speedFromMap !== undefined
        ? speedFromMap
        : base.speed !== undefined
          ? base.speed
          : driftSpeed !== undefined && idx === Math.floor(rawItems.length / 2)
            ? driftSpeed
            : undefined;
    return {
      ...base,
      speed: resolvedSpeed,
    };
  });

  const speedsKey = normalizedSegments
    .map((s) => (s.speed !== undefined ? String(s.speed) : ""))
    .join(",");
  const textKey = normalizedSegments.map((s) => s.text).join("\u001F");

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const resolvedSpeeds = speedsKey
      ? speedsKey
          .split(",")
          .map((v) => (v.trim() === "" ? undefined : Number(v)))
      : [];

    const ctx = gsap.context(() => {
      const lines = el.querySelectorAll<HTMLElement>(":scope > .row > .line");
      gsap.set(el, { opacity: 1 });
      gsap.set(lines, { y: "105%" });

      gsap.to(lines, {
        y: "0%",
        duration: 1.0,
        stagger: 0.1,
        ease: "power3.out",
        delay,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
        },
      });

      const mm = gsap.matchMedia();
      mm.add("(min-width: 581px)", () => {
        const rows = Array.from(
          el.querySelectorAll<HTMLElement>(":scope > .row")
        );
        rows.forEach((row, index) => {
          const speed = resolvedSpeeds[index];
          if (speed === undefined || Number.isNaN(speed) || speed === 0) return;

          const getAmplitude = () =>
            ((window.innerHeight * 0.5) / getSpeedIndicator()) * speed;

          gsap.fromTo(
            row,
            { x: () => getAmplitude() },
            {
              x: () => -getAmplitude(),
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
        });
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [textKey, speedsKey, delay]);

  const Tag = tag;

  return (
    <Tag
      ref={containerRef as React.RefObject<HTMLHeadingElement & HTMLDivElement>}
      className={`bigTitle ${className}`.trim()}
    >
      {normalizedSegments.map((seg, idx) => (
        <span
          key={idx}
          className={`row inline-block align-top overflow-hidden ${seg.className ?? ""}`.trim()}
          data-scroll-speed={seg.speed !== undefined ? seg.speed : undefined}
          data-scroll-direction={
            seg.speed !== undefined ? "horizontal" : undefined
          }
        >
          <span className="line" style={{ display: "inline-block" }}>
            {seg.text}
          </span>
        </span>
      ))}
    </Tag>
  );
}

export default SplitTitle;
