"use client";

import React, { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface WordRevealProps {
  text?: string;
  children?: React.ReactNode;
  tag?: "p" | "h1" | "h2" | "h3" | "div" | "span";
  className?: string;
  immediate?: boolean;
  delay?: number;
  fast?: boolean;
  scrollWords?: boolean;
}

export function WordReveal({
  text,
  children,
  tag = "p",
  className = "",
  immediate = false,
  delay = 0,
  fast = false,
  scrollWords = false,
}: WordRevealProps) {
  const containerRef = useRef<HTMLElement>(null);
  const resolvedText =
    typeof text === "string"
      ? text
      : typeof children === "string"
        ? children
        : "";

  const lines = useMemo(() => resolvedText.split("\n"), [resolvedText]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const words = el.querySelectorAll<HTMLElement>(".word");
      if (words.length === 0) return;

      gsap.set(words, { y: "110%" });

      const useScroll = scrollWords || !immediate;

      gsap.to(words, {
        y: "0%",
        duration: 0.7,
        stagger: fast ? 0.02 : 0.04,
        ease: "power3.out",
        delay,
        onComplete: () => {
          el.classList.add("transformNone");
        },
        ...(useScroll
          ? {
              scrollTrigger: {
                trigger: el,
                start: "top 85%",
                once: true,
              },
            }
          : {}),
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [text, immediate, delay, fast, scrollWords]);

  const Tag = tag;

  return (
    <Tag
      ref={containerRef as React.RefObject<
        HTMLParagraphElement & HTMLHeadingElement & HTMLDivElement & HTMLSpanElement
      >}
      className={className || undefined}
      data-words={scrollWords ? "true" : undefined}
      data-scroll-words={scrollWords ? "true" : undefined}
    >
      {resolvedText
        ? lines.map((line, lineIdx) => {
            const tokens = line.split(/(\s+)/);
            return (
              <React.Fragment key={lineIdx}>
                {tokens.map((token, tokenIdx) => {
                  if (!token) return null;
                  if (/^\s+$/.test(token)) {
                    return <React.Fragment key={tokenIdx}> </React.Fragment>;
                  }
                  return (
                    <span
                      key={tokenIdx}
                      className="wordWrap"
                      style={{
                        display: "inline-block",
                        overflow: "hidden",
                        verticalAlign: "top",
                      }}
                    >
                      <span className="word" style={{ display: "inline-block" }}>
                        {token}
                      </span>
                    </span>
                  );
                })}
                {lineIdx < lines.length - 1 ? <br /> : null}
              </React.Fragment>
            );
          })
        : children}
    </Tag>
  );
}

export default WordReveal;
