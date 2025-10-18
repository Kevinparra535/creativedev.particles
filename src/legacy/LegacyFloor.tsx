import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import DefaultSettings from "../config/settings.config";
import { useRef } from "react";

/**
 * LegacyFloor Component
 * Replica exactamente la funcionalidad del legacy floor.js
 * - PlaneGeometry 4000x4000 con 10x10 segments
 * - MeshStandardMaterial con roughness 0.7, metalness 1.0
 * - Color animation que sigue bgColor con lerp
 * - Receives shadows
 * - Position y = -100 (como en index.js legacy)
 */
const LegacyFloor = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const tmpColor = useRef(new THREE.Color());

  // Legacy: tmpColor.lerp(_bgColor, 0.05);
  useFrame(() => {
    if (meshRef.current && meshRef.current.material) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      tmpColor.current.setStyle(DefaultSettings.bgColor);
      material.color.lerp(tmpColor.current, 0.05);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, -100, 0]}
      rotation={[-Math.PI / 2, 0, 0]} // Legacy: floor.rotation.x = -1.57
      receiveShadow
    >
      {/* Legacy: new THREE.PlaneGeometry(4000, 4000, 10, 10) */}
      <planeGeometry args={[4000, 4000, 10, 10]} />

      {/* Legacy: MeshStandardMaterial with roughness: 0.7, metalness: 1.0, color: 0x333333 */}
      <meshStandardMaterial
        roughness={0.7}
        metalness={1.0}
        color={0x333333}
        emissive={0x000000}
      />
    </mesh>
  );
};

export default LegacyFloor;
