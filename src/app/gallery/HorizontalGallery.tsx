'use client';

import { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion } from 'framer-motion';
import BoxReveal from '@/components/common/BoxReveal';

const textContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.15,
    },
  },
};

gsap.registerPlugin(ScrollTrigger);

export default function HorizontalGallery() {
  const scroller = useRef<HTMLDivElement | null>(null);
  const wrapper = useRef<HTMLDivElement | null>(null);

  useGSAP(() => {
    if (!scroller.current || !wrapper.current) return;

    // Scoped query for sections to prevent transition conflicts
    const sections = gsap.utils.toArray<HTMLElement>('.skill-set', wrapper.current);
    if (sections.length === 0) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const getScrollDistance = () => {
        if (!scroller.current) return 0;
        return scroller.current.scrollWidth - window.innerWidth;
      };

      // 1. Pinned Horizontal Track ScrollTrigger (Handles locking full-screen at top top)
      const st = ScrollTrigger.create({
        trigger: scroller.current,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        start: "top top",
        end: () => '+=' + getScrollDistance(),
        id: "gallery-pin",
      });

      // 2. Horizontal Translation Animation ScrollTrigger (Starts sliding early at 50% scroll)
      ScrollTrigger.create({
        trigger: scroller.current,
        scrub: 1,
        invalidateOnRefresh: true,
        start: "top center", // Starts horizontal translation early when gallery reaches center
        end: () => '+=' + (getScrollDistance() + window.innerHeight / 2), // Total scroll distance from center to end of pin
        animation: gsap.to(scroller.current, {
          x: () => -getScrollDistance(),
          ease: 'none',
        }),
        id: "gallery-anim",
      });

      // 3. Section 1 Items Fade/Slide-in
      const section1Items = gsap.utils.toArray<HTMLElement>('.skill-set:nth-child(1) > div', wrapper.current);
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

      // 4. Section 2 Items Scrub Transition (Synced with anim start)
      const section2Items = gsap.utils.toArray<HTMLElement>('.skill-set:nth-child(2) > div', wrapper.current);
      gsap.set(section2Items, { y: 120, x: 60, opacity: 0 });

      ScrollTrigger.create({
        trigger: scroller.current,
        scrub: 0.8,
        start: 'top center', // Synced with animation start at center
        end: () => '+=' + (getScrollDistance() + window.innerHeight / 2),
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

    // Mobile specific animations: batch ScrollTriggers to minimize observer overhead
    mm.add("(max-width: 767px)", () => {
      ScrollTrigger.batch('.skill-set > div:not(.no-gsap)', {
        interval: 0.1,
        batchMax: 3,
        start: "top 95%",
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.7,
              stagger: 0.1,
              ease: "power2.out",
              overwrite: "auto",
            }
          );
        },
      });
    });

    // Safe delayed refresh to allow images/fonts/Next.js hydration layout to stabilize
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      clearTimeout(timer);
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
          .mobile-gallery-section {
            padding-top: clamp(2rem, 5vh, 4rem) !important;
            padding-bottom: 0 !important;
          }
          .mobile-gallery-end-section {
            padding-top: 0 !important;
            padding-bottom: clamp(2rem, 5vh, 4rem) !important;
          }
          
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
          
          .gallery-scroller-canvas img {
            object-fit: cover !important;
            object-position: center !important;
          }

          .gallery-item-1 > *:first-child,
          .gallery-item-2 > *:first-child,
          .gallery-item-3 > *:first-child,
          .gallery-item-4 > *:first-child,
          .gallery-item-5 > *:first-child,
          .gallery-item-6 > *:first-child,
          .gallery-item-7 > *:first-child,
          .gallery-item-8 > *:first-child,
          .gallery-item-9 > *:first-child {
            position: absolute !important;
            bottom: 100% !important;
            left: 0 !important;
            width: 100% !important;
            margin-bottom: 0.4rem !important;
            display: flex !important;
            z-index: 30 !important;
          }
          
          .gallery-item-1 {
            order: 1 !important;
            width: 65% !important;
            height: 38vh !important;
            margin-left: auto !important;
            margin-right: auto !important;
            margin-top: 0 !important;
            margin-bottom: 0 !important;
          }
          .gallery-item-7 {
            order: 2 !important;
            width: 60% !important;
            height: 34vh !important;
            margin-left: auto !important;
            margin-right: 0 !important;
            margin-top: 0 !important;
            margin-bottom: 0 !important;
          }
          .gallery-item-3 {
            order: 3 !important;
            width: 78% !important;
            height: 42vh !important;
            margin-left: 0 !important;
            margin-right: auto !important;
            margin-top: 0 !important;
            margin-bottom: 0 !important;
          }
          .gallery-item-text-1 {
            order: 4 !important;
            width: 90% !important;
            margin-left: auto !important;
            margin-right: auto !important;
            margin-top: 1rem !important;
            margin-bottom: 1rem !important;
            text-align: center !important;
            transform: none !important;
          }
          .gallery-item-5 {
            order: 5 !important;
            width: 65% !important;
            height: 38vh !important;
            margin-left: auto !important;
            margin-right: 0 !important;
            margin-top: 0 !important;
            margin-bottom: 0 !important;
          }
          .gallery-item-4 {
            order: 6 !important;
            width: 60% !important;
            height: 34vh !important;
            margin-left: 0 !important;
            margin-right: auto !important;
            margin-top: 0 !important;
            margin-bottom: 0 !important;
          }
          .gallery-item-6 {
            order: 7 !important;
            width: 70% !important;
            height: 36vh !important;
            margin-left: auto !important;
            margin-right: auto !important;
            margin-top: 0 !important;
            margin-bottom: 0 !important;
          }
          .gallery-item-8 {
            order: 8 !important;
            width: 75% !important;
            height: 40vh !important;
            margin-left: auto !important;
            margin-right: 0 !important;
            margin-top: 0 !important;
            margin-bottom: 0 !important;
          }
          .gallery-item-2 {
            order: 9 !important;
            width: 65% !important;
            height: 34vh !important;
            margin-left: 0 !important;
            margin-right: auto !important;
            margin-top: 0 !important;
            margin-bottom: 0 !important;
          }
          .gallery-item-9 {
            order: 11 !important;
            width: 70% !important;
            height: 36vh !important;
            margin-left: auto !important;
            margin-right: auto !important;
            margin-top: 0 !important;
            margin-bottom: 0 !important;
          }
          .gallery-item-text-2 {
            order: 10 !important;
            width: 90% !important;
            margin-left: auto !important;
            margin-right: auto !important;
            margin-top: 1rem !important;
            margin-bottom: 1rem !important;
            text-align: center !important;
            transform: none !important;
          }
        }
      `}</style>
      <div
        ref={scroller}
        className="gallery-scroller-canvas flex flex-col md:flex-row md:w-[200vw] w-full min-h-screen text-white relative bg-transparent"
      >


        {/* SECTION 1 */}
        <section className="skill-set mobile-gallery-section relative w-full md:w-screen h-auto md:h-full px-6 md:px-12 pt-[clamp(3.5rem,10vw,6rem)] pb-20 md:py-0 flex flex-col md:block gap-32 md:gap-20">
          <div className="gallery-item-1 relative md:absolute md:right-[600px] md:top-[150px] w-[80%] md:w-[25vw] h-[40vh] md:h-[35vh] ml-auto mt-8 md:mt-0">
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
            <Image
              src="https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782560566447_akr6jp.avif"
              alt="Image 1"
              fill
              className="z-0 translate-y-6 md:translate-y-0 object-cover"
              sizes="(max-width: 768px) 100vw, 70vw"
            />
          </div>

          <div className="gallery-item-2 relative md:absolute md:right-[600px] md:bottom-[120px] w-[65%] md:w-[15vw] h-[35vh] md:h-[20vh] mr-auto">
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
            <Image
              src="https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782560022208_0qc8i9.avif"
              alt="Image 2"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 70vw"
            />
          </div>

          <div className="gallery-item-3 relative md:absolute md:right-[0px] md:bottom-[120px] w-[75%] md:w-[28vw] h-[45vh] md:h-[45vh] ml-auto">
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
            <Image
              src="https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782561501835_is8g49.avif"
              alt="Image 3"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <div className="gallery-item-text-1 relative md:absolute md:right-[0px] md:top-[120px] w-full md:w-[28vw] pb-4 -translate-y-16 md:translate-y-0 md:mt-0 md:pb-0 md:py-0 text-center md:text-right no-gsap flex flex-col items-center md:items-end">
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
        <section className="skill-set mobile-gallery-end-section relative w-full md:w-screen h-auto md:h-full flex flex-col md:items-center md:justify-center px-6 md:px-12 py-20 md:py-0 gap-32 md:gap-20">
          <div className="gallery-item-4 relative md:absolute md:left-[100px] md:top-[150px] w-[60%] md:w-[18vw] h-[35vh] md:h-[18vh] mr-auto">
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
            <Image
              src="https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782565661341_zbz8t.webp"
              alt="Image 4"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 70vw"
            />
          </div>

          <div className="gallery-item-5 relative md:absolute md:left-[180px] md:bottom-[180px] w-[80%] md:w-[27vw] h-[45vh] md:h-[27vh] ml-auto">
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
            <Image
              src="https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782560271203_88tlqb.avif"
              alt="Image 5"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 70vw"
            />
          </div>

          <div className="gallery-item-6 relative md:absolute md:left-[670px] md:bottom-[80px] w-[70%] md:w-[25vw] h-[40vh] md:h-auto md:aspect-[16/9] mr-auto">
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
            <Image
              src="https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782571214276_nw4rqm.webp"
              alt="Image 6"
              fill
              className="z-0 object-cover"
              sizes="(max-width: 768px) 100vw, 70vw"
            />
          </div>

          <div className="gallery-item-7 relative md:absolute md:right-[720px] md:top-[180px] w-[65%] md:w-[20vw] h-[35vh] md:h-[20vh] ml-auto">
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
            <Image
              src="https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782560416402_819ju.jpeg"
              alt="Image 7"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 70vw"
            />
          </div>

          <div className="gallery-item-8 relative md:absolute md:right-[200px] md:top-[150px] w-[85%] md:w-[30vw] h-[55vh] md:h-auto md:aspect-[16/9] mr-auto">
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
            <Image
              src="https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782559824603_l6h16c.avif"
              alt="Image 8"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 70vw"
            />
          </div>

          

          <div className="gallery-item-9 relative md:absolute md:right-[40px] md:bottom-[130px] w-full md:w-[14vw] h-[40vh] md:h-[25vh]">
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
            <Image
              src="https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782571207688_kxib06.webp"
              alt="Image 9"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 70vw"
            />
          </div>
        </section>

      </div>
    </div>
  );
}