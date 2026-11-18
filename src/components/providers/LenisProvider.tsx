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
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export interface LenisContextValue {
  lenis: Lenis | null;
  isScrollLocked: boolean;
  lockScroll: () => void;
  unlockScroll: () => void;
  scrollToTop: (immediate?: boolean) => void;
}

const LenisContext = createContext<LenisContextValue | null>(null);

export function useLenisContext(): LenisContextValue {
  const ctx = useContext(LenisContext);
  if (!ctx) {
    throw new Error("useLenisContext must be used inside <LenisProvider>");
  }
  return ctx;
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const [isScrollLocked, setIsScrollLocked] = useState(false);

  const lenisRef = useRef<Lenis | null>(null);
  const coldLoadTimerRef = useRef<number | null>(null);

  const applyScrollLockDom = useCallback((locked: boolean) => {
    const html = document.documentElement;
    if (locked) {
      html.classList.add("stopScroll");
    } else {
      html.classList.remove("stopScroll", "overflow");
      document.body.classList.remove("overflow");
    }
  }, []);

  const lockScroll = useCallback(() => {
    if (coldLoadTimerRef.current !== null) {
      window.clearTimeout(coldLoadTimerRef.current);
      coldLoadTimerRef.current = null;
    }
    lenisRef.current?.stop();
    applyScrollLockDom(true);
    setIsScrollLocked(true);
  }, [applyScrollLockDom]);

  const unlockScroll = useCallback(() => {
    if (coldLoadTimerRef.current !== null) {
      window.clearTimeout(coldLoadTimerRef.current);
      coldLoadTimerRef.current = null;
    }
    applyScrollLockDom(false);
    lenisRef.current?.start();
    setIsScrollLocked(false);
  }, [applyScrollLockDom]);

  const scrollToTop = useCallback((immediate = false) => {
    const instance = lenisRef.current;
    if (immediate) {
      if (instance) {
        instance.scrollTo(0, { immediate: true, force: true });
      }
      window.scrollTo(0, 0);
      return;
    }

    if (instance) {
      instance.scrollTo(0, { duration: 1.2, force: true });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const instance = new Lenis({
      duration: 1.5,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 2,
      syncTouch: false,
      touchMultiplier: 5,
    });

    let disposed = false;
    lenisRef.current = instance;

    const onLenisScroll = () => {
      ScrollTrigger.update();
    };
    instance.on("scroll", onLenisScroll);

    const tick = (time: number) => {
      instance.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Cold load on `/` locks scroll briefly during the hero typography choreography
    const isHomeColdLoad = window.location.pathname === "/";
    if (isHomeColdLoad) {
      instance.stop();
      applyScrollLockDom(true);
      coldLoadTimerRef.current = window.setTimeout(() => {
        coldLoadTimerRef.current = null;
        applyScrollLockDom(false);
        instance.start();
        setIsScrollLocked(false);
      }, 2600);
    }

    const initRaf = window.requestAnimationFrame(() => {
      if (disposed) return;
      setLenis(instance);
      if (isHomeColdLoad && coldLoadTimerRef.current !== null) {
        setIsScrollLocked(true);
      }
    });

    let resizeRaf = 0;
    const ro = new ResizeObserver(() => {
      if (resizeRaf) window.cancelAnimationFrame(resizeRaf);
      resizeRaf = window.requestAnimationFrame(() => {
        instance.resize();
      });
    });
    ro.observe(document.body);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(initRaf);
      if (coldLoadTimerRef.current !== null) {
        window.clearTimeout(coldLoadTimerRef.current);
        coldLoadTimerRef.current = null;
      }
      if (resizeRaf) window.cancelAnimationFrame(resizeRaf);
      ro.disconnect();
      gsap.ticker.remove(tick);
      instance.off("scroll", onLenisScroll);
      instance.destroy();
      lenisRef.current = null;
      applyScrollLockDom(false);
    };
  }, [applyScrollLockDom]);

  const value = useMemo<LenisContextValue>(
    () => ({
      lenis,
      isScrollLocked,
      lockScroll,
      unlockScroll,
      scrollToTop,
    }),
    [lenis, isScrollLocked, lockScroll, unlockScroll, scrollToTop]
  );

  return (
    <LenisContext.Provider value={value}>{children}</LenisContext.Provider>
  );
}

export default LenisProvider;
