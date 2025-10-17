import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { fragmentShader } from "../../../materials/fragmentShader";

export type LowQualityParticlesProps = {
  count?: number;
  radius?: number;
  pointSize?: number;
  attract?: number;
  falloff?: number;
};

// Lightweight vertex shader with mouse attraction in world XY plane + falloff
const lowQualityVertex = `
uniform float uTime;
uniform float uRadius;
uniform vec2 uMouse;       // world-space XY at z=0 plane
uniform float uAttract;    // [0..1]
uniform float uPointSize;  // base point size
uniform float uFalloff;    // influence radius (world units)

varying float vDistance;

mat3 rotation3dY(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat3(
    c, 0.0, -s,
    0.0, 1.0, 0.0,
    s, 0.0, c
  );
}

void main() {
  // Base rotation for subtle motion
  float distFactor = max(0.0, uRadius - distance(position, vec3(0.0)));
  distFactor = pow(distFactor + 0.0001, 1.2);

  vec3 pos = position * rotation3dY(uTime * 0.2 * (0.5 + distFactor));

  // Mouse attraction in world XY with distance-based falloff
  vec2 toMouse = uMouse - pos.xy;
  float d = length(toMouse);
  float f = 1.0 - smoothstep(0.0, uFalloff, d);
  pos.xy += toMouse * uAttract * f;

  vDistance = distFactor;

  vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  gl_Position = projectedPosition;

  float size = uPointSize * (0.6 + distFactor);
  gl_PointSize = size;
  gl_PointSize *= (1.0 / -viewPosition.z); // attenuation
}
`;

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

  // Raycaster setup to project mouse to z=0 plane (world space)
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
    []
  ); // z=0
  const intersectPoint = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const { clock, pointer } = state;
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;

      // Project pointer (NDC) to world-space on z=0 plane
      raycaster.setFromCamera(pointer, camera);
      raycaster.ray.intersectPlane(plane, intersectPoint);
      const m = materialRef.current.uniforms.uMouse.value as THREE.Vector2;
      m.set(intersectPoint.x, intersectPoint.y);
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
        fragmentShader={fragmentShader}
        vertexShader={lowQualityVertex}
        uniforms={uniforms as unknown as { [uniform: string]: THREE.IUniform }}
      />
    </points>
  );
};

export default LowQualityParticles;
