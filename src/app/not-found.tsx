"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useThemeBackground } from "@/components/providers/ThemeBackgroundProvider";
import { Marquee } from "@/components/motion/Marquee";
import { ActionButton } from "@/components/motion/MicroPrimitives";

function ErrorRows() {
  return (
    <div className="errorTitle">
      <div className="row">
        <span>Oops!</span>
      </div>
      <div className="row">
        <span>you&apos;ve</span>
      </div>
      <div className="row">
        <span>reached</span>
      </div>
      <div className="row">
        <span>a dead</span>
      </div>
      <div className="row">
        <span>end</span>
      </div>
    </div>
  );
}

export default function NotFoundPage() {
  const { portalTarget404, refreshBackgrounds } = useThemeBackground();

  useEffect(() => {
    const blocks = document.querySelector(".blocks");
    blocks?.classList.add("primaryBackgroundFull");
    refreshBackgrounds();

    return () => {
      blocks?.classList.remove("primaryBackgroundFull");
      refreshBackgrounds();
    };
  }, [refreshBackgrounds]);

  return (
    <>
      <section className="errorBlock setPrimaryBackground">
        <div className="errorCanvasTriggerHost mouseTrigger">
          <div className="copyErrorContent">
            <div
              className="backgroundTitle"
              aria-label="Oops! you've reached a dead end"
            >
              <ErrorRows />
            </div>

            <div className="buttonWrapper">
              <ActionButton href="/" variant="secondary" icon>
                Back to home
              </ActionButton>
            </div>
          </div>
        </div>
      </section>

      {portalTarget404
        ? createPortal(
            <div className="copyErrorContent" aria-hidden="true">
              <div className="backgroundTitle">
                <ErrorRows />
                <div className="tags">
                  <Marquee items={["Oops", "Dead End", "404"]} />
                </div>
                <div className="tags second">
                  <Marquee
                    items={["Lost Pup", "Wrong Turn", "Page Not Found"]}
                    direction="right"
                  />
                </div>
              </div>
            </div>,
            portalTarget404
          )
        : null}
    </>
  );
}
