"use client";

import React, { useEffect, useRef, createContext, useContext, useState } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin once globally
gsap.registerPlugin(ScrollTrigger);

const LenisContext = createContext<Lenis | null>(null);

export function useLenis() {
  return useContext(LenisContext);
}

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Prevent browser auto-scroll restoration jumping
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    // Single source of truth Lenis instance
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;
    setLenisInstance(lenis);

    // Initial scroll reset
    window.scrollTo(0, 0);
    lenis.scrollTo(0, { immediate: true });

    // Connect Lenis scroll to ScrollTrigger updates
    const handleLenisScroll = () => {
      ScrollTrigger.update();
    };
    lenis.on("scroll", handleLenisScroll);

    // Synchronize GSAP ticker as the single RAF loop for Lenis
    const tickerFn = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    // Prevent address bar changes from triggering false layout resize recalculations
    ScrollTrigger.config({
      ignoreMobileResize: true,
      autoRefreshEvents: "visibilitychange,DOMContentLoaded,load,resize",
    });

    // ScrollTrigger normalizeScroll for mobile touch devices to lock address bar & prevent jitter
    if (ScrollTrigger.isTouch === 1) {
      ScrollTrigger.normalizeScroll({
        allowNestedScroll: true,
        lockAxis: true,
      });
    }

    return () => {
      // Clean up ticker and listeners
      gsap.ticker.remove(tickerFn);
      lenis.off("scroll", handleLenisScroll);
      
      // Disable normalizeScroll cleanly
      ScrollTrigger.normalizeScroll(false);

      // Destroy Lenis
      lenis.destroy();
      lenisRef.current = null;

      // Unlock document scroll styles
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    };
  }, []);

  // Route change synchronization
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    // Reset scroll position on route change
    window.scrollTo(0, 0);
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }

    // Refresh ScrollTrigger calculations after new route DOM has mounted
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    });

    return () => cancelAnimationFrame(rafId);
  }, [pathname]);

  return (
    <LenisContext.Provider value={lenisInstance}>
      {children}
    </LenisContext.Provider>
  );
}

export default ScrollProvider;
