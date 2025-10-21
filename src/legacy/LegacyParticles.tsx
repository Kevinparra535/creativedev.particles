import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';

import particlesVertexShader from '@/assets/glsl1/particles.vert.glsl?raw';
import particlesFragmentShader from '@/assets/glsl1/particles.frag.glsl?raw';
import particlesDistanceVertexShader from '@/assets/glsl1/particlesDistance.vert.glsl?raw';
import particlesDistanceFragmentShader from '@/assets/glsl1/particlesDistance.frag.glsl?raw';
import particlesMotionVertexShader from '@/assets/glsl1/particlesMotion.vert.glsl?raw';
import trianglesVertexShader from '@/assets/glsl1/triangles.vert.glsl?raw';
import trianglesDistanceShader from '@/assets/glsl1/trianglesDistance.vert.glsl?raw';
import trianglesMotionShader from '@/assets/glsl1/trianglesMotion.vert.glsl?raw';

import MeshMotionMaterial from '@/assets/postprocessing/motionBlur/MeshMotionMaterial';

import Simulator from './Simulator';
import { lightPosition } from './LegacyLights';
import { mouse3d, initAnimation } from './LegacyControls';

import DefaultSettings from '@/config/settings.config';

const LegacyParticles = () => {
  const { gl, camera } = useThree();
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

  // Main uniforms for points (with shadowmap support)
  const pointsUniforms = useMemo(
    () => ({
      ...THREE.UniformsUtils.merge([
        THREE.UniformsLib.lights,
        {
          texturePosition: { value: new THREE.Texture() },
          color1: { value: new THREE.Color(DefaultSettings.color1) },
          color2: { value: new THREE.Color(DefaultSettings.color2) }
        }
      ])
    }),
    []
  );

  // Main uniforms for triangles (with shadowmap support)
  const trianglesUniforms = useMemo(
    () => ({
      ...THREE.UniformsUtils.merge([
        THREE.UniformsLib.lights,
        {
          texturePosition: { value: new THREE.Texture() },
          flipRatio: { value: 0 },
          color1: { value: new THREE.Color(DefaultSettings.color1) },
          color2: { value: new THREE.Color(DefaultSettings.color2) },
          size: { value: 1 },
          cameraMatrix: { value: new THREE.Matrix4() }
        }
      ])
    }),
    []
  );

  // Distance material uniforms (for shadows)
  const pointsDistanceUniforms = useMemo(
    () => ({
      lightPos: { value: new THREE.Vector3(0, 0, 0) },
      texturePosition: { value: new THREE.Texture() }
    }),
    []
  );

  const trianglesDistanceUniforms = useMemo(
    () => ({
      lightPos: { value: new THREE.Vector3(0, 0, 0) },
      texturePosition: { value: new THREE.Texture() },
      flipRatio: { value: 0 }
    }),
    []
  );

  // Motion material uniforms (for motion blur)
  const pointsMotionUniforms = useMemo(
    () => ({
      texturePosition: { value: new THREE.Texture() },
      texturePrevPosition: { value: new THREE.Texture() }
    }),
    []
  );

  const trianglesMotionUniforms = useMemo(
    () => ({
      texturePosition: { value: new THREE.Texture() },
      texturePrevPosition: { value: new THREE.Texture() },
      flipRatio: { value: 0 }
    }),
    []
  );

  const pointsRef = useRef<THREE.Points>(null!);
  const trianglesRef = useRef<THREE.Mesh>(null!);
  const flipRef = useRef(0);

  // Material refs for additional materials (distance, motion)
  const pointsDistanceMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const trianglesDistanceMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const pointsMotionMatRef = useRef<MeshMotionMaterial | null>(null);
  const trianglesMotionMatRef = useRef<MeshMotionMaterial | null>(null);

  // Color animation refs
  const tmpColor = useRef(new THREE.Color());
  const col1 = useRef(new THREE.Color(DefaultSettings.color1));
  const col2 = useRef(new THREE.Color(DefaultSettings.color2));

  // Initialize additional materials (distance and motion) when meshes are ready
  useEffect(() => {
    // Points distance material (for shadows)
    if (pointsRef.current && !pointsDistanceMatRef.current) {
      pointsDistanceMatRef.current = new THREE.ShaderMaterial({
        uniforms: pointsDistanceUniforms,
        vertexShader: particlesDistanceVertexShader,
        fragmentShader: particlesDistanceFragmentShader,
        depthTest: true,
        depthWrite: true,
        side: THREE.BackSide,
        blending: THREE.NoBlending,
        glslVersion: THREE.GLSL3
      });
      (pointsRef.current as any).customDistanceMaterial = pointsDistanceMatRef.current;
    }

    // Points motion material (for motion blur)
    if (pointsRef.current && !pointsMotionMatRef.current) {
      pointsMotionMatRef.current = new MeshMotionMaterial({
        uniforms: pointsMotionUniforms,
        vertexShader: particlesMotionVertexShader,
        motionMultiplier: 1,
        depthTest: true,
        depthWrite: true,
        side: THREE.DoubleSide,
        blending: THREE.NoBlending
      });
      (pointsRef.current as any).motionMaterial = pointsMotionMatRef.current;
    }

    // Triangles distance material (for shadows)
    if (trianglesRef.current && !trianglesDistanceMatRef.current) {
      trianglesDistanceMatRef.current = new THREE.ShaderMaterial({
        uniforms: trianglesDistanceUniforms,
        vertexShader: trianglesDistanceShader,
        fragmentShader: particlesDistanceFragmentShader, // same as points
        depthTest: true,
        depthWrite: true,
        side: THREE.BackSide,
        blending: THREE.NoBlending,
        glslVersion: THREE.GLSL3
      });
      (trianglesRef.current as any).customDistanceMaterial = trianglesDistanceMatRef.current;
    }

    // Triangles motion material (for motion blur)
    if (trianglesRef.current && !trianglesMotionMatRef.current) {
      trianglesMotionMatRef.current = new MeshMotionMaterial({
        uniforms: trianglesMotionUniforms,
        vertexShader: trianglesMotionShader,
        motionMultiplier: 1,
        depthTest: true,
        depthWrite: true,
        side: THREE.DoubleSide,
        blending: THREE.NoBlending
      });
      (trianglesRef.current as any).motionMaterial = trianglesMotionMatRef.current;
    }

    // Enable shadows like legacy
    if (pointsRef.current) {
      pointsRef.current.castShadow = true;
      pointsRef.current.receiveShadow = true;

      // Initialize color uniforms like legacy
      const mat = pointsRef.current.material as THREE.ShaderMaterial;
      (mat.uniforms.color1.value as THREE.Color).copy(col1.current);
      (mat.uniforms.color2.value as THREE.Color).copy(col2.current);
    }
    if (trianglesRef.current) {
      trianglesRef.current.castShadow = true;
      trianglesRef.current.receiveShadow = true;

      // Initialize color uniforms and cameraMatrix like legacy
      const mat = trianglesRef.current.material as THREE.ShaderMaterial;
      (mat.uniforms.color1.value as THREE.Color).copy(col1.current);
      (mat.uniforms.color2.value as THREE.Color).copy(col2.current);
      (mat.uniforms.cameraMatrix.value as THREE.Matrix4).copy(camera.matrixWorld);
    }
  }, [
    pointsDistanceUniforms,
    trianglesDistanceUniforms,
    pointsMotionUniforms,
    trianglesMotionUniforms
  ]);

  useEffect(() => {
    simulatorRef.current!.recreate(W, H);
    // initAnimation is now handled by LegacyControls globally
    return () => {
      simulatorRef.current?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [W, H]);

  useFrame((state) => {
    // intro animation timing handled by LegacyControls globally
    // Use mouse3d computed by LegacyControls (ray to z-plane through origin), like legacy
    simulatorRef.current!.initAnimation = initAnimation;
    simulatorRef.current!.update(state.clock.getDelta() * 1000, mouse3d);

    const posTex = simulatorRef.current!.positionRenderTarget.texture;
    const prevPosTex = simulatorRef.current!.prevPositionRenderTarget.texture;

    // smooth color transitions like legacy
    tmpColor.current.setStyle(DefaultSettings.color1);
    col1.current.lerp(tmpColor.current, 0.05);
    tmpColor.current.setStyle(DefaultSettings.color2);
    col2.current.lerp(tmpColor.current, 0.05);

    // Update points materials
    if (pointsRef.current) {
      const mat = pointsRef.current.material as THREE.ShaderMaterial;
      (mat.uniforms.texturePosition.value as THREE.Texture) = posTex;
      (mat.uniforms.color1.value as THREE.Color).copy(col1.current);
      (mat.uniforms.color2.value as THREE.Color).copy(col2.current);

      // Update distance material
      const distanceMat = (pointsRef.current as any).customDistanceMaterial as
        | THREE.ShaderMaterial
        | undefined;
      if (distanceMat) {
        (distanceMat.uniforms.texturePosition.value as THREE.Texture) = posTex;
        (distanceMat.uniforms.lightPos.value as THREE.Vector3).copy(lightPosition);
      }

      // Update motion material
      const motionMat = (pointsRef.current as any).motionMaterial as
        | MeshMotionMaterial
        | undefined;
      if (motionMat) {
        motionMat.uniforms.texturePosition.value = posTex;
        motionMat.uniforms.texturePrevPosition.value = prevPosTex;
      }
    }

    // Update triangles materials
    if (trianglesRef.current) {
      const tMat = trianglesRef.current.material as THREE.ShaderMaterial;
      (tMat.uniforms.texturePosition.value as THREE.Texture) = posTex;
      (tMat.uniforms.color1.value as THREE.Color).copy(col1.current);
      (tMat.uniforms.color2.value as THREE.Color).copy(col2.current);
      (tMat.uniforms.cameraMatrix.value as THREE.Matrix4).copy(camera.matrixWorld);
      tMat.uniforms.flipRatio.value = flipRef.current ^= 1;

      // Update distance material
      const distanceMat = (trianglesRef.current as any).customDistanceMaterial as
        | THREE.ShaderMaterial
        | undefined;
      if (distanceMat) {
        (distanceMat.uniforms.texturePosition.value as THREE.Texture) = posTex;
        (distanceMat.uniforms.lightPos.value as THREE.Vector3).copy(lightPosition);
        distanceMat.uniforms.flipRatio.value = flipRef.current;
      }

      // Update motion material
      const motionMat = (trianglesRef.current as any).motionMaterial as
        | MeshMotionMaterial
        | undefined;
      if (motionMat) {
        motionMat.uniforms.texturePosition.value = posTex;
        motionMat.uniforms.texturePrevPosition.value = prevPosTex;
        motionMat.uniforms.flipRatio.value = flipRef.current;
      }
    }

    if (pointsRef.current) pointsRef.current.visible = !DefaultSettings.useTriangleParticles;
    if (trianglesRef.current) trianglesRef.current.visible = DefaultSettings.useTriangleParticles;
  });

  return (
    <>
      {/* Points */}
      <points ref={pointsRef} visible={!DefaultSettings.useTriangleParticles}>
        <bufferGeometry>
          <bufferAttribute attach='attributes-position' args={[lookups, 3]} />
        </bufferGeometry>
        <shaderMaterial
          glslVersion={THREE.GLSL3}
          vertexShader={particlesVertexShader}
          fragmentShader={particlesFragmentShader}
          uniforms={pointsUniforms as unknown as { [k: string]: THREE.IUniform }}
          blending={THREE.NoBlending}
          depthWrite
        />
      </points>

      {/* Triangles */}
      <mesh ref={trianglesRef as any} visible={DefaultSettings.useTriangleParticles}>
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
              Math.cos(angle * 3)
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
                <bufferAttribute attach='attributes-position' args={[pos, 3]} />
                <bufferAttribute attach='attributes-positionFlip' args={[posFlip, 3]} />
                <bufferAttribute attach='attributes-fboUV' args={[fboUV, 2]} />
              </>
            );
          })()}
        </bufferGeometry>

        <shaderMaterial
          glslVersion={THREE.GLSL3}
          vertexShader={trianglesVertexShader}
          fragmentShader={particlesFragmentShader}
          uniforms={trianglesUniforms as unknown as { [k: string]: THREE.IUniform }}
          blending={THREE.NoBlending}
          depthWrite
        />
      </mesh>
    </>
  );
};

export default LegacyParticles;
