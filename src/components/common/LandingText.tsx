import React from 'react';
import { motion } from 'framer-motion';
import BoxReveal from './BoxReveal';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18, // slightly faster stagger (approx 14% of duration)
      delayChildren: 0.08,
    },
  },
};

function Word({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <span
      className={`whitespace-nowrap ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}

export default function ImpactText() {
  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .mobile-hero-section {
            padding-bottom: clamp(6rem, 18vh, 10rem) !important;
          }
        }
      `}</style>

      <section className="mobile-hero-section w-full pt-6 pb-[clamp(3.5rem,12vw,7rem)] sm:py-8 lg:py-10 flex justify-center items-center px-4 md:px-8 bg-transparent relative z-10 selection:bg-[#F4A119] selection:text-black">
        <div className="max-w-[85rem] mx-auto text-center flex flex-col items-center justify-center text-[#e4e4e1]">

          <motion.h2
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-25% 0px" }}
            className="text-[1.5rem] sm:text-[2.6rem] md:text-[3.6rem] lg:text-[4.8rem] xl:text-[5.8rem] leading-[1.0] sm:leading-[0.95] lg:leading-[0.9] tracking-tight uppercase font-bold flex flex-col items-center w-full"
            style={{ fontFamily: "var(--font-inter), 'Inter', sans-serif" }}
          >

            {/* Line 1 */}
            <BoxReveal duration={2.5} widthClass="w-fit" paddingClass="py-0 px-2 sm:py-0.5">
              <div className="flex flex-wrap justify-center items-center gap-x-2 sm:gap-x-4 lg:gap-x-6 w-fit">
                <Word className="text-[#F4A119] font-normal tracking-normal" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontVariant: 'small-caps' }}>
                  Redefining
                </Word>
                <Word>BOUNDARIES,</Word>
              </div>
            </BoxReveal>

            {/* Line 2 */}
            <BoxReveal duration={2.5} widthClass="w-fit" paddingClass="py-0 px-2 sm:py-0.5">
              <div className="flex flex-wrap justify-center items-center gap-x-2 sm:gap-x-4 lg:gap-x-6 w-fit">
                <Word>DRIVING</Word>
                <Word className="text-[#F4A119] font-normal tracking-normal" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontVariant: 'small-caps' }}>
                  Innovation
                </Word>
                <Word>FORWARD.</Word>
              </div>
            </BoxReveal>

            {/* Line 3 */}
            <BoxReveal duration={2.5} widthClass="w-fit" paddingClass="py-0 px-2 sm:py-0.5">
              <div className="flex flex-wrap justify-center items-center gap-x-2 sm:gap-x-4 lg:gap-x-6 w-fit">
                <Word>WORKING</Word>
                <Word>TO</Word>
                <Word className="text-[#F4A119] font-normal tracking-normal" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontVariant: 'small-caps' }}>
                  Unite
                </Word>
              </div>
            </BoxReveal>

            {/* Line 4 */}
            <BoxReveal duration={2.5} widthClass="w-fit" paddingClass="py-0 px-2 sm:py-0.5">
              <div className="flex flex-wrap justify-center items-center gap-x-2 sm:gap-x-4 lg:gap-x-6 w-fit">
                <Word>PERSPECTIVES</Word>
                <Word>AND</Word>
                <Word className="text-[#F4A119] font-normal tracking-normal" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontVariant: 'small-caps' }}>
                  Strengths.
                </Word>
              </div>
            </BoxReveal>

            {/* Line 5 */}
            <BoxReveal duration={2.5} widthClass="w-fit" paddingClass="py-0 px-2 sm:py-0.5">
              <div className="flex flex-wrap justify-center items-center gap-x-2 sm:gap-x-4 lg:gap-x-6 w-fit">
                <Word>SHAPING</Word>
                <Word>A</Word>
                <Word>LEGACY</Word>
              </div>
            </BoxReveal>

            {/* Line 6 */}
            <BoxReveal duration={2.5} widthClass="w-fit" paddingClass="py-0 px-2 sm:py-0.5">
              <div className="flex flex-wrap justify-center items-center gap-x-2 sm:gap-x-4 lg:gap-x-6 w-fit">
                <Word>IN</Word>
                <Word>TECHNOLOGY,</Word>
                <Word>FROM</Word>
              </div>
            </BoxReveal>

            {/* Line 7 */}
            <BoxReveal duration={2.5} widthClass="w-fit" paddingClass="py-0 px-2 sm:py-0.5">
              <div className="flex flex-wrap justify-center items-center gap-x-2 sm:gap-x-4 lg:gap-x-6 w-fit">
                <Word>TODAY</Word>
                <Word>TO</Word>
                <Word className="text-[#F4A119] font-normal tracking-normal" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontVariant: 'small-caps' }}>
                  Forever
                </Word>
                <Word>MORE.</Word>
              </div>
            </BoxReveal>

          </motion.h2>
        </div>
      </section>
    </>
  );
}