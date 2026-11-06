"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function DigitalGlobeInner({
  particleCount = 900,
  speed = 0.5,
  colorGreen = "#39FF88",
  colorCyan = "#00D9FF",
}: {
  particleCount?: number;
  speed?: number;
  colorGreen?: string;
  colorCyan?: string;
}) {
  const globeRef = useRef<THREE.Group>(null);
  const ringRef1 = useRef<THREE.LineSegments>(null);
  const ringRef2 = useRef<THREE.LineSegments>(null);

  // Generate glowing nodes over a sphere surface
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const cGreen = new THREE.Color(colorGreen);
    const cCyan = new THREE.Color(colorCyan);

    for (let i = 0; i < particleCount; i++) {
      // Golden spiral distribution on sphere
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;
      const radius = 2.05 + (Math.random() - 0.5) * 0.08;

      pos[i * 3] = radius * Math.cos(theta) * Math.sin(phi);
      pos[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      const blended = Math.random() > 0.4 ? cGreen : cCyan;
      col[i * 3] = blended.r;
      col[i * 3 + 1] = blended.g;
      col[i * 3 + 2] = blended.b;
    }
    return [pos, col];
  }, [particleCount, colorGreen, colorCyan]);

  useFrame((_, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * speed * 0.35;
      globeRef.current.rotation.x = Math.sin(Date.now() * 0.0004) * 0.12;
    }
    if (ringRef1.current) {
      ringRef1.current.rotation.z += delta * 0.25;
      ringRef1.current.rotation.x += delta * 0.1;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.z -= delta * 0.3;
      ringRef2.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={globeRef}>
      {/* Central Wireframe Core */}
      <mesh>
        <sphereGeometry args={[1.9, 16, 16]} />
        <meshBasicMaterial
          color={colorGreen}
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>

      {/* Surface Nodes / Points Cloud */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          vertexColors
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Orbital Scan Ring 1 */}
      <lineSegments ref={ringRef1}>
        <edgesGeometry args={[new THREE.RingGeometry(2.35, 2.38, 48)]} />
        <lineBasicMaterial color={colorCyan} transparent opacity={0.35} />
      </lineSegments>

      {/* Orbital Scan Ring 2 */}
      <lineSegments ref={ringRef2}>
        <edgesGeometry args={[new THREE.RingGeometry(2.55, 2.58, 48)]} />
        <lineBasicMaterial color={colorGreen} transparent opacity={0.25} />
      </lineSegments>
    </group>
  );
}

export default function DigitalGlobe({
  particleCount = 900,
  speed = 0.5,
  colorGreen = "#39FF88",
  colorCyan = "#00D9FF",
  className = "h-[380px] w-full",
}: {
  particleCount?: number;
  speed?: number;
  colorGreen?: string;
  colorCyan?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 4.6], fov: 48 }}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.6} />
        <DigitalGlobeInner
          particleCount={particleCount}
          speed={speed}
          colorGreen={colorGreen}
          colorCyan={colorCyan}
        />
      </Canvas>
    </div>
  );
}

