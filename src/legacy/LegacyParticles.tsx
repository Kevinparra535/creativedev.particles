import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import Simulator from "./Simulator";
import MeshMotionMaterial from "../materials/motionBlur/MeshMotionMaterial";
import {
  particlesFragmentShader,
  pointsVertexShader,
  trianglesFragmentShader,
  trianglesVertexShader,
} from "../materials/particlesShaders";
import DefaultSettings from "../config/settings.config";

const LegacyParticles = () => {
  const { gl, camera, raycaster, pointer } = useThree();
  const W = DefaultSettings.simulatorTextureWidth;
  const H = DefaultSettings.simulatorTextureHeight;

  const simulatorRef = useRef<Simulator | null>(null);
  if (!simulatorRef.current) {
    simulatorRef.current = new Simulator(gl, W, H);
  }

  const lookups = useMemo(() => {
    const count = W * H;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const ix = i % W;
      const iy = Math.trunc(i / W);
      arr[i * 3] = ix / W;
      arr[i * 3 + 1] = iy / H;
    }
    return arr;
  }, [W, H]);

  const drawUniforms = useMemo(
    () => ({
      texturePosition: { value: new THREE.Texture() },
      color1: { value: new THREE.Color(DefaultSettings.color1) },
      color2: { value: new THREE.Color(DefaultSettings.color2) },
    }),
    []
  );

  const pointsRef = useRef<THREE.Points>(null!);
  const trianglesRef = useRef<THREE.Mesh>(null!);
  const flipRef = useRef(0);
  const motionMatRef = useRef<MeshMotionMaterial | null>(null);
  const tmpColor = useRef(new THREE.Color());
  const col1 = useRef(new THREE.Color(DefaultSettings.color1));
  const col2 = useRef(new THREE.Color(DefaultSettings.color2));
  const mouse3dRef = useRef(new THREE.Vector3());
  const initAnimRef = useRef(0);

  useEffect(() => {
    if (trianglesRef.current && !motionMatRef.current) {
      motionMatRef.current = new MeshMotionMaterial({
        uniforms: { size: { value: 1 } },
      });
      (trianglesRef.current as any).motionMaterial = motionMatRef.current;
    }
  }, []);

  useEffect(() => {
    simulatorRef.current!.recreate(W, H);
    initAnimRef.current = 0;
    return () => {
      simulatorRef.current?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [W, H]);

  useFrame((state) => {
    // intro animation timing similar to legacy
    initAnimRef.current = Math.min(
      1,
      initAnimRef.current + state.clock.getDelta() * 0.25
    );

    // project mouse onto a plane facing the camera through origin
    const normal = new THREE.Vector3();
    (camera as any).getWorldDirection(normal);
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
      normal,
      new THREE.Vector3()
    );
    raycaster.setFromCamera(pointer, camera);
    const hit = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(plane, hit)) {
      mouse3dRef.current.copy(hit);
    }

    simulatorRef.current!.initAnimation = initAnimRef.current;
    simulatorRef.current!.update(
      state.clock.getDelta() * 1000,
      mouse3dRef.current
    );

    const posTex = simulatorRef.current!.positionRenderTarget.texture;
    const prevPosTex = simulatorRef.current!.prevPositionRenderTarget.texture;

    // smooth color transitions like legacy
    tmpColor.current.setStyle(DefaultSettings.color1);
    col1.current.lerp(tmpColor.current, 0.05);
    tmpColor.current.setStyle(DefaultSettings.color2);
    col2.current.lerp(tmpColor.current, 0.05);

    if (pointsRef.current) {
      const mat = pointsRef.current.material as THREE.ShaderMaterial;
      (mat.uniforms.texturePosition.value as THREE.Texture) = posTex;
      (mat.uniforms.color1.value as THREE.Color).copy(col1.current);
      (mat.uniforms.color2.value as THREE.Color).copy(col2.current);
    }

    if (trianglesRef.current) {
      const tMat = trianglesRef.current.material as THREE.ShaderMaterial;
      (tMat.uniforms.texturePosition.value as THREE.Texture) = posTex;
      (tMat.uniforms.color1.value as THREE.Color).copy(col1.current);
      (tMat.uniforms.color2.value as THREE.Color).copy(col2.current);
      tMat.uniforms.flipRatio.value = flipRef.current ^= 1;
      const motion = (trianglesRef.current as any).motionMaterial as
        | MeshMotionMaterial
        | undefined;
      if (motion) {
        motion.uniforms.texturePosition.value = posTex;
        motion.uniforms.texturePrevPosition.value = prevPosTex;
        motion.uniforms.flipRatio.value = flipRef.current;
      }
    }

    if (pointsRef.current)
      pointsRef.current.visible = !DefaultSettings.useTriangleParticles;
    if (trianglesRef.current)
      trianglesRef.current.visible = DefaultSettings.useTriangleParticles;
  });

  return (
    <>
      {/* Points */}
      <points ref={pointsRef} visible={!DefaultSettings.useTriangleParticles}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[lookups, 3]} />
        </bufferGeometry>
        <shaderMaterial
          glslVersion={THREE.GLSL3}
          vertexShader={pointsVertexShader}
          fragmentShader={particlesFragmentShader}
          uniforms={drawUniforms as unknown as { [k: string]: THREE.IUniform }}
          blending={THREE.NoBlending}
          depthWrite
        />
      </points>

      {/* Triangles */}
      <mesh
        ref={trianglesRef as any}
        visible={DefaultSettings.useTriangleParticles}
      >
        <bufferGeometry>
          {(() => {
            const count = W * H;
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
            const pos = new Float32Array(count * 3 * 3);
            const posFlip = new Float32Array(count * 3 * 3);
            const fboUV = new Float32Array(count * 2 * 3);
            for (let i = 0; i < count; i++) {
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
              const ix = i % W;
              const iy = Math.trunc(i / W);
              const u = ix / W;
              const v = iy / H;
              fboUV[i6 + 0] = fboUV[i6 + 2] = fboUV[i6 + 4] = u;
              fboUV[i6 + 1] = fboUV[i6 + 3] = fboUV[i6 + 5] = v;
            }
            return (
              <>
                <bufferAttribute attach="attributes-position" args={[pos, 3]} />
                <bufferAttribute
                  attach="attributes-positionFlip"
                  args={[posFlip, 3]}
                />
                <bufferAttribute attach="attributes-fboUV" args={[fboUV, 2]} />
              </>
            );
          })()}
        </bufferGeometry>
        <shaderMaterial
          glslVersion={THREE.GLSL3}
          vertexShader={trianglesVertexShader}
          fragmentShader={trianglesFragmentShader}
          uniforms={
            {
              texturePosition: { value: new THREE.Texture() },
              flipRatio: { value: 0 },
              color1: { value: new THREE.Color(DefaultSettings.color1) },
              color2: { value: new THREE.Color(DefaultSettings.color2) },
              size: { value: 1 },
            } as unknown as { [k: string]: THREE.IUniform }
          }
          blending={THREE.NoBlending}
          depthWrite
        />
      </mesh>
    </>
  );
};

export default LegacyParticles;
