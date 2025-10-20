import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useSceneSettings } from "../../hooks/useSceneSettings";

/**
 * Legacy-aligned lights setup
 * - Group at (0, 500, 0)
 * - Ambient 0x333333
 * - PointLight (shadow caster) with distance 700
 * - Two directional lights with legacy colors/intensities
 *
 * Note: three.js no longer supports pointLight.shadowDarkness; we approximate
 *       perceived "shadow darkness" by adjusting ambient intensity smoothly.
 */
export default function Lights() {
  const s = useSceneSettings();
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const smoothRef = useRef<number>(s.shadowDarkness);

  // Smoothly approach target shadowDarkness like legacy update()
  useFrame(() => {
    smoothRef.current += (s.shadowDarkness - smoothRef.current) * 0.1;
    // Map to ambient intensity: higher shadowDarkness => lower ambient
    const amb = THREE.MathUtils.lerp(1.0, 0.15, smoothRef.current);
    if (ambientRef.current) ambientRef.current.intensity = amb;
  });

  // Ensure a sane default on mount
  useEffect(() => {
    if (ambientRef.current) ambientRef.current.intensity = 1.0;
  }, []);

  return (
    <group position={[0, 500, 0]}>
      {/* Ambient 0x333333 (legacy had no intensity param; using 1 as base) */}
      <ambientLight ref={ambientRef} color={0x333333} intensity={1} />

      {/* Shadow-casting point light matching legacy params */}
      <pointLight
        color={0xffffff}
        intensity={1}
        distance={700}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0005}
        shadow-camera-near={10}
        shadow-camera-far={700}
        shadow-normalBias={0.05}
      />

      {/* Directional lights with legacy tints */}
      <directionalLight color={0xba8b8b} intensity={0.5} position={[1, 1, 1]} />
      <directionalLight
        color={0x8bbab4}
        intensity={0.3}
        position={[1, 1, -1]}
      />
    </group>
  );
}
