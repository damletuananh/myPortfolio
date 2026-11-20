"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TransitionLink } from "@/components/providers/TransitionProvider";
import { PlusCross } from "@/components/svg/BrandGraphics";

gsap.registerPlugin(ScrollTrigger);

/* -------------------------------------------------------------------------- */
/* LineAnim                                                                   */
/* -------------------------------------------------------------------------- */

export interface LineAnimProps {
  secondary?: boolean;
  className?: string;
  delay?: number;
}

export function LineAnim({
  secondary = false,
  className = "",
  delay = 0,
}: LineAnimProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let timer: number | null = null;
    let activated = false;

    const activate = () => {
      if (activated) return;
      activated = true;
      if (delay > 0) {
        timer = window.setTimeout(
          () => el.classList.add("inview"),
          delay * 1000
        );
      } else {
        el.classList.add("inview");
      }
    };

    const checkImmediate = () => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) {
        activate();
      }
    };

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 92%",
        once: true,
        onEnter: activate,
        onEnterBack: activate,
      });

      checkImmediate();
    }, ref);

    window.addEventListener("portfolio:page-ready", checkImmediate);

    return () => {
      window.removeEventListener("portfolio:page-ready", checkImmediate);
      if (timer !== null) window.clearTimeout(timer);
      ctx.revert();
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`lineAnim${secondary ? " secondary" : ""}${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    >
      <div className="innerLine" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* BlockAnim                                                                  */
/* -------------------------------------------------------------------------- */

export interface BlockAnimProps {
  variant?: 1 | 2 | 3 | 4;
  secondary?: boolean;
  className?: string;
}

export function BlockAnim({
  variant = 1,
  secondary = false,
  className = "",
}: BlockAnimProps) {
  return (
    <div
      className={`blockAnimWrapper style-${variant}-anim${secondary ? " secondary" : ""}${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    >
      <div className="blockAnim" />
      <div className="blockAnim" />
      <div className="blockAnim" />
      <div className="blockAnim" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ToolTipIcon                                                                */
/* -------------------------------------------------------------------------- */

export interface ToolTipIconProps {
  label?: string;
  info?: string;
  text?: string;
  light?: boolean;
  small?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function ToolTipIcon({
  label,
  info,
  text,
  light = false,
  small = false,
  className = "",
  children,
}: ToolTipIconProps) {
  const body = info ?? text ?? children;
  const rootRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onOutsidePointer = (event: Event) => {
      if (
        rootRef.current &&
        event.target instanceof Node &&
        !rootRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onOutsidePointer, {
      passive: true,
    });
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", onOutsidePointer);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  const handleClick = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    setOpen((prev) => !prev);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      setOpen((prev) => !prev);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const handleFocus = (event: React.FocusEvent<HTMLSpanElement>) => {
    if (event.currentTarget.matches(":focus-visible")) {
      setOpen(true);
    }
  };

  const handleBlur = () => {
    setOpen(false);
  };

  const handleMouseLeave = () => {
    if (open && !document.documentElement.classList.contains("touch")) {
      setOpen(false);
    }
  };

  const accessibleLabel =
    label && typeof body === "string"
      ? `${label}: ${body}`
      : label || (typeof body === "string" ? body : "Additional credit info");

  return (
    <span
      ref={rootRef}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      aria-label={accessibleLabel}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseLeave={handleMouseLeave}
      className={`toolTipIcon${small ? " small" : ""}${open ? " open" : ""}${className ? ` ${className}` : ""}`}
    >
      <span className="icon-quote" aria-hidden="true">
        <svg viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M6.4 1.2C3.8 2.6 2.3 5 2 8.2H6.5V13H0.8V8.4C0.8 4.4 2.7 1.7 5.7 0L6.4 1.2ZM14.9 1.2C12.3 2.6 10.8 5 10.5 8.2H15V13H9.3V8.4C9.3 4.4 11.2 1.7 14.2 0L14.9 1.2Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span
        className={`toolTipWrapper${light ? " light" : ""}`}
        style={
          open
            ? {
                opacity: 1,
                transform: "translate(-50%, -0.35em)",
                pointerEvents: "auto",
              }
            : undefined
        }
      >
        {label ? <span className="label">{label}</span> : null}
        <span className="info">{body}</span>
      </span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* InnerCanvasBox                                                             */
/* -------------------------------------------------------------------------- */

export interface InnerCanvasBoxProps {
  imageSrc?: string;
  respImageSrc?: string;
  videoSrc?: string;
  biggerGrid?: boolean;
  mouseTrigger?: boolean;
  isHero?: boolean;
  delay?: number;
  className?: string;
  innerClassName?: string;
  alt?: string;
  children?: React.ReactNode;
}

export function InnerCanvasBox({
  imageSrc,
  respImageSrc,
  videoSrc,
  biggerGrid = false,
  mouseTrigger = false,
  isHero = false,
  delay,
  className = "",
  innerClassName = "",
  alt,
  children,
}: InnerCanvasBoxProps) {
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const markInview = () => {
      el.classList.add("inview");
    };

    if (isHero) {
      markInview();
      return;
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 95%",
        once: true,
        onEnter: markInview,
        onEnterBack: markInview,
      });

      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95) {
        markInview();
      }
    }, innerRef);

    return () => {
      ctx.revert();
    };
  }, [isHero]);

  return (
    <div
      className={`canvasContainer${mouseTrigger ? " mouseTrigger" : ""}${className ? ` ${className}` : ""}`}
    >
      <div
        ref={innerRef}
        className={`innerCanvas${isHero ? " loadCanvasHeaderBlock" : ""}${mouseTrigger ? " mouseTrigger" : ""}${innerClassName ? ` ${innerClassName}` : ""}`}
        data-image-src={imageSrc}
        data-resp-image-src={respImageSrc}
        data-video-src={videoSrc}
        data-bigger-grid={biggerGrid ? "true" : undefined}
        data-delay={delay !== undefined ? String(delay) : undefined}
        role={alt ? "img" : undefined}
        aria-label={alt}
      >
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ActionButton                                                               */
/* -------------------------------------------------------------------------- */

export interface ActionButtonProps {
  href?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  variant?: "primary" | "secondary" | "outline";
  size?: "default" | "small";
  full?: boolean;
  icon?: boolean;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  children: React.ReactNode;
}

export function ActionButton({
  href,
  onClick,
  variant = "outline",
  size = "default",
  full = false,
  icon = false,
  type = "button",
  disabled = false,
  className = "",
  ariaLabel,
  children,
}: ActionButtonProps) {
  const classes = [
    "button",
    variant === "primary" ? "primary" : variant === "secondary" ? "secondary" : "",
    size === "small" ? "small" : "",
    full ? "full" : "",
    icon ? "icon" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {children}
      {icon ? <PlusCross className="icon" /> : null}
    </>
  );

  if (href) {
    const isExternal = /^(https?:\/\/|mailto:|tel:)/i.test(href);
    const isHttp = /^https?:\/\//i.test(href);

    if (isExternal) {
      return (
        <a
          href={href}
          className={classes}
          aria-label={ariaLabel}
          onClick={onClick}
          target={isHttp ? "_blank" : undefined}
          rel={isHttp ? "noopener noreferrer" : undefined}
        >
          {content}
        </a>
      );
    }

    return (
      <TransitionLink
        href={href}
        className={classes}
        aria-label={ariaLabel}
        onClick={onClick as React.MouseEventHandler<HTMLAnchorElement> | undefined}
      >
        {content}
      </TransitionLink>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement> | undefined}
      className={classes}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
}
