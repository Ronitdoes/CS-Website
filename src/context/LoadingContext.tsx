"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { getPreloadPlan } from "@/data/preloadManifest";

interface LoadingContextType {
  isAssetsLoaded: boolean;
  isVideoFinished: boolean;
  isReady: boolean;
  setVideoFinished: (finished: boolean) => void;
  progress: number;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  const [isVideoFinished, setVideoFinished] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("preloaderShown") === "true";
    }
    return false;
  });
  const [isAssetsLoaded, setAssetsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  const hasEverLoaded = useRef(false);

  // Preload only the assets the current route actually renders, decoding them
  // off the critical path while the preloader is visible.
  useEffect(() => {
    if (hasEverLoaded.current) return;

    const plan = getPreloadPlan(pathname);
    const total = plan.images.length + plan.assets.length;

    let finished = false;
    let done = 0;
    let graceTimer: ReturnType<typeof setTimeout> | undefined;

    // Safety timeout: ensure the page becomes interactive even on slow/blocked networks
    const fallbackTimer = setTimeout(() => {
      if (finished || hasEverLoaded.current) return;
      finished = true;
      clearTimeout(graceTimer);
      hasEverLoaded.current = true;
      setAssetsLoaded(true);
    }, 2500);

    const settle = () => {
      if (finished || hasEverLoaded.current) return;
      finished = true;
      clearTimeout(fallbackTimer);
      clearTimeout(graceTimer);
      graceTimer = setTimeout(() => {
        hasEverLoaded.current = true;
        setAssetsLoaded(true);
      }, 300);
    };

    const bump = () => {
      done += 1;
      if (total > 0) setProgress(Math.min(100, Math.round((done / total) * 100)));
      if (done >= total) settle();
    };

    // Priority 1: eagerly decode Frame 1 of the hero sequence for instant first paint
    if (pathname === "/") {
      const priorityImg = new window.Image();
      priorityImg.src = "/Heroimg/0001.avif";
      if (typeof priorityImg.decode === "function") {
        priorityImg.decode().catch(() => {});
      }
    }

    plan.images.forEach((src) => {
      const img = new window.Image();
      img.src = src;
      if (typeof img.decode === "function") {
        img.decode().then(bump, bump);
      } else {
        img.onload = bump;
        img.onerror = bump;
      }
    });

    // 3D assets are fetched (not parsed) here so the preloader can gate on
    // their arrival; parsing happens inside the home page's R3F canvas.
    plan.assets.forEach((src) => {
      fetch(src).then(bump, bump);
    });

    if (total === 0) settle();

    return () => {
      clearTimeout(fallbackTimer);
      clearTimeout(graceTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      window.location.reload();
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      if (
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      if (
        (href.startsWith("http") && !href.startsWith(window.location.origin)) ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

      try {
        const targetUrl = new URL(href, window.location.origin);
        if (
          targetUrl.pathname === window.location.pathname &&
          targetUrl.search === window.location.search
        ) {
          return;
        }

        e.preventDefault();
        e.stopImmediatePropagation();

        window.location.href = href;
      } catch (err) {
        // Fallback
      }
    };

    document.addEventListener("click", handleLinkClick, true);
    return () => document.removeEventListener("click", handleLinkClick, true);
  }, []);

  const isReady = isAssetsLoaded && isVideoFinished;

  return (
    <LoadingContext.Provider
      value={{
        isAssetsLoaded,
        isVideoFinished,
        isReady,
        setVideoFinished,
        progress,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}
