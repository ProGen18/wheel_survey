// SVG components — the visual DNA of the survey
// Use these across the interface: the wheel mark, animated decorations, status icons.

import React from 'react';

export const WheelLogo = ({ size = 42, spinning = false }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" className={spinning ? "spinning-slow" : ""}>
    <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="24" cy="24" r="16" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
    <circle cx="24" cy="24" r="5" fill="var(--ember)" />
    <circle cx="24" cy="24" r="2" fill="var(--paper)" />
    <line x1="24" y1="2" x2="24" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="24" y1="40" x2="24" y2="46" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// The big hero artwork — uses the rendered EUC reference directly
export const HeroWheel = () => (
  <div style={{ width: "100%", height: "100%", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div className="hero-euc-glow" />
    <img src="/assets/euc-hero.png" alt="Gyroroue" className="hero-euc-img" />
    <svg viewBox="0 0 440 440" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} aria-hidden="true">
      {/* Scale indicator underneath */}
      <g fontFamily="var(--f-mono)" fontSize="8" fill="var(--ink-mute)" letterSpacing="1.5">
        <text x="220" y="428" textAnchor="middle">GYROROUE · Ø 16" · 2200 Wh · SCALE 1:3</text>
      </g>
      <g stroke="var(--ink-mute)" strokeWidth="0.5">
        <line x1="70" y1="412" x2="70" y2="420" />
        <line x1="370" y1="412" x2="370" y2="420" />
        <line x1="70" y1="416" x2="370" y2="416" strokeDasharray="2 2" />
      </g>
    </svg>
  </div>
);



// Corner ornament — an abstract sprocket/compass
export const Sprocket = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" className="spinning-r" aria-hidden="true">
    <g stroke="currentColor" fill="none" strokeWidth="0.8">
      <circle cx="30" cy="30" r="20" />
      <circle cx="30" cy="30" r="14" strokeDasharray="1 2" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        return (
          <line key={i}
            x1={30 + Math.cos(a) * 20}
            y1={30 + Math.sin(a) * 20}
            x2={30 + Math.cos(a) * 26}
            y2={30 + Math.sin(a) * 26}
          />
        );
      })}
      <circle cx="30" cy="30" r="2" fill="currentColor" stroke="none" />
    </g>
  </svg>
);

// Section divider — a road with perspective
export const RoadDivider = () => (
  <svg viewBox="0 0 600 60" style={{ width: "100%", height: "40px", opacity: 0.6 }} aria-hidden="true">
    <line x1="0" y1="30" x2="600" y2="30" stroke="var(--rule)" strokeWidth="1" />
    <g stroke="var(--ink-mute)" strokeWidth="1.5">
      {[50, 150, 250, 350, 450, 550].map((x, i) => (
        <line key={i} x1={x} y1="30" x2={x + 30} y2="30" />
      ))}
    </g>
  </svg>
);

// Arrow for buttons
export const Arrow = ({ className = "" }) => (
  <svg viewBox="0 0 16 10" className={`arr ${className}`} aria-hidden="true">
    <path d="M0 5 L14 5 M10 1 L14 5 L10 9" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Tiny icon used in option lists to denote multi-select
const MultiIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
    <rect x="1" y="1" width="4" height="4" stroke="currentColor" strokeWidth="1" fill="none" />
    <rect x="7" y="1" width="4" height="4" stroke="currentColor" strokeWidth="1" fill="none" />
    <rect x="1" y="7" width="4" height="4" stroke="currentColor" strokeWidth="1" fill="none" />
    <rect x="7" y="7" width="4" height="4" fill="currentColor" />
  </svg>
);

// Animated EUC for the end card — rolls, bounces, with motion lines
export const StampMark = () => (
  <div className="animated-euc" aria-hidden="true">
    <img src="/assets/euc-ref.png" alt="Gyroroue électrique" style={{ width: "100%", maxWidth: "180px", height: "auto" }} className="hero-euc-img" />
  </div>
);

// The mascot — used in the interactive ParallaxMascot
export const MascotRider = ({ pose = "euc" }) => {
  // Fallback to euc-cut.png if specific pose assets are not available
  const src = pose === "question" ? "/assets/euc-cut.png"
            : pose === "smile" ? "/assets/euc-cut.png"
            : pose === "thanks" ? "/assets/euc-cut.png"
            : "/assets/euc-cut.png";
            
  return (
    <div className="mascot-img-container">
      <img 
        src={src} 
        alt="Mascot" 
        style={{ width: '100%', height: 'auto', display: 'block' }} 
        loading="eager"
      />
    </div>
  );
};

