"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FEATURED_PROJECTS,
  REGULAR_WORK_PROJECTS,
  CLIENTS,
  type ProjectItem,
} from "@/data/portfolio";
import { ClientCategoryIcon } from "@/components/svg/BrandGraphics";
import { TransitionLink } from "@/components/providers/TransitionProvider";
import { SplitTitle } from "@/components/motion/SplitTitle";
import { Marquee } from "@/components/motion/Marquee";
import {
  InnerCanvasBox,
  ToolTipIcon,
} from "@/components/motion/MicroPrimitives";

gsap.registerPlugin(ScrollTrigger);

const WORK_TITLE_LINES = ["Work"];

function CatalogProjectCard({ project }: { project: ProjectItem }) {
  return (
    <article className="item">
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

      <TransitionLink
        href={`/project/${project.slug}`}
        className="itemMediaLink"
        aria-label={`View ${project.title} case study`}
      >
        <InnerCanvasBox
          imageSrc={project.primaryMedia.imageSrc}
          respImageSrc={project.primaryMedia.respImageSrc}
          videoSrc={project.primaryMedia.videoSrc}
          alt={project.primaryMedia.alt}
          mouseTrigger
        />
      </TransitionLink>

      <div className="titleWrapper">
        <TransitionLink href={`/project/${project.slug}`} className="titleLink">
          <span className="num itemNum">{project.number}</span>
          <span className="textTitle">{project.title}</span>
        </TransitionLink>
        {project.designCredit ? (
          <ToolTipIcon small label={project.role} info={project.designCredit} />
        ) : null}
      </div>
    </article>
  );
}

export function WorkCatalogBlock() {
  const sectionRef = useRef<HTMLElement>(null);

  const splitIndex = Math.ceil(CLIENTS.length / 2);
  const clientCols = [CLIENTS.slice(0, splitIndex), CLIENTS.slice(splitIndex)];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const cards = Array.from(section.querySelectorAll<HTMLElement>(".item"));
    const clientsArchive = section.querySelector<HTMLElement>(".clients");
    const targets = clientsArchive ? [...cards, clientsArchive] : cards;

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
      targets.forEach((el) => {
        const markInview = () => el.classList.add("inview");
        ScrollTrigger.create({
          trigger: el,
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
    <section ref={sectionRef} className="workBlock">
      <div className="contentWrapper">
        <div className="intro">
          <SplitTitle
            variant="big"
            tag="h1"
            lines={WORK_TITLE_LINES}
            immediate
            delay={0.1}
            align="center"
          />
        </div>

        <div className="items featured">
          {FEATURED_PROJECTS.map((project) => (
            <CatalogProjectCard key={project.slug} project={project} />
          ))}
        </div>

        {REGULAR_WORK_PROJECTS.length > 0 ? (
          <div className="items">
            {REGULAR_WORK_PROJECTS.map((project) => (
              <CatalogProjectCard key={project.slug} project={project} />
            ))}
          </div>
        ) : null}

        <div className="clients">
          {clientCols.map((colClients, colIndex) => (
            <div key={colIndex} className="col">
              {colClients.map((client, rowIndex) => {
                const staggerStyle = {
                  "--stagger-i": rowIndex,
                } as CSSProperties;

                const rowContent = (
                  <>
                    <span className="clientTitle">{client.name}</span>
                    <span className="type">
                      <ClientCategoryIcon category={client.category} />
                    </span>
                    <span className="year">{client.year}</span>
                  </>
                );

                if (client.url) {
                  return (
                    <a
                      key={client.id}
                      href={client.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="client"
                      style={{
                        ...staggerStyle,
                        color: "inherit",
                        textDecoration: "none",
                      }}
                    >
                      {rowContent}
                    </a>
                  );
                }

                return (
                  <div
                    key={client.id}
                    className="client"
                    style={staggerStyle}
                  >
                    {rowContent}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WorkCatalogBlock;
