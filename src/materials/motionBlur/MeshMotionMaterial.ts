import * as THREE from "three";
import { motionBlurMotionVertexShader } from "./motionBlurMotion.vert";
import { motionBlurMotionFragShader } from "./motionBlurMotion.frag";

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
      vertexShader: motionBlurMotionVertexShader,
      fragmentShader: motionBlurMotionFragShader,
      depthTest: true,
      depthWrite: true,
      blending: THREE.NoBlending,
    });
  }
}
