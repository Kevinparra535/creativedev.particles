import glsl from "glslify";
import Effect from "../Effect";
import * as THREE from "three";
import effectComposer from "../EffectComposer";
import * as fboHelper from "../../utils/fboHelper";

/**
 * Bloom Effect
 * Legacy-compatible implementation using GLSL3
 */
export default class BloomEffect extends Effect {
  public blurRadius: number = 1.3;
  public amount: number = 0.3;

  private blurMaterial?: THREE.RawShaderMaterial;
  private readonly BLUR_BIT_SHIFT = 1;

  /**
   * Initialize Bloom effect
   */
  initBloom() {
    super.init({
      uniforms: {
        u_blurTexture: { value: null as unknown as THREE.Texture },
        u_amount: { value: 0 },
      },
      fragmentShader: this.getBloomShader(),
      isRawMaterial: true,
      addRawShaderPrefix: false, // GLSL3 shaders don't need prefix
    });

    // Initialize blur material like legacy
    this.blurMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        u_texture: { value: null as unknown as THREE.Texture },
        u_delta: { value: new THREE.Vector2() },
      },
      vertexShader: fboHelper.getVertexShader(),
      fragmentShader:
        fboHelper.getRawShaderPrefix() + this.getBloomBlurShader(),
    });
  }

  /**
   * Get bloom fragment shader (GLSL3)
   */
  private getBloomShader(): string {
    return glsl`
      precision highp float;

      uniform sampler2D u_texture;
      uniform sampler2D u_blurTexture;
      uniform float u_amount;

      in vec2 v_uv;

      out vec4 outColor;

      void main() {
        vec3 baseColor = texture(u_texture, v_uv).rgb;
        vec3 blurColor = texture(u_blurTexture, v_uv).rgb;

        // Mezcla tipo "screen" controlada por u_amount
        vec3 blended = mix(
          baseColor,
          1.0 - ((1.0 - baseColor) * (1.0 - blurColor)),
          u_amount
        );

        outColor = vec4(blended, 1.0);
      }
    `;
  }

  /**
   * Get bloom blur fragment shader (GLSL1 for legacy compatibility)
   */
  private getBloomBlurShader(): string {
    return glsl`
      precision highp float;

      uniform sampler2D u_texture;
      uniform vec2 u_delta;

      in vec2 v_uv;
      out vec4 outColor;

      void main() {
        vec3 color = texture(u_texture, v_uv).rgb * 0.1633;

        vec2 delta = u_delta;

        color += texture(u_texture, v_uv - delta).rgb * 0.1531;
        color += texture(u_texture, v_uv + delta).rgb * 0.1531;

        delta += u_delta;
        color += texture(u_texture, v_uv - delta).rgb * 0.12245;
        color += texture(u_texture, v_uv + delta).rgb * 0.12245;

        delta += u_delta;
        color += texture(u_texture, v_uv - delta).rgb * 0.0918;
        color += texture(u_texture, v_uv + delta).rgb * 0.0918;

        delta += u_delta;
        color += texture(u_texture, v_uv - delta).rgb * 0.051;
        color += texture(u_texture, v_uv + delta).rgb * 0.051;

        outColor = vec4(color, 1.0);
      }
    `;
  }

  /**
   * Custom render method like legacy
   */
  render(
    dt: number,
    fromRenderTarget: THREE.WebGLRenderTarget,
    toScreen: boolean
  ) {
    if (!this.blurMaterial) return;

    const tmpRenderTarget1 = effectComposer.getRenderTarget(
      this.BLUR_BIT_SHIFT,
      false
    );
    const tmpRenderTarget2 = effectComposer.getRenderTarget(
      this.BLUR_BIT_SHIFT,
      false
    );

    // Horizontal blur
    this.blurMaterial.uniforms.u_texture.value = fromRenderTarget.texture;
    this.blurMaterial.uniforms.u_delta.value.set(
      this.blurRadius / effectComposer.resolution.x,
      0
    );
    fboHelper.render(this.blurMaterial, tmpRenderTarget1);

    // Vertical blur
    this.blurMaterial.uniforms.u_texture.value = tmpRenderTarget1.texture;
    this.blurMaterial.uniforms.u_delta.value.set(
      0,
      this.blurRadius / effectComposer.resolution.y
    );
    fboHelper.render(this.blurMaterial, tmpRenderTarget2);

    // Set uniforms for final bloom pass
    if (this.uniforms.u_blurTexture) {
      this.uniforms.u_blurTexture.value = tmpRenderTarget2.texture;
    }
    if (this.uniforms.u_amount) {
      this.uniforms.u_amount.value = this.amount;
    }

    // Call parent render
    super.render(dt, fromRenderTarget, toScreen);

    // Release render targets
    effectComposer.releaseRenderTarget(tmpRenderTarget1, tmpRenderTarget2);
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
