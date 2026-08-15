"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Menu } from "lucide-react";
import style from "./Navbar.module.css";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

export const NAV_IMAGES = [
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782386537059_8p7ddp.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782385702000_ecd65y.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782386405527_lbiscd.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782386135938_vj8bgs.avif",
];

const ScribbleIcon = () => (
  <svg
    viewBox="0 0 200 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={style.scribble}
  >
    <path
      d="M2 10C20 2 40 18 60 10C80 2 100 18 120 10C140 2 160 18 180 10C190 6 198 10 198 10"
      stroke="currentColor"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function NorrisText({
  text,
  cascadeIndex,
}: {
  text: string;
  cascadeIndex: number;
}) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timerIn = setTimeout(() => setAnimate(true), 120);
    const timerOut = setTimeout(() => setAnimate(false), 1300);

    return () => {
      clearTimeout(timerIn);
      clearTimeout(timerOut);
    };
  }, []);

  return (
    <span className={`${style.norrisWrapper} ${animate ? style.animate : ""}`}>
      {text.split("").map((char, index) => (
        <span
          key={index}
          className={style.norrisChar}
          data-char={char === " " ? "\u00A0" : char}
          style={
            {
              "--char-index": index,
              "--line-index": cascadeIndex,
            } as React.CSSProperties
          }
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

const isLightColor = (colorStr: string): boolean => {
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return false;
  
  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
  
  if (a < 0.1) return false; // semi-transparent treated as dark
  
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 180;
};

const checkLuminanceAtElement = (targetEl: HTMLElement | null): boolean => {
  if (!targetEl) return false;
  
  try {
    const rect = targetEl.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    const elements = document.elementsFromPoint(x, y);
    const header = document.querySelector(`header`);
    
    for (const el of elements) {
      if (header && header.contains(el)) {
        continue;
      }
      
      let currentEl: HTMLElement | null = el as HTMLElement;
      while (currentEl) {
        const style = window.getComputedStyle(currentEl);
        const bg = style.backgroundColor;
        if (bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)") {
          return isLightColor(bg);
        }
        currentEl = currentEl.parentElement;
      }
    }
  } catch (e) {
    console.error("Error detecting background color under element:", e);
  }
  
  return false;
};

export default function Navbar() {
  const [cursorActive, setCursorActive] = useState(false);
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  const [isLogoLightBg, setIsLogoLightBg] = useState(false);
  const [isMenuLightBg, setIsMenuLightBg] = useState(false);

  const logoRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let rafId = 0;
    let scrolledState = false;
    let scrollEndTimer: NodeJS.Timeout;

    const updateContrast = () => {
      const isLogoLight = checkLuminanceAtElement(logoRef.current);
      const isMenuLight = checkLuminanceAtElement(menuRef.current);
      
      setIsLogoLightBg((prev) => (prev === isLogoLight ? prev : isLogoLight));
      setIsMenuLightBg((prev) => (prev === isMenuLight ? prev : isMenuLight));
    };

    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        const scrollY = window.scrollY;
        const isScrolled = scrollY > 60;
        if (isScrolled !== scrolledState) {
          scrolledState = isScrolled;
          setScrolled(isScrolled);
        }
        
        // Fast direct transform/opacity update without reflow
        if (logoRef.current) {
          const opacity = Math.max(0, 1 - scrollY / 150);
          logoRef.current.style.opacity = String(opacity);
          logoRef.current.style.pointerEvents = opacity === 0 ? "none" : "auto";
        }

        // Defer expensive contrast hit-testing until scroll rests to avoid layout thrashing
        clearTimeout(scrollEndTimer);
        scrollEndTimer = setTimeout(updateContrast, 120);
      });
    };

    updateContrast();
    if (logoRef.current) {
      const initialOpacity = Math.max(0, 1 - window.scrollY / 150);
      logoRef.current.style.opacity = String(initialOpacity);
      logoRef.current.style.pointerEvents = initialOpacity === 0 ? "none" : "auto";
    }
    const timer = setTimeout(updateContrast, 100);

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateContrast, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateContrast);
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(timer);
      clearTimeout(scrollEndTimer);
    };
  }, [pathname]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      setMenuOpen(false);
      window.location.reload();
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Team", href: "/team" },
    { name: "Event", href: "/events" },
    { name: "Blog", href: "https://medium.com/@ieeecs" },
    { name: "Gallery", href: "/gallery" },
  ];

  const isNavItemActive = (href: string) => {
    // External links should never be treated as route-active.
    if (!href.startsWith("/")) return false;

    // Keep Home active only on the exact root path.
    if (href === "/") return pathname === "/";

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>


      <header
        className={`${style.header} ${scrolled ? style.scrolled : ""}`}
        onMouseEnter={() => setCursorActive(true)}
        onMouseLeave={() => setCursorActive(false)}
      >
        <div className={style.headerContainer}>
          <div 
            ref={logoRef} 
            className={style.logo} 
            onClick={() => router.push("/")}
          >
            <Image
              src="/logos/ieee-cs-logo.avif"
              alt="IEEE CS MUJ Logo"
              width={240}
              height={60}
              className={`${style.logoImage} ${isLogoLightBg ? style.logoLightBg : ""}`}
              priority
            />
          </div>

          <button
            ref={menuRef}
            className={`${style.menuToggle} ${isMenuLightBg && !menuOpen ? style.menuToggleLightBg : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={style.overlay}
          >
            <div className={style.overlayContent}>
              <div className={style.gridSection}>
                <div className={style.photoGrid}>
                  {NAV_IMAGES.map((src, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: 0.1 + idx * 0.1, duration: 0.6 }}
                      className={style.photoContainer}
                    >
                      <Image
                        src={src}
                        alt={`Menu Visual ${idx + 1}`}
                        fill
                        className={style.photo}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className={style.linksSection}>
                <nav className={style.navLinks}>
                  {navItems.map((item, idx) => {
                    const isActive = isNavItemActive(item.href);

                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1, duration: 0.5 }}
                        className={style.linkWrapper}
                      >
                        <Link
                          href={item.href}
                          className={`${style.navLink} ${isActive ? style.activeLink : ""}`}
                          onClick={() => setMenuOpen(false)}
                        >
                          <NorrisText text={item.name} cascadeIndex={idx} />
                          {isActive && <ScribbleIcon />}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}