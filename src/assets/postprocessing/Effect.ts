import * as THREE from "three";
import * as fboHelper from "../../utils/fboHelper";
import effectComposer from "./EffectComposer";

/**
 * Legacy-compatible Effect base class for postprocessing effects
 */
export default class Effect {
  uniforms: Record<string, THREE.IUniform>;
  enabled: boolean;
  vertexShader: string;
  fragmentShader: string;
  isRawMaterial: boolean;
  addRawShaderPrefix: boolean;
  material?: THREE.Material;
  needsResize: boolean;

  constructor() {
    this.uniforms = {};
    this.enabled = true;
    this.vertexShader = "";
    this.fragmentShader = "";
    this.isRawMaterial = true;
    this.addRawShaderPrefix = true;
    this.needsResize = false;
  }

  /**
   * Initialize effect with configuration
   * @param cfg Effect configuration
   */
  init(cfg: Partial<Effect> = {}) {
    // Merge configuration
    Object.assign(this, {
      uniforms: {
        u_texture: { value: null as unknown as THREE.Texture },
        u_resolution: { value: new THREE.Vector2() },
        u_aspect: { value: 1 },
      },
      enabled: true,
      vertexShader: "",
      fragmentShader: "",
      isRawMaterial: true,
      addRawShaderPrefix: true,
      glslVersion: THREE.GLSL3,
      ...cfg,
    });

    // Set default vertex shader if not provided
    if (!this.vertexShader) {
      this.vertexShader = this.isRawMaterial
        ? fboHelper.getVertexShader()
        : this.getShaderMaterialQuadVertexShader();
    }

    // Create material
    this.createMaterial();
  }

  /**
   * Create shader material for the effect
   */
  private createMaterial() {
    const MaterialClass = this.isRawMaterial
      ? THREE.RawShaderMaterial
      : THREE.ShaderMaterial;

    let vertexShader = this.vertexShader;
    let fragmentShader = this.fragmentShader;

    // Add raw shader prefix if needed
    if (this.isRawMaterial && this.addRawShaderPrefix) {
      const prefix = fboHelper.getRawShaderPrefix();
      if (!vertexShader.includes("precision")) {
        vertexShader = prefix + vertexShader;
      }
      if (!fragmentShader.includes("precision")) {
        fragmentShader = prefix + fragmentShader;
      }
    }

    this.material = new MaterialClass({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader,
      // Ensure GLSL3 so we can use in/out and layout qualifiers in shaders
      glslVersion: THREE.GLSL3,
    });
  }

  /**
   * Handle resize event
   * @param width New width
   * @param height New height
   */
  resize(width: number, height: number) {
    if (this.uniforms.u_resolution) {
      (this.uniforms.u_resolution.value as THREE.Vector2).set(width, height);
    }
    if (this.uniforms.u_aspect) {
      this.uniforms.u_aspect.value = width / height;
    }
    this.needsResize = true;
  }

  /**
   * Render the effect (legacy-compatible signature)
   * @param dt Delta time
   * @param fromRenderTarget Input render target
   * @param toScreen Whether to render to screen (last effect)
   */
  render(
    dt: number,
    fromRenderTarget?: THREE.WebGLRenderTarget,
    toScreen?: boolean
  ) {
    if (!this.enabled || !this.material) return;

    // Set input texture from render target (ping-pong input)
    if (fromRenderTarget && this.uniforms.u_texture) {
      this.uniforms.u_texture.value = fromRenderTarget.texture;
    }

    // Store render context for subclasses to use
    this.lastRenderContext = { dt, fromRenderTarget, toScreen };

    // Route rendering through the EffectComposer to preserve the legacy
    // ping-pong chain and only draw to screen on the last pass.
    effectComposer.render(this.material, !!toScreen);
  }

  // Store last render context for effects that need it
  protected lastRenderContext?: {
    dt: number;
    fromRenderTarget?: THREE.WebGLRenderTarget;
    toScreen?: boolean;
  };

  /**
   * Get shader material quad vertex shader (non-raw)
   */
  private getShaderMaterialQuadVertexShader(): string {
    return `
    // --- Inputs (Formerly attributes) ---
    in vec3 position;
    in vec2 uv;

    // --- Output (Formerly varying) ---
    out vec2 vUv;

    // --- Uniforms (Standard matrices must be explicitly defined) ---
    uniform mat4 projectionMatrix;
    uniform mat4 modelViewMatrix;

    void main() {
        vUv = uv; // Assign the input UV to the output varying
        // Perform matrix multiplication using explicit uniforms
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `;
  }

  /**
   * Dispose resources
   */
  dispose() {
    if (this.material) {
      this.material.dispose();
    }
  }
}
