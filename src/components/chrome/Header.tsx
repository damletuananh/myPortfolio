"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { SITE_CONFIG, type SocialLink } from "@/data/portfolio";
import { MvPixelLogo, SignatureDrawSvg } from "@/components/svg/BrandGraphics";
import {
  TransitionLink,
  useTransitionNav,
} from "@/components/providers/TransitionProvider";
import { useThemeBackground } from "@/components/providers/ThemeBackgroundProvider";
import { useLenisContext } from "@/components/providers/LenisProvider";
import { DrawSvg } from "@/components/motion/DrawSvg";

export function SocialGlyph({ platform }: { platform: SocialLink["platform"] }) {
  if (platform === "github") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 2C6.477 2 2 6.484 2 12.017C2 16.442 4.865 20.197 8.839 21.521C9.339 21.613 9.521 21.304 9.521 21.038C9.521 20.801 9.513 20.17 9.508 19.335C6.726 19.94 6.139 17.992 6.139 17.992C5.685 16.834 5.029 16.526 5.029 16.526C4.121 15.906 5.098 15.918 5.098 15.918C6.101 15.988 6.628 16.95 6.628 16.95C7.52 18.48 8.969 18.038 9.538 17.782C9.63 17.135 9.888 16.694 10.174 16.444C7.954 16.191 5.619 15.331 5.619 11.493C5.619 10.4 6.009 9.505 6.648 8.805C6.545 8.552 6.202 7.533 6.746 6.155C6.746 6.155 7.586 5.885 9.496 7.181C10.294 6.959 11.15 6.848 12 6.844C12.85 6.848 13.705 6.959 14.504 7.181C16.413 5.885 17.251 6.155 17.251 6.155C17.797 7.534 17.453 8.553 17.351 8.805C17.991 9.505 18.379 10.4 18.379 11.493C18.379 15.341 16.04 16.188 13.813 16.436C14.172 16.745 14.491 17.356 14.491 18.291C14.491 19.629 14.479 20.71 14.479 21.038C14.479 21.306 14.659 21.618 15.167 21.52C19.138 20.193 22 16.44 22 12.017C22 6.484 17.522 2 12 2Z"
        />
      </svg>
    );
  }

  if (platform === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M5.2 3.2C3.87 3.2 2.8 4.27 2.8 5.6C2.8 6.93 3.87 8 5.2 8C6.53 8 7.6 6.93 7.6 5.6C7.6 4.27 6.53 3.2 5.2 3.2ZM3.1 9.6H7.3V21H3.1V9.6ZM9.9 9.6H13.9V11.16H13.96C14.52 10.1 15.88 8.98 17.92 8.98C22.14 8.98 22.92 11.76 22.92 15.38V21H18.72V16.02C18.72 14.83 18.7 13.3 17.07 13.3C15.42 13.3 15.17 14.59 15.17 15.94V21H10.97V9.6H9.9Z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill="currentColor"
        d="M4 4.5H20C21.1046 4.5 22 5.39543 22 6.5V17.5C22 18.6046 21.1046 19.5 20 19.5H4C2.89543 19.5 2 18.6046 2 17.5V6.5C2 5.39543 2.89543 4.5 4 4.5ZM4.6 6.3L12 11.25L19.4 6.3H4.6ZM3.8 7.85V17.7H20.2V7.85L12 13.3L3.8 7.85Z"
      />
    </svg>
  );
}

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  if (href === "/work") {
    return pathname === "/work" || pathname.startsWith("/project/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname() ?? "/";
  const { isHeaderSecondary } = useThemeBackground();
  const { isMenuOpen, toggleMenu, closeMenu } = useTransitionNav();
  const { lenis } = useLenisContext();

  const headerRef = useRef<HTMLElement>(null);
  const headerBarRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const menuBgRef = useRef<HTMLDivElement>(null);
  const hasRevealedRef = useRef(false);
  const scrolledRef = useRef(false);

  const [active, setActive] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (hasRevealedRef.current) {
      setActive(true);
      return;
    }

    const delayMs = pathname === "/" ? 2400 : 600;
    const timer = window.setTimeout(() => {
      hasRevealedRef.current = true;
      setActive(true);
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    let rafId = 0;

    const applyScrollDom = () => {
      rafId = 0;
      const y = Math.max(
        0,
        lenis ? lenis.scroll : window.scrollY || window.pageYOffset || 0
      );
      const isCompact = window.innerWidth <= 580;
      const barH = headerBarRef.current?.offsetHeight || 90;
      const threshold = barH / 3;
      const nextScrolled = !isCompact && y > threshold;

      if (scrolledRef.current !== nextScrolled) {
        scrolledRef.current = nextScrolled;
        setScrolled(nextScrolled);
      }

      const leftEl = leftRef.current;
      const rightEl = rightRef.current;
      const bgEl = menuBgRef.current;

      if (isCompact) {
        if (leftEl) {
          leftEl.style.transform = "";
          leftEl.style.opacity = "";
          leftEl.style.pointerEvents = "";
        }
        if (rightEl) {
          rightEl.style.transform = "";
          rightEl.style.opacity = "";
          rightEl.style.pointerEvents = "";
        }
        if (bgEl) {
          bgEl.style.backdropFilter = "";
          (
            bgEl.style as CSSStyleDeclaration & {
              webkitBackdropFilter?: string;
            }
          ).webkitBackdropFilter = "";
        }
        return;
      }

      const offset = Math.min(y, barH);
      const fadeDenom = Math.max(barH * 0.72, 1);
      const sideOpacity = offset > 0 ? Math.max(0, 1 - offset / fadeDenom) : 1;
      const sideTransform =
        offset > 0 ? `translate3d(0, -${offset.toFixed(2)}px, 0)` : "";
      const sidePointer = nextScrolled ? "none" : "";

      if (leftEl) {
        leftEl.style.transform = sideTransform;
        leftEl.style.opacity = offset > 0 ? sideOpacity.toFixed(3) : "";
        leftEl.style.pointerEvents = sidePointer;
      }
      if (rightEl) {
        rightEl.style.transform = sideTransform;
        rightEl.style.opacity = offset > 0 ? sideOpacity.toFixed(3) : "";
        rightEl.style.pointerEvents = sidePointer;
      }

      if (bgEl) {
        const blurPx = Math.min(y / 2, 25);
        const blurValue = blurPx > 0.01 ? `blur(${blurPx.toFixed(2)}px)` : "";
        bgEl.style.backdropFilter = blurValue;
        (
          bgEl.style as CSSStyleDeclaration & {
            webkitBackdropFilter?: string;
          }
        ).webkitBackdropFilter = blurValue;
      }
    };

    const scheduleSync = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(applyScrollDom);
    };

    applyScrollDom();
    lenis?.on("scroll", scheduleSync);
    window.addEventListener("scroll", scheduleSync, { passive: true });
    window.addEventListener("resize", scheduleSync);
    window.addEventListener("portfolio:page-ready", scheduleSync);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      lenis?.off("scroll", scheduleSync);
      window.removeEventListener("scroll", scheduleSync);
      window.removeEventListener("resize", scheduleSync);
      window.removeEventListener("portfolio:page-ready", scheduleSync);
    };
  }, [lenis, pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        void closeMenu();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMenuOpen, closeMenu]);

  const navItems = SITE_CONFIG.navLinks;

  const headerClasses = [
    active ? "active" : "",
    scrolled ? "scrolled" : "",
    isHeaderSecondary ? "secondary" : "",
    isMenuOpen ? "open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header ref={headerRef} className={headerClasses}>
      <div ref={headerBarRef} className="headerBar">
        <div className="contentWrapper">
          <div ref={leftRef} className="left">
            <TransitionLink href="/" className="logo" aria-label={SITE_CONFIG.fullName}>
              <MvPixelLogo
                animateFrames
                secondary={isHeaderSecondary || isMenuOpen}
              />
            </TransitionLink>
          </div>

          <div className="center">
            <nav className="menuContainer" aria-label="Main navigation">
              <div ref={menuBgRef} className="background" />
              <div className="innerContainer">
                <ul>
                  {navItems.map((item) => {
                    const current = isNavActive(pathname, item.href);
                    return (
                      <li
                        key={item.href}
                        className={current ? "active" : undefined}
                      >
                        <TransitionLink
                          href={item.href}
                          aria-current={current ? "page" : undefined}
                        >
                          {item.label}
                        </TransitionLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </nav>
          </div>

          <div ref={rightRef} className="right">
            {SITE_CONFIG.socials.map((social) => {
              const isExternal = social.href.startsWith("http");
              return (
                <a
                  key={social.platform}
                  href={social.href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  aria-label={social.label}
                >
                  <SocialGlyph platform={social.platform} />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <button
        type="button"
        className={`menuIcon${active ? " active" : ""}`}
        aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isMenuOpen}
        onClick={() => void toggleMenu()}
        style={{
          appearance: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
        }}
      >
        <div className="hamburger">
          <div className="bars">
            <span className="bar" />
            <span className="bar" />
            <span className="bar" />
          </div>
        </div>
      </button>

      <div className="hamburgerMenu" aria-hidden={!isMenuOpen}>
        <div className="menuContainer">
          <ul className="mainMenu">
            {navItems.map((item) => {
              const current = isNavActive(pathname, item.href);
              return (
                <li key={item.href} className={current ? "active" : undefined}>
                  <TransitionLink
                    href={item.href}
                    tabIndex={isMenuOpen ? 0 : -1}
                    aria-current={current ? "page" : undefined}
                  >
                    {item.label}
                  </TransitionLink>
                </li>
              );
            })}
          </ul>

          <div className="socials">
            {SITE_CONFIG.socials.map((social) => {
              const isExternal = social.href.startsWith("http");
              return (
                <a
                  key={social.platform}
                  href={social.href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  aria-label={social.label}
                  tabIndex={isMenuOpen ? 0 : -1}
                >
                  <SocialGlyph platform={social.platform} />
                </a>
              );
            })}
          </div>

          <DrawSvg
            active={isMenuOpen}
            delay={0.35}
            className="drawTextContainer"
          >
            <SignatureDrawSvg variant="menu" />
          </DrawSvg>
        </div>
      </div>
    </header>
  );
}

export default Header;
