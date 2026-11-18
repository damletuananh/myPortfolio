"use client";

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

export function ClientsBlock() {
  return (
    <section className="clientsBlock setPrimaryBackground">
      <div className="contentWrapper">
        <div className="intro">
          <div className="left">
            <BlockAnim variant={2} secondary className="style-4-anim" />
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
            <div key={client.id} className="clientWrapper">
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
                  <span className="clientTitle">{client.name}</span>
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
          <LineAnim secondary className="right" />
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
