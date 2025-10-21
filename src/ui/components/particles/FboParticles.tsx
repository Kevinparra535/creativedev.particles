import * as React from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import DefaultSettings from "../../../config/settings.config";
import { positionFrag, quadVert } from "../../../assets/glsl3/simulationShaders";
import {
  particlesFragmentShader,
  particlesVertexShader,
  trianglesVertexShader,
  particlesMotionVertexShader,
  trianglesMotionShader,
  particlesDistanceVertexShader,
  particlesDistanceFragmentShader,
  trianglesDistanceShader,
} from "../../../assets/glsl3/particlesShaders";
import { createPingPong } from "../../../utils/fboHelper";
import MeshMotionMaterial from "../../../assets/postprocessing/effects/motionBlur/MeshMotionMaterial";

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
  mode?: "points" | "triangles";
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
      const u = (x + 0.5) / width;
      const v = (y + 0.5) / height;
      positions[ptr++] = u;
      positions[ptr++] = v;
      positions[ptr++] = 0;
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return geo;
}

function buildTrianglesGeometry(
  width: number,
  height: number,
  triSize: number
) {
  const count = width * height;
  const triVerts = [
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(-0.8660254, -0.5, 0),
    new THREE.Vector3(0.8660254, -0.5, 0),
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
      const u = (x + 0.5) / width;
      const v = (y + 0.5) / height;
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
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("positionFlip", new THREE.BufferAttribute(positionFlip, 3));
  geo.setAttribute("fboUV", new THREE.BufferAttribute(fboUV, 2));
  return geo;
}

// GLSL3 initializer to populate default positions texture with a sphere distribution and seeded life
const initPositionsFrag = /* glsl */ `
precision highp float;
out vec4 outColor;
uniform vec2 resolution;

// hash from uv to random
float hash(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

void main(){
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / resolution; // 0..1

  // index-based fibonacci sphere
  float w = resolution.x;
  float h = resolution.y;
  float idx = floor(frag.y) * w + floor(frag.x);
  float N = w * h;
  float i = idx + 0.5;
  float phi = acos(1.0 - 2.0 * i / N);
  float theta = 3.14159265 * (1.0 + sqrt(5.0)) * i;
  vec3 dir = vec3(
    sin(phi) * cos(theta),
    sin(phi) * sin(theta),
    cos(phi)
  );

  float life = 0.5 + 0.5 * hash(uv * 37.42);
  outColor = vec4(dir, life);
}
`;

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
    mode = "points",
    triangleSize = 2.5,
    flipRatio = 0,
  } = props;
  const { gl, camera } = useThree();
  const w = cols ?? size;
  const h = rows ?? size;
  const resolution = React.useMemo(() => new THREE.Vector2(w, h), [w, h]);

  // RTTs: ping-pong for positions and one default positions texture
  const pingpongRef = React.useRef<ReturnType<typeof createPingPong> | null>(
    null
  );
  const defaultRTRef = React.useRef<THREE.WebGLRenderTarget | null>(null);

  // Offscreen quad scene for simulation
  const simSceneRef = React.useRef<THREE.Scene | null>(null);
  const simCamRef = React.useRef<THREE.OrthographicCamera | null>(null);
  const simMeshRef = React.useRef<THREE.Mesh | null>(null);
  const initMatRef = React.useRef<THREE.RawShaderMaterial | null>(null);
  const simMatRef = React.useRef<THREE.RawShaderMaterial | null>(null);

  // Particles draw material and geometry
  const geoRef = React.useRef<THREE.BufferGeometry | null>(null);
  const matRef = React.useRef<THREE.ShaderMaterial | null>(null);
  const pointsRef = React.useRef<THREE.Points | null>(null);
  const meshRef = React.useRef<THREE.Mesh | null>(null);
  const motionMatRef = React.useRef<MeshMotionMaterial | null>(null);
  const distanceMatRef = React.useRef<THREE.ShaderMaterial | null>(null);
  const prevTexRef = React.useRef<THREE.Texture | null>(null);

  // Time and init animation
  const startTime = React.useRef<number>(performance.now());
  const initAnim = React.useRef(0);

  // Mouse 3D target on z=0 plane
  const mouse3d = React.useRef(new THREE.Vector3());
  const followTimeRef = React.useRef(0);
  const planeZ = React.useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
    []
  );
  const raycaster = React.useMemo(() => new THREE.Raycaster(), []);

  // Init resources once
  React.useEffect(() => {
    // Create ping-pong
    pingpongRef.current = createPingPong(w, h, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      depthBuffer: false,
      stencilBuffer: false,
    });

    // Default positions RT
    defaultRTRef.current = new THREE.WebGLRenderTarget(w, h, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      depthBuffer: false,
      stencilBuffer: false,
    });
    defaultRTRef.current.texture.generateMipmaps = false;

    // Offscreen sim scene and camera
    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), undefined);
    scene.add(mesh);
    simSceneRef.current = scene;
    simCamRef.current = cam;
    simMeshRef.current = mesh;

    // Init material to populate default positions
    initMatRef.current = new THREE.RawShaderMaterial({
      vertexShader: quadVert,
      fragmentShader: initPositionsFrag,
      uniforms: {
        resolution: { value: resolution },
      },
      glslVersion: THREE.GLSL3,
      depthWrite: false,
      depthTest: false,
      blending: THREE.NoBlending,
    });

    // Simulation material
    simMatRef.current = new THREE.RawShaderMaterial({
      vertexShader: quadVert,
      fragmentShader: positionFrag,
      uniforms: {
        resolution: { value: resolution },
        texturePosition: { value: null },
        textureDefaultPosition: { value: null },
        time: { value: 0 },
        speed: { value: speed },
        dieSpeed: { value: dieSpeed },
        radius: { value: radius },
        curlSize: { value: curlSize },
        attraction: { value: attraction },
        initAnimation: { value: 0 },
        mouse3d: { value: new THREE.Vector3() },
        followMouse: { value: followMouse ? 1 : 0 },
      },
      glslVersion: THREE.GLSL3,
      depthWrite: false,
      depthTest: false,
      blending: THREE.NoBlending,
    });

    // Fill default positions once
    if (simMeshRef.current && initMatRef.current && defaultRTRef.current) {
      simMeshRef.current.material = initMatRef.current;
      gl.setRenderTarget(defaultRTRef.current);
      gl.render(scene, cam);
      gl.setRenderTarget(null);
    }

    // Note: draw geometry/material are now created in a separate effect on mode change

    return () => {
      // Dispose
      pingpongRef.current?.dispose();
      defaultRTRef.current?.dispose();
      // Draw resources disposed in draw effect cleanup
      initMatRef.current?.dispose();
      simMatRef.current?.dispose();
      simMeshRef.current?.geometry.dispose();
    };
  }, [
    gl,
    size,
    resolution,
    color1,
    color2,
    speed,
    dieSpeed,
    radius,
    curlSize,
    attraction,
  ]);

  // Build draw geometry/material on mode or parameter change
  React.useEffect(() => {
    // Dispose previous
    geoRef.current?.dispose();
    matRef.current?.dispose();
    motionMatRef.current?.dispose();
    distanceMatRef.current?.dispose();

    if (mode === "points") {
      geoRef.current = buildLookupGeometry(w, h);
      matRef.current = new THREE.ShaderMaterial({
        vertexShader: particlesVertexShader,
        fragmentShader: particlesFragmentShader,
        uniforms: {
          texturePosition: { value: null },
          color1: { value: new THREE.Color(color1) },
          color2: { value: new THREE.Color(color2) },
          flipRatio: { value: 0 },
        },
        transparent: false,
        depthWrite: false,
        depthTest: true,
        blending: THREE.NoBlending,
        glslVersion: THREE.GLSL3,
      });

      distanceMatRef.current = new THREE.ShaderMaterial({
        vertexShader: particlesDistanceVertexShader,
        fragmentShader: particlesDistanceFragmentShader,
        uniforms: {
          lightPos: { value: new THREE.Vector3(0, 0, 0) },
          texturePosition: { value: null as unknown as THREE.Texture },
        },
        depthTest: true,
        depthWrite: true,
        side: THREE.BackSide,
        blending: THREE.NoBlending,
        glslVersion: THREE.GLSL3,
      });

      motionMatRef.current = new MeshMotionMaterial({
        vertexShader: particlesMotionVertexShader,
        depthTest: true,
        depthWrite: true,
        blending: THREE.NoBlending,
        uniforms: {
          texturePosition: { value: null as unknown as THREE.Texture },
          texturePrevPosition: { value: null as unknown as THREE.Texture },
        },
      });
    } else {
      geoRef.current = buildTrianglesGeometry(w, h, triangleSize);
      matRef.current = new THREE.ShaderMaterial({
        vertexShader: trianglesVertexShader,
        fragmentShader: particlesFragmentShader,
        uniforms: {
          texturePosition: { value: null },
          color1: { value: new THREE.Color(color1) },
          color2: { value: new THREE.Color(color2) },
          flipRatio: { value: flipRatio },
        },
        transparent: false,
        depthWrite: true,
        depthTest: true,
        blending: THREE.NoBlending,
        glslVersion: THREE.GLSL3,
      });

      distanceMatRef.current = new THREE.ShaderMaterial({
        vertexShader: trianglesDistanceShader,
        fragmentShader: particlesDistanceFragmentShader,
        uniforms: {
          lightPos: { value: new THREE.Vector3(0, 0, 0) },
          texturePosition: { value: null as unknown as THREE.Texture },
          flipRatio: { value: flipRatio },
        },
        depthTest: true,
        depthWrite: true,
        side: THREE.BackSide,
        blending: THREE.NoBlending,
        glslVersion: THREE.GLSL3,
      });

      motionMatRef.current = new MeshMotionMaterial({
        vertexShader: trianglesMotionShader,
        depthTest: true,
        depthWrite: true,
        blending: THREE.NoBlending,
        uniforms: {
          texturePosition: { value: null as unknown as THREE.Texture },
          texturePrevPosition: { value: null as unknown as THREE.Texture },
          flipRatio: { value: flipRatio },
        },
      });
    }

    // If object already exists, update its material reference for motion blur
    const obj =
      mode === "points"
        ? (pointsRef.current as unknown as { motionMaterial?: THREE.Material } | null)
        : (meshRef.current as unknown as { motionMaterial?: THREE.Material } | null);
    if (obj && motionMatRef.current) obj.motionMaterial = motionMatRef.current;

    return () => {
      // Clean up draw resources on param change
      const obj2 =
        mode === "points"
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
  React.useEffect(() => {
    if (mode !== "triangles") return;
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
  React.useEffect(() => {
    if (mode !== "triangles") return;
    if (motionMatRef.current && motionMatRef.current.uniforms.flipRatio) {
      (
        motionMatRef.current.uniforms.flipRatio as THREE.IUniform<number>
      ).value = flipRatio;
    }
  }, [flipRatio, mode]);

  // Scale motion blur multiplier by triangle size for triangles mode
  React.useEffect(() => {
    if (mode !== "triangles") return;
    if (motionMatRef.current && motionMatRef.current.uniforms.u_motionMultiplier) {
      // Heuristic: base 1.0 at size 2.5, scale proportionally
      const base = 2.5;
      const scale = triangleSize / base;
      (motionMatRef.current.uniforms.u_motionMultiplier as THREE.IUniform<number>).value = scale;
    }
  }, [triangleSize, mode]);

  // Attach legacy motion material to object for MotionBlur effect
  React.useEffect(() => {
    type MotionAttachable = { motionMaterial?: THREE.Material };
    const obj =
      mode === "points"
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
  React.useEffect(() => {
    if (matRef.current) {
      (matRef.current.uniforms.color1.value as THREE.Color).set(
        color1 as THREE.ColorRepresentation
      );
      (matRef.current.uniforms.color2.value as THREE.Color).set(
        color2 as THREE.ColorRepresentation
      );
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
      const h = 60;  // 40 on mobile in legacy; keep 60 by default
      const follow = new THREE.Vector3(
        Math.cos(t) * r,
        Math.cos(t * 4.0) * h,
        Math.sin(t * 2.0) * r
      );
      // Lerp like legacy (0.2)
      mouse3d.current.lerp(follow, 0.2);
    }
  });

  // Simulation + draw per frame
  useFrame(({ clock }, delta) => {
    if (
      !pingpongRef.current ||
      !simMatRef.current ||
      !simMeshRef.current ||
      !simSceneRef.current ||
      !simCamRef.current
    )
      return;

    // init animation 0..1 over ~2s
    const t = (performance.now() - startTime.current) / 1000;
    initAnim.current = Math.min(1, t / 2);

    const pingpong = pingpongRef.current;
    const read = pingpong.read();
    const write = pingpong.write();

    // Setup simulation uniforms
    const simMat = simMatRef.current;
  simMat.uniforms.time.value = clock.getElapsedTime();
  // Live update dynamic uniforms from props (scale by dt like legacy)
  const deltaRatio = delta / (1.0 / 60.0);
  simMat.uniforms.speed.value = speed * deltaRatio;
  simMat.uniforms.dieSpeed.value = dieSpeed * deltaRatio;
    simMat.uniforms.radius.value = radius;
  simMat.uniforms.curlSize.value = curlSize;
  // Keep attraction active even when followMouse is off; shader chooses target
  // between baseFollow and mouse via followMouse uniform.
  simMat.uniforms.attraction.value = attraction;
  simMat.uniforms.followMouse.value = followMouse ? 1 : 0;
    simMat.uniforms.texturePosition.value = read.texture;
    simMat.uniforms.textureDefaultPosition.value =
      defaultRTRef.current?.texture ?? null;
    simMat.uniforms.initAnimation.value = initAnim.current;
  // Always push current target into shader; keep followMouse enabled so we blend towards the target
  (simMat.uniforms.mouse3d.value as THREE.Vector3).copy(mouse3d.current);
  simMat.uniforms.followMouse.value = 1; // drive towards target regardless of UI toggle (legacy style)

    // Render simulation step to write target
    simMeshRef.current.material = simMat;
    gl.setRenderTarget(write);
    gl.render(simSceneRef.current, simCamRef.current);
    gl.setRenderTarget(null);

    // Swap
    pingpong.swap();

    // Update draw material
    if (matRef.current) {
      const currentTex = pingpong.read().texture;
      matRef.current.uniforms.texturePosition.value = currentTex;
      if (mode === "triangles") {
        matRef.current.uniforms.flipRatio.value = flipRatio;
      }
    }

    // Update distance material
    if (distanceMatRef.current) {
      const currentTex = pingpong.read().texture;
      distanceMatRef.current.uniforms.texturePosition.value = currentTex;
      if (mode === "triangles" && distanceMatRef.current.uniforms.flipRatio) {
        (distanceMatRef.current.uniforms.flipRatio as THREE.IUniform<number>).value = flipRatio;
      }
    }

    // Update motion material uniforms for legacy motion blur
    if (motionMatRef.current) {
      const currentTex = pingpong.read().texture;
      motionMatRef.current.uniforms.texturePosition.value = currentTex;
      motionMatRef.current.uniforms.texturePrevPosition.value =
        prevTexRef.current ?? currentTex;
      if (mode === "triangles") {
        motionMatRef.current.uniforms.flipRatio.value = flipRatio;
      }
      // After using, remember current as previous
      prevTexRef.current = currentTex;
    }
  });

  // Render points
  if (!geoRef.current || !matRef.current) return null;
  if (mode === "points") {
    return (
      <points
        ref={pointsRef as React.RefObject<THREE.Points>}
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
      ref={meshRef as React.RefObject<THREE.Mesh>}
      geometry={geoRef.current as unknown as THREE.BufferGeometry}
      material={matRef.current as unknown as THREE.Material}
      castShadow
      receiveShadow
      // @ts-ignore
      customDistanceMaterial={distanceMatRef.current as unknown as THREE.Material}
    />
  );
}
