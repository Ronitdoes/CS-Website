"use client";

import { Suspense, useRef, useLayoutEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const sharedMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#F5A623"),
  roughness: 0.35,
  metalness: 0.4,
});

// Eagerly preload the GLB model at module execution time.
useGLTF.preload("/logos/ieee.glb", true);

function Model() {
  const gltf = useGLTF("/logos/ieee.glb", true);
  const ref = useRef<THREE.Group>(null);

  // Apply custom materials synchronously before browser paint to prevent default white-material flashes
  useLayoutEffect(() => {
    if (!ref.current) return;
    ref.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = sharedMaterial;
      }
    });
  }, [gltf.scene]);
 
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.z += delta * 0.5;
  });

  return (
    <primitive 
      ref={ref} 
      object={gltf.scene} 
      scale={0.6} 
      rotation={[Math.PI / 2, 0, 0]} 
    />
  );
}

export default function Logo3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 48 }}
      gl={{ alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
      <directionalLight position={[-4, 2, -3]} intensity={0.8} />
      <Suspense fallback={null}>
        <Model />
      </Suspense>
    </Canvas>
  );
}
