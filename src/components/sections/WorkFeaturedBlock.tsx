"use client";

import { Fragment, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  SITE_CONFIG,
  FEATURED_PROJECTS,
  type ProjectItem,
} from "@/data/portfolio";
import { TransitionLink } from "@/components/providers/TransitionProvider";
import { BigDriftTitle } from "@/components/motion/SplitTitle";
import { Parallax } from "@/components/motion/Parallax";
import { WordReveal } from "@/components/motion/WordReveal";
import { Marquee } from "@/components/motion/Marquee";
import {
  LineAnim,
  BlockAnim,
  ToolTipIcon,
  InnerCanvasBox,
  ActionButton,
} from "@/components/motion/MicroPrimitives";

gsap.registerPlugin(ScrollTrigger);

const WORK_DRIFT_SEGMENTS = [
  { text: "W", speed: -0.6 },
  { text: "O", speed: -1.2 },
  { text: "RK" },
];

const WORK_PART_SPEEDS: Record<number, number> = {
  0: -0.6,
  1: -1.2,
};

const FEATURED_TAG_SPEEDS = [1.2, 1.0, 0.5, 0.8, 0.5, -1.0] as const;

function getFeaturedItemClass(style: ProjectItem["layoutStyle"]): string {
  switch (style) {
    case 1:
      return "item highlight";
    case 2:
      return "item half smallMarginBottom";
    case 3:
      return "item half extraPadding positionTop";
    case 4:
      return "item half extraPadding";
    case 5:
      return "item bigger";
    case 6:
      return "item highlight noMargin";
    default:
      return "item";
  }
}

function FeaturedProjectCard({
  project,
  cardIndex,
}: {
  project: ProjectItem;
  cardIndex: number;
}) {
  const showBlockAnim = project.layoutStyle === 3;
  const cardSpeed = FEATURED_TAG_SPEEDS[cardIndex % FEATURED_TAG_SPEEDS.length];

  return (
    <article className={getFeaturedItemClass(project.layoutStyle)}>
      <div className={`itemIntro style-${project.layoutStyle}`}>
        <Parallax
          direction="horizontal"
          speed={cardSpeed}
          className="part"
        >
          <span>{project.client}</span>
        </Parallax>
        <span className="part center">
          {project.services.slice(0, 2).join(" · ")}
        </span>
        <span className="part right">{project.year}</span>
      </div>

      <div className="itemIntro resp">
        <Marquee items={[...project.tags, project.year]} />
      </div>

      {showBlockAnim ? <BlockAnim variant={1} /> : null}

      <TransitionLink
        href={`/project/${project.slug}`}
        className="itemMediaLink"
        aria-label={`View ${project.title} case study`}
      >
        {project.secondaryMedia ? (
          <div className="canvasWrappers">
            <InnerCanvasBox
              imageSrc={project.primaryMedia.imageSrc}
              respImageSrc={project.primaryMedia.respImageSrc}
              videoSrc={project.primaryMedia.videoSrc}
              alt={project.primaryMedia.alt}
              mouseTrigger
            />
            <InnerCanvasBox
              imageSrc={project.secondaryMedia.imageSrc}
              respImageSrc={project.secondaryMedia.respImageSrc}
              videoSrc={project.secondaryMedia.videoSrc}
              alt={project.secondaryMedia.alt}
              delay={project.delaySecondary ?? 0.3}
              mouseTrigger
            />
          </div>
        ) : (
          <InnerCanvasBox
            imageSrc={project.primaryMedia.imageSrc}
            respImageSrc={project.primaryMedia.respImageSrc}
            videoSrc={project.primaryMedia.videoSrc}
            alt={project.primaryMedia.alt}
            mouseTrigger
          />
        )}
      </TransitionLink>

      <div className="titleWrapper">
        <TransitionLink
          href={`/project/${project.slug}`}
          className="titleLink"
        >
          <span className="num itemNum">{project.number}</span>
          <span className="textTitle">{project.title}</span>
        </TransitionLink>
        {project.designCredit ? (
          <ToolTipIcon
            small
            label={project.role}
            info={project.designCredit}
          />
        ) : null}
      </div>
    </article>
  );
}

export function WorkFeaturedBlock() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const cards = Array.from(section.querySelectorAll<HTMLElement>(".item"));

    const checkVisible = () => {
      const threshold = window.innerHeight * 0.92;
      for (const card of cards) {
        if (card.classList.contains("inview")) continue;
        const rect = card.getBoundingClientRect();
        if (rect.top < threshold && rect.bottom > 0) {
          card.classList.add("inview");
        }
      }
    };

    const ctx = gsap.context(() => {
      cards.forEach((card) => {
        const markInview = () => card.classList.add("inview");

        ScrollTrigger.create({
          trigger: card,
          start: "top 88%",
          once: true,
          onEnter: markInview,
          onEnterBack: markInview,
        });
      });

      checkVisible();
    }, sectionRef);

    window.addEventListener("portfolio:page-ready", checkVisible);

    return () => {
      window.removeEventListener("portfolio:page-ready", checkVisible);
      ctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="workFeaturedBlock">
      <div className="contentWrapper">
        <div className="intro">
          <div className="left">
            <BlockAnim variant={1} />
          </div>

          <BigDriftTitle
            tag="h2"
            segments={WORK_DRIFT_SEGMENTS}
            partSpeeds={WORK_PART_SPEEDS}
          />

          <div className="right">
            <p className="introNote">{SITE_CONFIG.roleTitle}</p>
            <BlockAnim variant={2} />
          </div>
        </div>

        <div className="items">
          {FEATURED_PROJECTS.map((project, index) => (
            <Fragment key={project.slug}>
              <FeaturedProjectCard project={project} cardIndex={index} />

              {project.layoutStyle === 2 ? (
                <div className="contentContainer">
                  <LineAnim />
                  <h3 className="normalTitle">{SITE_CONFIG.manifestoTitle}</h3>
                  <div className="text bigContainerText">
                    <WordReveal text={SITE_CONFIG.manifestoBody} tag="p" />
                  </div>
                </div>
              ) : null}

              {project.layoutStyle === 5 ? (
                <div className="contentContainer smaller hideResp">
                  <BlockAnim variant={2} />
                  <LineAnim />
                  <span className="mTag">{SITE_CONFIG.midNoteTitle}</span>
                  <div className="text">
                    <WordReveal text={SITE_CONFIG.midNoteBody} tag="p" />
                  </div>
                  <div className="midNoteAction">
                    <TransitionLink href="/about" className="textLink">
                      Read the full story
                    </TransitionLink>
                  </div>
                </div>
              ) : null}
            </Fragment>
          ))}
        </div>

        <div className="buttons">
          <div className="left">
            <BlockAnim variant={1} />
          </div>
          <div className="buttonWrapper">
            <ActionButton href="/work" full icon>
              View all work
            </ActionButton>
          </div>
          <div className="right">
            <BlockAnim variant={3} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default WorkFeaturedBlock;
