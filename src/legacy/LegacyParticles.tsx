import * as THREE from "three";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import settings from "../config/settings.config";
import Simulator from "./Simulator";

// Minimal legacy-like shaders
const quadVert = `
precision highp float;
attribute vec3 position;
attribute vec2 uv;
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position,1.0); }
`;
const copyFrag = `
precision highp float;
uniform sampler2D u_texture;
varying vec2 vUv;
void main(){ gl_FragColor = texture2D(u_texture, vUv); }
`;
const positionFrag = `
precision highp float;
uniform vec2 uResolution;
uniform sampler2D texturePosition;
uniform sampler2D textureDefaultPosition;
uniform float time;
uniform float speed;
uniform float dieSpeed;
uniform float radius;
uniform float curlSize;
uniform float attraction;
uniform float initAnimation;
uniform vec3 mouse3d;

vec3 curl(vec3 p, float t, float s) {
  // lightweight placeholder; can be swapped by full legacy curl if needed
  float x = sin(p.y + t) * cos(p.z * s);
  float y = sin(p.z + t) * cos(p.x * s);
  float z = sin(p.x + t) * cos(p.y * s);
  return vec3(x, y, z);
}

void main(){
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec4 info = texture2D(texturePosition, uv);
  vec3 pos = mix(vec3(0.0,-200.0,0.0), info.xyz, smoothstep(0.0,0.3,initAnimation));
  float life = info.w - dieSpeed;
  vec3 follow = mix(vec3(0.0, -(1.0 - initAnimation) * 200.0, 0.0), mouse3d, smoothstep(0.2, 0.7, initAnimation));
  if(life < 0.0){
    vec4 seed = texture2D(textureDefaultPosition, uv);
    pos = seed.xyz * (1.0 + sin(time*15.0)*0.2 + (1.0 - initAnimation)) * 0.4 * radius;
    pos += follow;
    life = 0.5 + fract(seed.w * 21.4131 + time);
  }else{
    vec3 delta = follow - pos;
    float dist = length(delta);
    pos += delta * (0.005 + life * 0.01) * attraction * (1.0 - smoothstep(50.0, 350.0, dist)) * speed;
    pos += curl(pos * curlSize, time, 0.1 + (1.0 - life) * 0.1) * speed;
  }
  gl_FragColor = vec4(pos, life);
}
`;
const particlesVert = `
precision highp float;
uniform sampler2D texturePosition;
varying float vLife;
void main(){
  vec4 info = texture2D(texturePosition, position.xy);
  vLife = info.w;
  vec4 modelPosition = modelMatrix * vec4(info.xyz, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;
  float d = length(viewPosition.xyz);
  gl_PointSize = 1300.0 / max(0.0001, d) * smoothstep(0.0, 0.2, vLife);
}
`;
const particlesFrag = `
precision highp float;
varying float vLife;
uniform vec3 color1; uniform vec3 color2;
void main(){
  vec3 col = mix(color2, color1, smoothstep(0.0, 0.7, vLife));
  vec2 d = gl_PointCoord - 0.5;
  float alpha = 1.0 - smoothstep(0.2, 0.5, length(d));
  gl_FragColor = vec4(col, alpha);
}
`;

function makeSeedTexture(w: number, h: number) {
  const data = new Float32Array(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const stride = i * 4;
    const r = (0.5 + Math.random() * 0.5) * 50;
    const phi = (Math.random() - 0.5) * Math.PI;
    const theta = Math.random() * Math.PI * 2;
    data[stride + 0] = r * Math.cos(theta) * Math.cos(phi);
    data[stride + 1] = r * Math.sin(phi);
    data[stride + 2] = r * Math.sin(theta) * Math.cos(phi);
    data[stride + 3] = Math.random();
  }
  const tex = new THREE.DataTexture(
    data,
    w,
    h,
    THREE.RGBAFormat,
    THREE.FloatType
  );
  tex.needsUpdate = true;
  tex.generateMipmaps = false;
  tex.flipY = false;
  return tex;
}

const LegacyParticles = () => {
  const { gl, camera, raycaster, pointer } = useThree();
  const W = settings.simulatorTextureWidth;
  const H = settings.simulatorTextureHeight;

  // Offscreen scenes/materials
  const simScene = useMemo(() => new THREE.Scene(), []);
  const copyScene = useMemo(() => new THREE.Scene(), []);
  const fsGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array([
      -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0,
    ]);
    const uv = new Float32Array([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1]);
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    return g;
  }, []);

  const copyMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { u_texture: { value: null as unknown as THREE.Texture } },
        vertexShader: quadVert,
        fragmentShader: copyFrag,
      }),
    []
  );

  const positionMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uResolution: { value: new THREE.Vector2(W, H) },
          texturePosition: { value: null as unknown as THREE.Texture },
          textureDefaultPosition: { value: makeSeedTexture(W, H) },
          time: { value: 0 },
          speed: { value: settings.speed },
          dieSpeed: { value: settings.dieSpeed },
          radius: { value: settings.radius },
          curlSize: { value: settings.curlSize },
          attraction: { value: settings.attraction },
          initAnimation: { value: 1 },
          mouse3d: { value: new THREE.Vector3() },
        },
        vertexShader: quadVert,
        fragmentShader: positionFrag,
        depthTest: false,
        depthWrite: false,
      }),
    [W, H]
  );

  // Replace manual ping-pong with Simulator (legacy behavior)
  const simulatorRef = useRef<Simulator | null>(null);
  if (!simulatorRef.current) {
    simulatorRef.current = new Simulator(gl, W, H);
  }

  // Points geometry for lookup uv in position.xy
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
      color1: { value: new THREE.Color(settings.color1) },
      color2: { value: new THREE.Color(settings.color2) },
    }),
    []
  );
  const pointsRef = useRef<THREE.Points>(null!);
  const initAnimRef = useRef(0);

  // Recreate simulator on amount change and dispose on unmount
  useEffect(() => {
    simulatorRef.current!.recreate(W, H);
    // reset intro animation to replay easing if desired
    initAnimRef.current = 0;
    return () => {
      simulatorRef.current?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [W, H]);

  useFrame((state) => {
    // Advance intro animation like legacy: init += dt(ms)*0.00025 → dt(s)*0.25
    initAnimRef.current = Math.min(
      1,
      initAnimRef.current + state.clock.getDelta() * 0.25
    );
    // Seed already handled by Simulator on construct.
    // Mouse follow
    const normal = new THREE.Vector3();
    (camera as any).getWorldDirection(normal);
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
      normal,
      new THREE.Vector3()
    );
    raycaster.setFromCamera(pointer, camera);
    const hit = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(plane, hit)) {
      (positionMat.uniforms.mouse3d.value as THREE.Vector3).copy(hit);
    }
    // Update simulator (dt in ms) with mouse3d at the camera-aligned plane
    simulatorRef.current!.initAnimation = initAnimRef.current;
    simulatorRef.current!.update(
      state.clock.getDelta() * 1000,
      positionMat.uniforms.mouse3d.value as THREE.Vector3
    );
    // Draw pass: update texture
    const mat = pointsRef.current.material as THREE.ShaderMaterial;
    (mat.uniforms.texturePosition.value as THREE.Texture) =
      simulatorRef.current!.positionRenderTarget.texture;
    (mat.uniforms.color1.value as THREE.Color).set(settings.color1);
    (mat.uniforms.color2.value as THREE.Color).set(settings.color2);
  });

  return (
    <>
      {/* Sim scenes */}
      {createPortal(
        <mesh>
          <shaderMaterial args={[positionMat]} />
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[fsGeo.getAttribute("position").array as Float32Array, 3]}
            />
            <bufferAttribute
              attach="attributes-uv"
              args={[fsGeo.getAttribute("uv").array as Float32Array, 2]}
            />
          </bufferGeometry>
        </mesh>,
        simScene
      )}
      {createPortal(
        <mesh>
          <shaderMaterial args={[copyMat]} />
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[fsGeo.getAttribute("position").array as Float32Array, 3]}
            />
            <bufferAttribute
              attach="attributes-uv"
              args={[fsGeo.getAttribute("uv").array as Float32Array, 2]}
            />
          </bufferGeometry>
        </mesh>,
        copyScene
      )}

      {/* Draw */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[lookups, 3]} />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={particlesVert}
          fragmentShader={particlesFrag}
          uniforms={drawUniforms as unknown as { [k: string]: THREE.IUniform }}
          blending={THREE.NoBlending}
          depthWrite
        />
      </points>
    </>
  );
};

export default LegacyParticles;
