import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function Bubble({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.5;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={1}
    >
      <Sphere args={[1, 32, 32]}>
        <MeshDistortMaterial
          color="#FF3366"
          attach="material"
          distort={0.6}
          speed={3}
          transparent
          opacity={0.2}
        />
      </Sphere>
    </mesh>
  );
}

export function WaterBubbles() {
  const bubblePositions: [number, number, number][] = [
    [-4, -2, -5],
    [4, 2, -10],
    [-2, 4, -8],
    [3, -3, -12],
    [-5, 1, -15],
    [5, -1, -7],
    [0, 3, -9],
    [-3, -4, -11],
    [2, 5, -6],
    [-1, -5, -13],
  ];

  return (
    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#0A0F1C] via-[#1A1F2C] to-[#2A2F3C]">
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        {bubblePositions.map((position, index) => (
          <Bubble key={index} position={position} />
        ))}
      </Canvas>
    </div>
  );
}