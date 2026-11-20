"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface PrimaryBackgroundRect {
  top: number;
  left: number;
  width: number;
  height: number;
  isFull: boolean;
}

export interface ThemeBackgroundContextValue {
  isHeaderSecondary: boolean;
  isBgInview: boolean;
  refreshBackgrounds: () => void;
  portalTarget404: HTMLDivElement | null;
}

interface ThemeBackgroundHostBridge {
  setBackgroundsHost: (el: HTMLDivElement | null) => void;
  setPortalTarget404: (el: HTMLDivElement | null) => void;
}

const ThemeBackgroundContext =
  createContext<ThemeBackgroundContextValue | null>(null);
const ThemeBackgroundBridgeContext =
  createContext<ThemeBackgroundHostBridge | null>(null);

export function useThemeBackground(): ThemeBackgroundContextValue {
  const ctx = useContext(ThemeBackgroundContext);
  if (!ctx) {
    throw new Error(
      "useThemeBackground must be used inside <ThemeBackgroundProvider>"
    );
  }
  return ctx;
}

export function useThemeBackgroundHosts(): ThemeBackgroundHostBridge {
  const ctx = useContext(ThemeBackgroundBridgeContext);
  if (!ctx) {
    throw new Error(
      "useThemeBackgroundHosts must be used inside <ThemeBackgroundProvider>"
    );
  }
  return ctx;
}

const FAVICON_FRAMES = [
  "/favicons/frame-0.png",
  "/favicons/frame-1.png",
  "/favicons/frame-2.png",
  "/favicons/frame-3.png",
] as const;

export function ThemeBackgroundProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isHeaderSecondary, setIsHeaderSecondary] = useState(false);
  const [isBgInview, setIsBgInview] = useState(false);
  const [backgroundsHost, setBackgroundsHost] = useState<HTMLDivElement | null>(
    null
  );
  const [portalTarget404, setPortalTarget404] = useState<HTMLDivElement | null>(
    null
  );
  const [bgRects, setBgRects] = useState<PrimaryBackgroundRect[]>([]);

  const triggersRef = useRef<ScrollTrigger[]>([]);
  const backgroundsHostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    backgroundsHostRef.current = backgroundsHost;
  }, [backgroundsHost]);

  const killOwnTriggers = useCallback(() => {
    for (const st of triggersRef.current) {
      st.kill();
    }
    triggersRef.current = [];
  }, []);

  const refreshBackgrounds = useCallback(() => {
    gsap.registerPlugin(ScrollTrigger);
    killOwnTriggers();

    const host =
      backgroundsHostRef.current ??
      document.querySelector<HTMLDivElement>(".backgroundContainer .backgrounds");
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(".setPrimaryBackground")
    );

    if (targets.length === 0) {
      setBgRects((prev) => (prev.length === 0 ? prev : []));
      setIsHeaderSecondary(false);
      return;
    }

    const hostRect = host?.getBoundingClientRect() ?? { top: 0, left: 0 };
    const isFull = Boolean(
      document.querySelector(".blocks.primaryBackgroundFull")
    );

    const measured: PrimaryBackgroundRect[] = targets.map((el) => {
      const r = el.getBoundingClientRect();
      return {
        top: r.top - hostRect.top,
        left: r.left - hostRect.left,
        width: r.width,
        // +1px anti-seam overlap prevents hairlines between stacked dark sections
        height: r.height + 1,
        isFull,
      };
    });

    setBgRects((prev) => {
      if (
        prev.length === measured.length &&
        prev.every(
          (p, i) =>
            Math.abs(p.top - measured[i].top) < 0.5 &&
            Math.abs(p.left - measured[i].left) < 0.5 &&
            Math.abs(p.width - measured[i].width) < 0.5 &&
            Math.abs(p.height - measured[i].height) < 0.5 &&
            p.isFull === measured[i].isFull
        )
      ) {
        return prev;
      }
      return measured;
    });

    const activeIndices = new Set<number>();
    const syncHeaderState = () => {
      setIsHeaderSecondary(activeIndices.size > 0);
    };

    const headerBar = document.querySelector<HTMLElement>("header .headerBar");
    const headerThreshold = Math.max(
      24,
      Math.round((headerBar?.offsetHeight || 90) / 2)
    );

    targets.forEach((el, idx) => {
      const st = ScrollTrigger.create({
        trigger: el,
        start: `top ${headerThreshold}px`,
        end: "bottom top",
        onEnter: () => {
          activeIndices.add(idx);
          syncHeaderState();
        },
        onEnterBack: () => {
          activeIndices.add(idx);
          syncHeaderState();
        },
        onLeave: () => {
          activeIndices.delete(idx);
          syncHeaderState();
        },
        onLeaveBack: () => {
          activeIndices.delete(idx);
          syncHeaderState();
        },
      });

      const r = el.getBoundingClientRect();
      if (st.isActive || (r.top <= headerThreshold && r.bottom > 0)) {
        activeIndices.add(idx);
      }
      triggersRef.current.push(st);
    });

    syncHeaderState();
  }, [killOwnTriggers]);

  // Touch-only detection, background canvas reveal timing, and animated favicon
  useEffect(() => {
    const touchMedia = window.matchMedia("(hover: none) and (pointer: coarse)");
    const syncTouchClass = () => {
      document.documentElement.classList.toggle("touch", touchMedia.matches);
    };
    syncTouchClass();

    const hasModernListener = typeof touchMedia.addEventListener === "function";
    if (hasModernListener) {
      touchMedia.addEventListener("change", syncTouchClass);
    } else if (typeof touchMedia.addListener === "function") {
      touchMedia.addListener(syncTouchClass);
    }

    const revealDelay = window.location.pathname === "/" ? 2900 : 900;
    const bgTimer = window.setTimeout(() => {
      setIsBgInview(true);
    }, revealDelay);

    let frameIdx = 0;
    const applyFaviconFrame = (href: string) => {
      const iconLinks = Array.from(
        document.querySelectorAll<HTMLLinkElement>(
          'link#favicon, link[rel="icon"], link[rel="shortcut icon"]'
        )
      );

      if (iconLinks.length === 0) {
        const link = document.createElement("link");
        link.id = "favicon";
        link.rel = "icon";
        link.type = "image/png";
        link.href = href;
        document.head.appendChild(link);
        return;
      }

      for (const link of iconLinks) {
        link.type = "image/png";
        if (link.hasAttribute("sizes")) {
          link.removeAttribute("sizes");
        }
        if (link.getAttribute("href") !== href) {
          link.href = href;
        }
      }
    };

    applyFaviconFrame(FAVICON_FRAMES[0]);
    const faviconInterval = window.setInterval(() => {
      frameIdx = (frameIdx + 1) % FAVICON_FRAMES.length;
      applyFaviconFrame(FAVICON_FRAMES[frameIdx]);
    }, 450);

    return () => {
      if (hasModernListener) {
        touchMedia.removeEventListener("change", syncTouchClass);
      } else if (typeof touchMedia.removeListener === "function") {
        touchMedia.removeListener(syncTouchClass);
      }
      window.clearTimeout(bgTimer);
      window.clearInterval(faviconInterval);
    };
  }, []);

  // Measure and synchronize `.setPrimaryBackground` overlays across resizes & route changes
  useEffect(() => {
    let rafId = 0;
    const scheduleRefresh = () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        refreshBackgrounds();
      });
    };

    scheduleRefresh();

    const onPageReady = () => {
      scheduleRefresh();
    };
    window.addEventListener("portfolio:page-ready", onPageReady);
    window.addEventListener("resize", scheduleRefresh);

    const pageContainer = document.getElementById("pageContainer");
    const ro = new ResizeObserver(scheduleRefresh);
    if (pageContainer) {
      ro.observe(pageContainer);
    } else {
      ro.observe(document.body);
    }

    const fontsReady = document.fonts?.ready;
    let mounted = true;
    fontsReady?.then(() => {
      if (mounted) scheduleRefresh();
    });

    return () => {
      mounted = false;
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("portfolio:page-ready", onPageReady);
      window.removeEventListener("resize", scheduleRefresh);
      ro.disconnect();
      killOwnTriggers();
    };
  }, [backgroundsHost, refreshBackgrounds, killOwnTriggers]);

  const value = useMemo<ThemeBackgroundContextValue>(
    () => ({
      isHeaderSecondary,
      isBgInview,
      refreshBackgrounds,
      portalTarget404,
    }),
    [isHeaderSecondary, isBgInview, refreshBackgrounds, portalTarget404]
  );

  const bridgeValue = useMemo<ThemeBackgroundHostBridge>(
    () => ({
      setBackgroundsHost,
      setPortalTarget404,
    }),
    []
  );

  return (
    <ThemeBackgroundContext.Provider value={value}>
      <ThemeBackgroundBridgeContext.Provider value={bridgeValue}>
        {children}
        {backgroundsHost &&
          createPortal(
            <>
              {bgRects.map((rect, index) => (
                <div
                  key={index}
                  className={
                    rect.isFull ? "primaryBackground full" : "primaryBackground"
                  }
                  data-index={index}
                  style={{
                    top: `${rect.top}px`,
                    left: `${rect.left}px`,
                    width: `${rect.width}px`,
                    height: `${rect.height}px`,
                  }}
                />
              ))}
            </>,
            backgroundsHost
          )}
      </ThemeBackgroundBridgeContext.Provider>
    </ThemeBackgroundContext.Provider>
  );
}

export default ThemeBackgroundProvider;
