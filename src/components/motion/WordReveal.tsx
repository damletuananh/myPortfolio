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
      const words = Array.from(el.querySelectorAll<HTMLElement>(".word"));
      if (words.length === 0) return;

      gsap.set(words, { y: "110%" });

      const useScroll = !immediate;
      const lineDelayStep = fast ? 0.1 : 0.3;
      const wordStagger = fast ? 0.018 : 0.035;

      const animateWords = () => {
        if (lines.length > 1) {
          const lineGroups = new Map<number, HTMLElement[]>();
          for (const word of words) {
            const idx = Number(word.dataset.lineIndex ?? "0");
            const group = lineGroups.get(idx);
            if (group) {
              group.push(word);
            } else {
              lineGroups.set(idx, [word]);
            }
          }

          const sortedIndices = Array.from(lineGroups.keys()).sort(
            (a, b) => a - b
          );
          const lastIdx = sortedIndices[sortedIndices.length - 1];

          for (const idx of sortedIndices) {
            const group = lineGroups.get(idx)!;
            gsap.to(group, {
              y: "0%",
              duration: 0.6,
              stagger: fast ? 0.014 : 0.024,
              ease: "power2.out",
              delay: delay + idx * lineDelayStep,
              onComplete:
                idx === lastIdx
                  ? () => {
                      el.classList.add("transformNone");
                    }
                  : undefined,
            });
          }
        } else {
          gsap.to(words, {
            y: "0%",
            duration: 0.65,
            stagger: wordStagger,
            ease: "power2.out",
            delay,
            onComplete: () => {
              el.classList.add("transformNone");
            },
          });
        }
      };

      if (useScroll) {
        let hasAnimated = false;
        const triggerOnce = () => {
          if (hasAnimated) return;
          hasAnimated = true;
          animateWords();
        };

        ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          once: true,
          onEnter: triggerOnce,
          onEnterBack: triggerOnce,
        });

        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
          triggerOnce();
        }
      } else {
        animateWords();
      }
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [resolvedText, lines.length, immediate, delay, fast, scrollWords]);

  const Tag = tag;

  return (
    <Tag
      ref={containerRef as React.RefObject<
        HTMLParagraphElement & HTMLHeadingElement & HTMLDivElement & HTMLSpanElement
      >}
      className={className || undefined}
      data-words={scrollWords || Boolean(resolvedText) ? "true" : undefined}
      data-scroll-words={!immediate ? "true" : undefined}
      data-words-fast={fast ? "true" : undefined}
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
                      <span
                        className="word"
                        data-line-index={lineIdx}
                        style={{ display: "inline-block" }}
                      >
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
