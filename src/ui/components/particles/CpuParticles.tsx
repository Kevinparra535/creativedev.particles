import * as React from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";

type Props = {
  count?: number;
  radius?: number;
  color?: THREE.ColorRepresentation;
  size?: number;
  attraction?: number;
};

export default function CpuParticles({
  count = 8000,
  radius = 250,
  color = "white",
  size = 2,
  attraction = 0.05,
}: Readonly<Props>) {
  const positions = React.useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = Math.cbrt(Math.random()) * radius;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      arr[i * 3 + 0] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
    return arr;
  }, [count, radius]);

  const geomRef = React.useRef<THREE.BufferGeometry | null>(null);
  const matRef = React.useRef<THREE.PointsMaterial | null>(null);
  const pointsRef = React.useRef<THREE.Points | null>(null);

  const { camera } = useThree();
  const mouse3d = React.useRef(new THREE.Vector3());
  const planeZ = React.useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
    []
  );
  const raycaster = React.useMemo(() => new THREE.Raycaster(), []);

  useFrame(({ pointer }) => {
    const ndc = new THREE.Vector2(pointer.x, pointer.y);
    raycaster.setFromCamera(ndc, camera);
    const hit = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(planeZ, hit)) {
      mouse3d.current.copy(hit);
    }
  });

  useFrame((_, dt) => {
    const g = geomRef.current;
    if (!g) return;
    const pos = g.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const p = new THREE.Vector3(pos[ix], pos[ix + 1], pos[ix + 2]);
      const toMouse = mouse3d.current.clone().sub(p);
      const d = toMouse.length() + 1e-6;
      toMouse.multiplyScalar((attraction * dt) / Math.max(1, d * 0.02));
      p.add(toMouse);
      pos[ix] = p.x;
      pos[ix + 1] = p.y;
      pos[ix + 2] = p.z;
    }
    g.attributes.position.needsUpdate = true;
  });

  return (
    <points
      ref={pointsRef as React.RefObject<THREE.Points>}
      castShadow
      receiveShadow
    >
      <bufferGeometry ref={geomRef as React.RefObject<THREE.BufferGeometry>}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef as React.RefObject<THREE.PointsMaterial>}
        color={color}
        size={size}
        sizeAttenuation
        transparent={false}
        depthWrite
        depthTest
        blending={THREE.NoBlending}
      />
    </points>
  );
}
