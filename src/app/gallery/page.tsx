'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import LineBackground from '@/components/LineBackground';
import ScrollGrid from '@/components/common/ScrollGrid';
import HorizontalGallery from '@/app/gallery/HorizontalGallery';
import ZoomGallery from '@/app/gallery/ZoomGallery';
const Gallery3D = dynamic(() => import('@/components/common/Gallery3D'), { ssr: false });

export default function Gallery() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Start muted to ensure autoplay is allowed by the browser
    video.muted = true;
    video.loop = false;
    video.load();
    video.play().catch((err) => {
      console.log("Autoplay blocked or failed:", err);
    });

    // Unmute upon first user interaction
    const unmute = () => {
      video.muted = false;
      video.play().catch(() => {});
      cleanup();
    };

    const cleanup = () => {
      document.removeEventListener("click", unmute);
      document.removeEventListener("touchstart", unmute);
      document.removeEventListener("keydown", unmute);
    };

    document.addEventListener("click", unmute);
    document.addEventListener("touchstart", unmute);
    document.addEventListener("keydown", unmute);

    return () => {
      cleanup();
    };
  }, []);

  return (
    <>
      <div className="relative min-h-screen bg-transparent w-full">

        <div className="fixed inset-0 -z-10 pointer-events-none">
          <LineBackground
            lineColor="rgba(180, 140, 60, 0.75)"
            backgroundColor="#0d0d0d"
            lineCount={14}
            animated={true}
          />
        </div>

        <div className="relative z-10 w-full">
          {/* responsive hero height */}
          <div className="relative w-full h-[100dvh] sm:h-[85vh] md:h-screen">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              loop={false}
              controls={false}
              className="w-full h-full object-cover"
              style={{
                filter: "grayscale(100%) brightness(0.6) blur(1px)",
                transform: "scale(1.02)",
              }}
            >
              <source src="/images/gallery/IMG_2175.webm" type="video/webm" />
              <source src="/images/gallery/IMG_2175.MOV" type="video/quicktime" />
            </video>

            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none px-4"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
            >
              <h1
                className="text-[48px] sm:text-[70px] md:text-[120px] lg:text-[150px] leading-[1] uppercase text-center"
                style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontWeight: 700,
                  fontStyle: 'italic',
                  letterSpacing: '0.05em',
                  textShadow: '0 4px 60px rgba(0,0,0,0.6)',
                  background: "linear-gradient(to right, #ffffff, #f9ba1f)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Gallery
              </h1>

            </div>
          </div>

          <HorizontalGallery />
          <ScrollGrid />

          {/*<div className="hidden md:block">
            <ZoomGallery />
          </div>*/}
        </div>
      </div>

    <section
      className="relative z-50 block md:hidden overflow-hidden bg-transparent"
      style={{ width: '100%', height: 'auto', minHeight: '0' }}
    >
      <Gallery3D title="IEEE CS" />
    </section>

  </>
  );
}