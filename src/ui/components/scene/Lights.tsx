import { useMemo } from "react";
import * as THREE from "three";
import { useSceneSettings } from "../../hooks/useSceneSettings";

export default function Lights() {
  const s = useSceneSettings();
  const hemi = useMemo(() => new THREE.Color(0xffffff), []);
  const dirIntensity = 0.4 + 0.8 * s.shadowDarkness;
  const ambIntensity = 0.05 + 0.25 * (1 - s.shadowDarkness);
  return (
    <>
      <hemisphereLight args={[hemi, new THREE.Color(0x222233), 0.6]} />
      <directionalLight position={[200, 300, 100]} intensity={dirIntensity} castShadow />
      <ambientLight intensity={ambIntensity} />
    </>
  );
}
