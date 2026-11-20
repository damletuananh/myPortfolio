"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FOOTER_BIRD_MEDIA, PROJECTS, SITE_CONFIG } from "@/data/portfolio";
import {
  BarcodeSvg,
  MvPixelLogo,
  SignatureDrawSvg,
} from "@/components/svg/BrandGraphics";
import { Marquee } from "@/components/motion/Marquee";
import { BigDriftTitle } from "@/components/motion/SplitTitle";
import { DrawSvg } from "@/components/motion/DrawSvg";
import { InnerCanvasBox } from "@/components/motion/MicroPrimitives";
import { SocialGlyph } from "@/components/chrome/Header";

gsap.registerPlugin(ScrollTrigger);

const KNOWN_PORTFOLIO_PATHS = new Set<string>([
  "/",
  "/work",
  "/about",
  "/contact",
  ...PROJECTS.map((project) => `/project/${project.slug}`),
]);

const CONNECT_DRIFT_SEGMENTS = [
  { text: "C" },
  { text: "ON", speed: -1.2 },
  { text: "NECT" },
];

const CONNECT_PART_SPEEDS: Record<number, number> = {
  1: -1.2,
};

function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function Footer() {
  const pathname = normalizePathname(usePathname() ?? "/");
  const footerRef = useRef<HTMLElement>(null);

  const isHome = pathname === "/";
  const isErrorPage = !KNOWN_PORTFOLIO_PATHS.has(pathname);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const markInview = () => {
      footer.classList.add("inview");
    };

    const checkVisible = () => {
      if (footer.classList.contains("inview")) return;
      const rect = footer.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.96 && rect.bottom > 0) {
        markInview();
      }
    };

    // Reset .inview on route change only if footer is off-screen below fold
    const initialRect = footer.getBoundingClientRect();
    if (initialRect.top >= window.innerHeight * 0.96) {
      footer.classList.remove("inview");
    } else {
      markInview();
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: footer,
        start: "top 92%",
        once: true,
        onEnter: markInview,
        onEnterBack: markInview,
      });

      checkVisible();
    }, footerRef);

    const onPageReady = () => {
      ScrollTrigger.refresh();
      checkVisible();
    };

    window.addEventListener("portfolio:page-ready", onPageReady);

    return () => {
      window.removeEventListener("portfolio:page-ready", onPageReady);
      ctx.revert();
    };
  }, [pathname]);

  return (
    <footer ref={footerRef} className="setPrimaryBackground">
      <div className="contentWrapper">
        <div className="divider" />
      </div>

      {!isErrorPage ? (
        <div className="topFooter">
          <InnerCanvasBox
            imageSrc={FOOTER_BIRD_MEDIA.imageSrc}
            respImageSrc={FOOTER_BIRD_MEDIA.respImageSrc}
            alt={FOOTER_BIRD_MEDIA.alt}
            mouseTrigger
            className={isHome ? "" : "smaller"}
          />

          <div className="contentWrapper">
            <div className="tags">
              <Marquee items={SITE_CONFIG.footerTags} />
            </div>

            <BigDriftTitle
              segments={CONNECT_DRIFT_SEGMENTS}
              partSpeeds={CONNECT_PART_SPEEDS}
              tag="div"
            />

            <div className="textColumns">
              <div className="col">{SITE_CONFIG.initials}</div>

              <div className="col">
                <div className="barCode">
                  <a
                    href={SITE_CONFIG.barcodeHref}
                    aria-label={`Email ${SITE_CONFIG.barcodeLabel}`}
                  >
                    <Marquee direction="right" speed={100} scrollSpeed={10}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          paddingRight: "0.5vw",
                        }}
                      >
                        <BarcodeSvg />
                      </span>
                    </Marquee>
                    <span className="label">{SITE_CONFIG.barcodeLabel}</span>
                  </a>
                </div>
              </div>

              <div className="col">
                <div className="location">
                  <a
                    href={SITE_CONFIG.locationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="locationLink"
                    title="View Ho Chi Minh City on Google Maps"
                    aria-label="Open Ho Chi Minh City on Google Maps (10.7770° N, 106.6954° E)"
                  >
                    {SITE_CONFIG.coordinateLines[0]}
                    <br />
                    {SITE_CONFIG.coordinateLines[1]}
                  </a>
                </div>
                <div className="footerAside">{SITE_CONFIG.footerAside}</div>
              </div>

              <div className="col">
                <div className="footerSocialRow">
                  {SITE_CONFIG.socials
                    .filter((social) => social.platform !== "email")
                    .map((social) => (
                      <a
                        key={social.platform}
                        className="textLink secondary"
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {social.label}
                      </a>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className={`copyFooter${isErrorPage ? " smaller" : ""}`}>
        <div className="contentWrapper">
          <div className="left">
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
                  >
                    <SocialGlyph platform={social.platform} />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="center">
            {!isErrorPage ? (
              <DrawSvg
                triggerOnScroll
                delay={0.1}
                className="drawTextContainer"
              >
                <SignatureDrawSvg variant="footer" />
              </DrawSvg>
            ) : null}
            <div className="logo">
              <MvPixelLogo secondary animateFrames />
            </div>
          </div>

          <div className="right">
            <div className="text">{SITE_CONFIG.copyright}</div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
