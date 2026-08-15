"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import type { EventItem } from "@/data/eventsData";
import styles from "./calendar.module.css";

gsap.registerPlugin(ScrollTrigger);

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface CalendarClientPageProps {
  events: EventItem[];
}

export default function CalendarClientPage({ events }: CalendarClientPageProps) {
  const landingRef = useRef<HTMLDivElement | null>(null);
  const section2Ref = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLImageElement | null>(null);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Extract all unique years from the events list
  const availableYears = Array.from(
    new Set(
      events
        .map((e) => {
          const d = new Date(e.date);
          return isNaN(d.getTime()) ? null : d.getFullYear();
        })
        .filter((y): y is number => y !== null)
    )
  );

  // Ensure currentYear is always in the list, sorted latest first
  const yearsToShow = Array.from(new Set([currentYear, ...availableYears])).sort((a, b) => b - a);

  const [selectedYear, setSelectedYear] = useState<number>(() => {
    return yearsToShow.includes(currentYear) ? currentYear : yearsToShow[0] || currentYear;
  });

  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const yearDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
        setIsYearDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!landingRef.current || !section2Ref.current || !logoRef.current) return;

    gsap.to(landingRef.current, {
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: section2Ref.current,
        start: "top 70%",
        end: "top top",
        scrub: true,
      },
    });
  }, []);

  const eventsForMonth = (monthIndex: number) => {
    return events.filter((e) => {
      const d = new Date(e.date);
      if (isNaN(d.getTime())) return false;
      const m = d.getMonth();
      const y = d.getFullYear();
      return m === monthIndex && y === selectedYear;
    });
  };

  return (
    <>
      <div>
        <section
          ref={landingRef}
          className="min-h-screen lg:h-screen sticky top-0 flex flex-col lg:flex-row items-center justify-center lg:justify-between px-6 sm:px-16 lg:px-32 bg-[#1a1a1a] text-white z-10 relative gap-6 lg:gap-0 py-16 lg:py-0"
        >
          <div className="z-10 translate-x-0 lg:translate-x-30 text-center lg:text-left">
            <p
              className="text-white font-bold text-2xl sm:text-3xl
              [-webkit-text-stroke:2px_#facc15]
              [paint-order:stroke_fill]
              drop-shadow-[0_0_8px_rgba(250,204,21,0.7)]
              drop-shadow-[0_0_16px_rgba(250,204,21,0.5)]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              What&apos;s On
            </p>
            <h1
              className="font-bold text-5xl sm:text-6xl md:text-7xl lg:text-8xl
              [-webkit-text-stroke:2px_#facc15]
              [paint-order:stroke_fill]
              drop-shadow-[0_0_8px_rgba(250,204,21,0.7)]
              drop-shadow-[0_0_16px_rgba(250,204,21,0.5)]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Events
            </h1>
          </div>

          <div className="relative lg:absolute lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 flex items-center justify-center my-4 lg:my-0">
            <div className={`${styles.responsiveLogoWrapper} relative flex items-center justify-center`}>
              <Image
                ref={logoRef}
                src="/logos/calendar-logo-center.avif"
                alt="cal-logo"
                fill
                sizes="(max-width: 1024px) 240px, 350px"
                className="object-contain relative z-10 mix-blend-screen"
              />
              <div className="sparkContainer">
                {Array.from({ length: 12 }).map((_, i) => (
                  <span key={i} className="spark"></span>
                ))}
              </div>
            </div>
          </div>

          <div className="z-10 translate-x-0 lg:-translate-x-20 text-center lg:text-right">
            <h1
              className="font-bold text-5xl sm:text-6xl md:text-7xl lg:text-8xl
              [-webkit-text-stroke:2px_#facc15]
              [paint-order:stroke_fill]
              drop-shadow-[0_0_8px_rgba(250,204,21,0.7)]
              drop-shadow-[0_0_16px_rgba(250,204,21,0.5)]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Calendar
            </h1>
          </div>
        </section>

        <section
          ref={section2Ref}
          className="relative items-center justify-center bg-black text-white relative z-20"
        >
        </section>

        <section className={styles.calendarSection}>
          <h2
            style={{
              textAlign: "center",
              fontFamily: "'Playfair Display', serif",
              fontWeight: 900,
              background: "linear-gradient(to right, #ffffff, #f9ba1f)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: "clamp(2.75rem, 8vw, 5.25rem)",
              lineHeight: 1.15,
              paddingBottom: "0.15em",
              letterSpacing: "-0.03em",
              marginBottom: "0px",
              marginTop: "40px",
            }}
          >
            Events
          </h2>
          <div
            style={{
              width: "32px",
              height: "3px",
              backgroundColor: "#ffffff",
              boxShadow: "0 0 8px rgba(255, 255, 255, 0.8), 0 0 15px rgba(255, 255, 255, 0.5)",
              marginTop: "10px",
              marginBottom: "2rem",
              marginLeft: "auto",
              marginRight: "auto",
              borderRadius: "999px",
            }}
          />

          <div className={styles.calendarContainer}>
            <div className={styles.calendarHeader}>
              <div className={styles.headerLeft}>
                <div className="relative mr-4" ref={yearDropdownRef}>
                   <button
                    onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 rounded-xl text-base sm:text-lg font-bold text-white transition-all duration-200 shadow-lg cursor-pointer"
                    style={{
                      paddingTop: "10px",
                      paddingBottom: "10px",
                      paddingLeft: "18px",
                      paddingRight: "18px",
                      lineHeight: 1,
                    }}
                  >
                    <span>{selectedYear}</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${isYearDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isYearDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-full min-w-[100px] bg-[#0b0b0b]/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl z-50 py-1.5 overflow-hidden transition-all duration-150 ease-out origin-top">
                      {yearsToShow.map((yr) => (
                        <button
                          key={yr}
                          onClick={() => {
                            setSelectedYear(yr);
                            setIsYearDropdownOpen(false);
                          }}
                          className={`w-full text-left font-semibold transition-colors cursor-pointer block ${
                            selectedYear === yr
                              ? "text-[#f9ba1f] bg-white/5"
                              : "text-white/70 hover:text-white hover:bg-white/5"
                          }`}
                          style={{
                            paddingLeft: "18px",
                            paddingRight: "18px",
                            paddingTop: "8px",
                            paddingBottom: "8px",
                          }}
                        >
                          {yr}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span
                  className="inline-flex items-center bg-white/15 border border-white/10 rounded-xl text-base sm:text-lg font-semibold text-white"
                  style={{
                    paddingTop: "10px",
                    paddingBottom: "10px",
                    paddingLeft: "18px",
                    paddingRight: "18px",
                    lineHeight: 1,
                  }}
                >
                  Yearly Calendar
                </span>
              </div>
            </div>

            <div className={styles.calendarGrid}>
              {MONTH_NAMES.map((name: string, idx: number) => {
                const isCurrentMonth = idx === currentMonth;
                const monthEvents = eventsForMonth(idx);

                return (
                  <div className={styles.dayRow} key={idx}>
                    {/* Label */}
                    <div
                      className={`${styles.dayLabel} ${isCurrentMonth ? styles.todayLabel : ""}`}
                    >
                      <span className={styles.dayName}>{name}</span>
                    </div>

                    <div className={styles.eventArea}>
                      {monthEvents.length === 0 && (
                        <span style={{ color: "#d1d5db", fontSize: "0.8rem", fontStyle: "italic" }}>
                          No events
                        </span>
                      )}

                      {monthEvents.map((ev: EventItem, evIdx: number) => {
                        return (
                          <div
                            key={ev.id}
                            className={styles.pillEvent}
                            style={{ animationDelay: `${evIdx * 0.08}s` }}
                          >
                            <span className={styles.pillTitle}>{ev.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
