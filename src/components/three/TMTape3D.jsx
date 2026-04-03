import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Text, Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

function Cell({ position, symbol, isHead, blankSymbol }) {
  const groupRef = useRef();
  
  const targetScale = isHead ? 1.2 : 1;
  const targetY = isHead ? 0.3 : 0;
  const color = isHead ? '#E8459B' : (symbol === blankSymbol ? '#0C1E14' : '#1A3828');
  const textColor = isHead ? '#F0FFF4' : (symbol === blankSymbol ? '#4A6B55' : '#94B8A0');
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, targetY, 4, delta);
      const currentScale = groupRef.current.scale.x;
      const nextScale = THREE.MathUtils.damp(currentScale, targetScale, 4, delta);
      groupRef.current.scale.set(nextScale, nextScale, nextScale);
    }
  });

  return (
    <group ref={groupRef} position={[position * 2.2, 0, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 2, 0.4]} />
        <meshPhysicalMaterial 
          color={color} 
          roughness={0.2} 
          metalness={0.1}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
          emissive={isHead ? '#E8459B' : '#000000'}
          emissiveIntensity={isHead ? 0.5 : 0}
        />
      </mesh>
      
      <Text
        position={[0, 0, 0.22]}
        fontSize={1}
        color={textColor}
        anchorX="center"
        anchorY="middle"
      >
        {symbol === blankSymbol ? '␣' : symbol}
      </Text>
      
      {/* Tape Index */}
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.4}
        color="#4A6B55"
        anchorX="center"
        anchorY="middle"
      >
        {position}
      </Text>
      
      {/* Head Indicator Beam */}
      {isHead && (
        <mesh position={[0, 1.8, 0]}>
          <coneGeometry args={[0.4, 0.8, 4]} />
          <meshBasicMaterial color="#F0A830" wireframe opacity={0.6} transparent />
        </mesh>
      )}
    </group>
  );
}

function Scene({ tape, headPosition, blankSymbol }) {
  const groupRef = useRef();
  
  // Smoothly pan the camera/group to keep the head centered
  useFrame((state, delta) => {
    const targetX = -headPosition * 2.2;
    groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, targetX, 4, delta);
  });

  const cells = useMemo(() => {
    const allPositions = [...tape.keys(), headPosition];
    const minPos = Math.min(...allPositions, headPosition - 6);
    const maxPos = Math.max(...allPositions, headPosition + 6);
    
    const elements = [];
    for (let i = minPos; i <= maxPos; i++) {
      elements.push(
        <Cell 
          key={i} 
          position={i} 
          symbol={tape.get(i) ?? blankSymbol} 
          isHead={i === headPosition} 
          blankSymbol={blankSymbol}
        />
      );
    }
    return elements;
  }, [tape, headPosition, blankSymbol]);

  return (
    <group ref={groupRef}>
      {cells}
    </group>
  );
}

export default function TMTape3D({ tape = new Map(), headPosition = 0, blankSymbol = '_' }) {
  return (
    <div className="w-full h-[240px] rounded-2xl bg-black/40 overflow-hidden shadow-inner border border-white/5 relative">
      <Canvas 
        camera={{ position: [0, 2, 8], fov: 35 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight castShadow position={[5, 10, 5]} intensity={1.5} color="#E8459B" />
        <directionalLight position={[-5, 5, -5]} intensity={1} color="#34D399" />
        
        <Suspense fallback={null}>
          <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
            <Scene tape={tape} headPosition={headPosition} blankSymbol={blankSymbol} />
          </Float>
          
          <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={20} blur={2} far={4} color="#E8459B" />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
