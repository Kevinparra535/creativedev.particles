import * as THREE from "three";
import { useMemo, useRef } from "react";
import { trianglesVertex } from "../../../materials/trianglesVertex";
import { spiritParticlesFragment } from "../../../materials/spiritParticlesFragment";

type TrianglesParticlesProps = {
  size: number;
  positionsTexture: THREE.Texture;
};

const TrianglesParticles = ({ size, positionsTexture }: TrianglesParticlesProps) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const flipRef = useRef(0);

  const { position, positionFlip, fboUV } = useMemo(() => {
    const AMOUNT = size * size;
    const pos = new Float32Array(AMOUNT * 3 * 3);
    const posFlip = new Float32Array(AMOUNT * 3 * 3);
    const uv = new Float32Array(AMOUNT * 2 * 3);
    const PI = Math.PI;
    const angle = (PI * 2) / 3;
    const angles = [
      Math.sin(angle * 2 + PI),
      Math.cos(angle * 2 + PI),
      Math.sin(angle + PI),
      Math.cos(angle + PI),
      Math.sin(angle * 3 + PI),
      Math.cos(angle * 3 + PI),
      Math.sin(angle * 2),
      Math.cos(angle * 2),
      Math.sin(angle),
      Math.cos(angle),
      Math.sin(angle * 3),
      Math.cos(angle * 3),
    ];
    for (let i = 0; i < AMOUNT; i++) {
      const i6 = i * 6;
      const i9 = i * 9;
      if (i % 2) {
        pos[i9 + 0] = angles[0];
        pos[i9 + 1] = angles[1];
        pos[i9 + 3] = angles[2];
        pos[i9 + 4] = angles[3];
        pos[i9 + 6] = angles[4];
        pos[i9 + 7] = angles[5];

        posFlip[i9 + 0] = angles[6];
        posFlip[i9 + 1] = angles[7];
        posFlip[i9 + 3] = angles[8];
        posFlip[i9 + 4] = angles[9];
        posFlip[i9 + 6] = angles[10];
        posFlip[i9 + 7] = angles[11];
      } else {
        posFlip[i9 + 0] = angles[0];
        posFlip[i9 + 1] = angles[1];
        posFlip[i9 + 3] = angles[2];
        posFlip[i9 + 4] = angles[3];
        posFlip[i9 + 6] = angles[4];
        posFlip[i9 + 7] = angles[5];

        pos[i9 + 0] = angles[6];
        pos[i9 + 1] = angles[7];
        pos[i9 + 3] = angles[8];
        pos[i9 + 4] = angles[9];
        pos[i9 + 6] = angles[10];
        pos[i9 + 7] = angles[11];
      }

      const ix = i % size;
      const iy = Math.floor(i / size);
      uv[i6 + 0] = uv[i6 + 2] = uv[i6 + 4] = ix / size;
      uv[i6 + 1] = uv[i6 + 3] = uv[i6 + 5] = iy / size;
    }
    return { position: pos, positionFlip: posFlip, fboUV: uv };
  }, [size]);

  const uniforms = useMemo(
    () => ({
      texturePosition: { value: positionsTexture },
      flipRatio: { value: 0 },
      uColor1: { value: new THREE.Color(1, 1, 1) },
      uColor2: { value: new THREE.Color(1, 1, 1) },
    }),
    [positionsTexture]
  );

  // Toggle flip ratio like legacy (XOR)
  if (meshRef.current) {
    flipRef.current ^= 1;
    (meshRef.current.material as THREE.ShaderMaterial).uniforms.flipRatio.value = flipRef.current;
  }

  return (
    <mesh ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[position, 3]} />
        <bufferAttribute attach="attributes-positionFlip" args={[positionFlip, 3]} />
        <bufferAttribute attach="attributes-fboUV" args={[fboUV, 2]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={trianglesVertex}
        fragmentShader={spiritParticlesFragment}
        uniforms={uniforms as unknown as { [k: string]: THREE.IUniform }}
        blending={THREE.NoBlending}
        depthWrite={true}
      />
    </mesh>
  );
};

export default TrianglesParticles;
