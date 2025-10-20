import glsl from "glslify";
import Effect from "../Effect";
import * as THREE from "three";
import effectComposer from "../EffectComposer";
import * as fboHelper from "../../utils/fboHelper";

/**
 * Bloom Effect - Exact Legacy Compatible Implementation
 * Replicates legacy bloom.js with identical shaders and behavior
 */
export default class BloomEffect extends Effect {
  public blurRadius: number = 1.3;
  public amount: number = 0.3;

  private blurMaterial?: THREE.RawShaderMaterial;
  private readonly BLUR_BIT_SHIFT = 1;

  /**
   * Initialize Bloom effect exactly like legacy
   */
  initBloom() {
    super.init({
      uniforms: {
        u_blurTexture: { value: null as unknown as THREE.Texture },
        u_amount: { value: 0 },
      },
      fragmentShader: this.getBloomShader(),
      isRawMaterial: true,
      addRawShaderPrefix: true, // Use legacy GLSL1 prefix
    });

    // Initialize blur material exactly like legacy
    this.blurMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        u_texture: { value: null as unknown as THREE.Texture },
        u_delta: { value: new THREE.Vector2() },
      },
      vertexShader: fboHelper.getVertexShader(),
      fragmentShader:
        fboHelper.getRawShaderPrefix() + this.getBloomBlurShader(),
      glslVersion: THREE.GLSL3,
    });
  }

  /**
   * Get bloom fragment shader (exact legacy GLSL1)
   */
  private getBloomShader(): string {
    return glsl`
      uniform sampler2D u_texture;
      uniform sampler2D u_blurTexture;
      uniform float u_amount;

      varying vec2 v_uv;

      void main() {
        vec3 baseColor = texture2D(u_texture, v_uv).rgb;
        vec3 blurColor = texture2D(u_blurTexture, v_uv).rgb;
        
        // Exact legacy screen blend
        vec3 color = mix(baseColor, 1.0 - ((1.0 - baseColor) * (1.0 - blurColor)), u_amount);
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;
  }

  /**
   * Get bloom blur fragment shader (exact legacy GLSL1)
   */
  private getBloomBlurShader(): string {
    return glsl`
      uniform sampler2D u_texture;
      uniform vec2 u_delta;

      varying vec2 v_uv;

      void main() {
        vec3 color = texture2D(u_texture, v_uv).rgb * 0.1633;

        vec2 delta = u_delta;
        color += texture2D(u_texture, v_uv - delta).rgb * 0.1531;
        color += texture2D(u_texture, v_uv + delta).rgb * 0.1531;

        delta += u_delta;
        color += texture2D(u_texture, v_uv - delta).rgb * 0.12245;
        color += texture2D(u_texture, v_uv + delta).rgb * 0.12245;

        delta += u_delta;
        color += texture2D(u_texture, v_uv - delta).rgb * 0.0918;
        color += texture2D(u_texture, v_uv + delta).rgb * 0.0918;

        delta += u_delta;
        color += texture2D(u_texture, v_uv - delta).rgb * 0.051;
        color += texture2D(u_texture, v_uv + delta).rgb * 0.051;

        gl_FragColor = vec4(color, 1.0);
      }
      }
    `;
  }

  /**
   * Custom render method exactly like legacy
   */
  render(
    dt: number,
    fromRenderTarget: THREE.WebGLRenderTarget,
    toScreen: boolean
  ) {
    if (!this.blurMaterial) return;

    // Get render targets exactly like legacy
    const tmpRenderTarget1 = effectComposer.getRenderTarget(
      this.BLUR_BIT_SHIFT
    );
    const tmpRenderTarget2 = effectComposer.getRenderTarget(
      this.BLUR_BIT_SHIFT
    );

    // Release them first (legacy pattern)
    effectComposer.releaseRenderTarget(tmpRenderTarget1, tmpRenderTarget2);

    // Horizontal blur pass
    const blurRadius = this.blurRadius;
    this.blurMaterial.uniforms.u_texture.value = fromRenderTarget.texture;
    this.blurMaterial.uniforms.u_delta.value.set(
      blurRadius / effectComposer.resolution.x,
      0
    );
    fboHelper.render(this.blurMaterial, tmpRenderTarget1);

    // Vertical blur pass
    this.blurMaterial.uniforms.u_texture.value = tmpRenderTarget1.texture;
    this.blurMaterial.uniforms.u_delta.value.set(
      0,
      blurRadius / effectComposer.resolution.y
    );
    fboHelper.render(this.blurMaterial, tmpRenderTarget2);

    // Set uniforms for final bloom pass
    this.uniforms.u_blurTexture.value = tmpRenderTarget2.texture;
    this.uniforms.u_amount.value = this.amount;

    // Call parent render exactly like legacy
    super.render(dt, fromRenderTarget, toScreen);
  }

  /**
   * Set bloom radius
   * @param radius Bloom radius
   */
  setRadius(radius: number) {
    this.blurRadius = radius;
  }

  /**
   * Set bloom amount
   * @param amount Bloom amount
   */
  setAmount(amount: number) {
    this.amount = amount;
  }

  /**
   * Set bloom threshold (alias for setAmount for compatibility)
   * @param threshold Bloom threshold
   */
  setThreshold(threshold: number) {
    this.amount = threshold;
  }
}
