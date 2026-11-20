"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  EnvelopeSimple,
  GithubLogo,
  LinkedinLogo,
} from "@phosphor-icons/react/dist/ssr";
import { SITE_CONFIG, type SocialLink } from "@/data/portfolio";
import { MvPixelLogo, SignatureDrawSvg } from "@/components/svg/BrandGraphics";
import {
  TransitionLink,
  useTransitionNav,
} from "@/components/providers/TransitionProvider";
import { useThemeBackground } from "@/components/providers/ThemeBackgroundProvider";
import { useLenisContext } from "@/components/providers/LenisProvider";
import { DrawSvg } from "@/components/motion/DrawSvg";

const SOCIAL_GLYPHS = {
  github: GithubLogo,
  linkedin: LinkedinLogo,
  email: EnvelopeSimple,
} as const;

export function SocialGlyph({ platform }: { platform: SocialLink["platform"] }) {
  const Icon = SOCIAL_GLYPHS[platform] ?? EnvelopeSimple;
  return <Icon size="1em" weight="bold" aria-hidden="true" />;
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
