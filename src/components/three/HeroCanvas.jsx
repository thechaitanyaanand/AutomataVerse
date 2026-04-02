import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Float, AdaptiveDpr, AdaptiveEvents, MeshDistortMaterial, Torus } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Floating Petal Particles ─── */
function PetalField({ count = 800 }) {
  const ref = useRef();

  const { positions, colors, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const palette = [
      new THREE.Color('#E8459B'), // pink
      new THREE.Color('#F584BF'), // light pink
      new THREE.Color('#F0A830'), // gold
      new THREE.Color('#34D399'), // emerald
      new THREE.Color('#6EE7B7'), // light green
      new THREE.Color('#FBBF24'), // warm yellow
    ];
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2 + Math.random() * 6;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      sz[i] = 0.02 + Math.random() * 0.06;
    }
    return { positions: pos, colors: col, sizes: sz };
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.015;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ─── Organic Bloom (distorted sphere looks like a flower) ─── */
function FloralBloom({ position, color = '#E8459B', scale = 1 }) {
  const ref = useRef();
  const speed = useMemo(() => 0.3 + Math.random() * 0.4, []);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed + offset) * 0.4;
      ref.current.rotation.y = state.clock.elapsedTime * 0.2;
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3 + offset) * 0.1;
    }
  });

  return (
    <group ref={ref} position={position}>
      <mesh scale={scale}>
        <icosahedronGeometry args={[0.35, 4]} />
        <MeshDistortMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.35}
          transparent
          opacity={0.85}
          roughness={0.2}
          metalness={0.1}
          distort={0.45}
          speed={2}
        />
      </mesh>
      {/* Inner glow sphere */}
      <mesh scale={scale * 0.5}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color="#FBBF24"
          emissive="#FBBF24"
          emissiveIntensity={0.8}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}

/* ─── Vine-like connections ─── */
function VineLine({ from, to, color = '#34D399' }) {
  const ref = useRef();

  const { curve, geometry } = useMemo(() => {
    const mid = [
      (from[0] + to[0]) / 2 + (Math.random() - 0.5) * 1.5,
      (from[1] + to[1]) / 2 + 0.8 + Math.random() * 0.5,
      (from[2] + to[2]) / 2 + (Math.random() - 0.5) * 0.5,
    ];
    const c = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...from),
      new THREE.Vector3(...mid),
      new THREE.Vector3(...to)
    );
    const pts = c.getPoints(40);
    return { curve: c, geometry: new THREE.BufferGeometry().setFromPoints(pts) };
  }, [from, to]);

  useFrame((state) => {
    if (ref.current?.material) {
      ref.current.material.dashOffset = -state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <line ref={ref} geometry={geometry}>
      <lineDashedMaterial
        color={color}
        dashSize={0.2}
        gapSize={0.12}
        transparent
        opacity={0.4}
        linewidth={1}
      />
    </line>
  );
}

/* ─── Firefly lights ─── */
function Firefly({ position, color = '#FBBF24' }) {
  const ref = useRef();
  const speed = useMemo(() => 0.5 + Math.random() * 1, []);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);
  const radius = useMemo(() => 0.5 + Math.random() * 1.5, []);

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime * speed + offset;
      ref.current.position.x = position[0] + Math.sin(t) * radius;
      ref.current.position.y = position[1] + Math.cos(t * 0.7) * 0.5;
      ref.current.position.z = position[2] + Math.cos(t) * radius * 0.5;
      // Pulse intensity
      ref.current.children[0].material.emissiveIntensity = 0.5 + Math.sin(t * 2) * 0.5;
    }
  });

  return (
    <group ref={ref} position={position}>
      <mesh>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}

/* ─── Orbital Ring (represents automaton transitions) ─── */
function OrbitalRing({ radius = 2, color = '#34D399', tilt = 0 }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = tilt;
      ref.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
  });

  return (
    <group ref={ref}>
      <Torus args={[radius, 0.008, 8, 80]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.3}
        />
      </Torus>
    </group>
  );
}

/* ─── Main Scene ─── */
function ForestScene() {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      const mx = state.pointer.x * 0.06;
      const my = state.pointer.y * 0.04;
      groupRef.current.rotation.y += (mx - groupRef.current.rotation.y) * 0.03;
      groupRef.current.rotation.x += (-my - groupRef.current.rotation.x) * 0.03;
    }
  });

  const blooms = useMemo(() => [
    { pos: [-2.5, 1.5, 0], color: '#E8459B', scale: 1.1 },
    { pos: [0, 2.5, -1], color: '#F584BF', scale: 0.9 },
    { pos: [2, 1, 0.5], color: '#F0A830', scale: 1.0 },
    { pos: [3, -0.5, -0.5], color: '#E8459B', scale: 0.8 },
    { pos: [-1.5, -1, 0.8], color: '#FBBF24', scale: 0.7 },
    { pos: [0.5, -2, -0.3], color: '#F584BF', scale: 1.0 },
    { pos: [-3, 0, -0.5], color: '#34D399', scale: 0.9 },
    { pos: [1.5, 0, 1], color: '#6EE7B7', scale: 0.8 },
  ], []);

  const edges = useMemo(() => [
    [0, 1], [1, 2], [2, 3], [0, 6], [4, 5], [6, 4], [7, 2], [5, 7],
  ], []);

  const fireflies = useMemo(() =>
    Array.from({ length: 15 }, () => ({
      pos: [(Math.random() - 0.5) * 8, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4],
      color: Math.random() > 0.5 ? '#FBBF24' : '#6EE7B7',
    })),
  []);

  return (
    <group ref={groupRef}>
      {/* Ambient forest light */}
      <ambientLight intensity={0.2} color="#1a3c2a" />
      <pointLight position={[4, 4, 4]} intensity={1.2} color="#E8459B" distance={15} />
      <pointLight position={[-4, -2, 3]} intensity={0.8} color="#34D399" distance={12} />
      <pointLight position={[0, 3, -2]} intensity={0.6} color="#F0A830" distance={10} />

      {/* Floral blooms (DFA states) */}
      {blooms.map((b, i) => (
        <FloralBloom key={i} position={b.pos} color={b.color} scale={b.scale} />
      ))}

      {/* Vine connections (transitions) */}
      {edges.map(([a, b], i) => (
        <VineLine
          key={i}
          from={blooms[a].pos}
          to={blooms[b].pos}
          color={i % 2 === 0 ? '#34D399' : '#6EE7B7'}
        />
      ))}

      {/* Fireflies */}
      {fireflies.map((f, i) => (
        <Firefly key={i} position={f.pos} color={f.color} />
      ))}

      {/* Orbital rings */}
      <OrbitalRing radius={3.5} color="#E8459B" tilt={0.3} />
      <OrbitalRing radius={4.5} color="#34D399" tilt={-0.5} />
      <OrbitalRing radius={2.5} color="#F0A830" tilt={0.8} />

      {/* Petal particle field */}
      <PetalField count={800} />
    </group>
  );
}

export default function HeroCanvas() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        <fog attach="fog" args={['#040A06', 8, 20]} />
        <ForestScene />
      </Canvas>
    </div>
  );
}
