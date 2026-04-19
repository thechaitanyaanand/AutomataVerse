import { useCallback, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import './TargetCursor.css';

/**
 * TargetCursor — a spinning crosshair cursor that snaps to hover targets.
 *
 * Usage: mount once at root; add class `cursor-target` (or custom selector)
 * to any element you want the cursor to "lock onto".
 */
const TargetCursor = ({
  targetSelector = '.cursor-target',
  spinDuration = 2,
  hideDefaultCursor = true,
}) => {
  const cursorRef = useRef(null);
  const cornersRef = useRef(null);
  const spinTl = useRef(null);
  const dotRef = useRef(null);
  const activeStrengthRef = useRef(0);
  const targetCornerPositionsRef = useRef(null);
  const tickerFnRef = useRef(null);

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  const constants = useMemo(() => ({ borderWidth: 3, cornerSize: 12 }), []);

  const moveCursor = useCallback((x, y) => {
    if (!cursorRef.current) return;
    gsap.to(cursorRef.current, { x, y, duration: 0.1, ease: 'power3.out' });
  }, []);

  useEffect(() => {
    if (isMobile || !cursorRef.current) return;

    const originalCursor = document.body.style.cursor;
    if (hideDefaultCursor) document.body.style.cursor = 'none';

    const cursor = cursorRef.current;
    cornersRef.current = cursor.querySelectorAll('.tc-corner');

    let activeTarget = null;
    let currentLeaveHandler = null;
    let resumeTimeout = null;

    gsap.set(cursor, { xPercent: -50, yPercent: -50, x: window.innerWidth / 2, y: window.innerHeight / 2 });

    const createSpin = () => {
      spinTl.current?.kill();
      spinTl.current = gsap.timeline({ repeat: -1 })
        .to(cursor, { rotation: '+=360', duration: spinDuration, ease: 'none' });
    };
    createSpin();

    const tickerFn = () => {
      if (!targetCornerPositionsRef.current || !cursorRef.current || !cornersRef.current) return;
      const strength = activeStrengthRef.current;
      if (strength === 0) return;
      const curX = gsap.getProperty(cursorRef.current, 'x');
      const curY = gsap.getProperty(cursorRef.current, 'y');
      Array.from(cornersRef.current).forEach((corner, i) => {
        const cx = gsap.getProperty(corner, 'x');
        const cy = gsap.getProperty(corner, 'y');
        const tx = targetCornerPositionsRef.current[i].x - curX;
        const ty = targetCornerPositionsRef.current[i].y - curY;
        gsap.to(corner, { x: cx + (tx - cx) * strength, y: cy + (ty - cy) * strength, duration: 0.05, overwrite: 'auto' });
      });
    };
    tickerFnRef.current = tickerFn;

    const moveHandler = e => moveCursor(e.clientX, e.clientY);
    window.addEventListener('mousemove', moveHandler);

    const mouseDownHandler = () => {
      gsap.to(dotRef.current, { scale: 0.7, duration: 0.2 });
      gsap.to(cursor, { scale: 0.9, duration: 0.15 });
    };
    const mouseUpHandler = () => {
      gsap.to(dotRef.current, { scale: 1, duration: 0.2 });
      gsap.to(cursor, { scale: 1, duration: 0.15 });
    };
    window.addEventListener('mousedown', mouseDownHandler);
    window.addEventListener('mouseup', mouseUpHandler);

    const enterHandler = e => {
      let current = e.target;
      let target = null;
      while (current && current !== document.body) {
        if (current.matches(targetSelector)) { target = current; break; }
        current = current.parentElement;
      }
      if (!target || activeTarget === target) return;
      if (activeTarget && currentLeaveHandler) { activeTarget.removeEventListener('mouseleave', currentLeaveHandler); }
      if (resumeTimeout) { clearTimeout(resumeTimeout); resumeTimeout = null; }

      activeTarget = target;
      const corners = Array.from(cornersRef.current);
      corners.forEach(c => gsap.killTweensOf(c));
      gsap.killTweensOf(cursor, 'rotation');
      spinTl.current?.pause();
      gsap.set(cursor, { rotation: 0 });

      const rect = target.getBoundingClientRect();
      const { borderWidth, cornerSize } = constants;
      const curX = gsap.getProperty(cursor, 'x');
      const curY = gsap.getProperty(cursor, 'y');

      targetCornerPositionsRef.current = [
        { x: rect.left - borderWidth, y: rect.top - borderWidth },
        { x: rect.right + borderWidth - cornerSize, y: rect.top - borderWidth },
        { x: rect.right + borderWidth - cornerSize, y: rect.bottom + borderWidth - cornerSize },
        { x: rect.left - borderWidth, y: rect.bottom + borderWidth - cornerSize },
      ];

      gsap.to(activeStrengthRef, { current: 1, duration: 0.2, ease: 'power2.out' });
      gsap.ticker.add(tickerFnRef.current);

      corners.forEach((corner, i) => {
        gsap.to(corner, { x: targetCornerPositionsRef.current[i].x - curX, y: targetCornerPositionsRef.current[i].y - curY, duration: 0.2, ease: 'power2.out' });
      });

      const leaveHandler = () => {
        gsap.ticker.remove(tickerFnRef.current);
        gsap.set(activeStrengthRef, { current: 0, overwrite: true });
        activeTarget = null;
        targetCornerPositionsRef.current = null;

        const { cornerSize } = constants;
        const positions = [
          { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
          { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
          { x: cornerSize * 0.5, y: cornerSize * 0.5 },
          { x: -cornerSize * 1.5, y: cornerSize * 0.5 },
        ];
        Array.from(cornersRef.current).forEach((corner, i) => {
          gsap.to(corner, { x: positions[i].x, y: positions[i].y, duration: 0.3, ease: 'power3.out' });
        });

        resumeTimeout = setTimeout(() => {
          if (!activeTarget) createSpin();
          resumeTimeout = null;
        }, 50);

        currentLeaveHandler = null;
      };

      currentLeaveHandler = leaveHandler;
      target.addEventListener('mouseleave', leaveHandler);
    };

    window.addEventListener('mouseover', enterHandler, { passive: true });

    return () => {
      if (tickerFnRef.current) gsap.ticker.remove(tickerFnRef.current);
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseover', enterHandler);
      window.removeEventListener('mousedown', mouseDownHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
      spinTl.current?.kill();
      document.body.style.cursor = originalCursor;
    };
  }, [targetSelector, spinDuration, moveCursor, constants, hideDefaultCursor, isMobile]);

  if (isMobile) return null;

  return (
    <div ref={cursorRef} className="tc-wrapper">
      <div ref={dotRef} className="tc-dot" />
      <div className="tc-corner tc-tl" />
      <div className="tc-corner tc-tr" />
      <div className="tc-corner tc-br" />
      <div className="tc-corner tc-bl" />
    </div>
  );
};

export default TargetCursor;
