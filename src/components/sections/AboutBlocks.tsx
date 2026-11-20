"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  SITE_CONFIG,
  PROFILE_PORTRAIT_MEDIA,
  ABOUT_CONTENT,
  SERVICES,
  TIMELINE_EVENTS,
  CERTIFICATIONS,
} from "@/data/portfolio";
import {
  SignatureDrawSvg,
  CertificationEmblemSvg,
  PlusCross,
} from "@/components/svg/BrandGraphics";
import { WordReveal } from "@/components/motion/WordReveal";
import { Parallax } from "@/components/motion/Parallax";
import { DrawSvg } from "@/components/motion/DrawSvg";
import { Marquee } from "@/components/motion/Marquee";
import {
  LineAnim,
  BlockAnim,
  InnerCanvasBox,
} from "@/components/motion/MicroPrimitives";

gsap.registerPlugin(ScrollTrigger);

export function AboutBlocks() {
  const headerSectionRef = useRef<HTMLElement>(null);
  const row1LineRef = useRef<HTMLSpanElement>(null);
  const splitRowRef = useRef<HTMLSpanElement>(null);
  const splitLeftRef = useRef<HTMLSpanElement>(null);
  const splitLeftLineRef = useRef<HTMLSpanElement>(null);
  const splitRightRef = useRef<HTMLSpanElement>(null);
  const splitRightLineRef = useRef<HTMLSpanElement>(null);
  const splitCenterRef = useRef<HTMLSpanElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);

  const servicesRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLElement>(null);
  const awwwardsRef = useRef<HTMLElement>(null);

  // Iconic /about Hero Split-Apart choreography
  useEffect(() => {
    const section = headerSectionRef.current;
    const row1Line = row1LineRef.current;
    const splitRow = splitRowRef.current;
    const splitLeft = splitLeftRef.current;
    const splitLeftLine = splitLeftLineRef.current;
    const splitRight = splitRightRef.current;
    const splitRightLine = splitRightLineRef.current;
    const splitCenter = splitCenterRef.current;
    const tags = tagsRef.current;

    if (
      !section ||
      !row1Line ||
      !splitRow ||
      !splitLeft ||
      !splitLeftLine ||
      !splitRight ||
      !splitRightLine ||
      !splitCenter ||
      !tags
    ) {
      return;
    }

    let splitCompleted = false;

    const computeSplitShifts = () => {
      const prevLeftX = Number(gsap.getProperty(splitLeft, "x")) || 0;
      const prevRightX = Number(gsap.getProperty(splitRight, "x")) || 0;

      const rowRect = splitRow.getBoundingClientRect();
      const leftRect = splitLeft.getBoundingClientRect();
      const rightRect = splitRight.getBoundingClientRect();
      const centerRect = splitCenter.getBoundingClientRect();

      const baseLeftLeft = leftRect.left - prevLeftX;
      const baseLeftRight = leftRect.right - prevLeftX;
      const baseRightLeft = rightRect.left - prevRightX;
      const baseRightRight = rightRect.right - prevRightX;

      const rowCenter = rowRect.left + rowRect.width / 2;
      const centerW = Math.max(centerRect.width, window.innerWidth * 0.22);
      const breathingPad = window.innerWidth * 0.022;

      let leftShift = rowCenter - centerW / 2 - breathingPad - baseLeftRight;
      let rightShift = rowCenter + centerW / 2 + breathingPad - baseRightLeft;

      // Clamp cleanly inside row bounds so TUAN / ANH never clip off-screen
      const minLeftShift = rowRect.left - baseLeftLeft;
      const maxRightShift = rowRect.right - baseRightRight;
      leftShift = Math.min(0, Math.max(leftShift, minLeftShift));
      rightShift = Math.max(0, Math.min(rightShift, maxRightShift));

      return { left: leftShift, right: rightShift };
    };

    const ctx = gsap.context(() => {
      // Phase 1: Slide up ABOUT (Row 1) and TUAN / ANH (Row 2)
      gsap.fromTo(
        row1Line,
        { y: "105%" },
        {
          y: "0%",
          duration: 0.6,
          ease: "power2.out",
          delay: 0.05,
        }
      );

      gsap.fromTo(
        [splitLeftLine, splitRightLine],
        { y: "105%" },
        {
          y: "0%",
          duration: 0.6,
          ease: "power2.out",
          delay: 0.1,
        }
      );

      // Tags marquee reveal at 0.9s
      gsap.fromTo(
        tags,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: "power2.out",
          delay: 0.9,
          clearProps: "transform",
        }
      );

      const mm = gsap.matchMedia();

      // Desktop / Tablet (> 580px): split TUAN & ANH horizontally apart at 0.6s,
      // then fade in centered editorial intro copy at 0.65s
      mm.add("(min-width: 581px)", () => {
        gsap.set([splitLeft, splitRight], { x: 0 });
        gsap.set(splitCenter, { opacity: 0, pointerEvents: "none" });

        gsap.to(splitLeft, {
          x: () => computeSplitShifts().left,
          duration: 0.6,
          delay: 0.6,
          ease: "power2.out",
          force3D: true,
          onComplete: () => {
            splitCompleted = true;
          },
        });

        gsap.to(splitRight, {
          x: () => computeSplitShifts().right,
          duration: 0.6,
          delay: 0.6,
          ease: "power2.out",
          force3D: true,
        });

        gsap.to(splitCenter, {
          opacity: 1,
          pointerEvents: "auto",
          duration: 0.55,
          delay: 0.65,
          ease: "power2.out",
          onStart: () => {
            splitCenter.classList.add("active");
          },
        });

        let mmDisposed = false;
        const handleResize = () => {
          if (mmDisposed || !splitCompleted) return;
          const { left, right } = computeSplitShifts();
          gsap.set(splitLeft, { x: left, force3D: true });
          gsap.set(splitRight, { x: right, force3D: true });
        };

        if (typeof document !== "undefined" && document.fonts?.ready) {
          document.fonts.ready.then(() => {
            if (!mmDisposed && splitCompleted) {
              handleResize();
            }
          });
        }

        window.addEventListener("resize", handleResize);
        return () => {
          mmDisposed = true;
          splitCompleted = false;
          window.removeEventListener("resize", handleResize);
        };
      });

      // Mobile (<= 580px): stack cleanly without horizontal clipping
      mm.add("(max-width: 580px)", () => {
        gsap.set([splitLeft, splitRight], { clearProps: "x,transform" });
        gsap.fromTo(
          splitCenter,
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            pointerEvents: "auto",
            duration: 0.55,
            delay: 0.45,
            ease: "power2.out",
            onStart: () => {
              splitCenter.classList.add("active");
            },
          }
        );
      });
    }, headerSectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  // ScrollTrigger .inview choreography for Services, Timeline, and Certifications
  useEffect(() => {
    const targets = [
      servicesRef.current,
      timelineRef.current,
      awwwardsRef.current,
    ].filter((el): el is HTMLElement => el !== null);

    if (targets.length === 0) return;

    const checkVisible = () => {
      const threshold = window.innerHeight * 0.92;
      for (const el of targets) {
        if (el.classList.contains("inview")) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top < threshold && rect.bottom > 0) {
          el.classList.add("inview");
        }
      }
    };

    const ctx = gsap.context(() => {
      targets.forEach((section) => {
        const markInview = () => section.classList.add("inview");
        ScrollTrigger.create({
          trigger: section,
          start: "top 88%",
          once: true,
          onEnter: markInview,
          onEnterBack: markInview,
        });
      });

      checkVisible();
    });

    window.addEventListener("portfolio:page-ready", checkVisible);

    return () => {
      window.removeEventListener("portfolio:page-ready", checkVisible);
      ctx.revert();
    };
  }, []);

  return (
    <>
      <section ref={headerSectionRef} className="aboutHeaderBlock">
        <div className="contentWrapper">
          <h1 className="hugeTitle">
            <span className="row">
              <span ref={row1LineRef} className="line">
                <span className="lineInner">{ABOUT_CONTENT.title}</span>
              </span>
            </span>

            <span
              ref={splitRowRef}
              className="row aboutSplitRow"
              style={{ columnGap: "0.22em" }}
            >
              <span ref={splitLeftRef} className="aboutSplitLeft">
                <span
                  style={{
                    display: "inline-block",
                    overflow: "hidden",
                    verticalAlign: "top",
                  }}
                >
                  <span ref={splitLeftLineRef} className="line">
                    <span className="innerText">
                      {ABOUT_CONTENT.headerSplit.left}
                    </span>
                  </span>
                </span>
              </span>

              <span
                ref={splitCenterRef}
                className="aboutSplitCenter"
                style={{
                  fontFamily: "var(--font-sans), 'DM Sans', sans-serif",
                  fontSize: "var(--body-size)",
                  lineHeight: "var(--body-lh)",
                  fontWeight: 500,
                  textTransform: "none",
                  letterSpacing: "normal",
                  whiteSpace: "normal",
                }}
              >
                {ABOUT_CONTENT.headerCenterNote}
              </span>

              <span ref={splitRightRef} className="aboutSplitRight">
                <span
                  style={{
                    display: "inline-block",
                    overflow: "hidden",
                    verticalAlign: "top",
                  }}
                >
                  <span ref={splitRightLineRef} className="line">
                    <span className="innerText">
                      {ABOUT_CONTENT.headerSplit.right}
                    </span>
                  </span>
                </span>
              </span>
            </span>
          </h1>

          <div ref={tagsRef} className="tags">
            <Marquee items={ABOUT_CONTENT.tags} scrollSpeed={0.3} />
          </div>
        </div>
      </section>

      <section className="aboutBlock">
        <div className="contentWrapper">
          <div className="intro">
            <div className="drawText">
              <DrawSvg triggerOnScroll delay={0.1}>
                <SignatureDrawSvg variant="hero" />
              </DrawSvg>
            </div>
            <InnerCanvasBox
              imageSrc={PROFILE_PORTRAIT_MEDIA.imageSrc}
              respImageSrc={PROFILE_PORTRAIT_MEDIA.respImageSrc}
              alt={PROFILE_PORTRAIT_MEDIA.alt}
              biggerGrid
              mouseTrigger
            />
          </div>

          <Parallax speed={1.2} className="introText">
            <div className="leftCol">
              <span className="mTag">{SITE_CONFIG.initials}</span>
            </div>
            <div className="rightCol">
              <WordReveal text={ABOUT_CONTENT.introParagraph} tag="p" />
            </div>
          </Parallax>

          <div className="aboutContent">
            <div className="normalTitle">
              <WordReveal
                text={ABOUT_CONTENT.sinceHeadline}
                fast
                scrollWords
                tag="h2"
              />
            </div>

            <div className="textRows">
              <LineAnim />
              <LineAnim delay={0.2} />
              {ABOUT_CONTENT.bodyParagraphs.map((paragraph, index) => (
                <div key={index} className="textContainer">
                  <PlusCross rotating />
                  <WordReveal text={paragraph} tag="p" className="text" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section ref={servicesRef} className="servicesBlock">
        <div className="contentWrapper">
          <div className="tableHeader">
            <BlockAnim variant={2} />
            <div className="cols">
              <div className="col">
                <span>No.</span>
              </div>
              <div className="col">
                <span>Capability</span>
              </div>
              <div className="col">
                <span>Engineering Focus</span>
              </div>
            </div>
            <div className="divider" aria-hidden="true" />
          </div>

          <div className="services">
            {SERVICES.map((service, index) => (
              <div
                key={service.id}
                className="service"
                style={{ "--stagger-i": index } as CSSProperties}
              >
                <div className="col">
                  <span className="num">{service.number}</span>
                </div>
                <div className="col">
                  <span className="textTitle">{service.title}</span>
                </div>
                <div className="col">
                  <p className="text justify">{service.description}</p>
                  <div className="serviceTags">
                    {service.items.map((item) => (
                      <span key={item} className="serviceTag">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={timelineRef} className="timelineBlock">
        <div className="contentWrapper">
          <div className="tableHeader">
            <BlockAnim variant={1} />
            <div className="cols">
              <div className="col">
                <span>Period</span>
              </div>
              <div className="col">
                <span>Role &amp; Milestone</span>
              </div>
              <div className="col">
                <span>Story &amp; Impact</span>
              </div>
            </div>
            <div className="divider" aria-hidden="true" />
          </div>

          <div className="timelines">
            {TIMELINE_EVENTS.map((event, index) => (
              <div
                key={event.id}
                className="timelineItem"
                style={{ "--stagger-i": index } as CSSProperties}
              >
                <div className="col">
                  <span className="num">{event.period}</span>
                </div>
                <div className="col">
                  <div className="milestoneHead">
                    <span className="textTitle">{event.title}</span>
                    {event.highlight ? (
                      <span className="timelineBadge">{event.highlight}</span>
                    ) : null}
                  </div>
                </div>
                <div className="col">
                  <p className="text justify">{event.context}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={awwwardsRef} className="awwwardsBlock">
        <div className="contentWrapper">
          <div className="cols">
            <div className="col">
              <h2 className="normalTitle certTitle">
                <span className="line">
                  <span>CERTI</span>
                  <span>FICATIONS</span>
                </span>
              </h2>
              <p className="text justify">
                <strong className="certKicker">
                  {ABOUT_CONTENT.awwwardsHeading}
                </strong>
                {" — "}
                {ABOUT_CONTENT.awwwardsCopy}
              </p>
            </div>
            <div className="col">
              <CertificationEmblemSvg className="awwwardsLogo" />
              <span className="dot" aria-hidden="true" />
            </div>
          </div>

          <div className="certificationsList">
            {CERTIFICATIONS.map((cert, index) => (
              <div
                key={cert.id}
                className="certificationRow awardRow"
                style={{ "--stagger-i": index } as CSSProperties}
              >
                <span className="certDate">{cert.date}</span>
                <div className="certMain">
                  <span className="certName">{cert.title}</span>
                  <span className="certIssuer">{cert.issuer}</span>
                </div>
                <span className="certFocus">{cert.focus}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default AboutBlocks;
