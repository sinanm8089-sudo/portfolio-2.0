"use client";

/**
 * Port of the original sinanm8089-sudo.github.io Three.js background:
 * matrix data rain, top/bottom grids, and ten wireframe cyber objects,
 * with a scroll-driven camera path and mouse parallax.
 *
 * Additions over the original: adaptive quality, render pause when the tab is
 * hidden, proper resource disposal on unmount, and drift-free glitch jitter.
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Quality = "HIGH" | "MEDIUM" | "LOW";

const QUALITY_PROFILE: Record<Quality, { particles: number; pixelRatio: number; objects: number }> = {
  HIGH: { particles: 2000, pixelRatio: 1.5, objects: 10 },
  MEDIUM: { particles: 1000, pixelRatio: 1.25, objects: 10 },
  LOW: { particles: 400, pixelRatio: 1, objects: 5 },
};

function pickQuality(desktop: Quality, mobile: Quality): Quality {
  const isSmall = window.innerWidth < 768;
  const cores = navigator.hardwareConcurrency || 4;
  const base = isSmall ? mobile : desktop;
  // Downgrade one step on low-core devices rather than assuming all mobiles are weak
  if (cores <= 2 && base === "HIGH") return "MEDIUM";
  if (cores <= 2 && base === "MEDIUM") return "LOW";
  return base;
}

export default function CyberBackground({
  primaryColor = "#39FF88",
  accentColor = "#FF003C",
  animationSpeed = 1,
  desktopQuality = "HIGH",
  mobileQuality = "MEDIUM",
}: {
  primaryColor?: string;
  accentColor?: string;
  animationSpeed?: number;
  desktopQuality?: Quality;
  mobileQuality?: Quality;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const quality = pickQuality(desktopQuality, mobileQuality);
    const profile = QUALITY_PROFILE[quality];

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, profile.pixelRatio));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050807, 0.04);
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 0, 5);

    const green = new THREE.Color(primaryColor);
    const dim = green.clone().multiplyScalar(0.35);

    const matGreen = new THREE.LineBasicMaterial({ color: green, transparent: true, opacity: 0.8 });
    const matRed = new THREE.LineBasicMaterial({ color: new THREE.Color(accentColor), transparent: true, opacity: 0.9 });
    const matDim = new THREE.LineBasicMaterial({ color: dim, transparent: true, opacity: 0.4 });

    const buildEdges = (geo: THREE.BufferGeometry, mat: THREE.Material) => {
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), mat);
      geo.dispose();
      return edges;
    };
    const buildLine = (pts: number[][], mat: THREE.Material) =>
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2]))),
        mat
      );
    const circleXY = (r: number, seg = 32) => {
      const pts: number[][] = [];
      for (let i = 0; i <= seg; i++) {
        const a = (i / seg) * Math.PI * 2;
        pts.push([Math.cos(a) * r, Math.sin(a) * r, 0]);
      }
      return pts;
    };

    // ─── Grids ───
    const gridBottom = new THREE.GridHelper(100, 50, green, dim);
    gridBottom.position.y = -10;
    const gridTop = new THREE.GridHelper(100, 50, green, dim);
    gridTop.position.y = 10;
    scene.add(gridBottom, gridTop);

    // ─── Matrix rain ───
    const particleCount = profile.particles;
    const pPos = new Float32Array(particleCount * 3);
    const pVels = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 40;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 5;
      pVels[i] = Math.random() * 0.2 + 0.05;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: green, size: 0.05, transparent: true, opacity: 0.6 });
    const matrixRain = new THREE.Points(pGeo, pMat);
    scene.add(matrixRain);

    // ─── Wireframe cyber objects ───
    type CyberObj = {
      obj: THREE.Group;
      rotX: number;
      rotY: number;
      floatAmp: number;
      floatSpeed: number;
      phase: number;
      baseX: number;
      baseY: number;
      spinner?: THREE.Group;
    };
    const cyberObjs: CyberObj[] = [];

    const place = (
      g: THREE.Group,
      pos: [number, number, number],
      cfg: Omit<CyberObj, "obj" | "baseX" | "baseY">
    ) => {
      g.position.set(...pos);
      scene.add(g);
      cyberObjs.push({ obj: g, baseX: pos[0], baseY: pos[1], ...cfg });
    };

    const builders: Array<() => void> = [
      // 1. Padlock
      () => {
        const g = new THREE.Group();
        g.add(buildEdges(new THREE.BoxGeometry(1.4, 1.1, 0.5, 2, 2, 1), matGreen));
        const shackle: number[][] = [];
        for (let i = 0; i <= 16; i++) {
          const a = Math.PI + (i / 16) * Math.PI;
          shackle.push([Math.cos(a) * 0.42, 0.55 - Math.sin(a) * 0.52, 0]);
        }
        g.add(buildLine(shackle, matGreen));
        g.add(buildLine(circleXY(0.17, 16), matRed));
        g.add(buildLine([[0, -0.17, 0], [0, -0.45, 0]], matRed));
        place(g, [4, 0.5, -3], { rotX: 0.005, rotY: 0.01, floatAmp: 0.2, floatSpeed: 0.5, phase: 0 });
      },
      // 2. Network globe
      () => {
        const g = new THREE.Group();
        g.add(buildEdges(new THREE.IcosahedronGeometry(1.4, 1), matDim));
        g.add(buildEdges(new THREE.IcosahedronGeometry(1.4, 0), matGreen));
        g.add(buildEdges(new THREE.OctahedronGeometry(0.5, 0), matRed));
        place(g, [-5, -1, -5], { rotX: 0.003, rotY: 0.007, floatAmp: 0.3, floatSpeed: 0.4, phase: 1 });
      },
      // 3. Shield
      () => {
        const g = new THREE.Group();
        g.add(buildLine([[0, 2.1, 0], [1.5, 1.5, 0], [1.2, -0.5, 0], [0, -2.4, 0], [-1.2, -0.5, 0], [-1.5, 1.5, 0], [0, 2.1, 0]], matGreen));
        g.add(buildLine([[0, 1.5, 0], [1, 1, 0], [0.8, -0.2, 0], [0, -1.6, 0], [-0.8, -0.2, 0], [-1, 1, 0], [0, 1.5, 0]], matDim));
        g.add(buildLine([[-0.5, 0.2, 0], [-0.1, -0.4, 0], [0.8, 0.6, 0]], matRed));
        place(g, [5, -3, -6], { rotX: 0.002, rotY: 0.008, floatAmp: 0.4, floatSpeed: 0.45, phase: 2 });
      },
      // 4. Binary helix tower
      () => {
        const g = new THREE.Group();
        g.add(buildEdges(new THREE.CylinderGeometry(0.8, 0.8, 4, 6, 4, true), matDim));
        g.add(buildEdges(new THREE.CylinderGeometry(0.4, 0.4, 4, 3, 2, true), matRed));
        place(g, [-4.5, -5.5, -4], { rotX: 0, rotY: 0.015, floatAmp: 0.2, floatSpeed: 0.55, phase: 0.5 });
      },
      // 5. Targeting scanner
      () => {
        const g = new THREE.Group();
        g.add(buildLine(circleXY(1.6, 16), matGreen));
        g.add(buildLine(circleXY(1.1, 8), matDim));
        g.add(buildLine([[-2, 0, 0], [-0.5, 0, 0]], matGreen));
        g.add(buildLine([[0.5, 0, 0], [2, 0, 0]], matGreen));
        g.add(buildLine([[0, -2, 0], [0, -0.5, 0]], matGreen));
        g.add(buildLine([[0, 0.5, 0], [0, 2, 0]], matGreen));
        const spinner = new THREE.Group();
        spinner.add(buildLine([[0, 0, 0], [1, 1, 0]], matRed));
        spinner.add(buildLine([[0, 0, 0], [-1, -1, 0]], matRed));
        g.add(spinner);
        place(g, [4.5, -8, -5], { rotX: 0, rotY: 0, floatAmp: 0.1, floatSpeed: 0.2, phase: 1.5, spinner });
      },
      // 6. Skull
      () => {
        const g = new THREE.Group();
        g.add(buildEdges(new THREE.SphereGeometry(1, 6, 4, 0, Math.PI * 2, 0, Math.PI * 0.75), matGreen));
        g.add(buildLine([[-0.7, -0.6, 0.5], [-0.5, -1, 0.4], [0, -1.1, 0.5], [0.5, -1, 0.4], [0.7, -0.6, 0.5]], matGreen));
        const lEye = buildEdges(new THREE.RingGeometry(0.12, 0.28, 5), matRed);
        lEye.position.set(-0.32, 0.1, 0.85);
        const rEye = buildEdges(new THREE.RingGeometry(0.12, 0.28, 5), matRed);
        rEye.position.set(0.32, 0.1, 0.85);
        g.add(lEye, rEye);
        g.add(buildLine([[0, -0.1, 0.9], [-0.1, -0.3, 0.9], [0.1, -0.3, 0.9], [0, -0.1, 0.9]], matDim));
        g.scale.setScalar(0.8);
        place(g, [-6, 2, -7], { rotX: 0.003, rotY: 0.006, floatAmp: 0.35, floatSpeed: 0.35, phase: 3 });
      },
      // 7. DNA double helix
      () => {
        const g = new THREE.Group();
        const s1: number[][] = [];
        const s2: number[][] = [];
        const steps = 60;
        for (let i = 0; i < steps; i++) {
          const t = (i / steps) * Math.PI * 4;
          const y = (i / steps) * 5 - 2.5;
          s1.push([Math.cos(t) * 0.6, y, Math.sin(t) * 0.6]);
          s2.push([Math.cos(t + Math.PI) * 0.6, y, Math.sin(t + Math.PI) * 0.6]);
        }
        g.add(buildLine(s1, matGreen), buildLine(s2, matGreen));
        for (let i = 0; i < steps; i += 6) g.add(buildLine([s1[i], s2[i]], matRed));
        place(g, [6, -6, -8], { rotX: 0, rotY: 0.012, floatAmp: 0.25, floatSpeed: 0.5, phase: 0.8 });
      },
      // 8. Firewall barrier
      () => {
        const g = new THREE.Group();
        for (let i = -3; i <= 3; i++) {
          g.add(buildLine([[i * 0.5, -1.5, 0], [i * 0.5, 1.5, 0]], matDim));
          g.add(buildLine([[-1.5, i * 0.5, 0], [1.5, i * 0.5, 0]], matDim));
        }
        g.add(buildLine([[-1.5, -1.5, 0], [1.5, -1.5, 0], [1.5, 1.5, 0], [-1.5, 1.5, 0], [-1.5, -1.5, 0]], matGreen));
        g.add(buildEdges(new THREE.OctahedronGeometry(0.4, 0), matRed));
        place(g, [-5.5, -10, -6], { rotX: 0.004, rotY: 0.008, floatAmp: 0.3, floatSpeed: 0.4, phase: 2.5 });
      },
      // 9. Satellite dish
      () => {
        const g = new THREE.Group();
        g.add(buildEdges(new THREE.SphereGeometry(1.2, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.5), matGreen));
        g.add(buildLine([[0, 0, 0], [0, 1.8, 0]], matGreen));
        const tip = buildEdges(new THREE.TetrahedronGeometry(0.2, 0), matRed);
        tip.position.set(0, 1.9, 0);
        const ring1 = buildLine(circleXY(0.3, 12), matDim);
        ring1.position.set(0, 2.2, 0);
        const ring2 = buildLine(circleXY(0.5, 12), matDim);
        ring2.position.set(0, 2.5, 0);
        g.add(tip, ring1, ring2);
        place(g, [5.5, -13, -5], { rotX: 0.002, rotY: 0.01, floatAmp: 0.2, floatSpeed: 0.3, phase: 1.8 });
      },
      // 10. Rotating cube lattice
      () => {
        const g = new THREE.Group();
        g.add(buildEdges(new THREE.BoxGeometry(2, 2, 2), matGreen));
        g.add(buildEdges(new THREE.BoxGeometry(1.3, 1.3, 1.3), matDim));
        g.add(buildEdges(new THREE.BoxGeometry(0.6, 0.6, 0.6), matRed));
        g.add(buildLine([[-1, -1, -1], [1, 1, 1]], matDim));
        g.add(buildLine([[-1, 1, -1], [1, -1, 1]], matDim));
        g.add(buildLine([[1, -1, -1], [-1, 1, 1]], matDim));
        g.add(buildLine([[1, 1, -1], [-1, -1, 1]], matDim));
        place(g, [-4, -14, -4], { rotX: 0.008, rotY: 0.012, floatAmp: 0.35, floatSpeed: 0.45, phase: 0.3 });
      },
    ];
    // LOW quality keeps every other object so the scroll journey still has content throughout
    builders
      .filter((_, i) => profile.objects >= builders.length || i % 2 === 0)
      .forEach((build) => build());

    // ─── Input: mouse parallax + scroll camera path ───
    const mouse = { x: 0, y: 0 };
    let scrollProgress = 0;
    const cameraPath = [
      { z: 5, y: 0 },
      { z: 3, y: -2 },
      { z: 4, y: -5 },
      { z: 3, y: -8 },
      { z: 4, y: -12 },
      { z: 3, y: -16 },
    ];

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress = total > 0 ? Math.min(window.scrollY / total, 1) : 0;
    };
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    onScroll();

    // ─── Animation loop ───
    const clock = new THREE.Clock();
    let frameId = 0;
    let running = true;

    const animate = () => {
      if (!running) return;
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime() * animationSpeed;

      const positions = pGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] -= pVels[i] * animationSpeed;
        if (positions[i * 3 + 1] < -20) positions[i * 3 + 1] = 20;
      }
      pGeo.attributes.position.needsUpdate = true;

      gridBottom.position.z = (t * 2) % 2;
      gridTop.position.z = (t * 2) % 2;

      for (const o of cyberObjs) {
        if (Math.random() < 0.005) {
          o.obj.rotation.x += Math.random() * 0.5;
          o.obj.rotation.y += Math.random() * 0.5;
        } else {
          o.obj.rotation.x += o.rotX * animationSpeed;
          o.obj.rotation.y += o.rotY * animationSpeed;
        }
        // Brief horizontal glitch, always anchored to baseX so objects never drift
        o.obj.position.x = Math.random() < 0.01 ? o.baseX + (Math.random() - 0.5) * 0.2 : o.baseX;
        o.obj.position.y = o.baseY + Math.sin(t * o.floatSpeed + o.phase) * o.floatAmp;
        if (o.spinner) o.spinner.rotation.z = t * 3;
      }

      const segments = cameraPath.length - 1;
      const scaled = scrollProgress * segments;
      const idx = Math.min(Math.floor(scaled), segments - 1);
      const alpha = scaled - idx;
      const a = cameraPath[idx];
      const b = cameraPath[idx + 1];
      camera.position.z += (a.z + (b.z - a.z) * alpha - camera.position.z) * 0.1;
      camera.position.y += (a.y + (b.y - a.y) * alpha - camera.position.y) * 0.1;
      camera.rotation.x += (mouse.y * 0.04 - camera.rotation.x) * 0.1;
      camera.rotation.y += (mouse.x * 0.06 - camera.rotation.y) * 0.1;

      renderer.render(scene, camera);
    };

    // Pause rendering while the tab is hidden
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(frameId);
      } else if (!running) {
        running = true;
        clock.getDelta();
        animate();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    animate();

    return () => {
      running = false;
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      scene.traverse((child) => {
        const geo = (child as THREE.Mesh).geometry;
        if (geo) geo.dispose();
      });
      [matGreen, matRed, matDim, pMat].forEach((m) => m.dispose());
      gridBottom.dispose();
      gridTop.dispose();
      renderer.dispose();
    };
  }, [primaryColor, accentColor, animationSpeed, desktopQuality, mobileQuality]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}

