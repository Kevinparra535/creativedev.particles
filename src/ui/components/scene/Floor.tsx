import * as THREE from "three";

export default function Floor() {
  return (
    // x,y,z
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -450, -0]}>
      <planeGeometry args={[8000, 8000, 1, 1]} />
      <meshStandardMaterial color={new THREE.Color(0x0a0a12)} roughness={1} metalness={0} />
    </mesh>
  );
}
