"use client";

import { Fragment } from "react";
import {
  SITE_CONFIG,
  FEATURED_PROJECTS,
  MID_BIRD_MEDIA,
  type ProjectItem,
} from "@/data/portfolio";
import { SignatureDrawSvg } from "@/components/svg/BrandGraphics";
import { TransitionLink } from "@/components/providers/TransitionProvider";
import { BigDriftTitle } from "@/components/motion/SplitTitle";
import { WordReveal } from "@/components/motion/WordReveal";
import { DrawSvg } from "@/components/motion/DrawSvg";
import { Marquee } from "@/components/motion/Marquee";
import {
  LineAnim,
  BlockAnim,
  ToolTipIcon,
  InnerCanvasBox,
  ActionButton,
} from "@/components/motion/MicroPrimitives";

function getFeaturedItemClass(style: ProjectItem["layoutStyle"]): string {
  switch (style) {
    case 2:
      return "item half smallMarginBottom";
    case 3:
      return "item half extraPadding positionTop";
    case 4:
      return "item half extraPadding";
    case 5:
      return "item bigger";
    case 1:
    case 6:
    default:
      return "item";
  }
}

function FeaturedProjectCard({ project }: { project: ProjectItem }) {
  const showBlockAnim = project.layoutStyle === 3;

  return (
    <article className={getFeaturedItemClass(project.layoutStyle)}>
      <div className={`itemIntro style-${project.layoutStyle}`}>
        <span className="part">{project.client}</span>
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
          <span className="num">{project.number}</span>
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
  const firstHalf = FEATURED_PROJECTS.slice(0, 3);
  const secondHalf = FEATURED_PROJECTS.slice(3);

  return (
    <section className="workFeaturedBlock">
      <div className="contentWrapper">
        <div className="intro">
          <div className="left">
            <BlockAnim variant={1} />
          </div>

          <BigDriftTitle
            tag="h2"
            segments={[
              { text: "W" },
              { text: "O", speed: -0.6 },
              { text: "RK" },
            ]}
          />

          <div className="right">
            <p className="introNote">{SITE_CONFIG.roleTitle}</p>
            <BlockAnim variant={2} />
          </div>
        </div>

        <div className="items">
          {firstHalf.map((project) => (
            <Fragment key={project.slug}>
              <FeaturedProjectCard project={project} />

              {project.layoutStyle === 2 ? (
                <div className="contentContainer">
                  <LineAnim />
                  <h3 className="normalTitle">{SITE_CONFIG.manifestoTitle}</h3>
                  <div className="text bigContainerText">
                    <WordReveal text={SITE_CONFIG.manifestoBody} tag="p" />
                  </div>
                </div>
              ) : null}
            </Fragment>
          ))}

          <div className="contentContainer smaller hideResp">
            <InnerCanvasBox
              imageSrc={MID_BIRD_MEDIA.imageSrc}
              respImageSrc={MID_BIRD_MEDIA.respImageSrc}
              alt={MID_BIRD_MEDIA.alt}
              mouseTrigger
            />
            <LineAnim />
            <div className="drawTextContainer">
              <DrawSvg triggerOnScroll delay={0.1}>
                <SignatureDrawSvg variant="birdCallout" />
              </DrawSvg>
            </div>
            <div className="text">
              <WordReveal text={SITE_CONFIG.birdJokeText} tag="p" />
            </div>
          </div>

          {secondHalf.map((project) => (
            <FeaturedProjectCard key={project.slug} project={project} />
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
            <BlockAnim variant={2} className="style-3-anim" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default WorkFeaturedBlock;
