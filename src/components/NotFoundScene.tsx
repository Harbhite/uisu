import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { AsciiRenderer, useTexture, Float } from '@react-three/drei'
import * as THREE from 'three'

function LogoCube() {
  // Use the logo as a texture for the cube
  const texture = useTexture('/uisu-logo.png')
  const meshRef = useRef<THREE.Mesh>(null)

  // Rotate the cube
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2
      meshRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[3, 3, 3]} />
      <meshStandardMaterial map={texture} color="white" roughness={0.5} />
    </mesh>
  )
}

export default function NotFoundScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas>
        <color attach="background" args={['#000510']} />

        {/* Lighting to ensure the ASCII renderer picks up shapes */}
        <ambientLight intensity={1} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={5} />
        <pointLight position={[-10, -10, -10]} intensity={5} />

        {/* Floating Container for the Logo - Only the logo as requested */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <LogoCube />
        </Float>

        {/* The ASCII Effect */}
        {/* fgColor: Blue (#3B82F6 is Tailwind blue-500, visible on dark), bgColor: Dark */}
        <AsciiRenderer
          fgColor="#3B82F6"
          bgColor="#000510"
          characters=" .:-+*=%@#"
          invert={false}
          resolution={0.2}
        />
      </Canvas>
    </div>
  )
}
