'use client'

import React, { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import ECCard from '@/app/team/ECCard'
import type { TeamMember } from '@/data/teamData'

gsap.registerPlugin(ScrollTrigger)

const TEAR_POINTS = [
  [50.0, 0],
  [49.2, 3.8],
  [51.4, 7.1],
  [48.6, 11.3],
  [52.1, 15.0],
  [47.8, 19.2],
  [51.5, 23.0],
  [48.2, 27.4],
  [52.8, 31.1],
  [47.4, 35.5],
  [51.9, 39.2],
  [48.0, 43.8],
  [52.5, 47.5],
  [47.6, 52.0],
  [51.3, 56.3],
  [48.8, 60.0],
  [52.2, 64.5],
  [47.3, 68.8],
  [51.7, 72.5],
  [48.4, 77.0],
  [52.0, 81.3],
  [47.9, 85.5],
  [51.1, 90.0],
  [48.7, 94.3],
  [50.5, 97.8],
  [50.0, 100],
]

// Build clip-path polygon for left half
function buildLeftClip(): string {
  const pts = [
    '0% 0%',
    ...TEAR_POINTS.map(([x, y]) => `${x}% ${y}%`),
    '0% 100%',
  ]
  return `polygon(${pts.join(', ')})`
}

// Build clip-path polygon for right half  
function buildRightClip(): string {
  const pts = [
    '100% 0%',
    ...TEAR_POINTS.map(([x, y]) => `${x}% ${y}%`),
    '100% 100%',
  ]
  return `polygon(${pts.join(', ')})`
}

// Newspaper collage images — dark, B&W grid of event photos
const COLLAGE_PHOTOS = [
  'https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1781938613491_jcpn7n.svg',
  'https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1781938637933_qzvdsl.svg',
  'https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1781938619711_vjiu3q.svg',
  'https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782228521495_a530ik.avif',
  'https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1781938626698_lp3yqr.svg',
  'https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1781938964231_adrg5b.avif',
]

//to write something on images
const HEADLINES = [
  "",
  ""
]

export default function HeroSection({ ecMembers }: { ecMembers: TeamMember[] }) {
  const contentRef = useRef<HTMLDivElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const ourStoryWrapper = useRef<HTMLDivElement>(null)
  const mobileContentRef = useRef<HTMLDivElement>(null)
  const mobileHeroRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)


  // Pull HeroSection up to cover the sticky navbar
  useLayoutEffect(() => {
    const nav = document.querySelector('nav')
    if (nav && heroRef.current) {
      heroRef.current.style.marginTop = `-${nav.clientHeight}px`
    }
  }, [])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // ENTRANCE: subtle slide up without touching opacity so text is 100% visible on load
      gsap.fromTo(
        contentRef.current,
        { y: 50 },
        { y: 0, duration: 1, ease: 'power3.out', overwrite: 'auto' }
      )

      gsap.fromTo(
        mobileContentRef.current,
        { y: 40 },
        { y: 0, duration: 1, ease: 'power3.out', overwrite: 'auto' }
      )

      // Responsive GSAP matchMedia
      const mm = gsap.matchMedia()

      // DESKTOP scroll animation (align with Tailwind lg: min-width: 1024px)
      mm.add('(min-width: 1024px)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ourStoryWrapper.current,
            start: 'top top',
            end: '+=1400',
            scrub: 0.5,
            pin: true,
            anticipatePin: 1,
            fastScrollEnd: true,
            preventOverlaps: true,
          },
        })

        // Step 1: fade & blur the text completely
        tl.to(
          contentRef.current,
          {
            opacity: 0,
            filter: 'blur(12px)',
            scale: 0.9,
            duration: 2,
            ease: 'power2.inOut',
          },
          0
        )

        // Step 2: hide text completely once faded
        tl.set(contentRef.current, { display: 'none' }, 2.1)

        // Step 3: slide halves apart simultaneously
        tl.to(
          leftRef.current,
          { x: '-100%', ease: 'power3.inOut', duration: 3.5 },
          0.8
        )
        tl.to(
          rightRef.current,
          { x: '100%', ease: 'power3.inOut', duration: 3.5 },
          0.8
        )

        // Step 4: hide offscreen panels so GPU compositing skips them
        tl.set([leftRef.current, rightRef.current], { display: 'none' })
      })

      // MOBILE/TABLET scroll animation (< 1024px)
      mm.add('(max-width: 1023px)', () => {
        const mobileTl = gsap.timeline({
          scrollTrigger: {
            trigger: ourStoryWrapper.current,
            start: 'top top',
            end: '+=1200',
            scrub: 0.35,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            fastScrollEnd: true,
            preventOverlaps: true,
          },
        })

        mobileTl.to(mobileHeroRef.current, {
          y: -window.innerHeight * 1.2,
          opacity: 0,
          ease: 'power1.inOut',
          duration: 3,
        })
        mobileTl.set(mobileHeroRef.current, { display: 'none' })
      })

      // Refresh triggers after page paint
      const refreshId = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh()
        })
      })

      return () => {
        cancelAnimationFrame(refreshId)
      }
    })

    return () => {
      // Cleanly revert all animations and ScrollTriggers in this context
      ctx.revert()
    }
  }, [])

  return (
    <div ref={heroRef} className="relative w-screen overflow-x-hidden text-white bg-black">
      <div ref={ourStoryWrapper} className="relative lg:min-h-[140vh] min-h-0 h-auto z-10 bg-black">

        {/* EC section */}
        <div
          className="relative lg:absolute lg:top-0 lg:left-0 w-full h-auto lg:h-full z-0"
          style={{ background: '#080808' }}
        >
          <div
            id="hero-ec-content"
            style={{
              width: '100%', minHeight: '100vh', height: 'auto',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'flex-start',
              padding: '90px 4vw 180px', opacity: 1,
            }}
          >
            {/* Glow */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 70% 50% at 50% 10%, rgba(239,158,0,0.12) 0%, transparent 70%)' }} />
            {/* Title */}
            <h2 style={{ position: 'relative', zIndex: 2, fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 900, color: '#fff', letterSpacing: '0.04em', marginBottom: '24px', textAlign: 'center', textShadow: '0 0 40px rgba(239,158,0,0.4)' }}>
              Executive Committee
            </h2>
            {/* Cards */}
            <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-[980px] justify-center">
              {ecMembers.map((m, i) => (
                <ECCard key={`${m.name}-${i}`} member={m} />
              ))}
            </div>
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden lg:block">
          <div className="sticky top-0 z-20 h-screen overflow-hidden pointer-events-none">

            {/* Left torn panel */}
            <div
              ref={leftRef}
              className="absolute top-0 left-0 h-screen z-30 will-change-transform pointer-events-auto"
              style={{
                width: '100vw',
                height: '104vh',
                top: '-2vh',
                clipPath: buildLeftClip(),
              }}
            >
              <CollageGrid side="left" />
            </div>

            {/* Right torn panel */}
            <div
              ref={rightRef}
              className="absolute top-0 right-0 h-screen z-30 will-change-transform pointer-events-auto"
              style={{
                width: '100vw',
                height: '104vh',
                top: '-2vh',
                clipPath: buildRightClip(),
              }}
            >
              <CollageGrid side="right" />
            </div>

            {/* Centered text over panels */}
            <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
              <div
                ref={contentRef}
                className="flex flex-col items-center text-center justify-center absolute inset-0"
              >
                <h1
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 900,
                    background: "linear-gradient(to right, #ffffff, #f9ba1f)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: 'clamp(8rem, 14vw, 13rem)',
                    lineHeight: '1.15',
                    paddingBottom: '0.15em',
                    letterSpacing: "-0.03em",
                    margin: 0,
                  }}
                >
                  IEEE CS
                </h1>
                <div
                  style={{
                    width: "40px",
                    height: "3px",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 0 8px rgba(255, 255, 255, 0.8), 0 0 15px rgba(255, 255, 255, 0.5)",
                    marginTop: "10px",
                    borderRadius: "999px",
                  }}
                />
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 900,
                    background: "linear-gradient(to right, #ffffff, #f9ba1f)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: 'clamp(2rem, 3.5vw, 4rem)',
                    lineHeight: '1.15',
                    paddingBottom: '0.15em',
                    letterSpacing: "-0.03em",
                    marginTop: '20px',
                    margin: 0,
                  }}
                >
                  Meet Our Team
                </h2>
              </div>
            </div>

          </div>
        </div>

        {/* ══ MOBILE / TABLET ══ */}
        <div className="lg:hidden">
          <div
            ref={mobileHeroRef}
            className="absolute top-0 left-0 w-full h-screen z-20 overflow-hidden pointer-events-none"
          >
            {/* Mobile collage background */}
            <div className="absolute inset-0 pointer-events-auto">
              <CollageGrid side="left" />
            </div>
            <div className="absolute inset-0 bg-black/35 pointer-events-none" />

            <div className="absolute inset-0 flex items-center justify-center z-30">
              <div
                ref={mobileContentRef}
                className="flex flex-col items-center text-center"
                style={{ transform: 'translateY(-10vh)' }}
              >
                <h1
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 900,
                    background: "linear-gradient(to right, #ffffff, #f9ba1f)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: 'clamp(4rem, 15vw, 6rem)',
                    lineHeight: '1.15',
                    paddingBottom: '0.15em',
                    letterSpacing: "-0.03em",
                    margin: 0,
                  }}
                >
                  IEEE CS
                </h1>
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
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 900,
                    background: "linear-gradient(to right, #ffffff, #f9ba1f)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: 'clamp(1.2rem, 4.5vw, 2.2rem)',
                    lineHeight: '1.15',
                    paddingBottom: '0.15em',
                    letterSpacing: "-0.03em",
                    marginTop: '20px',
                    margin: 0,
                    maxWidth: '80vw',
                  }}
                >
                  Meet Our Team
                </h2>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function CollageGrid({ side }: { side: 'left' | 'right' }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '3px',
        background: '#111',
        filter: 'grayscale(1) contrast(1.1) brightness(0.8)',
      }}
    >
      {COLLAGE_PHOTOS.map((photo, i) => (
        <div key={i} className="relative overflow-hidden" style={{ background: '#1a1a1a' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url('${photo}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.7,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              zIndex: 1,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 45%, rgba(0,0,0,0.35) 100%)',
            }}
          >
            <p
              style={{
                fontFamily: 'Special Elite, cursive',
                fontSize: 'clamp(0.4rem, 0.85vw, 0.72rem)',
                color: '#e0e0e0',
                lineHeight: 1.35,
                fontWeight: 700,
              }}
            >
              {HEADLINES[i]}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
