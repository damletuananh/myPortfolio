"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLenisContext } from "@/components/providers/LenisProvider";
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
  const { lenis } = useLenisContext();
  const { portalTarget404, refreshBackgrounds } = useThemeBackground();
  const [isRouteVisible, setIsRouteVisible] = useState(true);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) setIsRouteVisible(true);
    });
    return () => {
      active = false;
      setIsRouteVisible(false);
    };
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const blocks = document.querySelector(".blocks");

    html.classList.add("notFoundViewportLock");
    blocks?.classList.add("primaryBackgroundFull");
    window.scrollTo(0, 0);
    refreshBackgrounds();

    let settledRafId = 0;
    const mountRafId = window.requestAnimationFrame(() => {
      refreshBackgrounds();
    });

    const onSettled = () => {
      if (settledRafId) window.cancelAnimationFrame(settledRafId);
      settledRafId = window.requestAnimationFrame(() => {
        settledRafId = 0;
        refreshBackgrounds();
      });
    };

    window.addEventListener("portfolio:page-ready", onSettled);
    window.addEventListener("portfolio:curtain-opened", onSettled);

    return () => {
      window.cancelAnimationFrame(mountRafId);
      if (settledRafId) window.cancelAnimationFrame(settledRafId);
      window.removeEventListener("portfolio:page-ready", onSettled);
      window.removeEventListener("portfolio:curtain-opened", onSettled);
      html.classList.remove("notFoundViewportLock");
      blocks?.classList.remove("primaryBackgroundFull");
      refreshBackgrounds();
    };
  }, [refreshBackgrounds]);

  useEffect(() => {
    if (!lenis) return;

    const lockLenis = () => {
      lenis.scrollTo(0, { immediate: true, force: true });
      lenis.stop();
    };

    lockLenis();

    let curtainRafId = 0;
    const onCurtainOpened = () => {
      if (curtainRafId) window.cancelAnimationFrame(curtainRafId);
      curtainRafId = window.requestAnimationFrame(() => {
        curtainRafId = 0;
        lockLenis();
      });
    };

    window.addEventListener("portfolio:curtain-opened", onCurtainOpened);

    return () => {
      if (curtainRafId) window.cancelAnimationFrame(curtainRafId);
      window.removeEventListener("portfolio:curtain-opened", onCurtainOpened);
      lenis.start();
    };
  }, [lenis]);

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
              <div className="buttonWrapper">
                <ActionButton href="/" variant="secondary" icon>
                  Back to home
                </ActionButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {portalTarget404 && isRouteVisible
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
