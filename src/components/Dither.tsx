import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface DitherProps {
  waveColor?: [number, number, number];
  disableAnimation?: boolean;
  enableMouseInteraction?: boolean;
  mouseRadius?: number;
  colorNum?: number;
  waveAmplitude?: number;
  waveFrequency?: number;
  waveSpeed?: number;
}

const vertexShader = `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uAmplitude;
  uniform float uFrequency;
  uniform vec2 uMouse;
  uniform float uMouseRadius;
  uniform bool uInteractionEnabled;

  varying vec2 vUv;
  varying float vElevation;

  // Simple noise function
  float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
  }

  float noise(vec2 p){
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u*u*(3.0-2.0*u);

    float res = mix(
      mix(rand(ip), rand(ip+vec2(1.0,0.0)), u.x),
      mix(rand(ip+vec2(0.0,1.0)), rand(ip+vec2(1.0,1.0)), u.x), u.y);
    return res*res;
  }

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Base wave
    float wave = sin(pos.x * uFrequency + uTime * uSpeed) *
                 cos(pos.y * uFrequency + uTime * uSpeed) * uAmplitude;

    // Noise
    float n = noise(pos.xy * uFrequency + uTime * uSpeed * 0.5) * uAmplitude;

    pos.z += wave + n;

    // Mouse interaction
    if (uInteractionEnabled) {
      float dist = distance(pos.xy, uMouse * 5.0); // Map mouse [-1, 1] to world [-5, 5]
      if (dist < uMouseRadius * 10.0) {
        float influence = smoothstep(uMouseRadius * 10.0, 0.0, dist);
        pos.z += influence * uAmplitude * 2.0;
      }
    }

    vElevation = pos.z;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 uColor;
  uniform float uColorNum;

  varying float vElevation;

  void main() {
    // Map elevation to brightness
    float brightness = 0.5 + vElevation * 0.5;

    // Quantize brightness (Dither/Posterize effect)
    float steps = uColorNum;
    float quantized = floor(brightness * steps) / steps;

    vec3 finalColor = uColor * quantized;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const WaveMesh = ({
  waveColor = [0.5, 0.5, 0.5],
  disableAnimation = false,
  enableMouseInteraction = true,
  mouseRadius = 0.3,
  colorNum = 4,
  waveAmplitude = 0.3,
  waveFrequency = 3,
  waveSpeed = 0.05,
}: DitherProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport, pointer } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Vector3(...waveColor) },
      uSpeed: { value: waveSpeed },
      uAmplitude: { value: waveAmplitude },
      uFrequency: { value: waveFrequency },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uMouseRadius: { value: mouseRadius },
      uInteractionEnabled: { value: enableMouseInteraction },
      uColorNum: { value: colorNum },
    }),
    [waveColor, waveSpeed, waveAmplitude, waveFrequency, mouseRadius, enableMouseInteraction, colorNum]
  );

  useFrame((state) => {
    if (!meshRef.current) return;

    const material = meshRef.current.material as THREE.ShaderMaterial;
    if (!material || !material.uniforms) return;

    // Update time
    if (!disableAnimation) {
      material.uniforms.uTime.value = state.clock.getElapsedTime();
    }

    // Update mouse
    if (enableMouseInteraction) {
      material.uniforms.uMouse.value.set(pointer.x, pointer.y);
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.5, 0, 0]}>
      <planeGeometry args={[10, 10, 128, 128]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        wireframe={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const Dither = (props: DitherProps) => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 2, 4], fov: 45 }}>
        <WaveMesh {...props} />
      </Canvas>
    </div>
  );
};

export default Dither;
