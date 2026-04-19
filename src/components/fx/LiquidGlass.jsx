/**
 * LiquidGlass — a pure CSS glassmorphism panel with animated
 * chromatic light refraction and a mouse-tracking shimmer.
 *
 * Usage:
 *   <LiquidGlass className="p-6 rounded-2xl" intensity="normal">
 *     content...
 *   </LiquidGlass>
 *
 * intensity: "subtle" | "normal" | "strong"
 * tint:      "flora" | "emerald" | "gold" | "neutral"
 */
import { useRef, useEffect } from 'react';

const TINTS = {
  flora:   { base: 'rgba(232,69,155,0.08)',   border: 'rgba(232,69,155,0.25)',  glow: '#E8459B' },
  emerald: { base: 'rgba(52,211,153,0.08)',   border: 'rgba(52,211,153,0.25)',  glow: '#34D399' },
  gold:    { base: 'rgba(240,168,48,0.08)',   border: 'rgba(240,168,48,0.25)',  glow: '#F0A830' },
  neutral: { base: 'rgba(255,255,255,0.04)',  border: 'rgba(255,255,255,0.12)', glow: '#ffffff' },
};

const BLUR = {
  subtle: 'blur(8px)',
  normal: 'blur(16px)',
  strong: 'blur(28px)',
};

export default function LiquidGlass({
  children,
  className = '',
  intensity = 'normal',
  tint = 'neutral',
  rounded = '1rem',
  disableMouseTrack = false,
  style = {},
}) {
  const ref = useRef(null);
  const { base, border, glow } = TINTS[tint] || TINTS.neutral;
  const blur = BLUR[intensity] || BLUR.normal;

  // Mouse-tracking highlight spot
  useEffect(() => {
    if (disableMouseTrack || !ref.current) return;
    const el = ref.current;

    const onMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--lg-x', `${x}%`);
      el.style.setProperty('--lg-y', `${y}%`);
    };
    const onMouseLeave = () => {
      el.style.setProperty('--lg-x', '50%');
      el.style.setProperty('--lg-y', '50%');
    };

    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);
    return () => {
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [disableMouseTrack]);

  return (
    <div
      ref={ref}
      className={`liquid-glass-root ${className}`}
      style={{
        '--lg-base': base,
        '--lg-border': border,
        '--lg-glow': glow,
        '--lg-blur': blur,
        '--lg-radius': rounded,
        '--lg-x': '50%',
        '--lg-y': '50%',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
