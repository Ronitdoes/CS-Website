"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useProgress, useGLTF, useEnvironment } from "@react-three/drei";
import { usePathname } from "next/navigation";
import { EVENT_IMAGES } from "@/components/common/CardStack";
import { HORIZONTAL_GALLERY_IMAGES } from "@/app/gallery/HorizontalGallery";
import { SCROLL_GRID_IMAGES } from "@/components/common/ScrollGrid";
import { GALLERY_3D_DEFAULT_IMAGES } from "@/components/common/Gallery3D";
import { PROJECT_IMAGES } from "@/components/common/ProjectCard";
import { NAV_IMAGES } from "@/components/common/Navbar";
import { HERO_SEQUENCE_IMAGES } from "@/components/common/HeroImageSequence";

export const GALLERY_IMAGES = [
  ...HORIZONTAL_GALLERY_IMAGES,
  ...SCROLL_GRID_IMAGES,
  ...GALLERY_3D_DEFAULT_IMAGES,
];

export const ALL_PRELOAD_IMAGES = [
  ...HERO_SEQUENCE_IMAGES,
  ...EVENT_IMAGES,
  ...GALLERY_IMAGES,
  ...PROJECT_IMAGES,
  ...NAV_IMAGES,
];

// Eagerly preload critical 3D assets at application startup.
// These are tracked by R3F's useProgress() and block the preloader until loaded.
useGLTF.preload("/logos/ieee.glb", true);
useEnvironment.preload({ files: "/potsdamer_platz_1k.hdr" });

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
  const [lastPathname, setLastPathname] = useState(pathname);
  const isFirstRender = useRef(true);

  // Eagerly preload and decode all critical site images in background thread during preloader
  useEffect(() => {
    // Priority 1: Eagerly decode Frame 1 of hero sequence for instant first paint
    const priorityImg = new window.Image();
    priorityImg.src = "/Heroimg/0001.avif";
    if (typeof priorityImg.decode === "function") {
      priorityImg.decode().catch(() => {});
    }

    // Priority 2: Preload and decode the remaining assets (including frames 2-36)
    const allImages = Array.from(new Set(ALL_PRELOAD_IMAGES));
    allImages.forEach((src) => {
      if (src === "/Heroimg/0001.avif") return;
      const img = new window.Image();
      img.src = src;
      if (typeof img.decode === "function") {
        img.decode().catch(() => {});
      }
    });
  }, []);

  const [isVideoFinished, setVideoFinished] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("preloaderShown") === "true";
    }
    return false;
  });
  const { progress, active } = useProgress();
  const [isAssetsLoaded, setAssetsLoaded] = useState(false);

  const hasEverLoaded = useRef(false);

  useEffect(() => {
    if (hasEverLoaded.current) {
      // Already loaded once – ignore any future useProgress fluctuations
      return;
    }

    if (progress === 100 || !active) {
      const timer = setTimeout(() => {
        hasEverLoaded.current = true;
        setAssetsLoaded(true);
      }, 300);
      return () => clearTimeout(timer);
    }

    // Safety timeout: ensure page becomes interactive even on slow/blocked network
    const fallbackTimer = setTimeout(() => {
      hasEverLoaded.current = true;
      setAssetsLoaded(true);
    }, 2500);

    return () => clearTimeout(fallbackTimer);
  }, [progress, active]);
  
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
