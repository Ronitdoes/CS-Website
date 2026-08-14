"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./TVComponent.module.css";

interface Channel {
  ch: number;
  label: string;
  stat: string;
  desc: string;
  hex: string;
  r: number;
  g: number;
  b: number;
  img?: string;
}

const CHANNELS: Channel[] = [
  {
    ch: 1,
    label: "MUJ",
    stat: "IEEE CS",
    desc: "computer society chapter",
    hex: "#c4893a",
    r: 196,
    g: 137,
    b: 58,
  },
  {
    ch: 2,
    label: "MEMBERS",
    stat: "1,500+",
    desc: "and growing every year",
    hex: "#2e3d4f",
    r: 46,
    g: 61,
    b: 79,
  },
  {
    ch: 3,
    label: "EVENTS",
    stat: "30+",
    desc: "workshops · hackathons · talks",
    hex: "#4a5e45",
    r: 74,
    g: 94,
    b: 69,
  },
  {
    ch: 4,
    label: "SOCIETIES",
    stat: "3+",
    desc: "specialized technical societies",
    hex: "#1a1814",
    r: 26,
    g: 24,
    b: 20,
  },
  {
    ch: 5,
    label: "MENTORS",
    stat: "10+",
    desc: "industry & faculty mentors",
    hex: "#4a4e5a",
    r: 74,
    g: 78,
    b: 90,
  },
];

interface GlitchLine {
  id: number;
  style: React.CSSProperties;
}

export default function TVComponent() {
  const [currentCh, setCurrentCh] = useState(0);
  const [switching, setSwitching] = useState(false);
  const [glitching, setGlitching] = useState(false);
  const [glitchLines, setGlitchLines] = useState<GlitchLine[]>([]);
  
  const autoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tvScreenRef = useRef<HTMLDivElement>(null);
  const glitchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const switchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const switchTo = useCallback(
    (idx: number) => {
      if (switching) return;
      setSwitching(true);

      const targetIdx = ((idx % CHANNELS.length) + CHANNELS.length) % CHANNELS.length;

      if (switchTimeoutRef.current) {
        clearTimeout(switchTimeoutRef.current);
      }

      switchTimeoutRef.current = setTimeout(() => {
        setCurrentCh(targetIdx);
        setSwitching(false);
      }, 220);
    },
    [switching]
  );

  const next = useCallback(() => {
    switchTo(currentCh + 1);
  }, [currentCh, switchTo]);

  const prev = useCallback(() => {
    switchTo(currentCh - 1);
  }, [currentCh, switchTo]);

  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const restartAutoTimer = useCallback(
    (delayMs = 1500) => {
      if (autoTimerRef.current) {
        clearInterval(autoTimerRef.current);
        autoTimerRef.current = null;
      }
      if (!isInView) return;
      autoTimerRef.current = setInterval(() => {
        next();
      }, delayMs);
    },
    [next, isInView]
  );

  useEffect(() => {
    if (isInView) {
      restartAutoTimer(1500);
    } else if (autoTimerRef.current) {
      clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }
    return () => {
      if (autoTimerRef.current) {
        clearInterval(autoTimerRef.current);
      }
    };
  }, [isInView, restartAutoTimer]);

  const handleInteraction = useCallback(() => {
    restartAutoTimer(3000);
  }, [restartAutoTimer]);

  const handleScreenClick = useCallback(() => {
    handleInteraction();
    next();
  }, [handleInteraction, next]);

  const spawnGlitchLines = useCallback(() => {
    if (!tvScreenRef.current) return;
    const screenH = tvScreenRef.current.offsetHeight || 285;
    const count = 3 + Math.floor(Math.random() * 5);
    const lines: GlitchLine[] = [];

    for (let i = 0; i < count; i++) {
      const top = Math.random() * screenH;
      const h = 1 + Math.random() * 6;
      const w = 30 + Math.random() * 70; 
      const left = Math.random() * (100 - w);
      const alpha = 0.05 + Math.random() * 0.2;
      const isColor = Math.random() > 0.6;
      
      const style: React.CSSProperties = {
        position: "absolute",
        top: `${top}px`,
        left: `${left}%`,
        width: `${w}%`,
        height: `${h}px`,
        background: isColor
          ? Math.random() > 0.5
            ? `rgba(100, 200, 255, ${alpha})`
            : `rgba(255, 100, 100, ${alpha})`
          : `rgba(255, 255, 255, ${alpha})`,
        mixBlendMode: "screen",
      };

      lines.push({ id: i, style });
    }
    setGlitchLines(lines);
  }, []);

  const triggerGlitch = useCallback(() => {
    if (switching || !isInView) return;
    spawnGlitchLines();
    setGlitching(true);

    if (glitchTimeoutRef.current) {
      clearTimeout(glitchTimeoutRef.current);
    }

    glitchTimeoutRef.current = setTimeout(() => {
      setGlitching(false);
      setGlitchLines([]);
    }, 150);
  }, [switching, isInView, spawnGlitchLines]);

  useEffect(() => {
    if (!isInView) return;
    let timerId: NodeJS.Timeout;

    const schedule = () => {
      const delay = 3000 + Math.random() * 4000;
      timerId = setTimeout(() => {
        triggerGlitch();
        schedule();
      }, delay);
    };

    schedule();

    return () => {
      clearTimeout(timerId);
      if (glitchTimeoutRef.current) {
        clearTimeout(glitchTimeoutRef.current);
      }
    };
  }, [isInView, triggerGlitch]);

  useEffect(() => {
    return () => {
      if (switchTimeoutRef.current) {
        clearTimeout(switchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA")) {
        return;
      }

      if (e.key === "ArrowRight" || e.key === " " || e.key === "ArrowUp") {
        e.preventDefault();
        handleInteraction();
        next();
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        handleInteraction();
        prev();
      }
      const n = parseInt(e.key);
      if (!isNaN(n) && n >= 1 && n <= 5) {
        handleInteraction();
        switchTo(n - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [next, prev, switchTo, handleInteraction]);

  const activeCh = CHANNELS[currentCh];
  const screenImgStyle: React.CSSProperties = {
    backgroundImage: activeCh.img ? `url('${activeCh.img}')` : "none",
    backgroundColor: activeCh.hex,
  };

  const { r, g, b } = activeCh;
  const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
  const a = 0.28 + brightness * 0.3;
  const glowShadow = `
    0 0 18px rgba(${r}, ${g}, ${b}, ${a}),
    0 0 45px rgba(${r}, ${g}, ${b}, ${a * 0.6}),
    0 0 90px rgba(${r}, ${g}, ${b}, ${a * 0.3})
  `;

  const screenClasses = [
    styles.tvScreen,
    switching ? styles.switching : "",
    glitching ? styles.glitching : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={containerRef} className={styles.tvWrap}>
      <div className={styles.tvCabinet}>
        <div className={styles.tvBezel}>
          <div
            className={screenClasses}
            ref={tvScreenRef}
            tabIndex={0}
            onClick={handleScreenClick}
            aria-label={`IEEE CS TV Screen showing statistics. Channel ${activeCh.ch}: ${activeCh.label}`}
          >
            <div className={styles.phosphorGlow} style={{ boxShadow: glowShadow }} />
            <div className={styles.screenImg} style={screenImgStyle} />
            <div className={styles.screenOverlay} />
            <div className={styles.scanlines} />
            <div className={styles.glitchLayer}>
              {glitchLines.map((line) => (
                <div key={line.id} style={line.style} />
              ))}
            </div>
            <div className={styles.screenContent}>
              <div className={styles.screenCh}>
                CH {String(activeCh.ch).padStart(2, "0")}
              </div>
              <div className={styles.screenStat}>{activeCh.stat}</div>
              <div className={styles.screenLabel}>{activeCh.label}</div>
              <div className={styles.screenDesc}>{activeCh.desc}</div>
            </div>
            <div className={styles.screenGlass} />
          </div>
        </div>

        <div className={styles.tvControls}>
          <div className={styles.tvBrand}>IEEE CS</div>
          <div className={styles.indicatorRow}>
            <div className={styles.led} />
            <span
              style={{
                fontFamily: "var(--font-vt323), monospace",
                fontSize: "14px",
                color: "rgba(200, 191, 173, 0.3)",
                letterSpacing: "0.1em",
              }}
            >
              ON AIR
            </span>
          </div>
          <div className={styles.knobs}>
            <div
              className={styles.knob}
              title="Previous Channel"
              onClick={() => {
                handleInteraction();
                prev();
              }}
            />
            <div
              className={`${styles.knob} ${styles.chKnob}`}
              title="Next Channel"
              onClick={() => {
                handleInteraction();
                next();
              }}
            />
          </div>
        </div>
      </div>

      <div className={styles.hint}>click screen or knobs to switch</div>
    </div>
  );
}
