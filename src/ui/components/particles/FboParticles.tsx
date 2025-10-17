/* eslint-disable @typescript-eslint/no-namespace */
import * as THREE from "three";
import { createPortal, extend, useFrame } from "@react-three/fiber";
import { useFBO } from "@react-three/drei";
import { useMemo, useRef } from "react";
import SpiritSimulationMaterial from "../../../materials/SpiritSimulationMaterial";
import { spiritParticlesVertex } from "../../../materials/spiritParticlesVertex";
import { spiritParticlesFragment } from "../../../materials/spiritParticlesFragment";

extend({ SpiritSimulationMaterial });

type FboParticlesProps = {
  size?: number; // texture width/height
  pointSize?: number;
};

// Fullscreen quad positions/uvs
function useFullScreenQuad() {
  const positions = useMemo(
    () =>
      new Float32Array([
        -1, -1, 0, 1, -1, 0, 1, 1, 0,
        -1, -1, 0, 1, 1, 0, -1, 1, 0,
      ]),
    []
  );
  const uvs = useMemo(
    () =>
      new Float32Array([
        0, 0,
        1, 0,
        1, 1,
        0, 0,
        1, 1,
        0, 1,
      ]),
    []
  );
  return { positions, uvs };
}

const FboParticles = ({ size = 128, pointSize = 3 }: FboParticlesProps) => {
  const simMaterialRef = useRef<THREE.ShaderMaterial>(null!);
  const pointsRef = useRef<THREE.Points>(null!);

  const simScene = useMemo(() => new THREE.Scene(), []);
  const simCamera = useMemo(
    () => new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1),
    []
  );
  const { positions: fsPositions, uvs: fsUvs } = useFullScreenQuad();

  const target = useFBO(size, size, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    stencilBuffer: false,
    type: THREE.FloatType,
    depthBuffer: false,
  });

  // Build UV lookup geometry for points (The-Spirit style: use position.xy as (u,v))
  const lookups = useMemo(() => {
    const count = size * size;
    const data = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const ix = i % size;
      const iy = Math.floor(i / size);
      data[i * 3 + 0] = ix / size;
      data[i * 3 + 1] = iy / size;
      data[i * 3 + 2] = 0;
    }
    return data;
  }, [size]);

  const drawUniforms = useMemo(
    () => ({
      uPositions: { value: null as unknown as THREE.Texture },
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color(0.34, 0.53, 0.96) },
      uColor2: { value: new THREE.Color(0.97, 0.7, 0.45) },
      uPointScale: { value: 1300 },
    }),
    []
  );

  // Update animated uniforms
  if (pointsRef.current) {
    (pointsRef.current.material as THREE.ShaderMaterial).uniforms.uPointScale.value = 1300 * (pointSize / 3);
  }

  useFrame((state) => {
    const { gl, clock } = state;
    // Run simulation to FBO
    gl.setRenderTarget(target);
    gl.clear();
    gl.render(simScene, simCamera);
    gl.setRenderTarget(null);

    // Feed positions texture to draw pass
    const mat = pointsRef.current.material as THREE.ShaderMaterial;
    mat.uniforms.uPositions.value = target.texture;
    mat.uniforms.uTime.value = clock.elapsedTime;
    if (simMaterialRef.current) {
      simMaterialRef.current.uniforms.uTime.value = clock.elapsedTime;
      // Project mouse to z=0 plane in world space and send to sim
      const ray = state.raycaster.ray;
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const hit = new THREE.Vector3();
      state.raycaster.setFromCamera(state.pointer, state.camera);
      ray.intersectPlane(plane, hit);
      const m = simMaterialRef.current.uniforms.uMouse3d
        .value as THREE.Vector3;
      m.set(hit.x, hit.y, hit.z);
    }
  });

  return (
    <>
      {createPortal(
        <mesh>
          {/* simulation quad */}
          <shaderMaterial ref={simMaterialRef} />
          {/* register intrinsic <spiritSimulationMaterial /> via extend above */}
          {/* @ts-expect-error intrinsic element provided via extend */}
          <spiritSimulationMaterial args={[size]} ref={simMaterialRef} />
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[fsPositions, 3]} />
            <bufferAttribute attach="attributes-uv" args={[fsUvs, 2]} />
          </bufferGeometry>
        </mesh>,
        simScene
      )}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[lookups, 3]} />
        </bufferGeometry>
        <shaderMaterial
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          vertexShader={spiritParticlesVertex}
          fragmentShader={spiritParticlesFragment}
          uniforms={drawUniforms as unknown as { [k: string]: THREE.IUniform }}
        />
      </points>
    </>
  );
};

export default FboParticles;

declare module "@react-three/fiber" {
  namespace JSX {
    interface IntrinsicElements {
      spiritSimulationMaterial: ThreeElements["shaderMaterial"] & {
        args?: [number];
      };
    }
  }
}
