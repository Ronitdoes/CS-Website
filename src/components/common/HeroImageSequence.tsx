"use client";

import React, { useRef, useEffect, useState, Suspense, useLayoutEffect, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Float } from "@react-three/drei";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import { TOTAL_FRAMES, HERO_SEQUENCE_IMAGES } from "@/data/preloadManifest";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const sharedMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#F5A623"),
  roughness: 0.35,
  metalness: 0.4,
});

function Model({ url, scale = 0.35, position = [0, 0, 0] }: { url: string; scale?: number; position?: [number, number, number] }) {
  const { scene } = useGLTF(url, true);
  const modelRef = useRef<THREE.Group>(null);
  
  useLayoutEffect(() => {
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        (obj as THREE.Mesh).material = sharedMaterial;
      }
    });
  }, [scene]);

  useFrame((_, delta) => {
    if (modelRef.current) {
      // Continuous spin around its vertical axis
      modelRef.current.rotation.z += delta * 0.5;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <primitive 
        ref={modelRef}
        object={scene} 
        scale={scale} 
        position={position} 
        rotation={[Math.PI / 2, 0, Math.PI / 2]} 
      />
    </Float>
  );
}

useGLTF.preload("/logos/ieee.glb");

export default function HeroImageSequence({ scrollContainerRef }: { scrollContainerRef?: React.RefObject<HTMLElement | null> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const sequenceRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);

  // Cached image storage in ref to avoid triggering React re-renders on every loaded frame
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const loadedCountRef = useRef<number>(0);
  const aspectRatioRef = useRef<number | null>(null);
  const lastRenderedFrameRef = useRef<number>(-1);
  const currentFrameIndexRef = useRef<number>(0);
  const dimensionsRef = useRef({ width: 0, height: 0, dpr: 1 });

  // Minimal reactive state strictly for viewport and breakpoint changes
  const [isHeroInView, setIsHeroInView] = useState(true);
  const [isModelActive, setIsModelActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Viewport intersection observer to pause rendering when hero is offscreen
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroInView(entry.isIntersecting);
      },
      { threshold: 0.01 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Helper to retrieve the target frame or closest loaded frame
  const getAvailableFrame = (targetIndex: number): HTMLImageElement | null => {
    const images = imagesRef.current;
    if (images[targetIndex]) return images[targetIndex];

    // Search for closest loaded frame to keep scrolling smooth during preload
    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      if (targetIndex - offset >= 0 && images[targetIndex - offset]) {
        return images[targetIndex - offset];
      }
      if (targetIndex + offset < TOTAL_FRAMES && images[targetIndex + offset]) {
        return images[targetIndex + offset];
      }
    }
    return null;
  };

  // High-performance canvas drawing routine
  const renderFrame = useCallback((index: number, force = false) => {
    currentFrameIndexRef.current = index;

    if (!force && index === lastRenderedFrameRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx = ctxRef.current;
    if (!ctx) {
      ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) return;
      ctxRef.current = ctx;
    }

    const img = getAvailableFrame(index);
    if (!img) return;

    lastRenderedFrameRef.current = index;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    if (canvasWidth === 0 || canvasHeight === 0) return;

    const imgRatio = aspectRatioRef.current || (img.naturalWidth ? img.naturalWidth / img.naturalHeight : img.width / img.height);
    const canvasRatio = canvasWidth / canvasHeight;

    let drawWidth: number;
    let drawHeight: number;
    let offsetX: number;
    let offsetY: number;

    if (canvasRatio > imgRatio) {
      // Canvas is wider than image (relatively)
      drawWidth = canvasWidth;
      drawHeight = Math.round(canvasWidth / imgRatio);
      offsetX = 0;
      offsetY = Math.round((canvasHeight - drawHeight) * 0.5);
    } else {
      // Canvas is taller than image (relatively)
      drawWidth = Math.round(canvasHeight * imgRatio);
      drawHeight = canvasHeight;
      offsetX = Math.round((canvasWidth - drawWidth) * 0.5);
      offsetY = 0;
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }, []);

  // Priority-based progressive image preloading
  useEffect(() => {
    let isCancelled = false;

    const loadFrame = async (index: number): Promise<HTMLImageElement | null> => {
      const src = HERO_SEQUENCE_IMAGES[index];
      if (!src) return null;

      const img = new Image();
      img.decoding = "async";
      img.src = src;

      try {
        if (img.decode) {
          await img.decode();
        } else {
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = reject;
          });
        }
        if (isCancelled) return null;

        imagesRef.current[index] = img;
        loadedCountRef.current++;

        // Cache aspect ratio from the first successfully loaded image
        if (!aspectRatioRef.current && (img.naturalWidth || img.width)) {
          const nw = img.naturalWidth || img.width;
          const nh = img.naturalHeight || img.height;
          if (nw && nh) aspectRatioRef.current = nw / nh;
        }

        // Immediately paint Frame 1 (or current frame if user is already at this position)
        if (index === 0 || currentFrameIndexRef.current === index) {
          renderFrame(index, true);
        }

        return img;
      } catch {
        if (img.complete && (img.naturalWidth || img.width)) {
          imagesRef.current[index] = img;
          loadedCountRef.current++;
          if (index === 0 || currentFrameIndexRef.current === index) {
            renderFrame(index, true);
          }
        }
        return null;
      }
    };

    // Priority 1: Load and decode Frame 0 immediately for instant FCP
    loadFrame(0).then(() => {
      if (isCancelled) return;
      // Priority 2: Preload remaining frames in the background
      for (let i = 1; i < TOTAL_FRAMES; i++) {
        loadFrame(i);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [renderFrame]);

  // Debounced rAF resize handler to avoid layout thrashing and unnecessary React re-renders
  useEffect(() => {
    let rafId: number | null = null;

    const updateCanvasSize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const mobile = w < 768;
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5);

      setIsMobile(prev => (prev !== mobile ? mobile : prev));
      dimensionsRef.current = { width: w, height: h, dpr };

      const canvas = canvasRef.current;
      if (canvas) {
        const targetWidth = Math.round(w * dpr);
        const targetHeight = Math.round(h * dpr);

        if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          canvas.style.width = `${w}px`;
          canvas.style.height = `${h}px`;
          // Reset cached 2D context
          ctxRef.current = canvas.getContext("2d", { alpha: true });
        }
      }

      // Redraw current frame after resize
      const trigger = ScrollTrigger.getById("hero-sequence-trigger");
      const currentProgress = trigger ? trigger.progress : 0;
      const currentFrame = Math.min(
        TOTAL_FRAMES - 1,
        Math.floor(currentProgress * (TOTAL_FRAMES - 1))
      );
      renderFrame(currentFrame, true);
    };

    const handleResize = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateCanvasSize);
    };

    updateCanvasSize();
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, [renderFrame]);

  // GSAP ScrollTrigger timeline setup with container scope and dynamic WebGL activation
  useGSAP(() => {
    if (!scrollContainerRef?.current || !sequenceRef.current || !modelRef.current) return;

    // Initial setup
    gsap.set(sequenceRef.current, { opacity: 1, display: "flex" });
    gsap.set(modelRef.current, { opacity: 0, display: "block" });

    const playhead = { frame: 0 };

    const tl = gsap.timeline({
      scrollTrigger: {
        id: "hero-sequence-trigger",
        trigger: scrollContainerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5, // cinematic smooth catch-up
        onUpdate: (self) => {
          // Dynamically spin up WebGL frameloop only when approaching 3D transition (progress >= 0.88)
          const shouldActivate = self.progress >= 0.88;
          setIsModelActive(prev => (prev !== shouldActivate ? shouldActivate : prev));
        },
      },
    });

    // Sequence Opacity/Display
    tl.to(sequenceRef.current, {
      opacity: 1,
      duration: 0.94,
      ease: "none",
    }, 0);

    tl.to(sequenceRef.current, {
      opacity: 0,
      duration: 0.04,
      ease: "none",
    }, 0.94);

    tl.set(sequenceRef.current, { display: "none" }, 0.98);

    // Model Opacity/Display (No display toggles to prevent Layout Thrashing or ResizeObserver delays)
    tl.to(modelRef.current, {
      opacity: 1,
      duration: 0.04,
      ease: "none",
    }, 0.94);

    // Frame sequence playhead tween
    tl.to(playhead, {
      frame: TOTAL_FRAMES - 1,
      duration: 0.94,
      ease: "none",
      onUpdate: () => {
        renderFrame(Math.min(TOTAL_FRAMES - 1, Math.floor(playhead.frame)));
      },
    }, 0);

    // Initial draw
    renderFrame(0, true);

  }, { dependencies: [scrollContainerRef], scope: containerRef });

  return (
    <div ref={containerRef} className="w-full h-screen relative overflow-hidden flex items-center justify-center bg-transparent">
      {/* 2D Image Sequence Canvas */}
      <div 
        ref={sequenceRef}
        className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          style={{
            willChange: "transform",
            transform: "translate3d(0, 0, 0)",
            backfaceVisibility: "hidden",
          }}
        />
      </div>

      {/* 3D Model Canvas - Frameloop throttled dynamically when offscreen or hidden */}
      <div 
        ref={modelRef}
        className="absolute inset-0 z-20 pointer-events-none"
      >
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          gl={{ alpha: true, antialias: !isMobile, powerPreference: "high-performance" }}
          dpr={isMobile ? [1, 1.25] : [1, 1.5]}
          frameloop={isHeroInView && isModelActive ? "always" : "never"}
          style={{ background: "transparent", pointerEvents: "none" }}
        >
          <ambientLight intensity={1} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <Suspense fallback={null}>
            <Model 
              url="/logos/ieee.glb" 
              scale={isMobile ? 0.22 : 0.35} 
              position={isMobile ? [0, 0, 0] : [0, 0, 0]} 
            />
            <Environment files="/potsdamer_platz_1k.hdr" />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}
