"use client";

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

function CaseStudyMedia({
  media,
  aspect169 = false,
}: {
  media: MediaAsset;
  aspect169?: boolean;
}) {
  return (
    <div className={`imageWrapper${aspect169 ? " imageWrapper--169" : ""}`}>
      {media.videoSrc ? (
        <video
          className="innerImage"
          src={media.videoSrc}
          poster={media.imageSrc}
          autoPlay
          muted
          loop
          playsInline
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
        <section key={index} id={id} className="projectFullscreen169Block">
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
        <section key={index} id={id} className="projectTextBlock">
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
        <section key={index} id={id} className="projectImageTextBlock">
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
        <section key={index} id={id} className="project5050Block">
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
        <section key={index} id={id} className="projectMobileBlock">
          <div className="contentWrapper">
            <div className="cols">
              {block.screens.slice(0, 3).map((screen, sIdx) => (
                <div
                  key={sIdx}
                  className="col"
                  style={
                    block.darkSurface
                      ? { backgroundColor: "#22264B" }
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
        <section key={index} id={id} className="projectAwardsBlock">
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
  const tagsStyleVariant = Math.min(Math.max(project.tags.length, 2), 4);

  return (
    <>
      <section className="projectHeaderBlock">
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
              segments={[
                { text: "N" },
                { text: "E", speed: -0.6 },
                { text: "XT" },
              ]}
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
                  <span className="num">{nextProject.number}</span>
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
    </>
  );
}

export default ProjectDetailBlocks;
