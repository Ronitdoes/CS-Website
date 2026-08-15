"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useLoading } from "@/context/LoadingContext";
import { useLenis } from "@/components/providers/ScrollProvider";

export default function Preloader() {
  const { isReady, setVideoFinished } = useLoading();
  const lenis = useLenis();

  useEffect(() => {
    // Lock scroll while preloader is visible
    if (!isReady) {
      lenis?.stop();
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }
  }, [isReady, lenis]);

  const handleVideoEnd = () => {
    sessionStorage.setItem("preloaderShown", "true");
    setVideoFinished(true);
  };

  return (
    <AnimatePresence>
      {!isReady && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
        >
          <video
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
            className="w-full h-full object-contain md:object-cover"
          >
            <source src="/cs-microchip.webm" type="video/webm" />
            <source src="/cs-microchip.mp4" type="video/mp4" />
            
          </video>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
