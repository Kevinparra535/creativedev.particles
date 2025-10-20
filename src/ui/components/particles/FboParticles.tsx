import * as React from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import DefaultSettings from "../../../config/settings.config";
import { positionFrag, quadVert } from "../../../glsl/simulationShaders";
import {
  particlesFragmentShader,
  particlesVertexShader,
  trianglesVertexShader,
} from "../../../glsl/particlesShaders";
import { createPingPong } from "../../../utils/fboHelper";

type Props = {
  size?: number; // square fallback
  cols?: number; // FBO width
  rows?: number; // FBO height
  color1?: THREE.ColorRepresentation;
  color2?: THREE.ColorRepresentation;
  radius?: number;
  attraction?: number;
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

  // Time and init animation
  const startTime = React.useRef<number>(performance.now());
  const initAnim = React.useRef(0);

  // Mouse 3D target on z=0 plane
  const mouse3d = React.useRef(new THREE.Vector3());
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

    // Build draw geometry and material
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
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        glslVersion: THREE.GLSL3,
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
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        glslVersion: THREE.GLSL3,
      });
    }

    return () => {
      // Dispose
      pingpongRef.current?.dispose();
      defaultRTRef.current?.dispose();
      geoRef.current?.dispose();
      matRef.current?.dispose();
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

  // React to color changes at runtime
  React.useEffect(() => {
    if (matRef.current) {
      (matRef.current.uniforms.color1.value as THREE.Color).set(color1 as any);
      (matRef.current.uniforms.color2.value as THREE.Color).set(color2 as any);
    }
  }, [color1, color2]);

  // Update mouse target in world space (z=0 plane)
  useFrame(({ pointer }) => {
    // pointer is -1..1 in r3f
    const ndc = new THREE.Vector2(pointer.x, pointer.y);
    raycaster.setFromCamera(ndc, camera);
    const hit = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(planeZ, hit)) {
      mouse3d.current.copy(hit);
    }
  });

  // Simulation + draw per frame
  useFrame(({ clock }) => {
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
    // Live update dynamic uniforms from props
    simMat.uniforms.speed.value = speed;
    simMat.uniforms.dieSpeed.value = dieSpeed;
    simMat.uniforms.radius.value = radius;
    simMat.uniforms.curlSize.value = curlSize;
    simMat.uniforms.attraction.value = attraction;
    simMat.uniforms.texturePosition.value = read.texture;
    simMat.uniforms.textureDefaultPosition.value =
      defaultRTRef.current?.texture ?? null;
    simMat.uniforms.initAnimation.value = initAnim.current;
    (simMat.uniforms.mouse3d.value as THREE.Vector3).copy(mouse3d.current);

    // Render simulation step to write target
    simMeshRef.current.material = simMat;
    gl.setRenderTarget(write);
    gl.render(simSceneRef.current, simCamRef.current);
    gl.setRenderTarget(null);

    // Swap
    pingpong.swap();

    // Update draw material
    if (matRef.current) {
      matRef.current.uniforms.texturePosition.value = pingpong.read().texture;
      if (mode === "triangles") {
        matRef.current.uniforms.flipRatio.value = flipRatio;
      }
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
      />
    );
  }
  return (
    <mesh
      ref={meshRef as React.RefObject<THREE.Mesh>}
      geometry={geoRef.current as unknown as THREE.BufferGeometry}
      material={matRef.current as unknown as THREE.Material}
    />
  );
}
