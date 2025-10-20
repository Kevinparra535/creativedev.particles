import * as THREE from "three";

export default function Floor() {
  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow position={[0, -120, 0]}>
      <planeGeometry args={[4000, 4000, 1, 1]} />
      <meshStandardMaterial color={new THREE.Color(0x0a0a12)} roughness={1} metalness={0} />
    </mesh>
  );
}
