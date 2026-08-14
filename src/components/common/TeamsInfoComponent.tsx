"use client";
import { useEffect, useRef } from "react";
import { useInView } from "framer-motion";
import TVComponent from "./TVComponent";


function easeOutExpo(x: number) {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}


interface CountUpProps {
  to: number;
  from?: number;
  delay?: number;    // seconds
  duration?: number; // ms
  separator?: string;
}

function CountUp({ to, from = 0, delay = 0, duration = 1400, separator = "", start = true }: CountUpProps & { start?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!start) return;

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    if (isMobile) {
      if (ref.current) {
        ref.current.textContent = separator ? to.toLocaleString("en-US") : String(to);
      }
      return;
    }

    if (ref.current) ref.current.textContent = String(from);

    let rafId = 0;
    const startTime = performance.now() + delay * 1000;

    function tick(now: number) {
      const elapsed = now - startTime;
      if (elapsed < 0) { rafId = requestAnimationFrame(tick); return; }
      const p = Math.min(elapsed / duration, 1);
      const val = Math.round(easeOutExpo(p) * (to - from) + from);
      if (ref.current) {
        ref.current.textContent = separator ? val.toLocaleString("en-US") : String(val);
      }
      if (p < 1) {
        rafId = requestAnimationFrame(tick);
      } else if (ref.current) {
        ref.current.textContent = separator ? to.toLocaleString("en-US") : String(to);
      }
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [to, from, delay, duration, separator, start]);

  return <span ref={ref} />;
}


const STATS = [
  { label: "Members",   value: 1500, ticks: 15, delay: 0    },
  { label: "Events",    value: 30,   ticks: 8,  delay: 0.15 },
  { label: "Societies", value: 3,    ticks: 3,  delay: 0.3  },
  { label: "Mentors",   value: 10,   ticks: 5,  delay: 0.45 },
] as const;


function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let W = 0, H = 0, raf = 0;

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const particleCount = isMobile ? 18 : 60;
    const maxDistance = isMobile ? 80 : 120;

    const pts = Array.from({ length: particleCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00015,
      vy: (Math.random() - 0.5) * 0.00015,
      r: Math.random() * 1.5 + 0.5,
      o: Math.random() * 0.15 + 0.05,
    }));

    function resize() {
      W = canvas!.width = canvas!.offsetWidth;
      H = canvas!.height = canvas!.offsetHeight;
      if (isMobile) {
        draw();
      }
    }

    let isVisible = false;

    function draw() {
      if (!isVisible || !W) {
        return;
      }
      ctx.clearRect(0, 0, W, H);

      pts.forEach((p) => {
        if (!isMobile) {
          p.x = (p.x + p.vx + 1) % 1;
          p.y = (p.y + p.vy + 1) % 1;
        }
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.o})`;
        ctx.fill();
      });

      const maxDistanceSq = maxDistance * maxDistance;

      for (let i = 0; i < pts.length; i++) {
        const p1 = pts[i];
        const p1x = p1.x * W;
        const p1y = p1.y * H;
        for (let j = i + 1; j < pts.length; j++) {
          const p2 = pts[j];
          const p2x = p2.x * W;
          const p2y = p2.y * H;
          const dx = p1x - p2x;
          const dy = p1y - p2y;
          const dsq = dx * dx + dy * dy;
          if (dsq < maxDistanceSq) {
            const d = Math.sqrt(dsq);
            ctx.beginPath();
            ctx.moveTo(p1x, p1y);
            ctx.lineTo(p2x, p2y);
            ctx.strokeStyle = `rgba(255,255,255,${0.04 * (1 - d / maxDistance)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      
      if (!isMobile && isVisible) {
        raf = requestAnimationFrame(draw);
      }
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting && !document.hidden;
        if (isVisible && !isMobile) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(draw);
        } else {
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(canvas);

    const handleVisibility = () => {
      if (document.hidden) {
        isVisible = false;
        cancelAnimationFrame(raf);
      } else if (canvasRef.current) {
        isVisible = true;
        if (!isMobile) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(draw);
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      if (!isMobile) cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}


function StatCell({
  label,
  value,
  ticks,
  delay,
  index,
}: {
  label: string;
  value: number;
  ticks: number;
  delay: number;
  index: number;
}) {
  const isRight = index % 2 !== 0;
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });
  const tickRefs = useRef<(HTMLDivElement | null)[]>([]);
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isInView) return;

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    if (isMobile) {
      if (revealRef.current) {
        revealRef.current.style.transform = "scaleX(0)";
        revealRef.current.style.display = "none";
      }
      tickRefs.current.forEach((t) => {
        if (t) t.style.background = "#ffffff";
      });
      return;
    }

    const revealTimeout = setTimeout(() => {
      if (revealRef.current) {
        revealRef.current.style.transform = "scaleX(0)";
      }
    }, delay * 1000 + 50);

    const duration = 1400;
    const startTime = performance.now() + delay * 1000;
    let rafId = 0;

    function animTicks(now: number) {
      const elapsed = now - startTime;
      if (elapsed < 0) { rafId = requestAnimationFrame(animTicks); return; }
      const p = Math.min(elapsed / duration, 1);
      const e = easeOutExpo(p);
      const activeTick = Math.floor(e * ticks);
      tickRefs.current.forEach((t, idx) => {
        if (!t) return;
        t.style.background = idx <= activeTick ? "#ffffff" : "rgba(255,255,255,0.15)";
      });
      if (p < 1) rafId = requestAnimationFrame(animTicks);
      else tickRefs.current.forEach((t) => { if (t) t.style.background = "#ffffff"; });
    }

    rafId = requestAnimationFrame(animTicks);

    return () => {
      clearTimeout(revealTimeout);
      cancelAnimationFrame(rafId);
    };
  }, [delay, ticks, isInView]);

  return (
    <div ref={containerRef} className={`relative border-b border-white/[0.06] border-r p-2 md:p-10 group transition-colors duration-300 hover:bg-white/[0.02] [&:nth-child(2)]:border-r-0 [&:nth-child(4)]:border-r-0 md:[&:nth-child(2)]:border-r-0 md:[&:nth-child(4)]:border-r-0 [&:nth-child(3)]:border-b-0 [&:nth-child(4)]:border-b-0 md:[&:nth-child(3)]:border-b-0 md:[&:nth-child(4)]:border-b-0 flex flex-col items-center text-center md:items-start md:text-left px-4 md:px-10`}>

      <div
        ref={revealRef}
        className="absolute inset-0 bg-white/[0.03] origin-left z-10 pointer-events-none"
        style={{ transition: "transform 1s cubic-bezier(0.16, 1, 0.3, 1)" }}
      />
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        <div
          className="absolute bottom-[-16px] right-[-8px] font-black text-white/[0.025] group-hover:text-white/[0.05] transition-colors duration-300 select-none leading-none tracking-[-8px]"
          style={{ fontSize: "clamp(80px, 20vw, 200px)" }}
        >
          {value}
        </div>
      </div>
      <p
        className="relative z-[1] uppercase tracking-[4px] font-light text-white/35 mb-3"
        style={{ fontSize: "clamp(12px, 2vw, 16px)" }}
      >
        {label}
      </p>
      <div className="relative z-[1] flex items-baseline gap-1 leading-none">
        <div
          className="font-black text-white tracking-[-2px] md:tracking-[-4px] leading-none tabular-nums"
          style={{ fontSize: "clamp(44px, 9vw, 120px)" }}
        >
          <CountUp
            to={value}
            from={0}
            delay={delay}
            duration={1400}
            separator=","
            start={isInView}
          />
        </div>
        <span
          className="font-black text-white/40 leading-none"
          style={{ fontSize: "clamp(24px, 5vw, 60px)", alignSelf: "flex-start", marginTop: "clamp(4px, 1vw, 8px)" }}
        >
          +
        </span>
      </div>

      <div className="relative z-[1] flex flex-wrap gap-1.5 mt-5 justify-center md:justify-start">
        {Array.from({ length: ticks }).map((_, i) => (
          <div
            key={i}
            ref={(el) => { tickRefs.current[i] = el; }}
            className="w-1 h-1 rounded-full shrink-0"
            style={{ background: "rgba(255,255,255,0.15)" }}
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-white group-hover:w-full transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]" />
    </div>
  );
}


export default function TeamsInfoComponent() {
  return (
    <div className="mobile-teams-info-section relative min-h-screen py-20 lg:py-0 lg:h-screen flex flex-col lg:flex-row items-center justify-center overflow-x-hidden lg:overflow-hidden">
      <style>{`
        @media (max-width: 767px) {
          .mobile-teams-info-section {
            padding-bottom: clamp(3rem, 8vh, 5rem) !important;
          }
        }
      `}</style>

      <div className="flex flex-col items-center lg:items-start w-full lg:w-[40vw] px-6 lg:px-0 mb-12 lg:mb-0">
        <div className="flex flex-col items-center lg:items-start" style={{ marginBottom: "70px" }}>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl text-center lg:text-left"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 900,
              background: "linear-gradient(to right, #ffffff, #f9ba1f)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1.15,
              paddingBottom: "0.15em",
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            IEEE CS MUJ
          </h1>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl text-center lg:text-left"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 900,
              background: "linear-gradient(to right, #ffffff, #f9ba1f)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1.15,
              paddingBottom: "0.15em",
              letterSpacing: "-0.03em",
              margin: 0,
              marginTop: "10px",
            }}
          >
            Since 2019
          </h1>
          <div
            style={{
              width: "40px",
              height: "3px",
              backgroundColor: "#ffffff",
              boxShadow: "0 0 8px rgba(255, 255, 255, 0.8), 0 0 15px rgba(255, 255, 255, 0.5)",
              borderRadius: "999px",
              marginTop: "15px",
            }}
          />
        </div>
        <TVComponent />
      </div>

      <div className="relative w-full lg:w-[50vw] px-4 lg:px-0" style={{ marginTop: "65px" }}>
        <ParticleCanvas />
        <div className="relative z-[1] w-full grid grid-cols-2 grid-rows-2">
          {STATS.map(({ label, value, ticks, delay }, index) => (
            <StatCell
              key={label}
              label={label}
              value={value}
              ticks={ticks}
              delay={delay}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}