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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isTransparent =
      backgroundColor === "transparent" ||
      backgroundColor === "rgba(0,0,0,0)" ||
      backgroundColor === "none";

    const ctx = canvas.getContext("2d", { alpha: isTransparent });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let animFrameId = 0;
    let time = 0;
    let lastTime = 0;
    let isVisible = true;
    let isIntersecting = true;
    let isRunning = false;

    // Grid and precomputed data
    let cols = 0;
    let rows = 0;
    let cellW = 0;
    let cellH = 0;
    let rowStride = 0;
    let activeLineCount = lineCount;
    const minV = -0.85;
    const maxV = 0.85;

    // Pre-allocated typed buffers (reused across frames to eliminate GC)
    let field = new Float32Array(0);
    let colK1 = new Float32Array(0);
    let colS2 = new Float32Array(0);
    let colC2 = new Float32Array(0);
    let colC3 = new Float32Array(0);
    let colS3 = new Float32Array(0);
    let colS4 = new Float32Array(0);
    let colC4 = new Float32Array(0);

    let rowC2 = new Float32Array(0);
    let rowS2 = new Float32Array(0);
    let rowC3 = new Float32Array(0);
    let rowS3 = new Float32Array(0);
    let rowC4 = new Float32Array(0);
    let rowS4 = new Float32Array(0);

    let thresholds = new Float32Array(0);
    let invStep = 0;

    const updateDimensions = () => {
      const isMobile = window.innerWidth < 768;
      dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.25);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      if (width === 0 || height === 0) return;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      activeLineCount = isMobile ? 4 : lineCount;

      const maxDim = Math.max(width, height);
      const cellSize = Math.max(isMobile ? 28 : 22, maxDim / (isMobile ? 60 : 90));

      cols = Math.ceil(width / cellSize);
      rows = Math.ceil(height / cellSize);
      cellW = width / cols;
      cellH = height / rows;
      rowStride = cols + 1;

      const totalGridPoints = (rows + 1) * rowStride;
      if (field.length < totalGridPoints) {
        field = new Float32Array(totalGridPoints);
      }

      // Column buffers
      if (colK1.length < cols + 1) {
        colK1 = new Float32Array(cols + 1);
        colS2 = new Float32Array(cols + 1);
        colC2 = new Float32Array(cols + 1);
        colC3 = new Float32Array(cols + 1);
        colS3 = new Float32Array(cols + 1);
        colS4 = new Float32Array(cols + 1);
        colC4 = new Float32Array(cols + 1);
      }

      // Row static buffers (independent of time t)
      if (rowC2.length < rows + 1) {
        rowC2 = new Float32Array(rows + 1);
        rowS2 = new Float32Array(rows + 1);
        rowC3 = new Float32Array(rows + 1);
        rowS3 = new Float32Array(rows + 1);
        rowC4 = new Float32Array(rows + 1);
        rowS4 = new Float32Array(rows + 1);
      }

      for (let j = 0; j <= rows; j++) {
        const ny = (j * cellH) / 250;
        rowC2[j] = Math.cos(ny * 0.5);
        rowS2[j] = Math.sin(ny * 0.5);
        rowC3[j] = Math.cos(ny * 0.9);
        rowS3[j] = Math.sin(ny * 0.9);
        rowC4[j] = Math.cos(ny * 0.3);
        rowS4[j] = Math.sin(ny * 0.3);
      }

      // Thresholds buffer
      if (thresholds.length !== activeLineCount) {
        thresholds = new Float32Array(activeLineCount);
      }
      const step = activeLineCount > 1 ? (maxV - minV) / (activeLineCount - 1) : 1;
      invStep = activeLineCount > 1 ? 1 / step : 0;
      for (let c = 0; c < activeLineCount; c++) {
        thresholds[c] = minV + c * step;
      }
    };

    const drawContours = (t: number) => {
      const w = width;
      const h = height;
      if (w === 0 || h === 0 || cols === 0 || rows === 0) return;

      if (!isTransparent) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, w, h);
      } else {
        ctx.clearRect(0, 0, w, h);
      }

      // Precompute 1D column values for time t
      for (let i = 0; i <= cols; i++) {
        const nx = (i * cellW) / 250;
        colK1[i] = 0.4 * Math.sin(nx * 0.8 + t * 0.12);

        const u2 = nx * 0.4 + t * 0.07;
        colS2[i] = 0.3 * Math.sin(u2);
        colC2[i] = 0.3 * Math.cos(u2);

        const u3 = nx * 1.1 - t * 0.11;
        colC3[i] = 0.2 * Math.cos(u3);
        colS3[i] = 0.2 * Math.sin(u3);

        const u4 = nx * 0.25 + t * 0.05;
        colS4[i] = 0.1 * Math.sin(u4);
        colC4[i] = 0.1 * Math.cos(u4);
      }

      // Compute scalar field using separable components (pure arithmetic in inner loop)
      for (let j = 0; j <= rows; j++) {
        const rowOffset = j * rowStride;
        const ny = (j * cellH) / 250;
        const r1 = Math.cos(ny * 0.6 + t * 0.09);
        const c2 = rowC2[j], s2 = rowS2[j];
        const c3 = rowC3[j], s3 = rowS3[j];
        const c4 = rowC4[j], s4 = rowS4[j];

        for (let i = 0; i <= cols; i++) {
          field[rowOffset + i] =
            colK1[i] * r1 +
            (colS2[i] * c2 - colC2[i] * s2) +
            (colC3[i] * c3 - colS3[i] * s3) +
            (colS4[i] * c4 + colC4[i] * s4);
        }
      }

      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 0.2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();

      // Single-pass Marching Squares with cell min/max threshold filtering
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

          let minVal = v00 < v10 ? v00 : v10;
          if (v01 < minVal) minVal = v01;
          if (v11 < minVal) minVal = v11;

          let maxVal = v00 > v10 ? v00 : v10;
          if (v01 > maxVal) maxVal = v01;
          if (v11 > maxVal) maxVal = v11;

          if (maxVal < minV || minVal > maxV) continue;

          let cStart = Math.floor((minVal - minV) * invStep);
          if (cStart < 0) cStart = 0;
          let cEnd = Math.ceil((maxVal - minV) * invStep);
          if (cEnd >= activeLineCount) cEnd = activeLineCount - 1;

          if (cStart > cEnd) continue;

          const x0 = i * cellW;
          const x1 = x0 + cellW;

          for (let c = cStart; c <= cEnd; c++) {
            const threshold = thresholds[c];
            const idx =
              (v00 > threshold ? 8 : 0) |
              (v10 > threshold ? 4 : 0) |
              (v11 > threshold ? 2 : 0) |
              (v01 > threshold ? 1 : 0);

            if (idx === 0 || idx === 15) continue;

            switch (idx) {
              case 1: {
                const bottomX = x0 + cellW * ((threshold - v01) / (v11 - v01));
                const leftY = y0 + cellH * ((threshold - v00) / (v01 - v00));
                ctx.moveTo(bottomX, y1);
                ctx.lineTo(x0, leftY);
                break;
              }
              case 2: {
                const rightY = y0 + cellH * ((threshold - v10) / (v11 - v10));
                const bottomX = x0 + cellW * ((threshold - v01) / (v11 - v01));
                ctx.moveTo(x1, rightY);
                ctx.lineTo(bottomX, y1);
                break;
              }
              case 3: {
                const rightY = y0 + cellH * ((threshold - v10) / (v11 - v10));
                const leftY = y0 + cellH * ((threshold - v00) / (v01 - v00));
                ctx.moveTo(x1, rightY);
                ctx.lineTo(x0, leftY);
                break;
              }
              case 4: {
                const topX = x0 + cellW * ((threshold - v00) / (v10 - v00));
                const rightY = y0 + cellH * ((threshold - v10) / (v11 - v10));
                ctx.moveTo(topX, y0);
                ctx.lineTo(x1, rightY);
                break;
              }
              case 5: {
                const topX = x0 + cellW * ((threshold - v00) / (v10 - v00));
                const leftY = y0 + cellH * ((threshold - v00) / (v01 - v00));
                const rightY = y0 + cellH * ((threshold - v10) / (v11 - v10));
                const bottomX = x0 + cellW * ((threshold - v01) / (v11 - v01));
                ctx.moveTo(topX, y0);
                ctx.lineTo(x0, leftY);
                ctx.moveTo(x1, rightY);
                ctx.lineTo(bottomX, y1);
                break;
              }
              case 6: {
                const topX = x0 + cellW * ((threshold - v00) / (v10 - v00));
                const bottomX = x0 + cellW * ((threshold - v01) / (v11 - v01));
                ctx.moveTo(topX, y0);
                ctx.lineTo(bottomX, y1);
                break;
              }
              case 7: {
                const topX = x0 + cellW * ((threshold - v00) / (v10 - v00));
                const leftY = y0 + cellH * ((threshold - v00) / (v01 - v00));
                ctx.moveTo(topX, y0);
                ctx.lineTo(x0, leftY);
                break;
              }
              case 8: {
                const leftY = y0 + cellH * ((threshold - v00) / (v01 - v00));
                const topX = x0 + cellW * ((threshold - v00) / (v10 - v00));
                ctx.moveTo(x0, leftY);
                ctx.lineTo(topX, y0);
                break;
              }
              case 9: {
                const bottomX = x0 + cellW * ((threshold - v01) / (v11 - v01));
                const topX = x0 + cellW * ((threshold - v00) / (v10 - v00));
                ctx.moveTo(bottomX, y1);
                ctx.lineTo(topX, y0);
                break;
              }
              case 10: {
                const leftY = y0 + cellH * ((threshold - v00) / (v01 - v00));
                const bottomX = x0 + cellW * ((threshold - v01) / (v11 - v01));
                const topX = x0 + cellW * ((threshold - v00) / (v10 - v00));
                const rightY = y0 + cellH * ((threshold - v10) / (v11 - v10));
                ctx.moveTo(x0, leftY);
                ctx.lineTo(bottomX, y1);
                ctx.moveTo(topX, y0);
                ctx.lineTo(x1, rightY);
                break;
              }
              case 11: {
                const rightY = y0 + cellH * ((threshold - v10) / (v11 - v10));
                const topX = x0 + cellW * ((threshold - v00) / (v10 - v00));
                ctx.moveTo(x1, rightY);
                ctx.lineTo(topX, y0);
                break;
              }
              case 12: {
                const leftY = y0 + cellH * ((threshold - v00) / (v01 - v00));
                const rightY = y0 + cellH * ((threshold - v10) / (v11 - v10));
                ctx.moveTo(x0, leftY);
                ctx.lineTo(x1, rightY);
                break;
              }
              case 13: {
                const bottomX = x0 + cellW * ((threshold - v01) / (v11 - v01));
                const rightY = y0 + cellH * ((threshold - v10) / (v11 - v10));
                ctx.moveTo(bottomX, y1);
                ctx.lineTo(x1, rightY);
                break;
              }
              case 14: {
                const leftY = y0 + cellH * ((threshold - v00) / (v01 - v00));
                const bottomX = x0 + cellW * ((threshold - v01) / (v11 - v01));
                ctx.moveTo(x0, leftY);
                ctx.lineTo(bottomX, y1);
                break;
              }
            }
          }
        }
      }

      ctx.stroke();
    };

    const startAnimation = () => {
      if (isRunning || !animated) return;
      isRunning = true;
      lastTime = 0;
      animFrameId = requestAnimationFrame(animate);
    };

    const stopAnimation = () => {
      if (!isRunning) return;
      isRunning = false;
      cancelAnimationFrame(animFrameId);
      lastTime = 0;
    };

    const animate = (now: number) => {
      if (!isVisible || !isIntersecting) {
        isRunning = false;
        lastTime = 0;
        return;
      }

      if (lastTime === 0) lastTime = now;
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      time += delta * 2.6;
      drawContours(time);

      animFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      updateDimensions();
      drawContours(time);
    };

    updateDimensions();
    drawContours(time);

    if (animated) {
      startAnimation();
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isVisible = false;
        stopAnimation();
      } else {
        isVisible = true;
        if (isIntersecting && animated) {
          startAnimation();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("resize", handleResize, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(canvas);
    }

    let intersectionObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      intersectionObserver = new IntersectionObserver((entries) => {
        const entry = entries[0];
        isIntersecting = entry ? entry.isIntersecting : true;
        if (isIntersecting && isVisible && animated) {
          startAnimation();
        } else if (!isIntersecting) {
          stopAnimation();
        }
      });
      intersectionObserver.observe(canvas);
    }

    return () => {
      stopAnimation();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", handleResize);
      if (resizeObserver) resizeObserver.disconnect();
      if (intersectionObserver) intersectionObserver.disconnect();
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