"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface NodeData {
  position: [number, number, number];
  color: string;
  size: number;
}

function SceneGraph({ isTabVisible }: { isTabVisible: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  // Generate deterministic decision node coordinates aligned to architectural palette
  const nodes = useMemo<NodeData[]>(() => {
    return [
      { position: [-2.5, 1.2, 0], color: "#1D64EC", size: 0.16 }, // Prerequisite node (Cobalt Blue)
      { position: [-0.8, 0.4, 0.5], color: "#1E6E38", size: 0.18 }, // Verified obligation (Pine Green)
      { position: [0.8, -0.6, -0.3], color: "#0F4FC2", size: 0.15 }, // Financial milestone (Royal Navy)
      { position: [2.2, 0.8, 0.2], color: "#7C3AED", size: 0.14 }, // Scenario branch (Purple)
      { position: [1.5, -1.4, 0], color: "#DE4A2B", size: 0.16 }, // Breach condition (Coral Terracotta)
      { position: [-1.8, -1.0, -0.5], color: "#996500", size: 0.13 }, // Disputed clause (Ochre Amber)
      { position: [0.0, 1.8, -0.2], color: "#52524E", size: 0.12 }, // Inactive deadline (Charcoal)
    ];
  }, []);

  // Frame animation pauses immediately when browser tab is inactive or hidden
  useFrame((state, delta) => {
    if (!isTabVisible || typeof document !== "undefined" && document.hidden) {
      return;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.04;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }
  });

  // Comprehensive resource cleanup on unmount: dispose geometries, textures, materials
  useEffect(() => {
    const currentGroup = groupRef.current;
    return () => {
      if (currentGroup) {
        currentGroup.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose());
            } else {
              child.material?.dispose();
            }
          } else if (child instanceof THREE.GridHelper) {
            child.geometry?.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose());
            } else {
              child.material?.dispose();
            }
          }
        });
      }
    };
  }, []);

  return (
    <group ref={groupRef}>
      {/* Ambient and Key directional lights calibrated for warm drafting cream */}
      <ambientLight intensity={0.9} color="#FCFAF7" />
      <directionalLight position={[10, 15, 10]} intensity={0.8} color="#FFFFFF" />
      <directionalLight position={[-10, -5, -5]} intensity={0.3} color="#D1CCC0" />

      {/* Decision Nodes */}
      {nodes.map((node, idx) => (
        <mesh key={idx} position={node.position}>
          <sphereGeometry args={[node.size, 24, 24]} />
          <meshStandardMaterial
            color={node.color}
            roughness={0.4}
            metalness={0.1}
          />
        </mesh>
      ))}

      {/* Grid Plane for Grounding */}
      <gridHelper
        args={[10, 20, 0x1E1E1E, 0xD1CCC0]}
        position={[0, -2, 0]}
      />
    </group>
  );
}

export function DecisionBackdrop() {
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [isTabVisible, setIsTabVisible] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check WebGL availability
    try {
      const canvas = document.createElement("canvas");
      const gl = !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
      setHasWebGL(gl);
    } catch {
      setHasWebGL(false);
    }

    // Check and observe prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };
    mediaQuery.addEventListener("change", handleMotionChange);

    // Observe tab visibility to pause animation loops when backgrounded
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMotionChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // 2D SVG Blueprint Schematic Fallback for reduced motion or non-WebGL environments
  if (!hasWebGL || reducedMotion) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-40 flex items-center justify-center select-none"
      >
        <svg className="w-full h-full max-w-4xl" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Blueprint schematic connecting lines */}
          <path d="M200 180 L350 140 L500 220 L650 160" stroke="#D1CCC0" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M350 140 L450 80" stroke="#D1CCC0" strokeWidth="1.5" strokeDasharray="2 2" />
          <path d="M500 220 L580 300" stroke="#E57368" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Schematic nodes with high-contrast outlines */}
          <circle cx="200" cy="180" r="14" fill="#1D64EC" stroke="#1E1E1E" strokeWidth="2" />
          <circle cx="350" cy="140" r="18" fill="#1E6E38" stroke="#1E1E1E" strokeWidth="2" />
          <circle cx="500" cy="220" r="16" fill="#0F4FC2" stroke="#1E1E1E" strokeWidth="2" />
          <circle cx="650" cy="160" r="14" fill="#7C3AED" stroke="#1E1E1E" strokeWidth="2" />
          <circle cx="450" cy="80" r="10" fill="#996500" stroke="#1E1E1E" strokeWidth="1.5" />
          <circle cx="580" cy="300" r="12" fill="#DE4A2B" stroke="#1E1E1E" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none opacity-60 select-none"
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
        dpr={[1, 1.5]}
        frameloop={isTabVisible ? "always" : "never"}
      >
        <SceneGraph isTabVisible={isTabVisible} />
      </Canvas>
    </div>
  );
}
