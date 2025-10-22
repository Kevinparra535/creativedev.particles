import { useMemo, useRef, useEffect, type RefObject } from 'react';

import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import DefaultSettings from '@/config/settings.config';

import particlesVertexShader from '@/assets/glsl1/particles.vert.glsl?raw';
import particlesFragmentShader from '@/assets/glsl1/particles.frag.glsl?raw';
import particlesDistanceVertexShader from '@/assets/glsl1/particlesDistance.vert.glsl?raw';
import particlesDistanceFragmentShader from '@/assets/glsl1/particlesDistance.frag.glsl?raw';
import particlesMotionVertexShader from '@/assets/glsl1/particlesMotion.vert.glsl?raw';
import trianglesVertexShader from '@/assets/glsl1/triangles.vert.glsl?raw';
import trianglesDistanceShader from '@/assets/glsl1/trianglesDistance.vert.glsl?raw';
import trianglesMotionShader from '@/assets/glsl1/trianglesMotion.vert.glsl?raw';

//
import useFboSimulator from './useFboSimulator';
import MeshMotionMaterial from '@/assets/postprocessing/effects/motionBlur/MeshMotionMaterial';

type Props = {
  size?: number; // square fallback
  cols?: number; // FBO width
  rows?: number; // FBO height
  color1?: THREE.ColorRepresentation;
  color2?: THREE.ColorRepresentation;
  radius?: number;
  attraction?: number;
  followMouse?: boolean;
  curlSize?: number;
  speed?: number;
  dieSpeed?: number;
  mode?: 'points' | 'triangles';
  triangleSize?: number; // view-space units for tri side
  flipRatio?: number; // morph ratio for triangles
};

// Helper to build a UV grid as positions attribute: [u, v, 0]
function buildLookupGeometry(width: number, height: number) {
  const count = width * height;
  const positions = new Float32Array(count * 3);
  let ptr = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Legacy parity: no half-texel offset; sample uses NearestFilter
      const u = x / width;
      const v = y / height;
      positions[ptr++] = u;
      positions[ptr++] = v;
      positions[ptr++] = 0;
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return geo;
}

function buildTrianglesGeometry(width: number, height: number, triSize: number) {
  const count = width * height;
  const triVerts = [
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(-0.8660254, -0.5, 0),
    new THREE.Vector3(0.8660254, -0.5, 0)
  ].map((v) => v.multiplyScalar(triSize));

  const triFlip = triVerts.map((v) => v.clone().multiplyScalar(-1));

  const positions = new Float32Array(count * 3 * 3);
  const positionFlip = new Float32Array(count * 3 * 3);
  const fboUV = new Float32Array(count * 3 * 2);

  let vp = 0,
    vpf = 0,
    vu = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Legacy parity: no half-texel offset
      const u = x / width;
      const v = y / height;
      for (let k = 0; k < 3; k++) {
        const a = triVerts[k];
        const b = triFlip[k];
        positions[vp++] = a.x;
        positions[vp++] = a.y;
        positions[vp++] = a.z;
        positionFlip[vpf++] = b.x;
        positionFlip[vpf++] = b.y;
        positionFlip[vpf++] = b.z;
        fboUV[vu++] = u;
        fboUV[vu++] = v;
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('positionFlip', new THREE.BufferAttribute(positionFlip, 3));
  geo.setAttribute('fboUV', new THREE.BufferAttribute(fboUV, 2));
  return geo;
}

// (seeding shader moved into useFboSimulator)

export default function FboParticles(props: Readonly<Props>) {
  const {
    size = DefaultSettings.simulatorTextureWidth, // uses settings when cols/rows not provided
    cols,
    rows,
    color1 = new THREE.Color(1, 1, 1),
    color2 = new THREE.Color(0.2, 0.6, 1),
    radius = 300,
    attraction = 0.6,
    followMouse = true,
    curlSize = 0.015,
    speed = 1,
    dieSpeed = 0.003,
    mode = 'points',
    triangleSize = 2.5,
    flipRatio = 0
  } = props;
  const { gl, camera } = useThree();
  const w = cols ?? size;
  const h = rows ?? size;
  // resolution handled inside the simulator hook

  // Simulator hook (encapsulates init + ping-pong + step)
  const simulator = useFboSimulator(gl, w, h);

  // Particles draw material and geometry
  const geoRef = useRef<THREE.BufferGeometry | null>(null);
  const matRef = useRef<THREE.ShaderMaterial | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const motionMatRef = useRef<MeshMotionMaterial | null>(null);
  const distanceMatRef = useRef<THREE.ShaderMaterial | null>(null);
  // prev texture is provided by simulator

  // Time and init animation
  const startTime = useRef<number>(performance.now());
  const initAnim = useRef(0);

  // Mouse 3D target on z=0 plane
  const mouse3d = useRef(new THREE.Vector3());
  const followTimeRef = useRef(0);
  const planeZ = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  // Note: draw geometry/material are created in a separate effect on mode change

  // Build draw geometry/material on mode or parameter change
  useEffect(() => {
    // Dispose previous
    geoRef.current?.dispose();
    matRef.current?.dispose();
    motionMatRef.current?.dispose();
    distanceMatRef.current?.dispose();

    if (mode === 'points') {
      geoRef.current = buildLookupGeometry(w, h);
      matRef.current = new THREE.ShaderMaterial({
        vertexShader: particlesVertexShader,
        fragmentShader: particlesFragmentShader,
        uniforms: THREE.UniformsUtils.merge([
          THREE.UniformsLib['common'],
          THREE.UniformsLib['aomap'],
          THREE.UniformsLib['lightmap'],
          THREE.UniformsLib['emissivemap'],
          THREE.UniformsLib['bumpmap'],
          THREE.UniformsLib['normalmap'],
          THREE.UniformsLib['displacementmap'],
          THREE.UniformsLib['gradientmap'],
          THREE.UniformsLib['fog'],
          THREE.UniformsLib['lights'],
          {
            texturePosition: { value: null },
            color1: { value: new THREE.Color(color1) },
            color2: { value: new THREE.Color(color2) },
            flipRatio: { value: 0 }
          }
        ]),
        lights: true,
        transparent: false,
        depthWrite: false,
        depthTest: true,
        blending: THREE.NoBlending,
        glslVersion: THREE.GLSL3
      });

      distanceMatRef.current = new THREE.ShaderMaterial({
        vertexShader: particlesDistanceVertexShader,
        fragmentShader: particlesDistanceFragmentShader,
        uniforms: {
          lightPos: { value: new THREE.Vector3(0, 0, 0) },
          texturePosition: { value: null as unknown as THREE.Texture }
        },
        depthTest: true,
        depthWrite: true,
        side: THREE.BackSide,
        blending: THREE.NoBlending,
        glslVersion: THREE.GLSL3
      });

      motionMatRef.current = new MeshMotionMaterial({
        vertexShader: particlesMotionVertexShader,
        depthTest: true,
        depthWrite: true,
        blending: THREE.NoBlending,
        uniforms: {
          texturePosition: { value: null as unknown as THREE.Texture },
          texturePrevPosition: { value: null as unknown as THREE.Texture }
        }
      });
    } else {
      geoRef.current = buildTrianglesGeometry(w, h, triangleSize);
      matRef.current = new THREE.ShaderMaterial({
        vertexShader: trianglesVertexShader,
        fragmentShader: particlesFragmentShader,
        uniforms: THREE.UniformsUtils.merge([
          THREE.UniformsLib['common'],
          THREE.UniformsLib['aomap'],
          THREE.UniformsLib['lightmap'],
          THREE.UniformsLib['emissivemap'],
          THREE.UniformsLib['bumpmap'],
          THREE.UniformsLib['normalmap'],
          THREE.UniformsLib['displacementmap'],
          THREE.UniformsLib['gradientmap'],
          THREE.UniformsLib['fog'],
          THREE.UniformsLib['lights'],
          {
            texturePosition: { value: null },
            color1: { value: new THREE.Color(color1) },
            color2: { value: new THREE.Color(color2) },
            flipRatio: { value: flipRatio }
          }
        ]),
        lights: true,
        transparent: false,
        depthWrite: true,
        depthTest: true,
        blending: THREE.NoBlending,
        glslVersion: THREE.GLSL3
      });

      distanceMatRef.current = new THREE.ShaderMaterial({
        vertexShader: trianglesDistanceShader,
        fragmentShader: particlesDistanceFragmentShader,
        uniforms: {
          lightPos: { value: new THREE.Vector3(0, 0, 0) },
          texturePosition: { value: null as unknown as THREE.Texture },
          flipRatio: { value: flipRatio }
        },
        depthTest: true,
        depthWrite: true,
        side: THREE.BackSide,
        blending: THREE.NoBlending,
        glslVersion: THREE.GLSL3
      });

      motionMatRef.current = new MeshMotionMaterial({
        vertexShader: trianglesMotionShader,
        depthTest: true,
        depthWrite: true,
        blending: THREE.NoBlending,
        uniforms: {
          texturePosition: { value: null as unknown as THREE.Texture },
          texturePrevPosition: { value: null as unknown as THREE.Texture },
          flipRatio: { value: flipRatio }
        }
      });
    }

    // If object already exists, update its material reference for motion blur
    const obj =
      mode === 'points'
        ? (pointsRef.current as unknown as { motionMaterial?: THREE.Material } | null)
        : (meshRef.current as unknown as { motionMaterial?: THREE.Material } | null);
    if (obj && motionMatRef.current) obj.motionMaterial = motionMatRef.current;

    return () => {
      // Clean up draw resources on param change
      const obj2 =
        mode === 'points'
          ? (pointsRef.current as unknown as { motionMaterial?: THREE.Material } | null)
          : (meshRef.current as unknown as { motionMaterial?: THREE.Material } | null);
      if (obj2) obj2.motionMaterial = undefined;
      motionMatRef.current?.dispose();
      distanceMatRef.current?.dispose();
      matRef.current?.dispose();
      geoRef.current?.dispose();
    };
  }, [mode, w, h, color1, color2, flipRatio, triangleSize]);

  // Rebuild triangles geometry if size changes at runtime
  useEffect(() => {
    if (mode !== 'triangles') return;
    if (!geoRef.current) return;
    const newGeo = buildTrianglesGeometry(w, h, triangleSize);
    const oldGeo = geoRef.current;
    geoRef.current = newGeo;
    // assign to mesh if mounted
    if (meshRef.current) {
      meshRef.current.geometry = newGeo as unknown as THREE.BufferGeometry;
    }
    oldGeo.dispose();
  }, [triangleSize, mode, w, h]);

  // Keep motion material flipRatio uniform in sync without rebuilding geometry
  useEffect(() => {
    if (mode !== 'triangles') return;
    if (motionMatRef.current && motionMatRef.current.uniforms.flipRatio) {
      (motionMatRef.current.uniforms.flipRatio as THREE.IUniform<number>).value = flipRatio;
    }
  }, [flipRatio, mode]);

  // Scale motion blur multiplier by triangle size for triangles mode
  useEffect(() => {
    if (mode !== 'triangles') return;
    if (motionMatRef.current && motionMatRef.current.uniforms.u_motionMultiplier) {
      // Heuristic: base 1.0 at size 2.5, scale proportionally
      const base = 2.5;
      const scale = triangleSize / base;
      (motionMatRef.current.uniforms.u_motionMultiplier as THREE.IUniform<number>).value = scale;
    }
  }, [triangleSize, mode]);

  // Attach legacy motion material to object for MotionBlur effect
  useEffect(() => {
    type MotionAttachable = { motionMaterial?: THREE.Material };
    const obj =
      mode === 'points'
        ? (pointsRef.current as unknown as MotionAttachable | null)
        : (meshRef.current as unknown as MotionAttachable | null);
    if (obj && motionMatRef.current) {
      obj.motionMaterial = motionMatRef.current;
    }
    return () => {
      if (obj) obj.motionMaterial = undefined;
    };
  }, [mode]);

  // React to color changes at runtime
  useEffect(() => {
    if (matRef.current) {
      (matRef.current.uniforms.color1.value as THREE.Color).set(color1);
      (matRef.current.uniforms.color2.value as THREE.Color).set(color2);
    }
  }, [color1, color2]);

  // Update follow target: either mouse on z=0 plane or synthetic follow point (legacy)
  useFrame(({ pointer }, delta) => {
    if (followMouse) {
      // pointer is -1..1 in r3f
      const ndc = new THREE.Vector2(pointer.x, pointer.y);
      raycaster.setFromCamera(ndc, camera);
      const hit = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(planeZ, hit)) {
        mouse3d.current.copy(hit);
      }
    } else {
      // Legacy follow path when followMouse is disabled
      followTimeRef.current += delta * Math.max(0.0001, speed);
      const t = followTimeRef.current;
      const r = 200; // 100 on mobile in legacy; keep 200 by default
      const h = 60; // 40 on mobile in legacy; keep 60 by default
      const follow = new THREE.Vector3(Math.cos(t) * r, Math.cos(t * 4) * h, Math.sin(t * 2) * r);
      // Lerp like legacy (0.2)
      mouse3d.current.lerp(follow, 0.2);
    }
  });

  // Simulation + draw per frame
  useFrame(({ clock }, delta) => {
    if (!simulator) return;

    // init animation 0..1 over ~2s
    const t = (performance.now() - startTime.current) / 1000;
    initAnim.current = Math.min(1, t / 2);

    // Step simulation via hook
    simulator.step({
      dt: delta * 1000,
      time: clock.getElapsedTime(),
      speed,
      dieSpeed,
      radius,
      curlSize,
      attraction,
      followMouse,
      initAnimation: initAnim.current,
      mouse3d: mouse3d.current
    });

    // Update draw material
    if (matRef.current) {
      const currentTex = simulator.texture;
      matRef.current.uniforms.texturePosition.value = currentTex;
      if (mode === 'triangles') {
        matRef.current.uniforms.flipRatio.value = flipRatio;
      }
    }

    // Update distance material
    if (distanceMatRef.current) {
      const currentTex = simulator.texture;
      distanceMatRef.current.uniforms.texturePosition.value = currentTex;
      if (mode === 'triangles' && distanceMatRef.current.uniforms.flipRatio) {
        (distanceMatRef.current.uniforms.flipRatio as THREE.IUniform<number>).value = flipRatio;
      }
    }

    // Update motion material uniforms for legacy motion blur
    if (motionMatRef.current) {
      const currentTex = simulator.texture;
      motionMatRef.current.uniforms.texturePosition.value = currentTex;
      motionMatRef.current.uniforms.texturePrevPosition.value =
        simulator.prevTexture ?? currentTex;
      if (mode === 'triangles') {
        motionMatRef.current.uniforms.flipRatio.value = flipRatio;
      }
    }
  });

  // Render points
  if (!geoRef.current || !matRef.current) return null;
  if (mode === 'points') {
    return (
      <points
        ref={pointsRef as RefObject<THREE.Points>}
        geometry={geoRef.current as unknown as THREE.BufferGeometry}
        material={matRef.current as unknown as THREE.Material}
        castShadow
        receiveShadow
        // @ts-ignore - Drei/React three types allow passing material instance
        customDistanceMaterial={distanceMatRef.current as unknown as THREE.Material}
      />
    );
  }
  return (
    <mesh
      ref={meshRef as RefObject<THREE.Mesh>}
      geometry={geoRef.current as unknown as THREE.BufferGeometry}
      material={matRef.current as unknown as THREE.Material}
      castShadow
      receiveShadow
      // @ts-ignore
      customDistanceMaterial={distanceMatRef.current as unknown as THREE.Material}
    />
  );
}
