import * as THREE from "three";
import {
  motionBlurMotionFragShader,
  motionBlurMotionVertexShader,
} from "./motionBlurShaders";

interface MeshMotionMaterialParameters {
  uniforms?: Record<string, THREE.IUniform>;
  motionMultiplier?: number;
  vertexShader?: string;
  depthTest?: boolean;
  depthWrite?: boolean;
  side?: THREE.Side;
  blending?: THREE.Blending;
}

export default class MeshMotionMaterial extends THREE.ShaderMaterial {
  motionMultiplier: number;

  constructor(parameters: MeshMotionMaterialParameters = {}) {
    const customUniforms = parameters.uniforms || {};

    // Base uniforms like legacy (u_prevModelViewMatrix + u_motionMultiplier)
    const baseUniforms: Record<string, THREE.IUniform> = {
      u_prevModelViewMatrix: { value: new THREE.Matrix4() },
      u_motionMultiplier: { value: parameters.motionMultiplier || 1 },
      // Legacy particle-specific uniforms
      texturePosition: { value: null as unknown as THREE.Texture },
      texturePrevPosition: { value: null as unknown as THREE.Texture },
      flipRatio: { value: 0 },
      size: { value: 1 },
    };

    // Merge with custom uniforms (like legacy fillIn)
    const finalUniforms = { ...baseUniforms, ...customUniforms };

    super({
      uniforms: finalUniforms,
      vertexShader: parameters.vertexShader || motionBlurMotionVertexShader,
      fragmentShader: motionBlurMotionFragShader,
      depthTest: parameters.depthTest ?? true,
      depthWrite: parameters.depthWrite ?? true,
      side: parameters.side || THREE.FrontSide,
      blending: parameters.blending ?? THREE.NoBlending,
      glslVersion: THREE.GLSL3,
    });

    // Store motionMultiplier property like legacy
    this.motionMultiplier = parameters.motionMultiplier || 1;

    // Update uniform value when motionMultiplier changes
    this.uniforms.u_motionMultiplier.value = this.motionMultiplier;
  }

  // Getter/setter for motionMultiplier to update uniform
  setMotionMultiplier(value: number) {
    this.motionMultiplier = value;
    this.uniforms.u_motionMultiplier.value = value;
  }

  getMotionMultiplier(): number {
    return this.motionMultiplier;
  }
}
