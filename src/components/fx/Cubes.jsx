import { useCallback, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';

/**
 * Cubes — an interactive 3D cube grid that tilts toward the pointer.
 * Auto-animates a slow sweep when idle.
 */
const Cubes = ({
  gridSize = 10,
  maxAngle = 45,
  radius = 3,
  easing = 'power3.out',
  duration = { enter: 0.3, leave: 0.6 },
  borderStyle = '1px solid rgba(255,255,255,0.12)',
  faceColor = 'rgba(8,20,16,0.7)',
  autoAnimate = true,
  rippleOnClick = true,
  rippleColor = '#E8459B',
  rippleSpeed = 2,
  className = '',
}) => {
  const sceneRef = useRef(null);
  const rafRef = useRef(null);
  const idleTimerRef = useRef(null);
  const userActiveRef = useRef(false);
  const simPosRef = useRef({ x: 0, y: 0 });
  const simTargetRef = useRef({ x: 0, y: 0 });
  const simRAFRef = useRef(null);

  const enterDur = duration.enter;
  const leaveDur = duration.leave;

  const tiltAt = useCallback((rowCenter, colCenter) => {
    if (!sceneRef.current) return;
    sceneRef.current.querySelectorAll('.cube').forEach(cube => {
      const r = +cube.dataset.row;
      const c = +cube.dataset.col;
      const dist = Math.hypot(r - rowCenter, c - colCenter);
      if (dist <= radius) {
        const pct = 1 - dist / radius;
        const angle = pct * maxAngle;
        gsap.to(cube, { duration: enterDur, ease: easing, overwrite: true, rotateX: -angle, rotateY: angle });
      } else {
        gsap.to(cube, { duration: leaveDur, ease: 'power3.out', overwrite: true, rotateX: 0, rotateY: 0 });
      }
    });
  }, [radius, maxAngle, enterDur, leaveDur, easing]);

  const resetAll = useCallback(() => {
    if (!sceneRef.current) return;
    sceneRef.current.querySelectorAll('.cube').forEach(cube =>
      gsap.to(cube, { duration: leaveDur, rotateX: 0, rotateY: 0, ease: 'power3.out' })
    );
  }, [leaveDur]);

  const onPointerMove = useCallback(e => {
    userActiveRef.current = true;
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    const rect = sceneRef.current.getBoundingClientRect();
    const colCenter = (e.clientX - rect.left) / (rect.width / gridSize);
    const rowCenter = (e.clientY - rect.top) / (rect.height / gridSize);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => tiltAt(rowCenter, colCenter));
    idleTimerRef.current = setTimeout(() => { userActiveRef.current = false; }, 3000);
  }, [gridSize, tiltAt]);

  const onClick = useCallback(e => {
    if (!rippleOnClick || !sceneRef.current) return;
    const rect = sceneRef.current.getBoundingClientRect();
    const cellW = rect.width / gridSize;
    const cellH = rect.height / gridSize;
    const colHit = Math.floor((e.clientX - rect.left) / cellW);
    const rowHit = Math.floor((e.clientY - rect.top) / cellH);
    const spreadDelay = 0.15 / rippleSpeed;
    const animDuration = 0.3 / rippleSpeed;
    const holdTime = 0.6 / rippleSpeed;

    const rings = {};
    sceneRef.current.querySelectorAll('.cube').forEach(cube => {
      const r = +cube.dataset.row;
      const c = +cube.dataset.col;
      const ring = Math.round(Math.hypot(r - rowHit, c - colHit));
      if (!rings[ring]) rings[ring] = [];
      rings[ring].push(cube);
    });

    Object.keys(rings).map(Number).sort((a, b) => a - b).forEach(ring => {
      const delay = ring * spreadDelay;
      const faces = rings[ring].flatMap(cube => [...cube.querySelectorAll('.cube-face')]);
      gsap.to(faces, { backgroundColor: rippleColor, duration: animDuration, delay, ease: 'power3.out' });
      gsap.to(faces, { backgroundColor: faceColor, duration: animDuration, delay: delay + animDuration + holdTime, ease: 'power3.out' });
    });
  }, [rippleOnClick, gridSize, faceColor, rippleColor, rippleSpeed]);

  // Auto-animate slow sweep when idle
  useEffect(() => {
    if (!autoAnimate || !sceneRef.current) return;
    simPosRef.current = { x: Math.random() * gridSize, y: Math.random() * gridSize };
    simTargetRef.current = { x: Math.random() * gridSize, y: Math.random() * gridSize };
    const speed = 0.018;
    const loop = () => {
      if (!userActiveRef.current) {
        const pos = simPosRef.current;
        const tgt = simTargetRef.current;
        pos.x += (tgt.x - pos.x) * speed;
        pos.y += (tgt.y - pos.y) * speed;
        tiltAt(pos.y, pos.x);
        if (Math.hypot(pos.x - tgt.x, pos.y - tgt.y) < 0.1) {
          simTargetRef.current = { x: Math.random() * gridSize, y: Math.random() * gridSize };
        }
      }
      simRAFRef.current = requestAnimationFrame(loop);
    };
    simRAFRef.current = requestAnimationFrame(loop);
    return () => { if (simRAFRef.current != null) cancelAnimationFrame(simRAFRef.current); };
  }, [autoAnimate, gridSize, tiltAt]);

  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerleave', resetAll);
    el.addEventListener('click', onClick);
    return () => {
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerleave', resetAll);
      el.removeEventListener('click', onClick);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [onPointerMove, resetAll, onClick]);

  const cells = Array.from({ length: gridSize });

  return (
    <div
      className={className}
      style={{
        '--cube-face-border': borderStyle,
        '--cube-face-bg': faceColor,
        width: '100%',
        height: '100%',
      }}
    >
      <div
        ref={sceneRef}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          width: '100%',
          height: '100%',
          perspective: '99999999px',
          gap: '4px',
        }}
      >
        {cells.map((_, r) =>
          cells.map((__, c) => (
            <div key={`${r}-${c}`} className="cube" data-row={r} data-col={c}
              style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', aspectRatio: '1/1' }}
            >
              {['top','bottom','left','right','front','back'].map(face => (
                <div key={face} className={`cube-face cube-face--${face}`}
                  style={{
                    position: 'absolute', width: '100%', height: '100%',
                    background: 'var(--cube-face-bg)',
                    border: 'var(--cube-face-border)',
                    transform: face === 'top' ? 'translateY(-50%) rotateX(90deg)'
                      : face === 'bottom' ? 'translateY(50%) rotateX(-90deg)'
                      : face === 'left' ? 'translateX(-50%) rotateY(-90deg)'
                      : face === 'right' ? 'translateX(50%) rotateY(90deg)'
                      : 'rotateY(-90deg) translateX(50%) rotateY(90deg)',
                  }}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Cubes;
