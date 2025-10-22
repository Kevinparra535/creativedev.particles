import { useCallback, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { quadVert, positionFrag } from '../../../assets/glsl3/simulationShaders';
import { createPingPong } from '@/utils/fboHelper';

export type SimStepParams = {
  dt: number;
  time: number;
  speed: number;
  dieSpeed: number;
  radius: number;
  curlSize: number;
  attraction: number;
  followMouse: boolean;
  initAnimation: number;
  mouse3d: THREE.Vector3;
};

export type FboSimulator = {
  texture: THREE.Texture; // current positions
  prevTexture: THREE.Texture; // previous positions (for motion blur)
  defaultTexture: THREE.Texture; // initial seed distribution
  resolution: THREE.Vector2;
  step: (params: SimStepParams) => void;
  dispose: () => void;
};

// GLSL3 initializer to populate default positions texture with a sphere distribution and seeded life
const initPositionsFrag = /* glsl */ `
precision highp float;
out vec4 outColor;
uniform vec2 resolution;

float hash(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

void main(){
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / resolution;
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

export function useFboSimulator(
  gl: THREE.WebGLRenderer,
  width: number,
  height: number
): FboSimulator {
  const resolution = useMemo(() => new THREE.Vector2(width, height), [width, height]);

  // Offscreen scene/camera + mesh for full-screen quad
  const sceneRef = useRef<THREE.Scene | null>(null);
  const camRef = useRef<THREE.OrthographicCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);

  // Materials
  const initMatRef = useRef<THREE.RawShaderMaterial | null>(null);
  const simMatRef = useRef<THREE.RawShaderMaterial | null>(null);

  // Targets
  const pingRef = useRef<ReturnType<typeof createPingPong> | null>(null);
  const defaultRTRef = useRef<THREE.WebGLRenderTarget | null>(null);
  const prevTexRef = useRef<THREE.Texture | null>(null);

  // Create resources
  useEffect(() => {
    // Scene and camera
    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), undefined);
    scene.add(mesh);
    sceneRef.current = scene;
    camRef.current = cam;
    meshRef.current = mesh;

    // Default positions RT
    const defaultRT = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      depthBuffer: false,
      stencilBuffer: false
    });
    defaultRT.texture.generateMipmaps = false;
    defaultRTRef.current = defaultRT;

    // Init material to populate default positions
    const initMat = new THREE.RawShaderMaterial({
      vertexShader: quadVert,
      fragmentShader: initPositionsFrag,
      uniforms: { resolution: { value: resolution } },
      glslVersion: THREE.GLSL3,
      depthWrite: false,
      depthTest: false,
      blending: THREE.NoBlending
    });
    initMatRef.current = initMat;

    // Simulation material
    const simMat = new THREE.RawShaderMaterial({
      vertexShader: quadVert,
      fragmentShader: positionFrag,
      uniforms: {
        resolution: { value: resolution.clone() },
        texturePosition: { value: null },
        textureDefaultPosition: { value: null },
        time: { value: 0 },
        speed: { value: 1 },
        dieSpeed: { value: 0.003 },
        radius: { value: 300 },
        curlSize: { value: 0.015 },
        attraction: { value: 0.6 },
        initAnimation: { value: 0 },
        mouse3d: { value: new THREE.Vector3() },
        followMouse: { value: 1 }
      },
      glslVersion: THREE.GLSL3,
      depthWrite: false,
      depthTest: false,
      blending: THREE.NoBlending
    });
    simMatRef.current = simMat;

    // Create ping-pong targets
    const ping = createPingPong(width, height, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      depthBuffer: false,
      stencilBuffer: false
    });
    pingRef.current = ping;

    // Seed defaultRT, then copy into both ping-pong buffers by rendering twice
    if (meshRef.current && initMatRef.current) {
      meshRef.current.material = initMatRef.current;
      gl.setRenderTarget(defaultRT);
      gl.render(scene, cam);
      gl.setRenderTarget(null);
    }

    // Prime ping-pong targets with default positions (render init into write, swap, repeat)
    if (meshRef.current && initMatRef.current && pingRef.current) {
      meshRef.current.material = initMatRef.current;
      gl.setRenderTarget(pingRef.current.write());
      gl.render(scene, cam);
      gl.setRenderTarget(null);
      pingRef.current.swap();
      gl.setRenderTarget(pingRef.current.write());
      gl.render(scene, cam);
      gl.setRenderTarget(null);
      pingRef.current.swap();
    }

    return () => {
      initMatRef.current?.dispose();
      simMatRef.current?.dispose();
      meshRef.current?.geometry.dispose();
      defaultRTRef.current?.dispose();
      pingRef.current?.dispose();
    };
  }, [gl, width, height, resolution]);

  const step = useCallback((params: SimStepParams) => {
    const ping = pingRef.current;
    const simMat = simMatRef.current;
    const scene = sceneRef.current;
    const cam = camRef.current;
    const mesh = meshRef.current;
    const defaultRT = defaultRTRef.current;
    if (!ping || !simMat || !scene || !cam || !mesh || !defaultRT) return;

    const read = ping.read();
    const write = ping.write();

    // Update uniforms
    simMat.uniforms.time.value = params.time;
    const deltaRatio = params.dt / (1000 / 60);
    simMat.uniforms.speed.value = params.speed * deltaRatio;
    simMat.uniforms.dieSpeed.value = params.dieSpeed * deltaRatio;
    simMat.uniforms.radius.value = params.radius;
    simMat.uniforms.curlSize.value = params.curlSize;
    simMat.uniforms.attraction.value = params.attraction;
    simMat.uniforms.initAnimation.value = params.initAnimation;
    (simMat.uniforms.mouse3d.value as THREE.Vector3).copy(params.mouse3d);
    simMat.uniforms.followMouse.value = params.followMouse ? 1 : 0;
    simMat.uniforms.texturePosition.value = read.texture;
    simMat.uniforms.textureDefaultPosition.value = defaultRT.texture;

    // Render simulation to write target
    mesh.material = simMat;
    gl.setRenderTarget(write);
    gl.render(scene, cam);
    gl.setRenderTarget(null);

    // Update prev/current textures for consumers (motion blur)
    prevTexRef.current = read.texture;

    // Swap ping-pong
    ping.swap();
  }, []);

  // Expose live getters so consumers always read the up-to-date textures
  return {
    get texture() {
      return pingRef.current ? pingRef.current.read().texture : (new THREE.Texture() as any);
    },
    get prevTexture() {
      return (
        prevTexRef.current ||
        (pingRef.current ? pingRef.current.read().texture : (new THREE.Texture() as any))
      );
    },
    get defaultTexture() {
      return defaultRTRef.current
        ? defaultRTRef.current.texture
        : ((new THREE.Texture() as unknown) as THREE.Texture);
    },
    resolution,
    step,
    dispose: () => {
      initMatRef.current?.dispose();
      simMatRef.current?.dispose();
      meshRef.current?.geometry.dispose();
      defaultRTRef.current?.dispose();
      pingRef.current?.dispose();
    }
  } as unknown as FboSimulator;
}

export default useFboSimulator;
