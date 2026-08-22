"use client";
import { useEffect, useRef, useState } from "react";
import styles from "@/components/common/CardStack.module.css";
import { CARD_STACK_IMAGES as EVENT_IMAGES } from "@/data/preloadManifest";

export default function CardStack() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    EVENT_IMAGES.forEach((src) => {
      const img = new window.Image();
      img.src = src;
      if (typeof img.decode === "function") {
        img.decode().catch(() => {});
      }
    });
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const target = containerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => {
            setOpen(true);
          }, 500);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <div id="card-stack-section">
      <style>{`
        @media (max-width: 767px) {
          .mobile-events-title-container {
            padding-top: clamp(6rem, 15vh, 10rem) !important;
          }
          .mobile-events-cards-section {
            min-height: 60vh !important;
            padding-bottom: clamp(4rem, 10vh, 6rem) !important;
            padding-top: 2rem !important;
          }
        }
      `}</style>
      <div
        className="mobile-events-title-container w-full flex flex-col items-center"
        style={{
          paddingTop: "3rem",
          marginBottom: "1rem",
        }}
      >
        <h2 style={{
          display: "inline-block",
          textAlign: "center",
          fontFamily: "'Playfair Display', serif",
          fontWeight: 900,
          background: "linear-gradient(to right, #ffffff, #f9ba1f)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontSize: "clamp(2.75rem, 8vw, 5.25rem)",
          lineHeight: 1.15,
          padding: "0px 0px 0.15em 0px",
          letterSpacing: "-0.03em",
          margin: 0,
        }}>
          Our Events
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
      <section ref={containerRef} className={`${styles.container} mobile-events-cards-section`} style={{ minHeight: "100vh", paddingBottom: "10rem", paddingTop: "4rem" }}>
        <div className={`${styles.cards} ${open ? styles.open : ""}`}>
          {EVENT_IMAGES.map((src, index) => (
            <div key={index} className={styles.card}>
              <img
                src={src}
                alt={`IEEE CS Event Card ${index + 1}`}
                draggable="false"
                loading="eager"
                decoding="async"
                className={styles.cardImg}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}