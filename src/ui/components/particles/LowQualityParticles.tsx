import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { spiritParticlesFragment } from "../../../materials/spiritParticlesFragment";
import { spiritParticlesVertex } from "../../../materials/spiritParticlesVertex";

export type LowQualityParticlesProps = {
  count?: number;
  radius?: number;
  pointSize?: number;
  attract?: number;
  falloff?: number;
};

const LowQualityParticles = ({
  count: countProp,
  radius: radiusProp,
  pointSize: pointSizeProp,
  attract: attractProp,
  falloff: falloffProp,
}: LowQualityParticlesProps) => {
  const pointsRef = useRef<THREE.Points>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const { camera } = useThree();

  const count = countProp ?? 10000;
  const radius = radiusProp ?? 2;
  const pointSize = pointSizeProp ?? 8;
  const attract = attractProp ?? 0.02;
  const falloff = falloffProp ?? 1.5;

  // Positions in a sphere for nice distribution
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const d = Math.sqrt(Math.random()) * radius;
      const theta = THREE.MathUtils.randFloatSpread(Math.PI * 2);
      const phi = THREE.MathUtils.randFloatSpread(Math.PI * 2);
      const x = d * Math.sin(theta) * Math.cos(phi);
      const y = d * Math.sin(theta) * Math.sin(phi);
      const z = d * Math.cos(theta);
      arr.set([x, y, z], i * 3);
    }
    return arr;
  }, [count, radius]);

  // Uniforms shared with shaders
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRadius: { value: radius },
      uMouse: { value: new THREE.Vector2(0, 0) }, // world XY
      uAttract: { value: attract },
      uPointSize: { value: pointSize },
      uFalloff: { value: falloff },
    }),
    [radius, attract, pointSize, falloff]
  );

  // Recompute uniforms that are controlled
  if (materialRef.current) {
    materialRef.current.uniforms.uRadius.value = radius;
    materialRef.current.uniforms.uAttract.value = attract;
    materialRef.current.uniforms.uPointSize.value = pointSize;
    materialRef.current.uniforms.uFalloff.value = falloff;
  }

  // Raycaster setup: project mouse to a plane aligned with camera forward, through world origin
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(), []);
  const planeNormal = useMemo(() => new THREE.Vector3(), []);
  const planePoint = useMemo(() => new THREE.Vector3(0, 0, 0), []); // origin (particles center)
  const intersectPoint = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const { clock, pointer } = state;
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;

      // Update plane to face camera and pass through origin for intuitive picking
      camera.getWorldDirection(planeNormal);
      plane.setFromNormalAndCoplanarPoint(planeNormal, planePoint);

      // Project pointer (NDC) to world-space on view-aligned plane
      raycaster.setFromCamera(pointer, camera);
      if (raycaster.ray.intersectPlane(plane, intersectPoint)) {
        const m = materialRef.current.uniforms.uMouse.value as THREE.Vector2;
        m.set(intersectPoint.x, intersectPoint.y);
      }
    }
  });

  return (
    <points ref={pointsRef} key={count}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        fragmentShader={spiritParticlesFragment}
        vertexShader={spiritParticlesVertex}
        uniforms={uniforms as unknown as { [uniform: string]: THREE.IUniform }}
      />
    </points>
  );
};

export default LowQualityParticles;
