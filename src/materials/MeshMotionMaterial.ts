import * as THREE from "three";

// Minimal mesh motion vector material for particles/triangles.
// Encodes screen-space velocity in RG channels (packed to 0..1), A stores magnitude.

const motionVert = /* glsl */ `
precision highp float;
uniform sampler2D texturePosition;
uniform sampler2D texturePrevPosition;
uniform float flipRatio;
uniform float size;
attribute vec3 positionFlip;
attribute vec2 fboUV;
varying vec2 vVelocity; // screen-space velocity
varying float vSpeed;

vec4 project(vec3 world){
  vec4 mv = viewMatrix * vec4(world, 1.0);
  vec4 clip = projectionMatrix * mv;
  return clip / clip.w;
}

void main(){
  vec3 base = mix(position, positionFlip, step(0.5, mod(flipRatio, 2.0)));
  vec3 p = texture2D(texturePosition, fboUV).xyz;
  vec3 pp = texture2D(texturePrevPosition, fboUV).xyz;
  // Current vertex pos: billboard offset in view space
  vec4 centerV = viewMatrix * modelMatrix * vec4(p, 1.0);
  vec4 posV = centerV + vec4(base.xy * size, 0.0, 0.0);
  vec4 clip = projectionMatrix * posV;
  gl_Position = clip;

  vec2 curSS = clip.xy / max(1e-6, clip.w);
  vec4 prevCenterV = viewMatrix * modelMatrix * vec4(pp, 1.0);
  vec4 prevPosV = prevCenterV + vec4(base.xy * size, 0.0, 0.0);
  vec4 prevClip = projectionMatrix * prevPosV;
  vec2 prevSS = prevClip.xy / max(1e-6, prevClip.w);
  vVelocity = curSS - prevSS; // NDC velocity, will be used downstream
  vSpeed = length(vVelocity);
}
`;

const motionFrag = /* glsl */ `
precision highp float;
varying vec2 vVelocity;
varying float vSpeed;
void main(){
  // Pack velocity from -1..1 to 0..1
  vec2 packed = vVelocity * 0.5 + 0.5;
  gl_FragColor = vec4(packed, vSpeed, 1.0);
}
`;

export default class MeshMotionMaterial extends THREE.ShaderMaterial {
  constructor(params?: { uniforms?: Record<string, THREE.IUniform> }) {
    const baseUniforms: Record<string, THREE.IUniform> = {
      texturePosition: { value: null as unknown as THREE.Texture },
      texturePrevPosition: { value: null as unknown as THREE.Texture },
      flipRatio: { value: 0 },
      size: { value: 1 },
    };
    if (params?.uniforms) Object.assign(baseUniforms, params.uniforms);
    super({
      uniforms: baseUniforms,
      vertexShader: motionVert,
      fragmentShader: motionFrag,
      depthTest: true,
      depthWrite: true,
      blending: THREE.NoBlending,
    });
  }
}
