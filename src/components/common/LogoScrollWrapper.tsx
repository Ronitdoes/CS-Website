"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import dynamic from "next/dynamic";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const Logo3D = dynamic(() => import("@/components/common/Logo3D"), {
  ssr: false,
});

export default function LogoScrollWrapper() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef({ value: 0 });

  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    // Desktop motion path (min-width: 769px)
    mm.add("(min-width: 769px)", () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const logoW = el.offsetWidth;
      const logoH = el.offsetHeight;

      const startX = vw - logoW - 70;
      const startY = vh * 0.5 - logoH * 0.5;
      const dropX = vw - logoW - 66;
      const dropY = vh * 0.58 - logoH * 0.5;
      const sweepX = vw * 0.58 - logoW * 0.5;
      const sweepY = vh * 0.60 - logoH * 0.5;
      const hookX = vw * 0.30 - logoW * 0.5;
      const hookY = vh * 0.54 - logoH * 0.5;
      const endX = vw * 0.22 - logoW * 0.5;
      const endY = vh * 0.50 - logoH * 0.5;

      gsap.set(el, { x: startX, y: startY, scale: 1, opacity: 1, visibility: "visible" });
      progressRef.current.value = 0;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#about-scroll-canvas",
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
        },
      });

      // Bind the custom ref value directly to the scroll timeline
      tl.to(progressRef.current, {
        value: 1,
        ease: "none",
        duration: 1,
      }, 0);

      // Cohesive cinematic title exit animation
      tl.to("#about-hero-title", {
        opacity: 0,
        scale: 0.85,
        y: -60,
        ease: "power1.inOut",
        duration: 0.6,
      }, 0);

      // Map scroll progress to 3D logo coordinates along curved motion path to exact static resting position
      tl.to(el, {
        motionPath: {
          path: [
            { x: startX, y: startY },
            { x: dropX, y: dropY },
            { x: sweepX, y: sweepY },
            { x: hookX, y: hookY },
            { x: endX, y: endY },
          ],
          curviness: 1.45,
          autoRotate: false,
        },
        scale: 1,
        opacity: 1,
        ease: "power1.inOut",
        duration: 1,
      }, 0);

      // Smoothly fade and dissolve the logo in-place as the chairperson section approaches without recalculating position
      const fadeOutTl = gsap.timeline({
        scrollTrigger: {
          trigger: "#about-chairperson-section",
          start: "top 95%",
          end: "top 45%",
          scrub: 0.5,
        },
      });

      fadeOutTl.to(el, {
        opacity: 0,
        ease: "power1.out",
      });
    });

    // Mobile motion path (max-width: 768px)
    mm.add("(max-width: 768px)", () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const logoW = el.offsetWidth;
      const logoH = el.offsetHeight;

      const startX = vw * 0.5 - logoW * 0.5;
      const startY = vh * 0.28 - logoH * 0.5;
      const endX = startX;
      const endY = vh * 0.45 - logoH * 0.5;

      gsap.set(el, { x: startX, y: startY, scale: 1, opacity: 1, visibility: "visible" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#about-scroll-canvas",
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
        },
      });

      tl.to("#about-hero-title", {
        opacity: 0,
        scale: 0.85,
        y: -60,
        ease: "power1.inOut",
        duration: 0.6,
      }, 0);

      tl.to(el, {
        x: endX,
        y: endY,
        scale: 0.65,
        opacity: 0.85,
        ease: "power1.inOut",
        duration: 1,
      }, 0);

      const fadeOutTl = gsap.timeline({
        scrollTrigger: {
          trigger: "#about-chairperson-section",
          start: "top 95%",
          end: "top 45%",
          scrub: 0.5,
        },
      });

      fadeOutTl.to(el, {
        opacity: 0,
        ease: "power1.out",
      });
    });

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      id="logo-mover"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "clamp(150px, 30vw, 440px)",
        height: "clamp(150px, 30vw, 440px)",
        pointerEvents: "none",
        zIndex: 10,
        willChange: "transform",
      }}
    >
      <Logo3D progressRef={progressRef} />
    </div>
  );
}