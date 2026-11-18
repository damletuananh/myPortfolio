"use client";

import React from "react";
import { usePathname } from "next/navigation";
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

const KNOWN_PORTFOLIO_PATHS = new Set<string>([
  "/",
  "/work",
  "/about",
  "/contact",
  ...PROJECTS.map((project) => `/project/${project.slug}`),
]);

function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function Footer() {
  const pathname = normalizePathname(usePathname() ?? "/");

  const isHome = pathname === "/";
  const isErrorPage = !KNOWN_PORTFOLIO_PATHS.has(pathname);

  return (
    <footer className="setPrimaryBackground">
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
              segments={[
                { text: "C" },
                { text: "ON", speed: -1.2 },
                { text: "NECT" },
              ]}
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
                <div>{SITE_CONFIG.locationLabel}</div>
                <div>{SITE_CONFIG.coordinates}</div>
                <div className="footerAside">{SITE_CONFIG.footerAside}</div>
              </div>

              <div className="col">
                <div>
                  <a
                    className="textLink secondary"
                    href={`mailto:${SITE_CONFIG.email}`}
                  >
                    {SITE_CONFIG.email}
                  </a>
                </div>
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
