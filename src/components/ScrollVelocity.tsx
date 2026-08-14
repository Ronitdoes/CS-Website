"use client";

import React, { useRef, useLayoutEffect, useCallback } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame
} from 'motion/react';

interface VelocityMapping {
  input: [number, number];
  output: [number, number];
}

interface VelocityTextProps {
  children: React.ReactNode;
  baseVelocity: number;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  className?: string;
  damping?: number;
  stiffness?: number;
  numCopies?: number;
  velocityMapping?: VelocityMapping;
  parallaxClassName?: string;
  scrollerClassName?: string;
  parallaxStyle?: React.CSSProperties;
  scrollerStyle?: React.CSSProperties;
}

interface ScrollVelocityProps {
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  texts: React.ReactNode[];
  velocity?: number;
  className?: string;
  damping?: number;
  stiffness?: number;
  numCopies?: number;
  velocityMapping?: VelocityMapping;
  parallaxClassName?: string;
  scrollerClassName?: string;
  parallaxStyle?: React.CSSProperties;
  scrollerStyle?: React.CSSProperties;
}

/**
 * Measures element width with subpixel accuracy WITHOUT triggering React re-renders.
 * Uses ResizeObserver and font loading hooks with immediate fallback.
 */
function useElementWidthRef<T extends HTMLElement>(ref: React.RefObject<T | null>): React.MutableRefObject<number> {
  const widthRef = useRef<number>(0);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const element = ref.current;

    const measure = () => {
      const rect = element.getBoundingClientRect();
      const w = rect.width || element.offsetWidth || element.scrollWidth || 0;
      if (w > 0) {
        widthRef.current = w;
      }
    };

    // Initial measurement
    measure();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const rect = entry.contentRect;
        if (rect && rect.width > 0) {
          widthRef.current = rect.width;
        } else {
          measure();
        }
      }
    });

    resizeObserver.observe(element);

    // Refresh after fonts are fully loaded to prevent initial 0-width stall
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(() => {
        measure();
      }).catch(() => {});
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref]);

  return widthRef;
}

function VelocityText({
  children,
  baseVelocity,
  scrollContainerRef,
  className = '',
  damping = 80,
  stiffness = 150,
  numCopies = 6,
  velocityMapping = { input: [0, 1000], output: [0, 1.5] },
  parallaxClassName,
  scrollerClassName,
  parallaxStyle,
  scrollerStyle
}: VelocityTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Default to visible = true so animation starts immediately on mount
  const isVisibleRef = useRef<boolean>(true);
  const baseX = useMotionValue<number>(0);

  // Track the actual window scroll
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);

  // Smooth scroll velocity using spring physics
  const smoothVelocity = useSpring(scrollVelocity, {
    damping,
    stiffness
  });

  // Velocity boost factor (0 to max output based on scroll intensity)
  const velocityFactor = useTransform(
    smoothVelocity,
    velocityMapping.input,
    velocityMapping.output,
    { clamp: true }
  );

  const copyRef = useRef<HTMLSpanElement>(null);
  const copyWidthRef = useElementWidthRef(copyRef);

  // Resilient IntersectionObserver with threshold: 0 and generous rootMargin
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          isVisibleRef.current = entry.isIntersecting;
        }
      },
      {
        threshold: 0,
        rootMargin: "250px 0px 250px 0px"
      }
    );

    observer.observe(el);

    // Also re-verify visibility on window resize or tab visibility change
    const handleCheck = () => {
      if (document.hidden) {
        isVisibleRef.current = false;
      } else {
        isVisibleRef.current = true;
      }
    };
    document.addEventListener("visibilitychange", handleCheck);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleCheck);
    };
  }, []);

  // Safe wrapping function: bounds checked to avoid divide-by-zero or NaN
  const wrap = useCallback((min: number, max: number, v: number): number => {
    const range = max - min;
    if (range <= 0 || !Number.isFinite(range) || !Number.isFinite(v)) {
      return 0;
    }
    const mod = (((v - min) % range) + range) % range;
    return mod + min;
  }, []);

  // Frame transform with fallback width check
  const x = useTransform(baseX, (v) => {
    let w = copyWidthRef.current;
    // Live self-heal: if width ref is 0, attempt a direct read
    if (w <= 0 && copyRef.current) {
      w = copyRef.current.getBoundingClientRect().width || copyRef.current.offsetWidth || 0;
      if (w > 0) {
        copyWidthRef.current = w;
      }
    }
    if (w <= 0 || !Number.isFinite(w) || !Number.isFinite(v)) {
      return '0px';
    }
    return `${Math.round(wrap(-w, 0, v))}px`;
  });

  useAnimationFrame((_, delta) => {
    // Skip frames when hidden or offscreen
    if (!isVisibleRef.current || (typeof document !== "undefined" && document.hidden)) {
      return;
    }

    // Clamp delta between 0 and 100ms to eliminate tab switch or lag jumps
    const clampedDelta = Math.max(0, Math.min(delta, 100));

    // Ensure raw boost factor is a valid finite number
    const rawVFactor = velocityFactor.get();
    const vFactor = Number.isFinite(rawVFactor) ? Math.max(0, Math.min(2.5, Math.abs(rawVFactor))) : 0;

    // Smooth movement in the baseVelocity direction with scroll speedup boost
    let moveBy = baseVelocity * (clampedDelta / 1000) * (1 + vFactor);

    if (!Number.isFinite(moveBy)) {
      moveBy = baseVelocity * (clampedDelta / 1000);
    }

    const currentX = baseX.get();
    const nextX = Number.isFinite(currentX) ? currentX + moveBy : 0;
    baseX.set(nextX);
  });

  const spans = [];
  const copies = Math.max(4, numCopies ?? 6);
  for (let i = 0; i < copies; i++) {
    spans.push(
      <span
        className={`flex-shrink-0 select-none ${className}`}
        key={i}
        ref={i === 0 ? copyRef : null}
      >
        {children}&nbsp;
      </span>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`${parallaxClassName || ''} relative overflow-hidden select-none`}
      style={{
        ...parallaxStyle,
        contain: "paint",
      }}
    >
      <motion.div
        className={`${scrollerClassName || ''} flex whitespace-nowrap text-center font-sans text-2xl font-bold tracking-[-0.02em] antialiased sm:text-4xl md:text-[5rem] md:leading-[5rem] select-none`}
        style={{
          x,
          willChange: "transform",
          transform: "translate3d(0, 0, 0)",
          backfaceVisibility: "hidden",
          ...scrollerStyle
        }}
      >
        {spans}
      </motion.div>
    </div>
  );
}

export const ScrollVelocity: React.FC<ScrollVelocityProps> = ({
  scrollContainerRef,
  texts = [],
  velocity = 35,
  className = '',
  damping = 80,
  stiffness = 150,
  numCopies = 6,
  velocityMapping = { input: [0, 1000], output: [0, 1.5] },
  parallaxClassName,
  scrollerClassName,
  parallaxStyle,
  scrollerStyle
}) => {
  return (
    <section className="select-none pointer-events-none">
      {texts.map((text, index) => (
        <VelocityText
          key={index}
          className={className}
          baseVelocity={index % 2 !== 0 ? -velocity : velocity}
          scrollContainerRef={scrollContainerRef}
          damping={damping}
          stiffness={stiffness}
          numCopies={numCopies}
          velocityMapping={velocityMapping}
          parallaxClassName={parallaxClassName}
          scrollerClassName={scrollerClassName}
          parallaxStyle={parallaxStyle}
          scrollerStyle={scrollerStyle}
        >
          {text}
        </VelocityText>
      ))}
    </section>
  );
};

export default ScrollVelocity;

