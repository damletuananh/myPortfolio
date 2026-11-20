"use client";

import React, {
  Suspense,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenisContext } from "./LenisProvider";
import { useThemeBackground } from "./ThemeBackgroundProvider";

export type CurtainVariant = "nav" | "menu";

export interface CurtainCloseOptions {
  fromMenu?: boolean;
}

export interface CurtainController {
  closeCurtain: (
    variant: CurtainVariant,
    options?: CurtainCloseOptions
  ) => Promise<void>;
  openCurtain: (variant: CurtainVariant) => Promise<void>;
}

const NAV_REVEAL_OFFSET_SEC = 0.35;

export interface TransitionContextValue {
  navigate: (href: string) => Promise<void>;
  isTransitioning: boolean;
  isMenuOpen: boolean;
  openMenu: () => Promise<void>;
  closeMenu: () => Promise<void>;
  toggleMenu: () => Promise<void>;
  registerCurtainController: (
    controller: CurtainController | null
  ) => () => void;
}

const TransitionContext = createContext<TransitionContextValue | null>(null);

export function useTransitionNav(): TransitionContextValue {
  const ctx = useContext(TransitionContext);
  if (!ctx) {
    throw new Error(
      "useTransitionNav must be used inside <TransitionProvider>"
    );
  }
  return ctx;
}

function normalizePath(path: string): string {
  if (!path || path === "/") return "/";
  return path.endsWith("/") ? path.slice(0, -1) : path;
}

function nextAnimationFrame(): Promise<void> {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}

function RouteChangeBridge({
  onPathname,
}: {
  onPathname: (pathname: string) => void;
}) {
  const pathname = usePathname();

  useEffect(() => {
    onPathname(pathname);
  }, [pathname, onPathname]);

  return null;
}

export function TransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { lenis, lockScroll, unlockScroll, scrollToTop } = useLenisContext();
  const { refreshBackgrounds } = useThemeBackground();

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const curtainControllerRef = useRef<CurtainController | null>(null);
  const isTransitioningRef = useRef(false);
  const isMenuOpenRef = useRef(false);
  const menuBusyRef = useRef(false);
  const lastPathnameRef = useRef<string | null>(null);
  const pendingNavigationRef = useRef<{
    targetPath: string;
    resolve: () => void;
  } | null>(null);

  const lenisRef = useRef(lenis);
  const refreshRef = useRef(refreshBackgrounds);
  const settledCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  useEffect(() => {
    refreshRef.current = refreshBackgrounds;
  }, [refreshBackgrounds]);

  useEffect(() => {
    return () => {
      settledCleanupRef.current?.();
      settledCleanupRef.current = null;
    };
  }, []);

  const scheduleSettledRefresh = useCallback(() => {
    settledCleanupRef.current?.();

    let disposed = false;
    let rafId = 0;

    const runRefresh = () => {
      if (disposed) return;
      lenisRef.current?.resize();
      ScrollTrigger.refresh();
      refreshRef.current();
    };

    const debouncedRefresh = () => {
      if (disposed) return;
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        runRefresh();
      });
    };

    // Immediate refresh on route mount
    runRefresh();

    // Refresh again once fonts finish loading
    document.fonts?.ready?.then(() => {
      if (!disposed) debouncedRefresh();
    });

    // Refresh as pending images inside #pageContainer settle
    const cleanups: Array<() => void> = [];
    const pageEl = document.getElementById("pageContainer");
    if (pageEl) {
      const imgs = Array.from(pageEl.querySelectorAll<HTMLImageElement>("img"));
      for (const img of imgs) {
        if (!img.complete) {
          const onSettled = () => {
            img.removeEventListener("load", onSettled);
            img.removeEventListener("error", onSettled);
            debouncedRefresh();
          };
          img.addEventListener("load", onSettled, { once: true });
          img.addEventListener("error", onSettled, { once: true });
          cleanups.push(() => {
            img.removeEventListener("load", onSettled);
            img.removeEventListener("error", onSettled);
          });
        }
      }
    }

    const t1 = window.setTimeout(debouncedRefresh, 260);
    const t2 = window.setTimeout(debouncedRefresh, 760);

    settledCleanupRef.current = () => {
      disposed = true;
      if (rafId) window.cancelAnimationFrame(rafId);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      for (const fn of cleanups) {
        fn();
      }
    };
  }, []);

  const registerCurtainController = useCallback(
    (controller: CurtainController | null) => {
      curtainControllerRef.current = controller;
      return () => {
        if (curtainControllerRef.current === controller) {
          curtainControllerRef.current = null;
        }
      };
    },
    []
  );

  const handlePathnameChange = useCallback((rawPathname: string) => {
    const normalized = normalizePath(rawPathname);

    if (lastPathnameRef.current === null) {
      lastPathnameRef.current = normalized;
      return;
    }

    const pending = pendingNavigationRef.current;
    if (pending) {
      if (normalized === pending.targetPath) {
        lastPathnameRef.current = normalized;
        pendingNavigationRef.current = null;
        pending.resolve();
      }
      return;
    }

    // Handle browser back/forward or external push updates
    if (normalized !== lastPathnameRef.current) {
      lastPathnameRef.current = normalized;
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          scheduleSettledRefresh();
          window.dispatchEvent(
            new CustomEvent("portfolio:page-ready", {
              detail: {
                pathname: normalized,
                source: "popstate",
                revealOffset: 0,
              },
            })
          );
        });
      });
    }
  }, [scheduleSettledRefresh]);

  const openMenu = useCallback(async () => {
    if (isMenuOpenRef.current || menuBusyRef.current || isTransitioningRef.current) {
      return;
    }
    menuBusyRef.current = true;
    isMenuOpenRef.current = true;
    setIsMenuOpen(true);

    document.documentElement.classList.add("overflowMenu");
    document.body.classList.add("overflowMenu");
    lockScroll();

    try {
      if (curtainControllerRef.current) {
        await curtainControllerRef.current.closeCurtain("menu");
      }
    } finally {
      menuBusyRef.current = false;
    }
  }, [lockScroll]);

  const closeMenu = useCallback(async () => {
    if (!isMenuOpenRef.current || menuBusyRef.current) {
      return;
    }
    menuBusyRef.current = true;
    isMenuOpenRef.current = false;
    setIsMenuOpen(false);

    try {
      if (curtainControllerRef.current) {
        await curtainControllerRef.current.openCurtain("menu");
      }
    } finally {
      document.documentElement.classList.remove("overflowMenu");
      document.body.classList.remove("overflowMenu");
      unlockScroll();
      menuBusyRef.current = false;
    }
  }, [unlockScroll]);

  const toggleMenu = useCallback(async () => {
    if (isMenuOpenRef.current) {
      await closeMenu();
    } else {
      await openMenu();
    }
  }, [closeMenu, openMenu]);

  const navigate = useCallback(
    async (href: string) => {
      if (!href) return;

      let parsed: URL;
      try {
        parsed = new URL(href, window.location.origin);
      } catch {
        window.location.assign(href);
        return;
      }

      if (parsed.origin !== window.location.origin) {
        window.open(parsed.href, "_blank", "noopener,noreferrer");
        return;
      }

      const targetPath = normalizePath(parsed.pathname);
      const currentPath = normalizePath(window.location.pathname);
      const targetFull = `${parsed.pathname}${parsed.search}${parsed.hash}`;

      if (targetPath === currentPath) {
        if (isMenuOpenRef.current) {
          await closeMenu();
        }
        if (parsed.hash) {
          const hashTarget = document.querySelector<HTMLElement>(parsed.hash);
          if (hashTarget) {
            if (lenisRef.current) {
              lenisRef.current.scrollTo(hashTarget);
            } else {
              hashTarget.scrollIntoView({ behavior: "smooth" });
            }
            return;
          }
        }
        scrollToTop(false);
        return;
      }

      if (isTransitioningRef.current) return;

      isTransitioningRef.current = true;
      setIsTransitioning(true);
      document.documentElement.classList.add("is-changing");
      lockScroll();

      const wasMenuOpen = isMenuOpenRef.current;
      if (wasMenuOpen) {
        isMenuOpenRef.current = false;
        setIsMenuOpen(false);
        document.documentElement.classList.remove("overflowMenu");
        document.body.classList.remove("overflowMenu");
      }

      try {
        if (curtainControllerRef.current) {
          await curtainControllerRef.current.closeCurtain("nav", {
            fromMenu: wasMenuOpen,
          });
        } else {
          const pageEl = document.getElementById("pageContainer");
          if (pageEl) {
            pageEl.style.opacity = "0";
          }
          await new Promise((r) => window.setTimeout(r, 220));
        }

        const routeCommitted = new Promise<void>((resolve) => {
          const timeout = window.setTimeout(() => {
            if (pendingNavigationRef.current?.resolve === finish) {
              pendingNavigationRef.current = null;
            }
            resolve();
          }, 1500);

          const finish = () => {
            window.clearTimeout(timeout);
            resolve();
          };

          pendingNavigationRef.current = {
            targetPath,
            resolve: finish,
          };
        });

        router.push(targetFull);
        await routeCommitted;
        lastPathnameRef.current = targetPath;

        // Wait two frames so incoming Suspense/page DOM nodes mount cleanly
        await nextAnimationFrame();
        await nextAnimationFrame();

        scrollToTop(true);
        await nextAnimationFrame();

        scheduleSettledRefresh();
        window.dispatchEvent(
          new CustomEvent("portfolio:page-ready", {
            detail: {
              pathname: targetPath,
              source: "nav",
              revealOffset: NAV_REVEAL_OFFSET_SEC,
            },
          })
        );

        if (curtainControllerRef.current) {
          window.dispatchEvent(
            new CustomEvent("portfolio:curtain-opening", {
              detail: { pathname: targetPath, duration: 0.9 },
            })
          );
          await curtainControllerRef.current.openCurtain("nav");
          window.dispatchEvent(
            new CustomEvent("portfolio:curtain-opened", {
              detail: { pathname: targetPath },
            })
          );
        } else {
          const pageEl = document.getElementById("pageContainer");
          if (pageEl) {
            pageEl.style.opacity = "1";
          }
        }

        if (parsed.hash) {
          const hashTarget = document.querySelector<HTMLElement>(parsed.hash);
          if (hashTarget) {
            if (lenisRef.current) {
              lenisRef.current.scrollTo(hashTarget, { immediate: true });
            } else {
              hashTarget.scrollIntoView();
            }
          }
        }

        // Sync ScrollTrigger coordinates once the curtain finishes lifting
        lenisRef.current?.resize();
        ScrollTrigger.refresh();
        refreshRef.current();
      } finally {
        document.documentElement.classList.remove("is-changing");
        unlockScroll();
        isTransitioningRef.current = false;
        setIsTransitioning(false);
      }
    },
    [
      closeMenu,
      lockScroll,
      router,
      scheduleSettledRefresh,
      scrollToTop,
      unlockScroll,
    ]
  );

  const value = useMemo<TransitionContextValue>(
    () => ({
      navigate,
      isTransitioning,
      isMenuOpen,
      openMenu,
      closeMenu,
      toggleMenu,
      registerCurtainController,
    }),
    [
      navigate,
      isTransitioning,
      isMenuOpen,
      openMenu,
      closeMenu,
      toggleMenu,
      registerCurtainController,
    ]
  );

  return (
    <TransitionContext.Provider value={value}>
      <Suspense fallback={null}>
        <RouteChangeBridge onPathname={handlePathnameChange} />
      </Suspense>
      {children}
    </TransitionContext.Provider>
  );
}

export interface TransitionLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  children: React.ReactNode;
}

export function TransitionLink({
  href,
  children,
  onClick,
  target,
  ...rest
}: TransitionLinkProps) {
  const { navigate } = useTransitionNav();

  const isExternalOrSpecial =
    target === "_blank" ||
    /^(https?:\/\/|mailto:|tel:)/i.test(href) ||
    rest.download !== undefined;

  if (isExternalOrSpecial) {
    return (
      <a href={href} target={target} onClick={onClick} {...rest}>
        {children}
      </a>
    );
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return;
    }
    e.preventDefault();
    void navigate(href);
  };

  return (
    <Link href={href} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}

export default TransitionProvider;
