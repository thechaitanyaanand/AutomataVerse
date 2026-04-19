import { useEffect, useRef } from 'react';

/**
 * FuzzyText — Canvas-based fuzz/glitch text effect.
 *
 * Props:
 *  children        - the text string to render
 *  fontSize        - CSS font size (string or number in px)
 *  fontWeight      - CSS font weight (number)
 *  fontFamily      - CSS font family
 *  color           - fill color (or use `gradient` array instead)
 *  gradient        - array of color stops e.g. ['#ff6188','#ffd866']
 *  enableHover     - whether to ramp up intensity on hover
 *  baseIntensity   - baseline fuzz amount (0–1)
 *  hoverIntensity  - fuzz amount while hovering (0–1)
 *  fuzzRange       - max pixel offset per row
 *  fps             - render frame rate cap
 *  className       - extra class names for the wrapper
 */
const FuzzyText = ({
  children,
  fontSize = 'clamp(2rem, 10vw, 8rem)',
  fontWeight = 900,
  fontFamily = 'inherit',
  color = '#fff',
  gradient = null,
  enableHover = true,
  baseIntensity = 0.18,
  hoverIntensity = 0.5,
  fuzzRange = 30,
  fps = 60,
  className = '',
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    let rafId;
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const init = async () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const computedFamily =
        fontFamily === 'inherit'
          ? window.getComputedStyle(canvas).fontFamily || 'sans-serif'
          : fontFamily;

      const fontSizeStr = typeof fontSize === 'number' ? `${fontSize}px` : fontSize;
      const fontString = `${fontWeight} ${fontSizeStr} ${computedFamily}`;

      try { await document.fonts.load(fontString); } catch { await document.fonts.ready; }
      if (cancelled) return;

      // Measure numeric font size
      let numFS;
      if (typeof fontSize === 'number') {
        numFS = fontSize;
      } else {
        const t = document.createElement('span');
        t.style.fontSize = fontSize;
        document.body.appendChild(t);
        numFS = parseFloat(window.getComputedStyle(t).fontSize);
        document.body.removeChild(t);
      }

      const text = String(children ?? '');

      // Offscreen canvas with the text
      const off = document.createElement('canvas');
      const offCtx = off.getContext('2d');
      offCtx.font = fontString;
      offCtx.textBaseline = 'alphabetic';

      const m = offCtx.measureText(text);
      const textW = Math.ceil(m.actualBoundingBoxRight ?? m.width);
      const ascent = m.actualBoundingBoxAscent ?? numFS;
      const descent = m.actualBoundingBoxDescent ?? numFS * 0.2;
      const textH = Math.ceil(ascent + descent);

      off.width = textW + 10;
      off.height = textH;

      offCtx.font = fontString;
      offCtx.textBaseline = 'alphabetic';

      if (gradient?.length >= 2) {
        const g = offCtx.createLinearGradient(0, 0, off.width, 0);
        gradient.forEach((c, i) => g.addColorStop(i / (gradient.length - 1), c));
        offCtx.fillStyle = g;
      } else {
        offCtx.fillStyle = color;
      }
      offCtx.fillText(text, 5, ascent);

      const hMargin = fuzzRange + 20;
      canvas.width = off.width + hMargin * 2;
      canvas.height = textH;
      ctx.translate(hMargin, 0);

      const interL = hMargin + 5;
      const interR = interL + textW;

      let isHovering = false;
      let intensity = baseIntensity;
      let targetIntensity = baseIntensity;
      let lastFrame = 0;
      const frameDur = 1000 / fps;

      const run = (ts) => {
        if (cancelled) return;
        if (ts - lastFrame < frameDur) { rafId = requestAnimationFrame(run); return; }
        lastFrame = ts;

        targetIntensity = isHovering ? hoverIntensity : baseIntensity;
        intensity += (targetIntensity - intensity) * 0.12;

        ctx.clearRect(-(fuzzRange + 20), -(fuzzRange + 10), canvas.width + 2 * (fuzzRange + 20), textH + 2 * (fuzzRange + 10));

        for (let j = 0; j < textH; j++) {
          const dx = Math.floor(intensity * (Math.random() - 0.5) * fuzzRange);
          ctx.drawImage(off, 0, j, off.width, 1, dx, j, off.width, 1);
        }

        rafId = requestAnimationFrame(run);
      };

      rafId = requestAnimationFrame(run);

      if (enableHover) {
        const onMove = (e) => {
          const rect = canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          isHovering = x >= interL && x <= interR;
        };
        const onLeave = () => { isHovering = false; };
        canvas.addEventListener('mousemove', onMove);
        canvas.addEventListener('mouseleave', onLeave);
        canvas._fuzzyCleanup = () => {
          canvas.removeEventListener('mousemove', onMove);
          canvas.removeEventListener('mouseleave', onLeave);
        };
      }
    };

    const handleResize = () => {
      // Debounce slightly for performance
      clearTimeout(canvasRef.current?._resT);
      if (canvasRef.current) {
        canvasRef.current._resT = setTimeout(() => {
          if (!cancelled) init();
        }, 150);
      }
    };

    window.addEventListener('resize', handleResize);
    init();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      if (canvasRef.current) {
        clearTimeout(canvasRef.current._resT);
        canvasRef.current._fuzzyCleanup?.();
      }
    };
  }, [children, fontSize, fontWeight, fontFamily, color, gradient, enableHover, baseIntensity, hoverIntensity, fuzzRange, fps]);

  return <canvas ref={canvasRef} className={`fuzzy-text-canvas ${className}`} style={{ display: 'block' }} />;
};

export default FuzzyText;
