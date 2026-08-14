"use client";

import { useEffect, useRef } from "react";

interface TopographicBackgroundProps {
  className?: string;
  lineColor?: string;
  backgroundColor?: string;
  lineCount?: number;
  animated?: boolean;
}

export default function TopographicBackground({
  className = "",
  lineColor = "rgba(180, 140, 60, 0.33)",
  backgroundColor = "#0d0d0d",
  lineCount = 5,
  animated = true,
}: TopographicBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const isMobile = window.innerWidth < 768;
      dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.25);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    const noise = (x: number, y: number, t: number): number => {
      return (
        Math.sin(x * 0.8 + t * 0.12) * Math.cos(y * 0.6 + t * 0.09) * 0.4 +
        Math.sin(x * 0.4 - y * 0.5 + t * 0.07) * 0.3 +
        Math.cos(x * 1.1 + y * 0.9 - t * 0.11) * 0.2 +
        Math.sin(x * 0.25 + y * 0.3 + t * 0.05) * 0.1
      );
    };

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const activeLineCount = isMobile ? 4 : lineCount;

    // Pre-allocated Float32Array for marching squares field
    let field = new Float32Array(0);

    const drawContours = (t: number) => {
      const w = width;
      const h = height;
      if (w === 0 || h === 0) return;

      if (backgroundColor !== "transparent") {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, w, h);
      } else {
        ctx.clearRect(0, 0, w, h);
      }

      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 0.2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Responsive grid
      const maxDim = Math.max(w, h);
      const cellSize = Math.max(isMobile ? 28 : 22, maxDim / (isMobile ? 60 : 90));

      const cols = Math.ceil(w / cellSize);
      const rows = Math.ceil(h / cellSize);
      const cellW = w / cols;
      const cellH = h / rows;

      const totalGridPoints = (rows + 1) * (cols + 1);
      if (field.length < totalGridPoints) {
        field = new Float32Array(totalGridPoints);
      }

      const rowStride = cols + 1;
      for (let j = 0; j <= rows; j++) {
        const rowOffset = j * rowStride;
        const ny = (j * cellH) / 250;
        for (let i = 0; i <= cols; i++) {
          const nx = (i * cellW) / 250;
          field[rowOffset + i] = noise(nx, ny, t);
        }
      }

      const minV = -0.85;
      const maxV = 0.85;

      for (let c = 0; c < activeLineCount; c++) {
        const threshold = minV + ((maxV - minV) * c) / (activeLineCount - 1);

        ctx.beginPath();

        for (let j = 0; j < rows; j++) {
          const r0 = j * rowStride;
          const r1 = (j + 1) * rowStride;
          const y0 = j * cellH;
          const y1 = y0 + cellH;

          for (let i = 0; i < cols; i++) {
            const v00 = field[r0 + i];
            const v10 = field[r0 + i + 1];
            const v01 = field[r1 + i];
            const v11 = field[r1 + i + 1];

            const idx =
              (v00 > threshold ? 8 : 0) |
              (v10 > threshold ? 4 : 0) |
              (v11 > threshold ? 2 : 0) |
              (v01 > threshold ? 1 : 0);

            if (idx === 0 || idx === 15) continue;

            const x0 = i * cellW;
            const x1 = x0 + cellW;

            const topX = x0 + ((x1 - x0) * (threshold - v00)) / (v10 - v00);
            const bottomX = x0 + ((x1 - x0) * (threshold - v01)) / (v11 - v01);
            const leftY = y0 + ((y1 - y0) * (threshold - v00)) / (v01 - v00);
            const rightY = y0 + ((y1 - y0) * (threshold - v10)) / (v11 - v10);

            switch (idx) {
              case 1:
                ctx.moveTo(bottomX, y1);
                ctx.lineTo(x0, leftY);
                break;
              case 2:
                ctx.moveTo(x1, rightY);
                ctx.lineTo(bottomX, y1);
                break;
              case 3:
                ctx.moveTo(x1, rightY);
                ctx.lineTo(x0, leftY);
                break;
              case 4:
                ctx.moveTo(topX, y0);
                ctx.lineTo(x1, rightY);
                break;
              case 5:
                ctx.moveTo(topX, y0);
                ctx.lineTo(x0, leftY);
                ctx.moveTo(x1, rightY);
                ctx.lineTo(bottomX, y1);
                break;
              case 6:
                ctx.moveTo(topX, y0);
                ctx.lineTo(bottomX, y1);
                break;
              case 7:
                ctx.moveTo(topX, y0);
                ctx.lineTo(x0, leftY);
                break;
              case 8:
                ctx.moveTo(x0, leftY);
                ctx.lineTo(topX, y0);
                break;
              case 9:
                ctx.moveTo(bottomX, y1);
                ctx.lineTo(topX, y0);
                break;
              case 10:
                ctx.moveTo(x0, leftY);
                ctx.lineTo(bottomX, y1);
                ctx.moveTo(topX, y0);
                ctx.lineTo(x1, rightY);
                break;
              case 11:
                ctx.moveTo(x1, rightY);
                ctx.lineTo(topX, y0);
                break;
              case 12:
                ctx.moveTo(x0, leftY);
                ctx.lineTo(x1, rightY);
                break;
              case 13:
                ctx.moveTo(bottomX, y1);
                ctx.lineTo(x1, rightY);
                break;
              case 14:
                ctx.moveTo(x0, leftY);
                ctx.lineTo(bottomX, y1);
                break;
            }
          }
        }

        ctx.stroke();
      }
    };

    let isVisible = true;
    let isRunning = false;
    let lastTime = 0;

    const animate = (now: number) => {
      if (!isVisible) {
        isRunning = false;
        lastTime = 0;
        return;
      }

      if (lastTime === 0) lastTime = now;
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      timeRef.current += animated ? delta * 2.6 : 0;
      drawContours(timeRef.current);

      animFrameRef.current = requestAnimationFrame(animate);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isVisible = false;
        cancelAnimationFrame(animFrameRef.current);
        isRunning = false;
        lastTime = 0;
      } else {
        isVisible = true;
        if (!isRunning) {
          isRunning = true;
          lastTime = 0;
          animFrameRef.current = requestAnimationFrame(animate);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    isRunning = true;
    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [lineColor, backgroundColor, lineCount, animated]);

  return (
    <canvas
      ref={canvasRef}
      className={`block ${className}`}
      style={{ background: backgroundColor, width: "100%", height: "100%", display: "block" }}
    />
  );
}


export function TopographicDemo() {
  return (
    <div style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh" }}>
      <TopographicBackground
        lineColor="rgba(180, 140, 60, 0.33)"
        backgroundColor="#0d0d0d"
        lineCount={5}
        animated={true}
      />
    </div>
  );
}