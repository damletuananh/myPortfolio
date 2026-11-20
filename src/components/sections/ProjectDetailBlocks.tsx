"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type {
  ProjectItem,
  CaseStudyBlock,
  MediaAsset,
} from "@/data/portfolio";
import { LaurelIcon } from "@/components/svg/BrandGraphics";
import { TransitionLink } from "@/components/providers/TransitionProvider";
import { SplitTitle, BigDriftTitle } from "@/components/motion/SplitTitle";
import { Marquee } from "@/components/motion/Marquee";
import {
  BlockAnim,
  InnerCanvasBox,
  ActionButton,
  ToolTipIcon,
} from "@/components/motion/MicroPrimitives";

gsap.registerPlugin(ScrollTrigger);

const NEXT_DRIFT_SEGMENTS = [
  { text: "N" },
  { text: "E", speed: -1.2 },
  { text: "XT" },
];

const NEXT_PART_SPEEDS: Record<number, number> = {
  1: -1.2,
};

function CaseStudyMedia({
  media,
  aspect169 = false,
}: {
  media: MediaAsset;
  aspect169?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !media.videoSrc) return;

    if (typeof IntersectionObserver === "undefined") {
      video.play().catch(() => {});
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [media.videoSrc]);

  return (
    <div className={`imageWrapper${aspect169 ? " imageWrapper--169" : ""}`}>
      {media.videoSrc ? (
        <video
          ref={videoRef}
          className="innerImage setVideoOnScroll"
          src={media.videoSrc}
          poster={media.imageSrc}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={media.alt}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="innerImage"
          src={media.imageSrc}
          alt={media.alt}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
}

function renderCaseStudyBlock(block: CaseStudyBlock, index: number) {
  const id = index === 0 ? "case-study-start" : undefined;

  switch (block.type) {
    case "fullscreen169":
      return (
        <section
          key={index}
          id={id}
          className="projectBlock projectFullscreen169Block"
        >
          <div className="contentWrapper">
            <CaseStudyMedia media={block.media} />
            {block.caption ? (
              <p className="caption">{block.caption}</p>
            ) : null}
          </div>
        </section>
      );

    case "text":
      return (
        <section
          key={index}
          id={id}
          className="projectBlock projectTextBlock"
        >
          <div className="contentWrapper smaller">
            <h2 className="smallTitle">{block.heading}</h2>
            <div className="text justify">
              {block.paragraphs.map((paragraph, pIdx) => (
                <p key={pIdx}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>
      );

    case "imageText":
      return (
        <section
          key={index}
          id={id}
          className="projectBlock projectImageTextBlock"
        >
          <div className="contentWrapper">
            <div className={`cols${block.align === "right" ? " reverse" : ""}`}>
              <div className="mediaCol">
                <CaseStudyMedia
                  media={block.media}
                  aspect169={Boolean(block.aspect169)}
                />
              </div>
              <div
                className={`textCol${block.align === "right" ? "" : " right"}`}
              >
                <h2 className="smallTitle">{block.heading}</h2>
                <div className="text justify">
                  {block.paragraphs.map((paragraph, pIdx) => (
                    <p key={pIdx}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      );

    case "split5050":
      return (
        <section
          key={index}
          id={id}
          className="projectBlock project5050Block"
        >
          <div className="contentWrapper">
            <div className="cols">
              <div className="col">
                <CaseStudyMedia media={block.left} />
              </div>
              <div className="col">
                <CaseStudyMedia media={block.right} />
              </div>
            </div>
          </div>
        </section>
      );

    case "mobileShowcase":
      return (
        <section
          key={index}
          id={id}
          className="projectBlock projectMobileBlock"
        >
          <div className="contentWrapper">
            <div className="cols">
              {block.screens.slice(0, 3).map((screen, sIdx) => (
                <div
                  key={sIdx}
                  className="col"
                  style={
                    block.darkSurface
                      ? { backgroundColor: "var(--color-ink)" }
                      : undefined
                  }
                >
                  <CaseStudyMedia media={screen} />
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "awards":
      return (
        <section
          key={index}
          id={id}
          className="projectBlock projectAwardsBlock"
        >
          <div className="contentWrapper small">
            <div className="cols">
              <div className="col">
                <h2 className="normalTitle">{block.heading}</h2>
              </div>
              <div className="col">
                {block.awards.map((award, aIdx) => (
                  <div key={aIdx} className="award">
                    <span className="awardTitle">{award.title}</span>
                    <div className="awardCompanyWrap">
                      <span className="leftIcon">
                        <LaurelIcon side="left" />
                      </span>
                      <span className="awardCompany">
                        {award.organization}
                        {award.year ? ` · ${award.year}` : ""}
                      </span>
                      <span className="rightIcon">
                        <LaurelIcon side="right" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      );

    default:
      return null;
  }
}

export function ProjectDetailBlocks({
  project,
  nextProject,
}: {
  project: ProjectItem;
  nextProject: ProjectItem;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [headerActive, setHeaderActive] = useState(false);

  const tagsStyleVariant = Math.min(Math.max(project.tags.length, 2), 4);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setHeaderActive(true);
    }, 100);

    return () => {
      window.clearTimeout(timer);
    };
  }, [project.slug]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const blocks = Array.from(
      root.querySelectorAll<HTMLElement>(".projectBlock")
    );
    const awards = Array.from(
      root.querySelectorAll<HTMLElement>(".projectAwardsBlock .award")
    );
    const nextItems = Array.from(
      root.querySelectorAll<HTMLElement>(".nextProjectBlock .item")
    );

    const revealElements = [...blocks, ...awards, ...nextItems];

    const checkVisible = () => {
      const threshold = window.innerHeight * 0.92;
      for (const el of revealElements) {
        if (el.classList.contains("inview")) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top < threshold && rect.bottom > 0) {
          el.classList.add("inview");
        }
      }
    };

    const ctx = gsap.context(() => {
      blocks.forEach((block) => {
        const markInview = () => block.classList.add("inview");
        ScrollTrigger.create({
          trigger: block,
          start: "top 88%",
          once: true,
          onEnter: markInview,
          onEnterBack: markInview,
        });
      });

      awards.forEach((award) => {
        const markInview = () => award.classList.add("inview");
        ScrollTrigger.create({
          trigger: award,
          start: "top 90%",
          once: true,
          onEnter: markInview,
          onEnterBack: markInview,
        });
      });

      nextItems.forEach((item) => {
        const markInview = () => item.classList.add("inview");
        ScrollTrigger.create({
          trigger: item,
          start: "top 88%",
          once: true,
          onEnter: markInview,
          onEnterBack: markInview,
        });
      });

      checkVisible();
    }, rootRef);

    window.addEventListener("portfolio:page-ready", checkVisible);

    return () => {
      window.removeEventListener("portfolio:page-ready", checkVisible);
      ctx.revert();
    };
  }, [project.slug]);

  return (
    <div ref={rootRef}>
      <section
        className={`projectHeaderBlock${headerActive ? " active" : ""}`}
      >
        <div className="contentWrapper">
          <SplitTitle
            variant="huge"
            tag="h1"
            lines={project.titleLines}
            immediate
            delay={0.1}
          />

          <div className={`tags style-${tagsStyleVariant}`}>
            {project.tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>

          <div className="tags resp">
            <Marquee items={project.tags} />
          </div>

          <div className="divider" aria-hidden="true" />

          <div className="projectInfo">
            <div className="info">
              <div className="infoItem">
                <span className="infoLabel">Client</span>
                <span className="infoValue">{project.client}</span>
              </div>
              <div className="infoItem">
                <span className="infoLabel">Role</span>
                <span className="infoValue">{project.role}</span>
              </div>
              <div className="infoItem">
                <span className="infoLabel">Services</span>
                <span className="infoValue">{project.services.join(", ")}</span>
              </div>
            </div>

            <span className="year">{project.year}</span>

            <div className="buttonWrapper">
              {project.liveUrl ? (
                <ActionButton
                  href={project.liveUrl}
                  variant="primary"
                  size="small"
                  icon
                >
                  {project.liveUrl.includes("github.com")
                    ? "View on GitHub"
                    : "Case Overview"}
                </ActionButton>
              ) : (
                <ActionButton
                  variant="primary"
                  size="small"
                  icon
                  onClick={() => {
                    document
                      .getElementById("case-study-start")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Explore case
                </ActionButton>
              )}
            </div>
          </div>

          <div className="divider" aria-hidden="true" />
        </div>
      </section>

      {project.caseStudyBlocks.map((block, index) =>
        renderCaseStudyBlock(block, index)
      )}

      <section className="workFeaturedBlock nextProjectBlock">
        <div className="contentWrapper">
          <div className="intro">
            <div className="left">
              <BlockAnim variant={1} />
            </div>

            <BigDriftTitle
              tag="h2"
              segments={NEXT_DRIFT_SEGMENTS}
              partSpeeds={NEXT_PART_SPEEDS}
            />

            <div className="right">
              <BlockAnim variant={2} />
            </div>
          </div>

          <div className="items">
            <article className="item">
              <div className={`itemIntro style-${nextProject.layoutStyle}`}>
                <span className="part">{nextProject.client}</span>
                <span className="part center">
                  {nextProject.services.slice(0, 2).join(" · ")}
                </span>
                <span className="part right">{nextProject.year}</span>
              </div>

              <div className="itemIntro resp">
                <Marquee items={[...nextProject.tags, nextProject.year]} />
              </div>

              <TransitionLink
                href={`/project/${nextProject.slug}`}
                className="itemMediaLink"
                aria-label={`Next project: ${nextProject.title}`}
              >
                <InnerCanvasBox
                  imageSrc={nextProject.primaryMedia.imageSrc}
                  respImageSrc={nextProject.primaryMedia.respImageSrc}
                  videoSrc={nextProject.primaryMedia.videoSrc}
                  alt={nextProject.primaryMedia.alt}
                  mouseTrigger
                />
              </TransitionLink>

              <div className="titleWrapper">
                <TransitionLink
                  href={`/project/${nextProject.slug}`}
                  className="titleLink"
                >
                  <span className="num itemNum">{nextProject.number}</span>
                  <span className="textTitle">{nextProject.title}</span>
                </TransitionLink>
                {nextProject.designCredit ? (
                  <ToolTipIcon
                    small
                    label={nextProject.role}
                    info={nextProject.designCredit}
                  />
                ) : null}
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProjectDetailBlocks;
