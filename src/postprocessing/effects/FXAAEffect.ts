import glsl from "glslify";
import Effect from "../Effect";

/**
 * FXAA (Fast Approximate Anti-Aliasing) Effect
 * Legacy-compatible implementation using GLSL3 and glslify
 */
export default class FXAAEffect extends Effect {
  /**
   * Initialize FXAA effect
   * @param isLow Whether to use low quality FXAA
   */
  initFXAA(isLow: boolean = false) {
    const vertexShader = isLow ? this.getLowFXAAVertexShader() : "";
    const fragmentShader = isLow
      ? this.getLowFXAAShader()
      : this.getFXAAShader();

    super.init({
      uniforms: {},
      vertexShader,
      fragmentShader,
      isRawMaterial: true,
      addRawShaderPrefix: false, // GLSL3 shaders don't need prefix
    });
  }

  /**
   * Get standard FXAA fragment shader using glsl-fxaa package
   */
  private getFXAAShader(): string {
    return glsl`
      precision highp float;

      uniform vec2 u_resolution;
      uniform sampler2D u_texture;

      // Simplified FXAA through glslify (GLSL3 compatible)
      #pragma glslify: fxaa = require(glsl-fxaa)

      out vec4 outColor;

      void main() {
        outColor = fxaa(u_texture, gl_FragCoord.xy, u_resolution);
      }
    `;
  }

  /**
   * Get low quality FXAA fragment shader using glsl-fxaa package
   */
  private getLowFXAAShader(): string {
    return glsl`
      precision highp float;

      uniform vec2 u_resolution;
      uniform sampler2D u_texture;

      in vec2 v_uv;
      in vec2 v_rgbNW;
      in vec2 v_rgbNE;
      in vec2 v_rgbSW;
      in vec2 v_rgbSE;
      in vec2 v_rgbM;

      out vec4 outColor;

      #pragma glslify: fxaa = require(glsl-fxaa/fxaa.glsl)

      void main() {
        vec2 fragCoord = v_uv * u_resolution;
        outColor = fxaa(u_texture, fragCoord, u_resolution, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);
      }
    `;
  }

  /**
   * Get low quality FXAA vertex shader using glsl-fxaa package
   */
  private getLowFXAAVertexShader(): string {
    return glsl`
      precision highp float;

      in vec3 position;
      in vec2 uv;

      uniform vec2 u_resolution;

      out vec2 v_uv;
      out vec2 v_rgbNW;
      out vec2 v_rgbNE;
      out vec2 v_rgbSW;
      out vec2 v_rgbSE;
      out vec2 v_rgbM;

      #pragma glslify: texcoords = require(glsl-fxaa/texcoords.glsl)

      void main() {
        vec2 fragCoord = uv * u_resolution;
        texcoords(fragCoord, u_resolution, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);

        v_uv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;
  }
}
