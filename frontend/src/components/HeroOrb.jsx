import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Sphere, Float } from "@react-three/drei";

function OrbCore() {
  const core = useRef();
  useFrame((state) => {
    if (core.current) {
      core.current.rotation.x = state.clock.getElapsedTime() * 0.5;
      core.current.rotation.y = state.clock.getElapsedTime() * 0.8;
    }
  });
  return (
    <mesh ref={core} scale={0.5}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#d4af37" wireframe emissive="#d4af37" emissiveIntensity={0.8} />
    </mesh>
  );
}

function GlassOrb() {
  return (
    <Float floatIntensity={2} speed={2}>
      <Sphere args={[1, 64, 64]} scale={1.2}>
        <MeshTransmissionMaterial
          backside
          backsideThickness={0.1}
          thickness={0.5}
          chromaticAberration={0.03}
          transmission={1}
          roughness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.1}
          color="#152A45"
          ior={1.5}
        />
      </Sphere>
      <OrbCore />
    </Float>
  );
}

export default function HeroOrb() {
  return (
    <div className="hero-orb-container" style={{ width: "160px", height: "160px", margin: "0 auto 1.5rem auto", opacity: 0.9 }}>
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={3} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={2} color="#245B8F" />
        <GlassOrb />
      </Canvas>
    </div>
  );
}
