import * as THREE from "three";
import { Canvas, createPortal, extend, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  OrthographicCamera,
  PerspectiveCamera,
  useFBO,
} from "@react-three/drei";
import SimulationMaterial from "../../materials/SimulationMaterial";
import {
  Bloom,
  DepthOfField,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";

import { vertexShader } from "../../materials/vertexShader";
import { dynamicFragmentShader } from "../../materials/dynamicFragmentShader";

extend({ SimulationMaterial });

declare module "@react-three/fiber" {
  namespace JSX {
    interface IntrinsicElements {
      simulationMaterial: THREE.Object3DNode<
        THREE.ShaderMaterial,
        typeof THREE.ShaderMaterial
      > & {
        args?: [number];
      };
    }
  }
}

interface ColorParticlesProps {
  color1?: [number, number, number];
  color2?: [number, number, number];
  speed?: number;
  size?: number;
}

const FBOParticles = ({
  color1 = [1, 0.2, 0.4],
  color2 = [0.2, 0.4, 1],
  speed = 0.1,
  size = 250,
}: ColorParticlesProps) => {
  const points = useRef<THREE.Points>(null!);
  const simulationMaterialRef = useRef<THREE.ShaderMaterial>(null!);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(
    -1,
    1,
    1,
    -1,
    1 / Math.pow(2, 53),
    1
  );

  const positions = new Float32Array([
    -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0,
  ]);

  const uvs = new Float32Array([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1]);

  const renderTarget = useFBO(size, size, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    stencilBuffer: false,
    type: THREE.FloatType,
  });

  const randomNum = 3; // Math.floor(Math.random() * (5 - 2 + 1)) + 2;

  const particlesPosition = useMemo(() => {
    const length = size * size;
    const particles = new Float32Array(length * randomNum);
    for (let i = 0; i < length; i++) {
      const i3 = i * randomNum;
      particles[i3 + 0] = (i % size) / size;
      particles[i3 + 1] = i / size / size;
    }
    return particles;
  }, [size]);

  const uniforms = useMemo(
    () => ({
      uPositions: { value: null },
      uTime: { value: 0 },
      uColor1: { value: new THREE.Vector3(...color1) },
      uColor2: { value: new THREE.Vector3(...color2) },
      uSpeed: { value: speed },
    }),
    [color1, color2, speed]
  );

  useFrame((state) => {
    const { gl, clock } = state;

    gl.setRenderTarget(renderTarget);
    gl.clear();
    gl.render(scene, camera);
    gl.setRenderTarget(null);

    if (points.current?.material) {
      const material = points.current.material as THREE.ShaderMaterial;
      material.uniforms.uPositions.value = renderTarget.texture;
      material.uniforms.uTime.value = clock.elapsedTime;
    }

    if (simulationMaterialRef.current?.uniforms?.uTime) {
      simulationMaterialRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  return (
    <>
      {createPortal(
        <mesh>
          <simulationMaterial ref={simulationMaterialRef} args={[size]} />
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={positions.length / randomNum}
              array={positions}
              itemSize={randomNum}
              args={[positions, randomNum]}
            />
            <bufferAttribute
              attach="attributes-uv"
              count={uvs.length / 2}
              array={uvs}
              itemSize={2}
              args={[uvs, 2]}
            />
          </bufferGeometry>
        </mesh>,
        scene
      )}

      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particlesPosition.length / randomNum}
            array={particlesPosition}
            itemSize={randomNum}
            args={[particlesPosition, randomNum]}
          />
        </bufferGeometry>

        <shaderMaterial
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          fragmentShader={dynamicFragmentShader}
          vertexShader={vertexShader}
          uniforms={uniforms}
        />
      </points>
    </>
  );
};

// Componente principal con controles de color
const R3FCanva = () => {
  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <div style={{ position: "absolute" }}>
        <button>change camera</button>
      </div>

      <Canvas
        shadows
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        camera={{ position: [0, 0, 0], fov: 120, near: 0.1, far: 1000 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={Math.PI / 2} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          decay={0}
          intensity={Math.PI}
        />

        <EffectComposer>
          <DepthOfField
            focusDistance={0}
            focalLength={0.02}
            bokehScale={2}
            height={480}
          />
          <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
          <Noise opacity={0.02} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />

          <FBOParticles
            color1={[1, 0, 0.6]} // Rosa neón (magenta)
            color2={[0, 1, 1]} // Cian eléctrico
            speed={1} // Velocidad de animación
            size={250}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default R3FCanva;
