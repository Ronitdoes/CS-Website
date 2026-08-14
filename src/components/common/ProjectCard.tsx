"use client";

import React, { useRef, useState, useMemo } from "react";
import Image from "next/image";
import { Barlow_Condensed, Barlow } from "next/font/google";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const barlowCondensed = Barlow_Condensed({
  weight: ["700", "800"],
  subsets: ["latin"],
  display: "swap",
});

const barlow = Barlow({
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

interface CardProps {
  image: string;
  title: string;
  description: string;
  github?: string;
}

export const cards: CardProps[] = [
  {
    title: "Venom Portal",
    description: "The VENOM portal gave teams their room numbers, threw tasks at them, and kept the whole game running in real time. Avoiding boards and manual back and forth .",
    image: "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1781890098603_s975e.avif",
    github: "https://github.com/Tanmayman0896/Snakes-ladders.git",
  },
  {
    title: "Campus Cab",
    description: "CampusCab lets verified students coordinate rides, split costs, and get around without the chaos .No waiting, no strangers, no guesswork. Just open the app and you’re ready to go.",
    image: "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1781890043018_ugfop6.avif",
    github: "https://github.com/Tanmayman0896/Campus-cab-project.git",
  },
  {
    title: "CScrypt",
    description: "CScrypt is an interactive encryption and decryption website developed by IEEE CS MUJ to help users explore and understand classical cryptography techniques.",
    image: "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1781890052192_ziz7r5.avif",
    github: "https://github.com/idkdolly/CS-Crypt.git",
  },
  {
    title: "CS Tijori",
    description: "CS Tijori is IEEE CS MUJ's in-house financial platform. It’s built to track budgets, invoices, and expenses without the mess. One centralized system. Full transparency. Every rupee accounted for.",
    image: "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1781890266264_66l66g.avif",
    github: "https://github.com/AwesomeSam9523/expense-tracker.git",
  },
];

export const PROJECT_IMAGES = cards.map((c) => c.image);

const ArrowIcon = React.memo(() => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-[22px] h-[22px]"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
));
ArrowIcon.displayName = "ArrowIcon";

const Card = React.memo(({ image, title, description, github }: CardProps) => {
  const githubUrl = github ?? "https://github.com";

  const letterSpans = useMemo(() => {
    return title.split("").map((char, index) => (
      <span
        key={index}
        className="inline-block relative transition-transform duration-[400ms] ease-[cubic-bezier(0.19,1,0.22,1)] will-change-transform"
        style={{ transitionDelay: `${index * 30}ms` }}
      >
        <span className="inline-block transition-transform duration-[400ms] group-hover:-translate-y-full will-change-transform">
          {char === " " ? "\u00A0" : char}
        </span>
        <span className="absolute left-0 top-full inline-block transition-transform duration-[400ms] group-hover:-translate-y-full text-white will-change-transform">
          {char === " " ? "\u00A0" : char}
        </span>
      </span>
    ));
  }, [title]);

  return (
    <a
      href={githubUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`View ${title} project on GitHub`}
      className={`w-full h-full rounded-[7px] overflow-hidden bg-[#111] border border-[#222] shadow-[0_20px_60px_rgba(0,0,0,0.4)] relative transition-colors duration-[250ms] ease-in hover:bg-[#F4A119] hover:border-[#F4A119] cursor-pointer group flex flex-col no-underline text-inherit ${barlow.className}`}
      style={{ willChange: "background-color, border-color" }}
    >
      <div style={{ padding: "14px 14px 2px 14px" }} className="w-full">
        <div
          className="relative w-full rounded-[8px] overflow-hidden"
          style={{ height: "clamp(100px, 28vw, 200px)" }}
        >
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 48vw, (max-width: 1024px) 240px, 280px"
            loading="lazy"
            decoding="async"
            className="object-cover object-top block transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </div>

      <div style={{ padding: "14px" }} className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-[10px]">
          <h3
            className={`font-extrabold text-[clamp(20px,4.8vw,26px)] sm:text-[38px] tracking-[0.03em] uppercase text-white leading-none m-0 flex overflow-hidden ${barlowCondensed.className}`}
          >
            {letterSpans}
          </h3>

          <div className="flex items-center justify-center text-white shrink-0">
            <span
              className="inline-flex relative overflow-hidden items-center justify-center will-change-transform"
              style={{ transitionDelay: `${title.length * 30}ms` }}
            >
              <span className="inline-flex transition-transform duration-[400ms] group-hover:-translate-y-full items-center justify-center will-change-transform">
                <ArrowIcon />
              </span>
              <span className="absolute left-0 top-full inline-flex transition-transform duration-[400ms] group-hover:-translate-y-full text-white items-center justify-center will-change-transform">
                <ArrowIcon />
              </span>
            </span>
          </div>
        </div>

        <p className="text-[13px] sm:text-[15px] leading-[1.55] text-white/90 font-medium m-0 p-0 transition-colors duration-[250ms]">
          {description}
        </p>
      </div>
    </a>
  );
});
Card.displayName = "Card";

const SectionHeader = React.memo(({ isVisible = true }: { isVisible?: boolean }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginBottom: "2rem",
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "translateY(0px)" : "translateY(40px)",
      transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(0.19, 1, 0.22, 1)",
      willChange: "transform, opacity",
    }}
  >
    <h2
      style={{
        textAlign: "center",
        fontFamily: "var(--font-playfair), 'Playfair Display', serif",
        fontWeight: 900,
        background: "linear-gradient(to right, #ffffff, #f9ba1f)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        fontSize: "clamp(2.75rem, 8vw, 5.25rem)",
        lineHeight: 1.15,
        paddingBottom: "0.15em",
        letterSpacing: "-0.03em",
        margin: 0,
      }}
    >
      Our Projects
    </h2>
    <div
      style={{
        width: "32px",
        height: "3px",
        backgroundColor: "#ffffff",
        boxShadow: "0 0 8px rgba(255, 255, 255, 0.8), 0 0 15px rgba(255, 255, 255, 0.5)",
        marginTop: "10px",
        borderRadius: "999px",
      }}
    />
  </div>
));
SectionHeader.displayName = "SectionHeader";

const MobileGrid = React.memo(() => {
  return (
    <section className="w-full py-[clamp(3rem,8vh,5rem)] px-4">
      <SectionHeader isVisible={true} />
      <div className="grid grid-cols-2 gap-[12px]">
        {cards.map((card) => (
          <div key={card.title} style={{ minHeight: "clamp(220px, 55vw, 340px)" }}>
            <Card {...card} />
          </div>
        ))}
      </div>
    </section>
  );
});
MobileGrid.displayName = "MobileGrid";

const DesktopScroll = React.memo(() => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(0);

  useGSAP(() => {
    if (!containerRef.current) return;

    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress;
          const count =
            progress < 0.04
              ? 0
              : Math.min(cards.length, Math.floor((progress - 0.04) / ((1 - 0.04) / cards.length)) + 1);
          setVisibleCount((prev) => (prev === count ? prev : count));
        },
      });
    });

    return () => mm.revert();
  }, { scope: containerRef });

  return (
    <div ref={containerRef} style={{ height: `${cards.length * 100}vh` }} className="relative">
      <div className="sticky top-0 w-full h-screen flex flex-col items-center justify-center px-4 md:px-8">
        <SectionHeader isVisible={true} />
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-[20px]">
          {cards.map((card, index) => {
            const isVisible = index < visibleCount;
            return (
              <div
                key={card.title}
                style={{
                  marginTop: index * 48,
                  width: 280,
                  height: 440,
                  transform: isVisible ? "translateY(0px)" : "translateY(80px)",
                  opacity: isVisible ? 1 : 0,
                  transition: "transform 0.75s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.6s ease",
                  willChange: "transform, opacity",
                }}
                className="flex shrink-0"
              >
                <Card {...card} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
DesktopScroll.displayName = "DesktopScroll";

const CascadingCards = () => {
  return (
    <div className="w-full bg-transparent">
      {/* Desktop view (>= 768px): Sticky cascade scroll sequence */}
      <div className="hidden md:block">
        <DesktopScroll />
      </div>

      {/* Mobile view (< 768px): Fast 2-column grid without layout shifts */}
      <div className="block md:hidden">
        <MobileGrid />
      </div>
    </div>
  );
};

export default CascadingCards;