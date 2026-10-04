import { useRef, useEffect, useState } from "react";

export default function ThreeBackground({ theme, view }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const listener = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  const isDark = theme === "dark";

  return (
    <div
      className="legal-chambers-bg"
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1, // Strictly behind all content layers
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* High-Resolution Law Library Atmosphere (Subtle Watermark in Light, Rich Ambient in Dark) */}
      <div
        style={{
          position: "absolute",
          top: "-5%",
          left: "-5%",
          width: "110%",
          height: "110%",
          backgroundImage: "url('/assets/legal_library_bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center 20%",
          filter: isDark
            ? "blur(18px) brightness(0.22) contrast(1.2)"
            : "blur(22px) brightness(0.96) saturate(0.70)",
          transform: "scale(1.05)",
          opacity: isDark ? 0.45 : 0.09, // Extremely subtle so text is 100% legible
          transition: "opacity 600ms ease, filter 600ms ease",
        }}
      />

      {/* Atmospheric Courtroom Pillars Accent (Right Side Ambient Depth) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "50vw",
          height: "100vh",
          backgroundImage: "url('/assets/court_pillars_bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: isDark
            ? "blur(24px) brightness(0.18)"
            : "blur(26px) brightness(0.98)",
          opacity: isDark ? 0.30 : 0.06, // Soft depth without washing out page content
          maskImage: "radial-gradient(ellipse at 80% 50%, black 15%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at 80% 50%, black 15%, transparent 70%)",
          transition: "opacity 600ms ease",
        }}
      />

      {/* Warm Saffron / Ivory Tint Vignette */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: isDark
            ? "radial-gradient(circle at 50% 15%, rgba(216, 139, 36, 0.06) 0%, rgba(11, 21, 36, 0.90) 65%, rgba(7, 13, 24, 0.99) 100%)"
            : "radial-gradient(circle at 50% 10%, rgba(254, 246, 228, 0.35) 0%, rgba(250, 249, 246, 0.60) 60%, rgba(244, 245, 247, 0.85) 100%)",
        }}
      />

      {/* Micro-dot Legal Registry Grid */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: isDark
            ? "radial-gradient(rgba(228, 163, 76, 0.10) 1px, transparent 1px)"
            : "radial-gradient(rgba(21, 42, 69, 0.05) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          opacity: 0.5,
        }}
      />
    </div>
  );
}
