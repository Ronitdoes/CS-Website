'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion } from 'framer-motion';
import BoxReveal from '@/components/common/BoxReveal';

export const HORIZONTAL_GALLERY_IMAGES = [
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782560566447_akr6jp.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782560022208_0qc8i9.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782561501835_is8g49.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782565661341_zbz8t.webp",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782560271203_88tlqb.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782571214276_nw4rqm.webp",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782560416402_819ju.jpeg",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782559824603_l6h16c.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782571207688_kxib06.webp",
];

const textContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.15,
    },
  },
};

export default function HorizontalGallery() {
  const scroller = useRef<HTMLDivElement | null>(null);
  const wrapper = useRef<HTMLDivElement | null>(null);

  useGSAP(() => {
    if (!scroller.current || !wrapper.current) return;

    const mm = gsap.matchMedia();

    // Desktop: Seamless Synchronized Horizontal Pinned Scroll
    mm.add("(min-width: 768px)", () => {
      const getScrollDistance = () => {
        if (!scroller.current) return 0;
        return scroller.current.scrollWidth - window.innerWidth;
      };

      // 1. Unified Master Pin + Horizontal Translation Timeline
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: scroller.current,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          start: "top top",
          end: () => `+=${getScrollDistance()}`,
          id: "gallery-master",
        },
      });

      masterTl.to(scroller.current, {
        x: () => -getScrollDistance(),
        ease: "none",
      });

      // 2. Section 1 Items Fade & Slide-in (triggers on approach)
      const section1Items = gsap.utils.toArray<HTMLElement>(
        '.skill-set:nth-child(1) > .gallery-item-card',
        wrapper.current
      );
      gsap.set(section1Items, { y: 120, x: 60, opacity: 0 });

      ScrollTrigger.create({
        trigger: scroller.current,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(section1Items, {
            y: 0,
            x: 0,
            opacity: 1,
            ease: 'power2.out',
            stagger: 0.12,
            duration: 0.9,
          });
        },
        id: "gallery-fade-in-1",
      });

      // 3. Section 2 Items Scrub Transition (synchronized with pin start)
      const section2Items = gsap.utils.toArray<HTMLElement>(
        '.skill-set:nth-child(2) > .gallery-item-card',
        wrapper.current
      );
      gsap.set(section2Items, { y: 120, x: 60, opacity: 0 });

      ScrollTrigger.create({
        trigger: scroller.current,
        scrub: 0.8,
        start: 'top top',
        end: () => `+=${getScrollDistance()}`,
        animation: gsap.to(section2Items, {
          y: 0,
          x: 0,
          opacity: 1,
          ease: 'power2.out',
          stagger: 0.05,
        }),
        id: "gallery-scrub-2",
      });
    });

    // Mobile: Batched Single-Pass Entrance Triggers for ultra-smooth 60fps scrolling
    mm.add("(max-width: 767px)", () => {
      const mobileItems = gsap.utils.toArray<HTMLElement>(
        '.gallery-item-card:not(.no-gsap)',
        wrapper.current
      );

      gsap.set(mobileItems, { y: 28, opacity: 0 });

      ScrollTrigger.batch(mobileItems, {
        start: "top 92%",
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, {
            y: 0,
            opacity: 1,
            duration: 0.65,
            stagger: 0.08,
            ease: "power2.out",
            clearProps: "transform,opacity",
          });
        },
      });
    });

    return () => {
      mm.revert();
    };
  }, { scope: wrapper });

  return (
    <div
      ref={wrapper}
      className="overflow-hidden transition-colors duration-500"
    >
      <style>{`
        @media (max-width: 767px) {
          .skill-set {
            display: contents !important;
          }
          .gallery-scroller-canvas {
            display: flex !important;
            flex-direction: column !important;
            gap: 5.5rem !important;
            padding: 4rem 1.5rem !important;
            height: auto !important;
          }
          .gallery-badge-wrapper {
            position: absolute !important;
            bottom: calc(100% + 0.35rem) !important;
            left: 0 !important;
            width: auto !important;
            max-width: 100% !important;
            margin-bottom: 0 !important;
            display: flex !important;
            z-index: 30 !important;
          }
        }
      `}</style>
      <div
        ref={scroller}
        className="gallery-scroller-canvas flex flex-col md:flex-row md:w-[200vw] w-full min-h-screen text-white relative bg-transparent will-change-transform"
      >

        {/* SECTION 1 */}
        <section className="skill-set relative w-full md:w-screen h-auto md:h-full px-6 md:px-12 pt-[clamp(2rem,5vh,4rem)] md:pt-[clamp(3.5rem,10vw,6rem)] pb-0 md:py-0 flex flex-col md:block gap-32 md:gap-20">
          
          {/* Item 1 */}
          <div className="gallery-item-card gallery-item-1 relative md:absolute md:right-[600px] md:top-[150px] w-[65%] md:w-[25vw] h-[38vh] md:h-[35vh] mx-auto md:ml-auto md:mr-0 mt-0 md:mt-0 max-md:order-1">
            <div className="gallery-badge-wrapper">
              <BoxReveal
                align="justify-start md:justify-end"
                className="md:translate-y-[-25px] md:absolute right-0 md:right-auto mb-2"
                widthClass="w-fit"
                marginClass="my-0"
                paddingClass="p-0"
                boxColor="#f9ba1f"
                duration={2.5}
                standalone={true}
              >
                <p className="text-[#f9ba1f] text-[13px] md:text-[10px]">WE ARE IEEE</p>
              </BoxReveal>
            </div>
            <div className="relative w-full h-full overflow-hidden rounded-sm bg-[#141414]">
              <Image
                src={HORIZONTAL_GALLERY_IMAGES[0]}
                alt="WE ARE IEEE"
                fill
                priority
                className="z-0 object-cover select-none"
                sizes="(max-width: 768px) 90vw, 40vw"
              />
            </div>
          </div>

          {/* Item 2 */}
          <div className="gallery-item-card gallery-item-2 relative md:absolute md:right-[600px] md:bottom-[120px] w-[65%] md:w-[15vw] h-[34vh] md:h-[20vh] mr-auto ml-0 my-0 max-md:order-9">
            <div className="gallery-badge-wrapper">
              <BoxReveal
                align="justify-start"
                className="md:translate-y-[-25px] md:absolute mb-2"
                widthClass="w-fit"
                marginClass="my-0"
                paddingClass="p-0"
                boxColor="#f9ba1f"
                duration={2.5}
                standalone={true}
              >
                <p className="text-[#f9ba1f] text-[13px] md:text-[10px]">VENOM, 2026</p>
              </BoxReveal>
            </div>
            <div className="relative w-full h-full overflow-hidden rounded-sm bg-[#141414]">
              <Image
                src={HORIZONTAL_GALLERY_IMAGES[1]}
                alt="VENOM, 2026"
                fill
                decoding="async"
                className="object-cover select-none"
                sizes="(max-width: 768px) 90vw, 40vw"
              />
            </div>
          </div>

          {/* Item 3 */}
          <div className="gallery-item-card gallery-item-3 relative md:absolute md:right-[0px] md:bottom-[120px] w-[78%] md:w-[28vw] h-[42vh] md:h-[45vh] mr-auto ml-0 my-0 md:ml-auto md:mr-0 max-md:order-3">
            <div className="gallery-badge-wrapper">
              <BoxReveal
                align="justify-start"
                className="md:translate-y-[-25px] md:absolute mb-2"
                widthClass="w-fit"
                marginClass="my-0"
                paddingClass="p-0"
                boxColor="#f9ba1f"
                duration={2.5}
                standalone={true}
              >
                <p className="text-[#f9ba1f] text-[13px] md:text-[10px]">HACKERZ STREET 4.0, 2026</p>
              </BoxReveal>
            </div>
            <div className="relative w-full h-full overflow-hidden rounded-sm bg-[#141414]">
              <Image
                src={HORIZONTAL_GALLERY_IMAGES[2]}
                alt="HACKERZ STREET 4.0, 2026"
                fill
                decoding="async"
                className="object-cover select-none"
                sizes="(max-width: 768px) 90vw, 50vw"
              />
            </div>
          </div>

          {/* Text 1 */}
          <div className="gallery-item-text-1 relative md:absolute md:right-[0px] md:top-[120px] w-[90%] md:w-[28vw] pb-4 -translate-y-16 md:translate-y-0 md:mt-0 md:pb-0 md:py-0 text-center md:text-right no-gsap flex flex-col items-center md:items-end mx-auto my-4 md:my-0 max-md:order-4">
            <motion.div
              variants={textContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-10% 0px" }}
              className="w-full flex flex-col items-center md:items-end"
            >
              <BoxReveal align="justify-center md:justify-end" boxColor="#f9ba1f" duration={2.5} widthClass="w-fit">
                <p className="text-[#f9ba1f] text-[18px] md:text-[20px]">It doesn&apos;t matter where</p>
              </BoxReveal>
              <BoxReveal align="justify-center md:justify-end" boxColor="#f9ba1f" duration={2.5} widthClass="w-fit">
                <p className="text-[#f9ba1f] text-[18px] md:text-[20px]">you start, it&apos;s how you</p>
              </BoxReveal>
              <BoxReveal align="justify-center md:justify-end" boxColor="#f9ba1f" duration={2.5} widthClass="w-fit">
                <p className="text-[#f9ba1f] text-[18px] md:text-[20px]">progress from there.</p>
              </BoxReveal>
            </motion.div>
          </div>
        </section>

        {/* SECTION 2 */}
        <section className="skill-set relative w-full md:w-screen h-auto md:h-full flex flex-col md:items-center md:justify-center px-6 md:px-12 pt-0 pb-[clamp(2rem,5vh,4rem)] md:py-0 gap-32 md:gap-20">
          
          {/* Item 4 */}
          <div className="gallery-item-card gallery-item-4 relative md:absolute md:left-[100px] md:top-[150px] w-[60%] md:w-[18vw] h-[34vh] md:h-[18vh] mr-auto ml-0 my-0 max-md:order-6">
            <div className="gallery-badge-wrapper">
              <BoxReveal
                align="justify-start"
                className="md:translate-y-[-25px] md:absolute mb-2"
                widthClass="w-fit"
                marginClass="my-0"
                paddingClass="p-0"
                boxColor="#f9ba1f"
                duration={2.5}
                standalone={true}
              >
                <p className="text-[#f9ba1f] text-[13px] md:text-[10px]">HACKERZ STREET 4.0, 2026</p>
              </BoxReveal>
            </div>
            <div className="relative w-full h-full overflow-hidden rounded-sm bg-[#141414]">
              <Image
                src={HORIZONTAL_GALLERY_IMAGES[3]}
                alt="HACKERZ STREET 4.0, 2026"
                fill
                decoding="async"
                className="object-cover select-none"
                sizes="(max-width: 768px) 90vw, 40vw"
              />
            </div>
          </div>

          {/* Item 5 */}
          <div className="gallery-item-card gallery-item-5 relative md:absolute md:left-[180px] md:bottom-[180px] w-[65%] md:w-[27vw] h-[38vh] md:h-[27vh] ml-auto mr-0 my-0 max-md:order-5">
            <div className="gallery-badge-wrapper">
              <BoxReveal
                align="justify-end"
                className="md:translate-y-[-25px] md:absolute right-0 md:right-auto mb-2"
                widthClass="w-fit"
                marginClass="my-0"
                paddingClass="p-0"
                boxColor="#f9ba1f"
                duration={2.5}
                standalone={true}
              >
                <p className="text-[#f9ba1f] text-[13px] md:text-[10px]">Social Outreach, 2025</p>
              </BoxReveal>
            </div>
            <div className="relative w-full h-full overflow-hidden rounded-sm bg-[#141414]">
              <Image
                src={HORIZONTAL_GALLERY_IMAGES[4]}
                alt="Social Outreach, 2025"
                fill
                decoding="async"
                className="object-cover select-none"
                sizes="(max-width: 768px) 90vw, 40vw"
              />
            </div>
          </div>

          {/* Item 6 */}
          <div className="gallery-item-card gallery-item-6 relative md:absolute md:left-[670px] md:bottom-[80px] w-[70%] md:w-[25vw] h-[36vh] md:h-auto md:aspect-[16/9] mx-auto md:mr-auto md:ml-0 my-0 max-md:order-7">
            <div className="gallery-badge-wrapper">
              <BoxReveal
                align="justify-start"
                className="-translate-y-6 md:translate-y-[-25px] md:absolute mb-2 z-20"
                widthClass="w-fit"
                marginClass="my-0"
                paddingClass="p-0"
                boxColor="#f9ba1f"
                duration={2.5}
                standalone={true}
              >
                <p className="text-[#f9ba1f] text-[13px] md:text-[10px]">GENESIS 5.0, 2025</p>
              </BoxReveal>
            </div>
            <div className="relative w-full h-full overflow-hidden rounded-sm bg-[#141414]">
              <Image
                src={HORIZONTAL_GALLERY_IMAGES[5]}
                alt="GENESIS 5.0, 2025"
                fill
                decoding="async"
                className="z-0 object-cover select-none"
                sizes="(max-width: 768px) 90vw, 40vw"
              />
            </div>
          </div>

          {/* Item 7 */}
          <div className="gallery-item-card gallery-item-7 relative md:absolute md:right-[720px] md:top-[180px] w-[60%] md:w-[20vw] h-[34vh] md:h-[20vh] ml-auto mr-0 my-0 max-md:order-2">
            <div className="gallery-badge-wrapper">
              <BoxReveal
                align="justify-end"
                className="md:translate-y-[-25px] md:absolute right-0 md:right-auto mb-2"
                widthClass="w-fit"
                marginClass="my-0"
                paddingClass="p-0"
                boxColor="#f9ba1f"
                duration={2.5}
                standalone={true}
              >
                <p className="text-[#f9ba1f] text-[13px] md:text-[10px]">Night Perm</p>
              </BoxReveal>
            </div>
            <div className="relative w-full h-full overflow-hidden rounded-sm bg-[#141414]">
              <Image
                src={HORIZONTAL_GALLERY_IMAGES[6]}
                alt="Night Perm"
                fill
                decoding="async"
                className="object-cover select-none"
                sizes="(max-width: 768px) 90vw, 40vw"
              />
            </div>
          </div>

          {/* Item 8 */}
          <div className="gallery-item-card gallery-item-8 relative md:absolute md:right-[200px] md:top-[150px] w-[75%] md:w-[30vw] h-[40vh] md:h-auto md:aspect-[16/9] ml-auto mr-0 my-0 md:mr-auto md:ml-0 max-md:order-8">
            <div className="gallery-badge-wrapper">
              <BoxReveal
                align="justify-end"
                className="md:translate-y-[-25px] md:absolute right-0 md:right-auto mb-2"
                widthClass="w-fit"
                marginClass="my-0"
                paddingClass="p-0"
                boxColor="#f9ba1f"
                duration={2.5}
                standalone={true}
              >
                <p className="text-[#f9ba1f] text-[13px] md:text-[10px]">IEEE CS, 2025</p>
              </BoxReveal>
            </div>
            <div className="relative w-full h-full overflow-hidden rounded-sm bg-[#141414]">
              <Image
                src={HORIZONTAL_GALLERY_IMAGES[7]}
                alt="IEEE CS, 2025"
                fill
                decoding="async"
                className="object-cover select-none"
                sizes="(max-width: 768px) 90vw, 40vw"
              />
            </div>
          </div>

          {/* Item 9 */}
          <div className="gallery-item-card gallery-item-9 relative md:absolute md:right-[40px] md:bottom-[130px] w-[70%] md:w-[14vw] h-[36vh] md:h-[25vh] mx-auto md:mx-0 max-md:order-11">
            <div className="gallery-badge-wrapper">
              <BoxReveal
                align="justify-start"
                className="md:translate-y-[-25px] md:absolute mb-2"
                widthClass="w-fit"
                marginClass="my-0"
                paddingClass="p-0"
                boxColor="#f9ba1f"
                duration={2.5}
                standalone={true}
              >
                <p className="text-[#f9ba1f] text-[13px] md:text-[10px]">IEEE CCs SUMMIT, 2025</p>
              </BoxReveal>
            </div>
            <div className="relative w-full h-full overflow-hidden rounded-sm bg-[#141414]">
              <Image
                src={HORIZONTAL_GALLERY_IMAGES[8]}
                alt="IEEE CCs SUMMIT, 2025"
                fill
                decoding="async"
                className="object-cover select-none"
                sizes="(max-width: 768px) 90vw, 40vw"
              />
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}