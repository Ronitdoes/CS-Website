"use client";

import { Suspense, useEffect, useRef, useLayoutEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const sharedMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#F5A623"),
  roughness: 0.35,
  metalness: 0.4,
});

// Eagerly preload the GLB model at module execution time.
useGLTF.preload("/logos/ieee.glb", true);

interface ModelProps {
  progressRef?: React.RefObject<{ value: number }>;
}

function Model({ progressRef }: ModelProps) {
  const gltf = useGLTF("/logos/ieee.glb", true);
  const ref = useRef<THREE.Group>(null);
  const invalidate = useThree((state) => state.invalidate);

  // Apply custom materials synchronously before browser paint to prevent default white-material flashes
  useLayoutEffect(() => {
    if (!ref.current) return;
    ref.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = sharedMaterial;
      }
    });
    // Guarantees a frame is drawn as soon as the GLB resolves under demand frameloop
    invalidate();
  }, [gltf.scene, invalidate]);

  useFrame(() => {
    if (!ref.current) return;

    // Retrieve the deterministic scroll progress from the GSAP timeline ref
    const scrollProgress = progressRef?.current?.value ?? 0;

    // Map scroll progress to 3D rotation on multiple axes.
    // Z-axis provides a flat roll spin (completes exactly 1 full rotation so it settles perfectly upright at 0/2*PI).
    const scrollSpin = scrollProgress * Math.PI * 2;

    // Y-axis (Yaw) provides a subtle depth-revealing sweep that peaks in the middle of the scroll (around 36 degrees tilt)
    // and returns perfectly to 0 at the end using a sine envelope.
    const scrollTiltY = Math.sin(scrollProgress * Math.PI) * (Math.PI * 0.2);

    // X-axis (Pitch) baseline starts at Math.PI / 2. We add a subtle pitch shift that peaks in the middle
    // and returns perfectly to Math.PI / 2 at the end using a sine envelope.
    const scrollTiltX = Math.PI / 2 + Math.sin(scrollProgress * Math.PI) * 0.1;

    ref.current.rotation.x = scrollTiltX;
    ref.current.rotation.y = scrollTiltY;
    ref.current.rotation.z = scrollSpin;

    // Reset translation to be perfectly centered and static
    ref.current.position.y = 0;
  });

  return (
    <primitive 
      ref={ref} 
      object={gltf.scene} 
      scale={0.6} 
    />
  );
}

interface Logo3DProps {
  progressRef?: React.RefObject<{ value: number }>;
}

// Mobile renders on demand only: nothing recalculates while scrolling, but the
// frame is redrawn whenever the buffer may have been cleared (resize, URL-bar
// collapse, tab restore, context loss) so the logo never goes missing.
function StaticFrameController({ enabled }: { enabled: boolean }) {
  const invalidate = useThree((state) => state.invalidate);
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    if (!enabled) return;

    invalidate();

    const redraw = () => invalidate();
    const el = gl.domElement;

    window.addEventListener("resize", redraw, { passive: true });
    window.addEventListener("orientationchange", redraw);
    window.addEventListener("pageshow", redraw);
    document.addEventListener("visibilitychange", redraw);
    el.addEventListener("webglcontextrestored", redraw);

    return () => {
      window.removeEventListener("resize", redraw);
      window.removeEventListener("orientationchange", redraw);
      window.removeEventListener("pageshow", redraw);
      document.removeEventListener("visibilitychange", redraw);
      el.removeEventListener("webglcontextrestored", redraw);
    };
  }, [enabled, invalidate, gl]);

  return null;
}

export default function Logo3D({ progressRef }: Logo3DProps) {
  // Mobile (max-width: 768px) renders a single static frame; scroll only animates
  // composited transforms on the wrapper, so the GLB scene is never recalculated.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 48 }}
      gl={{
        alpha: true,
        antialias: !isMobile,
        powerPreference: isMobile ? "default" : "high-performance",
      }}
      dpr={isMobile ? [1, 1.25] : [1, 2]}
      frameloop={isMobile ? "demand" : "always"}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 5, 5]} intensity={2.5} />
      <directionalLight position={[-4, 2, -3]} intensity={1.0} />
      <StaticFrameController enabled={isMobile} />
      <Suspense fallback={null}>
        <Model progressRef={progressRef} />
      </Suspense>
    </Canvas>
  );
}
