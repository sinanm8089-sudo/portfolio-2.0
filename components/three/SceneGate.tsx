"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const CyberBackground = dynamic(() => import("./CyberBackground"), {
  ssr: false,
});

export default function SceneGate({
  isEnabled = true,
  disableAnimations = false,
  animationSpeed = 1.0,
  primaryColor = "#00ff00",
  secondaryColor = "#ff003c",
  desktopQuality = "HIGH",
  mobileQuality = "MEDIUM",
}: {
  isEnabled?: boolean;
  disableAnimations?: boolean;
  preset?: string;
  particleDensity?: number;
  animationSpeed?: number;
  primaryColor?: string;
  secondaryColor?: string;
  desktopQuality?: "HIGH" | "MEDIUM" | "LOW";
  mobileQuality?: "HIGH" | "MEDIUM" | "LOW";
}) {
  const [mounted, setMounted] = useState(false);
  const [supportsWebGL, setSupportsWebGL] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);

    try {
      const testCanvas = document.createElement("canvas");
      const gl =
        testCanvas.getContext("webgl") ||
        testCanvas.getContext("experimental-webgl");
      setSupportsWebGL(Boolean(gl));
    } catch {
      setSupportsWebGL(false);
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  if (
    !mounted ||
    !isEnabled ||
    disableAnimations ||
    !supportsWebGL ||
    prefersReducedMotion
  ) {
    return null;
  }

  return (
    <CyberBackground
      primaryColor={primaryColor}
      accentColor={secondaryColor}
      animationSpeed={animationSpeed}
      desktopQuality={desktopQuality}
      mobileQuality={mobileQuality}
    />
  );
}
