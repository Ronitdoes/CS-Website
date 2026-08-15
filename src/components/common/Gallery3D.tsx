"use client";
import { useEffect, useRef, useCallback } from 'react';
import styles from './Gallery3D.module.css';


interface SlotConfig {
  destX: number;
  destY: number;
  img: string;
  t0: number;
  spd: number;
}

interface CardState {
  el: HTMLDivElement;
  slot: SlotConfig;
  t: number;
}

export interface Gallery3DProps {

  title?: string;

  images?: [string, string, string, string, string];
  cardWidth?: number;
  cardAspect?: number;
  overflowFraction?: number;
  className?: string;
}


export const GALLERY_3D_DEFAULT_IMAGES: [string, string, string, string, string] = [
  'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=760&q=85',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=760&q=85',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=760&q=85',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=760&q=85',
  'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=760&q=85',
];

const DEFAULT_IMAGES = GALLERY_3D_DEFAULT_IMAGES;

function easeIn(t: number): number {
  return t * t * t;
}

const SCALE_FAR = 0.04;


export default function Gallery3D({
  title = 'GALLERY 3D',
  images = DEFAULT_IMAGES,
  cardWidth,
  cardAspect = 0.7,
  overflowFraction = 0.6,
  className,
}: Gallery3DProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const buildSlots = useCallback(
    (cw: number, ch: number, bw: number, bh: number): SlotConfig[] => {
      const cx = cw / 2;
      const cy = ch / 2;
      const ox = bw * overflowFraction;
      const oy = bh * overflowFraction;

      return [
        // top-left
        { destX: -ox, destY: -oy, img: images[0], t0: 0.00, spd: 0.00018 },
        // top-right
        { destX: cw + ox, destY: -oy, img: images[1], t0: 0.35, spd: 0.00022 },
        // center (flies straight at viewer)
        { destX: cx, destY: cy, img: images[2], t0: 0.65, spd: 0.00016 },
        // bottom-left
        { destX: -ox, destY: ch + oy, img: images[3], t0: 0.20, spd: 0.00020 },
        // bottom-right
        { destX: cw + ox, destY: ch + oy, img: images[4], t0: 0.50, spd: 0.00019 },
      ];
    },
    [images, overflowFraction],
  );

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    let rafId: number;
    let cardStates: CardState[] = [];

    const initScene = () => {
      // Clean up previous elements
      for (const c of cardStates) c.el.remove();
      cancelAnimationFrame(rafId);

      const { width: rawW, height: rawH } = scene.getBoundingClientRect();
      const cw = rawW || window.innerWidth;
      const ch = rawH || window.innerHeight;
      const cx = cw / 2;
      const cy = ch / 2;

      const bw = cardWidth ?? Math.max(Math.round(Math.min(cw * 0.32, 380)), 150);
      const bh = Math.max(Math.round(bw * cardAspect), 150);

      const slots = buildSlots(cw, ch, bw, bh);

      cardStates = slots.map(slot => {
        const el = document.createElement('div');
        el.className = styles.card;
        el.style.width = `${bw}px`;
        el.style.height = `${bh}px`;
        el.style.willChange = 'transform, opacity';
        el.style.contain = 'layout style paint';

        const inner = document.createElement('div');
        inner.className = styles.cardInner;

        const img = document.createElement('img');
        img.src = slot.img;
        img.draggable = false;
        img.loading = 'eager';
        img.decoding = 'async';
        img.alt = '';

        inner.appendChild(img);
        el.appendChild(inner);
        scene.appendChild(el);

        return { el, slot, t: slot.t0 };
      });

      let last: number | null = null;

      function tick(now: number) {
        if (!last) last = now;
        const dt = Math.min(now - last, 50);
        last = now;

        for (const c of cardStates) {
          c.t += c.slot.spd * dt;
          if (c.t > 1) c.t -= 1;

          const et = easeIn(c.t);

          const px = cx + (c.slot.destX - cx) * et;
          const py = cy + (c.slot.destY - cy) * et;

          const scale = SCALE_FAR + (1 - SCALE_FAR) * et;

          let opacity: number;
          if (c.t < 0.05) opacity = c.t / 0.05;
          else if (c.t > 0.85) opacity = 1 - (c.t - 0.85) / 0.15;
          else opacity = 1;

          const left = px - bw / 2;
          const top = py - bh / 2;

          c.el.style.transform = `translate3d(${left}px, ${top}px, 0) scale(${scale})`;
          c.el.style.opacity = String(Math.max(0, opacity));
          c.el.style.zIndex = String(Math.floor(scale * 100)); // Ensure larger items are in front
        }

        rafId = requestAnimationFrame(tick);
      }

      rafId = requestAnimationFrame(tick);
      rafRef.current = rafId;
    };

    initScene();

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initScene, 150);
    };

    window.addEventListener('resize', handleResize);

    function onMouseMove(e: MouseEvent) {
      const cur = cursorRef.current;
      if (!cur || !scene) return;
      const rect = scene.getBoundingClientRect();
      cur.style.left = `${e.clientX - rect.left}px`;
      cur.style.top = `${e.clientY - rect.top}px`;
    }

    scene.addEventListener('mousemove', onMouseMove);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      scene.removeEventListener('mousemove', onMouseMove);
      for (const c of cardStates) c.el.remove();
    };
  }, [buildSlots, cardAspect, cardWidth]);

  return (
    <div
      ref={sceneRef}
      className={`${styles.scene}${className ? ` ${className}` : ''}`}
    >
      <div ref={cursorRef} className={styles.cursor} />
      <div className={styles.grain} />
      <span className={styles.title}>{title}</span>
    </div>
  );
}