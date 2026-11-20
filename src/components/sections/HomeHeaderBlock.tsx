"use client";

import { SITE_CONFIG, HERO_MEDIA } from "@/data/portfolio";
import {
  SignatureDrawSvg,
  BarcodeSvg,
} from "@/components/svg/BrandGraphics";
import { SplitTitle } from "@/components/motion/SplitTitle";
import { WordReveal } from "@/components/motion/WordReveal";
import { Parallax } from "@/components/motion/Parallax";
import { DrawSvg } from "@/components/motion/DrawSvg";
import { Marquee } from "@/components/motion/Marquee";
import {
  LineAnim,
  BlockAnim,
  InnerCanvasBox,
} from "@/components/motion/MicroPrimitives";

const HERO_LINES = [SITE_CONFIG.firstName, SITE_CONFIG.lastName];
const HERO_LINE_SPEEDS = [6, 3];

export function HomeHeaderBlock() {
  return (
    <section className="homeHeaderBlock">
      <div className="contentWrapper">
        <div className="intro">
          <SplitTitle
            variant="huge"
            tag="h1"
            lines={HERO_LINES}
            lineSpeeds={HERO_LINE_SPEEDS}
            scrollPosition="top"
            immediate
            delay={0.1}
          />
          <div className="tags">
            <Marquee items={SITE_CONFIG.heroTags} scrollSpeed={0.35} />
          </div>
        </div>

        <div className="columns">
          <div className="lines" aria-hidden="true">
            <LineAnim delay={0.15} />
            <LineAnim delay={0.3} />
            <LineAnim delay={0.45} />
            <LineAnim delay={0.6} />
          </div>

          <Parallax speed={-2.5} position="top" className="heroBirdParallax">
            <InnerCanvasBox
              imageSrc={HERO_MEDIA.imageSrc}
              respImageSrc={HERO_MEDIA.respImageSrc}
              videoSrc={HERO_MEDIA.videoSrc}
              alt={HERO_MEDIA.alt}
              isHero
              mouseTrigger
            />
          </Parallax>

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

          <div className="extraInfo">
            <Parallax speed={4} position="top" className="innerExtraInfo">
              <span>{SITE_CONFIG.roleTitle}</span>
            </Parallax>
          </div>

          <div className="contentContainer">
            <span className="mTag">{SITE_CONFIG.initials}</span>

            <div className="drawText">
              <DrawSvg active delay={1.8}>
                <SignatureDrawSvg variant="hero" />
              </DrawSvg>
            </div>

            <div className="text justify">
              <WordReveal
                text={SITE_CONFIG.heroBio.join(" ")}
                immediate
                delay={0.6}
                tag="p"
              />
            </div>
          </div>

          <Parallax speed={4} position="top" className="location">
            <div className="innerLocation">
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
            <BlockAnim variant={1} />
          </Parallax>
        </div>
      </div>
    </section>
  );
}

export default HomeHeaderBlock;
