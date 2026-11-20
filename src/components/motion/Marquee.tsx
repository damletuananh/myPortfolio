"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PlusCross } from "@/components/svg/BrandGraphics";

gsap.registerPlugin(ScrollTrigger);

export interface MarqueeProps {
  items?: string[];
  children?: React.ReactNode;
  direction?: "left" | "right";
  speed?: number;
  scrollSpeed?: number;
  className?: string;
  separator?: React.ReactNode | false;
  active?: boolean;
}

export function Marquee({
  items,
  children,
  direction = "left",
  speed = 72,
  scrollSpeed,
  className = "",
  separator,
  active = false,
}: MarqueeProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [resizeTick, setResizeTick] = useState(0);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let lastWidth = window.innerWidth;
    const handleResize = () => {
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        setResizeTick((t) => t + 1);
      }
    };

    window.addEventListener("resize", handleResize);
    let disposed = false;
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!disposed) setResizeTick((t) => t + 1);
      });
    }

    return () => {
      disposed = true;
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const scrollEl = scrollRef.current;
    if (!wrapper || !scrollEl) return;

    if (active) {
      wrapper.classList.add("inview");
    }

    const ctx = gsap.context(() => {
      const containers = Array.from(
        scrollEl.querySelectorAll<HTMLElement>(":scope > .itemsContainer")
      );
      if (containers.length === 0) return;

      const firstWidth = containers[0].offsetWidth;
      const viewportWidth = Math.max(window.innerWidth, 320);

      let duration =
        firstWidth > 0 ? speed * (firstWidth / viewportWidth) : speed * 0.5;
      if (viewportWidth <= 580) {
        duration *= 0.45;
      } else if (viewportWidth <= 1080) {
        duration *= 0.72;
      }
      duration = Math.max(2, duration);

      const baseSign = direction === "right" ? -1 : 1;
      const boostGain = 1.0 + Math.min(Math.max(scrollSpeed ?? 0, 0), 2) * 0.2;
      const MAX_BOOST = 2.8;

      gsap.set(scrollEl, { x: 0 });

      const loopTween = gsap.to(containers, {
        xPercent: -100,
        repeat: -1,
        duration,
        ease: "none",
        force3D: true,
        paused: true,
      });

      loopTween.iteration(10000);
      loopTween.timeScale(baseSign);

      let isInView = false;
      let scrollDirMult: 1 | -1 = 1;
      let targetBoost = 0;
      let currentScale = baseSign * scrollDirMult;
      let lastScale = currentScale;

      const syncInView = (visible: boolean) => {
        const restingScale = baseSign * scrollDirMult;
        if (visible) {
          isInView = true;
          wrapper.classList.add("inview");
          if (!Number.isFinite(currentScale) || currentScale === 0) {
            currentScale = restingScale;
          }
          if (currentScale !== lastScale) {
            loopTween.timeScale(currentScale);
            lastScale = currentScale;
          }
          loopTween.resume();
        } else {
          isInView = false;
          targetBoost = 0;
          currentScale = restingScale;
          if (lastScale !== restingScale) {
            loopTween.timeScale(restingScale);
            lastScale = restingScale;
          }
          loopTween.pause();
        }
      };

      const checkIsInView = () => {
        const rect = wrapper.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
      };

      ScrollTrigger.create({
        trigger: wrapper,
        start: "top bottom",
        end: "bottom top",
        onEnter: () => syncInView(true),
        onEnterBack: () => syncInView(true),
        onLeave: () => syncInView(false),
        onLeaveBack: () => syncInView(false),
        onRefresh: () => syncInView(checkIsInView()),
        onUpdate: (self) => {
          if (!isInView) return;
          const rawVel = self.getVelocity();
          if (!Number.isFinite(rawVel)) return;
          if (Math.abs(rawVel) > 25) {
            scrollDirMult = rawVel >= 0 ? 1 : -1;
          }
          const v = Math.abs(rawVel);
          if (v > 0) {
            targetBoost = Math.max(
              targetBoost,
              Math.min(MAX_BOOST, (v / 520) * boostGain)
            );
          }
        },
      });

      syncInView(checkIsInView());

      const handleWheel = (event: WheelEvent) => {
        if (!isInView) return;
        if (
          Math.abs(event.deltaY) >= Math.abs(event.deltaX) &&
          Math.abs(event.deltaY) >= 4
        ) {
          scrollDirMult = event.deltaY >= 0 ? 1 : -1;
        }
        const wheelMag = Math.min(
          Math.abs(event.deltaY) + Math.abs(event.deltaX),
          360
        );
        if (wheelMag > 0) {
          targetBoost = Math.max(
            targetBoost,
            Math.min(MAX_BOOST, (wheelMag / 160) * boostGain)
          );
        }
      };

      window.addEventListener("wheel", handleWheel, { passive: true });

      const onTick = (_time: number, deltaRatioMs: number) => {
        if (!isInView) return;

        if (currentScale < 0 && loopTween.iteration() < 500) {
          loopTween.iteration(loopTween.iteration() + 10000, true);
        }

        const dt = Math.min(
          (deltaRatioMs > 0 ? deltaRatioMs : 16.67) / 1000,
          0.05
        );

        targetBoost *= Math.exp(-4.2 * dt);
        if (targetBoost < 0.001) {
          targetBoost = 0;
        }

        const restingScale = baseSign * scrollDirMult;
        const targetScale = baseSign * scrollDirMult * (1 + targetBoost);

        const rate = Math.abs(targetScale) > Math.abs(currentScale) ? 10 : 3.2;
        const alpha = 1 - Math.exp(-rate * dt);
        currentScale += (targetScale - currentScale) * alpha;

        if (targetBoost === 0 && Math.abs(currentScale - restingScale) < 0.004) {
          currentScale = restingScale;
        }

        if (currentScale !== lastScale) {
          loopTween.timeScale(currentScale);
          lastScale = currentScale;
        }
      };

      gsap.ticker.add(onTick);

      return () => {
        window.removeEventListener("wheel", handleWheel);
        gsap.ticker.remove(onTick);
      };
    }, wrapperRef);

    return () => {
      ctx.revert();
    };
  }, [items, direction, speed, scrollSpeed, active, resizeTick]);

  const blocks = [0, 1, 2, 3];

  return (
    <div
      ref={wrapperRef}
      className={`marqueeWrapper ${active ? "inview " : ""}${className}`.trim()}
      data-marquee-speed={speed}
      data-marquee-direction={direction}
      data-marquee-scroll-speed={scrollSpeed}
    >
      <div className="marquee">
        <div
          ref={scrollRef}
          className="marqueeScroll"
          style={{
            display: "flex",
            flexWrap: "nowrap",
            width: "max-content",
            alignItems: "center",
          }}
        >
          {blocks.map((blockIdx) => (
            <div
              key={blockIdx}
              className="itemsContainer"
              aria-hidden={blockIdx > 0 ? true : undefined}
              style={{
                display: "inline-flex",
                alignItems: "center",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {items
                ? items.map((item, itemIdx) => (
                    <span
                      key={itemIdx}
                      className="marqueeItem"
                      style={{ gap: "1.25vw", paddingRight: "1.25vw" }}
                    >
                      <span className="tag">{item}</span>
                      {separator !== false ? (
                        <span className="icon plusCross" aria-hidden="true">
                          {separator ?? <PlusCross rotating />}
                        </span>
                      ) : null}
                    </span>
                  ))
                : children}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Marquee;
