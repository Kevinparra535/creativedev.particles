import { useMemo } from "react";
import * as THREE from "three";

export default function Lights() {
  const hemi = useMemo(() => new THREE.Color(0xffffff), []);
  return (
    <>
      <hemisphereLight args={[hemi, new THREE.Color(0x222233), 0.6]} />
      <directionalLight position={[200, 300, 100]} intensity={0.8} castShadow />
      <ambientLight intensity={0.1} />
    </>
  );
}
