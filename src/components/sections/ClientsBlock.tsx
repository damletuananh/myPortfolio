"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CLIENTS, SITE_CONFIG } from "@/data/portfolio";
import {
  LaurelIcon,
  ClientCategoryIcon,
  PlusCross,
} from "@/components/svg/BrandGraphics";
import {
  LineAnim,
  BlockAnim,
  ToolTipIcon,
  ActionButton,
} from "@/components/motion/MicroPrimitives";

gsap.registerPlugin(ScrollTrigger);

export function ClientsBlock() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const markInview = () => {
      section.classList.add("inview");
    };

    const checkVisible = () => {
      if (section.classList.contains("inview")) return;
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
        markInview();
      }
    };

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top 85%",
        once: true,
        onEnter: markInview,
        onEnterBack: markInview,
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
    <section ref={sectionRef} className="clientsBlock setPrimaryBackground">
      <div className="contentWrapper">
        <div className="intro">
          <div className="left">
            <BlockAnim variant={4} secondary />
          </div>

          <h2 className="bigTitle">
            <span>MIL</span>
            <span className="centerContent">
              <span className="leftIcon">
                <LaurelIcon side="left" />
              </span>
              <span
                className="quoteText"
                style={{ display: "inline-block", textAlign: "center" }}
              >
                Track &amp;
                <br />
                Milestones
              </span>
              <span className="rightIcon">
                <LaurelIcon side="right" />
              </span>
            </span>
            <span>ESTONES</span>
          </h2>
        </div>

        <div className="textColumns">
          <div className="col">
            <span className="mTag">{SITE_CONFIG.initials}</span>
          </div>
          <div className="col">
            <p className="text">
              Since post-lockdown nights pulling templates apart in 2022, quiet
              curiosity has grown into national podiums, mentored research, and
              community classrooms.
            </p>
          </div>
          <div className="col">
            <p className="text">
              Each milestone pairs calm system architecture — Next.js,
              TypeScript, Java, FastAPI, and pgvector RAG — with tactile
              interfaces built to outlast the demo.
            </p>
          </div>
          <div className="col">
            <PlusCross rotating />
          </div>
        </div>

        <div className="clients">
          {CLIENTS.map((client, index) => (
            <div
              key={client.id}
              className="clientWrapper"
              style={{ "--stagger-i": index } as CSSProperties}
            >
              <LineAnim
                secondary
                className={index % 2 === 0 ? "left" : "right"}
              />
              <div
                className={`client hover${client.featured ? " featured" : ""}`}
              >
                <div
                  className="innerClient"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    columnGap: "0.625em",
                    rowGap: "0.25em",
                  }}
                >
                  {client.url ? (
                    <a
                      href={client.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="clientTitle"
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      {client.name}
                    </a>
                  ) : (
                    <span className="clientTitle">{client.name}</span>
                  )}
                  <span
                    className="clientMeta"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.45em",
                    }}
                  >
                    <span
                      className="type"
                      style={{ display: "inline-flex", alignItems: "center" }}
                    >
                      <ClientCategoryIcon category={client.category} />
                    </span>
                    <span className="year">{client.year}</span>
                    {client.tooltipNote || client.tooltipLabel ? (
                      <ToolTipIcon
                        small
                        light
                        label={client.tooltipLabel}
                        info={client.tooltipNote}
                      />
                    ) : null}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="buttons">
          <BlockAnim variant={1} secondary />
          <div className="clientsCtas">
            <ActionButton href="/about" variant="secondary" icon>
              Read full story
            </ActionButton>
            <ActionButton
              href="/contact"
              variant="outline"
              className="lightOutline"
              icon
            >
              Work together
            </ActionButton>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ClientsBlock;
