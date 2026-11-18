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
  speed = 45,
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
        duration *= 0.25;
      } else if (viewportWidth <= 1080) {
        duration *= 0.5;
      }
      duration = Math.max(2, duration);

      const baseSign = direction === "right" ? -1 : 1;

      const loopTween = gsap.to(containers, {
        xPercent: -100,
        repeat: -1,
        duration,
        ease: "none",
        paused: true,
      });

      loopTween.iteration(1000);
      loopTween.timeScale(baseSign);

      let lastScrollDir = 1;

      ScrollTrigger.create({
        trigger: wrapper,
        start: "top bottom",
        end: "bottom top",
        onEnter: () => {
          wrapper.classList.add("inview");
          loopTween.play();
        },
        onEnterBack: () => {
          wrapper.classList.add("inview");
          loopTween.play();
        },
        onLeave: () => loopTween.pause(),
        onLeaveBack: () => loopTween.pause(),
        onUpdate: (self) => {
          if (self.direction !== 0 && self.direction !== lastScrollDir) {
            lastScrollDir = self.direction;
            gsap.to(loopTween, {
              timeScale: baseSign * (self.direction === -1 ? -1 : 1),
              duration: 0.4,
              overwrite: true,
            });
          }
        },
      });

      const rect = wrapper.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        wrapper.classList.add("inview");
        loopTween.play();
      }

      if (scrollSpeed !== undefined && scrollSpeed !== 0) {
        const scrollSign = direction === "right" ? -1 : 1;
        gsap.fromTo(
          scrollEl,
          {
            x: () => (scrollSign * scrollSpeed * wrapper.clientWidth) / 100,
          },
          {
            x: () => (-scrollSign * scrollSpeed * wrapper.clientWidth) / 100,
            ease: "none",
            force3D: true,
            scrollTrigger: {
              trigger: wrapper,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
              invalidateOnRefresh: true,
            },
          }
        );
      }
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
