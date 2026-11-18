"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
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
import { DrawSvg } from "@/components/motion/DrawSvg";
import { Marquee } from "@/components/motion/Marquee";
import {
  LineAnim,
  BlockAnim,
  InnerCanvasBox,
} from "@/components/motion/MicroPrimitives";

export function AboutBlocks() {
  const headerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const lines = el.querySelectorAll<HTMLElement>(".line");
      if (lines.length === 0) return;

      gsap.fromTo(
        lines,
        { y: "105%" },
        {
          y: "0%",
          duration: 1.0,
          stagger: 0.12,
          ease: "power3.out",
          delay: 0.12,
          clearProps: "transform",
        }
      );
    }, headerRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <section className="aboutHeaderBlock">
        <div className="contentWrapper">
          <h1 ref={headerRef} className="hugeTitle">
            <span className="row">
              <span className="line">
                <span className="lineInner">{ABOUT_CONTENT.title}</span>
              </span>
            </span>

            <span className="row splitRow">
              <span className="left">
                <span className="line">
                  <span className="innerText">{ABOUT_CONTENT.headerSplit.left}</span>
                </span>
              </span>
              <span className="animatedText">
                <DrawSvg active delay={0.7}>
                  <SignatureDrawSvg variant="about" />
                </DrawSvg>
              </span>
              <span className="right">
                <span className="line">
                  <span className="innerText">{ABOUT_CONTENT.headerSplit.right}</span>
                </span>
              </span>
            </span>
          </h1>

          <div className="tags">
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

          <div className="introText">
            <div className="leftCol">
              <span className="mTag">{SITE_CONFIG.initials}</span>
            </div>
            <div className="rightCol">
              <WordReveal text={ABOUT_CONTENT.introParagraph} tag="p" />
            </div>
          </div>

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
              {ABOUT_CONTENT.bodyParagraphs.map((paragraph, index) => (
                <div key={index} className="textContainer">
                  <PlusCross rotating />
                  <LineAnim />
                  <WordReveal text={paragraph} tag="p" className="text" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="servicesBlock">
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
            {SERVICES.map((service) => (
              <div key={service.id} className="service">
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

      <section className="timelineBlock">
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
            {TIMELINE_EVENTS.map((event) => (
              <div key={event.id} className="timelineItem">
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

      <section className="awwwardsBlock">
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
                <strong className="certKicker">{ABOUT_CONTENT.awwwardsHeading}</strong>
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
            {CERTIFICATIONS.map((cert) => (
              <div key={cert.id} className="certificationRow">
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
