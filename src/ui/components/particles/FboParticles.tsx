/* eslint-disable @typescript-eslint/no-namespace */
import * as THREE from "three";
import { createPortal, extend, useFrame } from "@react-three/fiber";
import { useFBO } from "@react-three/drei";
import { useMemo, useRef } from "react";
import SpiritSimulationMaterial from "../../../materials/SpiritSimulationMaterial.ts";
import { spiritParticlesVertex } from "../../../materials/spiritParticlesVertex.ts";
import { spiritParticlesFragment } from "../../../materials/spiritParticlesFragment.ts";
import TrianglesParticles from "./TrianglesParticles";

extend({ SpiritSimulationMaterial });

type FboParticlesProps = {
  size?: number; // texture width/height
  pointSize?: number;
  useTriangles?: boolean;
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

const FboParticles = ({ size = 256, pointSize = 3, useTriangles = false }: FboParticlesProps) => {
  const simMaterialRef = useRef<THREE.ShaderMaterial>(null!);
  const pointsRef = useRef<THREE.Points>(null!);
  const baseSpeedRef = useRef<number>(1);
  const baseDieSpeedRef = useRef<number>(0.015);

  const simScene = useMemo(() => new THREE.Scene(), []);
  const simCamera = useMemo(
    () => new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1),
    []
  );
  // Copy scene for seeding render targets
  const copyScene = useMemo(() => new THREE.Scene(), []);
  const { positions: fsPositions, uvs: fsUvs } = useFullScreenQuad();
  const copyUniforms = useMemo(() => ({ uTexture: { value: null as unknown as THREE.Texture } }), []);
  const copyVertex = useMemo(
    () => `
    precision highp float;
    attribute vec3 position;
    attribute vec2 uv;
    varying vec2 vUv;
    void main(){ vUv = uv; gl_Position = vec4(position,1.0); }
  `,
    []
  );
  const copyFragment = useMemo(
    () => `
    precision highp float;
    uniform sampler2D uTexture;
    varying vec2 vUv;
    void main(){ gl_FragColor = texture2D(uTexture, vUv); }
  `,
    []
  );
  const copyMatRef = useRef<THREE.ShaderMaterial>(null!);
  const seededRef = useRef(false);

  // Ping-pong targets (like legacy simulator.positionRenderTarget and prev)
  const targetA = useFBO(size, size, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    stencilBuffer: false,
    type: THREE.FloatType,
    depthBuffer: false,
  });
  const targetB = useFBO(size, size, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    stencilBuffer: false,
    type: THREE.FloatType,
    depthBuffer: false,
  });
  const ping = useRef<THREE.WebGLRenderTarget>(null!);
  const pong = useRef<THREE.WebGLRenderTarget>(null!);
  if (!ping.current) {
    ping.current = targetA;
    pong.current = targetB;
  }

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

  useFrame((state, dt) => {
    const { gl, clock } = state;
    const simMat = simMaterialRef.current;
    // Update time and delta-scaled parameters like legacy
    if (simMat) {
      simMat.uniforms.uTime.value = clock.elapsedTime;
      simMat.uniforms.uDelta.value = dt * 1000; // ms
      const deltaRatio = dt / (16.6667 / 1000);
      // set from base values each frame (no accumulation)
      if (baseSpeedRef.current === 1 && typeof simMat.uniforms.uSpeed.value === 'number') {
        baseSpeedRef.current = simMat.uniforms.uSpeed.value;
      }
      if (typeof simMat.uniforms.uDieSpeed.value === 'number') {
        baseDieSpeedRef.current = simMat.uniforms.uDieSpeed.value;
      }
      simMat.uniforms.uSpeed.value = baseSpeedRef.current * deltaRatio;
      simMat.uniforms.uDieSpeed.value = baseDieSpeedRef.current * deltaRatio;
      // Project mouse to a plane aligned with camera forward and through origin
      const plane = new THREE.Plane();
      const normal = new THREE.Vector3();
      const hit = new THREE.Vector3();
      (state.camera as THREE.Camera as any).getWorldDirection(normal);
      plane.setFromNormalAndCoplanarPoint(normal, new THREE.Vector3(0, 0, 0));
      state.raycaster.setFromCamera(state.pointer, state.camera);
      if (state.raycaster.ray.intersectPlane(plane, hit)) {
        const m = simMat.uniforms.uMouse3d.value as THREE.Vector3;
        m.set(hit.x, hit.y, hit.z);
      }
    }

    // One-time seed: copy initial positions texture into both RTs
    if (!seededRef.current && simMat) {
      // The initial positions texture lives in simMat.uniforms.positionsA
      copyUniforms.uTexture.value = simMat.uniforms.positionsA.value as THREE.Texture;
      // Render copy into both targets
      gl.setRenderTarget(ping.current);
      gl.clear();
      gl.render(copyScene, simCamera);
      gl.setRenderTarget(pong.current);
      gl.clear();
      gl.render(copyScene, simCamera);
      gl.setRenderTarget(null);
      seededRef.current = true;
    }

    // Ping-pong swap
    const writeRT = ping.current;
    const readRT = pong.current;
    // Set positionsA (current) to readRT.texture
    if (simMat) {
      simMat.uniforms.positionsA.value = readRT.texture;
    }

    // Render simulation to writeRT
    gl.setRenderTarget(writeRT);
    gl.clear();
    gl.render(simScene, simCamera);
    gl.setRenderTarget(null);

    // Swap refs
    const tmp = ping.current;
    ping.current = pong.current;
    pong.current = tmp;

    // Feed positions texture to draw pass (latest texture is in pong after swap)
    const mat = pointsRef.current.material as THREE.ShaderMaterial;
    mat.uniforms.uPositions.value = pong.current.texture;
    mat.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <>
      {createPortal(
        <mesh>
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
      {!useTriangles && (
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[lookups, 3]} />
        </bufferGeometry>
        <shaderMaterial
          blending={THREE.NoBlending}
          depthWrite={true}
          vertexShader={spiritParticlesVertex}
          fragmentShader={spiritParticlesFragment}
          uniforms={drawUniforms as unknown as { [k: string]: THREE.IUniform }}
        />
      </points>
      )}
      {useTriangles && (
        <TrianglesParticles />
      )}
      {createPortal(
        <mesh>
          <shaderMaterial
            ref={copyMatRef}
            uniforms={copyUniforms as unknown as { [k: string]: THREE.IUniform }}
            vertexShader={copyVertex}
            fragmentShader={copyFragment}
          />
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[fsPositions, 3]} />
            <bufferAttribute attach="attributes-uv" args={[fsUvs, 2]} />
          </bufferGeometry>
        </mesh>,
        copyScene
      )}
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
