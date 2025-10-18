import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import DefaultSettings from "../config/settings.config";

// Global light position for particles distance materials
export const lightPosition = new THREE.Vector3(0, 500, 0);

/**
 * LegacyLights Component
 * Replica exactamente la funcionalidad del legacy lights.js
 * - Ambient light (0x333333)
 * - Point light con shadows (4096x2048)
 * - Directional light 1 (0xba8b8b, warm)
 * - Directional light 2 (0x8bbab4, cool)
 * - Shadow darkness animation
 */
const LegacyLights = () => {
  // Refs para las luces
  const containerRef = useRef<THREE.Group>(null!);
  const pointLightRef = useRef<THREE.PointLight>(null!);
  const shadowDarknessRef = useRef(0.45);

  // Update shadow darkness como legacy
  useFrame(() => {
    if (pointLightRef.current) {
      // Legacy: pointLight.shadowDarkness = _shadowDarkness += (settings.shadowDarkness - _shadowDarkness) * 0.1;
      shadowDarknessRef.current +=
        (DefaultSettings.shadowDarkness - shadowDarknessRef.current) * 0.1;

      // En Three.js moderno, shadowDarkness se maneja diferente
      // Podemos ajustar la intensidad de las luces para simular el efecto
      const darknessFactor = 1 - shadowDarknessRef.current;
      pointLightRef.current.intensity = darknessFactor * 1; // Base intensity = 1
    }
  });

  // Position container like legacy: mesh.position.set(0, 500, 0)
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.position.set(0, 500, 0);
      // Update global light position for particles
      lightPosition.copy(containerRef.current.position);
    }
  }, []);

  return (
    <group ref={containerRef}>
      {/* Legacy: var ambient = new THREE.AmbientLight(0x333333) */}
      <ambientLight color={0x333333} />

      {/* Legacy: pointLight = new THREE.PointLight(0xffffff, 1, 700) */}
      <pointLight
        ref={pointLightRef}
        color={0xffffff}
        intensity={1}
        distance={700}
        castShadow
        shadow-camera-near={10}
        shadow-camera-far={700}
        shadow-bias={0.1}
        shadow-mapSize-width={4096}
        shadow-mapSize-height={2048}
      />

      {/* Legacy: var directionalLight = new THREE.DirectionalLight(0xba8b8b, 0.5) */}
      {/* directionalLight.position.set(1, 1, 1) */}
      <directionalLight color={0xba8b8b} intensity={0.5} position={[1, 1, 1]} />

      {/* Legacy: var directionalLight2 = new THREE.DirectionalLight(0x8bbab4, 0.3) */}
      {/* directionalLight2.position.set(1, 1, -1) */}
      <directionalLight
        color={0x8bbab4}
        intensity={0.3}
        position={[1, 1, -1]}
      />
    </group>
  );
};

export default LegacyLights;
