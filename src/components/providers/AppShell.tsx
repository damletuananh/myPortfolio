"use client";

import React, { Suspense } from "react";
import { LenisProvider } from "./LenisProvider";
import { TransitionProvider } from "./TransitionProvider";
import {
  ThemeBackgroundProvider,
  useThemeBackground,
  useThemeBackgroundHosts,
} from "./ThemeBackgroundProvider";
import BackgroundCanvas from "@/components/canvas/BackgroundCanvas";
import PageCanvas from "@/components/canvas/PageCanvas";
import LoadCanvas from "@/components/canvas/LoadCanvas";
import ErrorCanvas from "@/components/canvas/ErrorCanvas";
import { Header } from "@/components/chrome/Header";
import { Footer } from "@/components/chrome/Footer";

function AppShellInner({ children }: { children: React.ReactNode }) {
  const { isBgInview } = useThemeBackground();
  const { setBackgroundsHost, setPortalTarget404 } =
    useThemeBackgroundHosts();

  return (
    <>
      <div
        className={`backgroundContainer${isBgInview ? " inview" : ""}`}
        aria-hidden="true"
      >
        <div className="backgrounds" ref={setBackgroundsHost} />
        <Suspense fallback={null}>
          <BackgroundCanvas />
        </Suspense>
        <div
          id="error-canvas-clone-slot"
          className="errorCanvasContainer"
          ref={setPortalTarget404}
        />
        <Suspense fallback={null}>
          <PageCanvas />
        </Suspense>
        <Suspense fallback={null}>
          <ErrorCanvas />
        </Suspense>
      </div>

      <Suspense fallback={null}>
        <LoadCanvas />
      </Suspense>

      <Suspense fallback={null}>
        <Header />
      </Suspense>

      <div id="pageContainer" className="pageContainer transition-fade">
        <main id="swup" className="transition-fade">
          <div className="blocks">{children}</div>
          <Suspense fallback={null}>
            <Footer />
          </Suspense>
        </main>
      </div>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <LenisProvider>
      <ThemeBackgroundProvider>
        <TransitionProvider>
          <AppShellInner>{children}</AppShellInner>
        </TransitionProvider>
      </ThemeBackgroundProvider>
    </LenisProvider>
  );
}

export default AppShell;
