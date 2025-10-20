import * as THREE from "three";
import Effect from "../Effect";
import effectComposer from "../EffectComposer";
import * as fboHelper from "../../utils/fboHelper";
import glsl from "glslify";

/**
 * Motion Blur Effect
 * Complete legacy-compatible implementation
 */
export default class MotionBlurEffect extends Effect {
  // Legacy properties - exact match
  public useSampling: boolean = false;
  public skipMatrixUpdate: boolean = false;

  public fadeStrength: number = 1;
  public motionMultiplier: number = 1;
  public maxDistance: number = 100;
  public targetFPS: number = 60;
  public leaning: number = 0.5;

  // Lines method only options
  public jitter: number = 0;
  public opacity: number = 1;
  public depthBias: number = 0.002;
  public depthTest: boolean = false;
  public useDithering: boolean = false;

  public motionRenderTargetScale: number = 1;
  public linesRenderTargetScale: number = 1 / 2;

  // Private members like legacy
  private motionRenderTarget?: THREE.WebGLRenderTarget;
  private linesRenderTarget?: THREE.WebGLRenderTarget;

  private lines?: THREE.LineSegments;
  private linesCamera?: THREE.Camera;
  private linesScene?: THREE.Scene;
  private linesPositions?: Float32Array;
  private linesPositionAttribute?: THREE.BufferAttribute;
  private linesGeometry?: THREE.BufferGeometry;
  private linesMaterial?: THREE.RawShaderMaterial;

  private samplingMaterial?: THREE.RawShaderMaterial;

  private prevUseDithering?: boolean;
  private prevUseSampling?: boolean;

  private visibleCache: THREE.Object3D[] = [];

  private width?: number;
  private height?: number;

  /**
   * Initialize Motion Blur effect exactly like legacy
   * @param sampleCount Sample count for sampling method
   */
  initMotionBlur(sampleCount?: number) {
    // Check for float texture support like legacy
    const gl = effectComposer.renderer?.getContext();
    if (
      gl &&
      (!gl.getExtension("OES_texture_float") ||
        !gl.getExtension("OES_texture_float_linear"))
    ) {
      console.warn("Motion Blur: No float linear support");
    }

    // Create motion render target like legacy
    this.motionRenderTarget = fboHelper.createRenderTarget(
      1,
      1,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    this.motionRenderTarget.depthBuffer = true;

    // Create lines render target like legacy
    this.linesRenderTarget = fboHelper.createRenderTarget(
      1,
      1,
      THREE.RGBAFormat,
      THREE.FloatType
    );

    this.linesCamera = new THREE.Camera();
    this.linesCamera.position.z = 1;
    this.linesScene = new THREE.Scene();

    // Initialize main effect like legacy
    super.init({
      uniforms: {
        u_lineAlphaMultiplier: { value: 1 },
        u_linesTexture: { value: this.linesRenderTarget.texture },
      },
      fragmentShader: this.getMotionBlurShader(),
      isRawMaterial: true,
      addRawShaderPrefix: false,
    });

    // Initialize lines geometry and material like legacy
    this.linesPositions = new Float32Array(0);
    this.linesGeometry = new THREE.BufferGeometry();

    this.linesMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        u_texture: { value: null },
        u_motionTexture: { value: this.motionRenderTarget.texture },
        u_resolution: { value: effectComposer.resolution },
        u_maxDistance: { value: 1 },
        u_jitter: { value: 0.3 },
        u_fadeStrength: { value: 1 },
        u_motionMultiplier: { value: 1 },
        u_depthTest: { value: 0 },
        u_opacity: { value: 1 },
        u_leaning: { value: 0.5 },
        u_depthBias: { value: 0.01 },
      },
      vertexShader:
        fboHelper.getRawShaderPrefix() + this.getMotionBlurLinesVertexShader(),
      fragmentShader:
        fboHelper.getRawShaderPrefix() + this.getMotionBlurLinesFragShader(),

      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
      blendEquationAlpha: THREE.AddEquation,
      blendSrcAlpha: THREE.OneFactor,
      blendDstAlpha: THREE.OneFactor,
      depthTest: false,
      depthWrite: false,
      transparent: true,
    });

    this.lines = new THREE.LineSegments(this.linesGeometry, this.linesMaterial);
    this.linesScene.add(this.lines);

    // Initialize sampling material like legacy
    this.samplingMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        u_texture: { value: null },
        u_motionTexture: { value: this.motionRenderTarget.texture },
        u_resolution: { value: effectComposer.resolution },
        u_maxDistance: { value: 1 },
        u_fadeStrength: { value: 1 },
        u_motionMultiplier: { value: 1 },
        u_leaning: { value: 0.5 },
      },
      defines: {
        SAMPLE_COUNT: sampleCount || 21,
      },
      vertexShader: fboHelper.getVertexShader(),
      fragmentShader:
        fboHelper.getRawShaderPrefix() +
        "#define SAMPLE_COUNT " +
        (sampleCount || 21) +
        "\n" +
        this.getMotionBlurSamplingShader(),
      glslVersion: THREE.GLSL3,
    });
  }

  /**
   * Resize method like legacy
   */
  resize(width?: number, height?: number) {
    if (width === undefined || height === undefined) {
      width = this.width;
      height = this.height;
    } else {
      this.width = width;
      this.height = height;
    }

    if (width === undefined || height === undefined) return;

    // Resize motion render target like legacy
    const motionWidth = Math.trunc(width * this.motionRenderTargetScale);
    const motionHeight = Math.trunc(height * this.motionRenderTargetScale);
    this.motionRenderTarget?.setSize(motionWidth, motionHeight);

    if (!this.useSampling) {
      // Resize lines render target like legacy
      const linesWidth = Math.trunc(width * this.linesRenderTargetScale);
      const linesHeight = Math.trunc(height * this.linesRenderTargetScale);
      this.linesRenderTarget?.setSize(linesWidth, linesHeight);

      // Update lines positions like legacy
      const noDithering = !this.useDithering;
      const amount = noDithering
        ? linesWidth * linesHeight
        : this.getDitheringAmount(linesWidth, linesHeight);
      const currentLen = this.linesPositions!.length / 6;

      if (amount > currentLen) {
        this.linesPositions = new Float32Array(amount * 6);
        this.linesPositionAttribute = new THREE.BufferAttribute(
          this.linesPositions,
          3
        );
        this.linesGeometry!.deleteAttribute("position");
        this.linesGeometry!.setAttribute(
          "position",
          this.linesPositionAttribute
        );
      }

      let i6 = 0;
      const size = linesWidth * linesHeight;
      for (let i = 0; i < size; i++) {
        const x = i % linesWidth;
        const y = Math.trunc(i / linesWidth);
        if (noDithering || (x + (y & 1)) & 1) {
          this.linesPositions![i6 + 0] = this.linesPositions![i6 + 3] =
            (x + 0.5) / linesWidth;
          this.linesPositions![i6 + 1] = this.linesPositions![i6 + 4] =
            (y + 0.5) / linesHeight;
          this.linesPositions![i6 + 2] = 0;
          this.linesPositions![i6 + 5] = 0.001 + 0.999 * Math.random();
          i6 += 6;
        }
      }
      this.linesPositionAttribute!.needsUpdate = true;
      this.linesGeometry!.setDrawRange(0, amount * 2);
    }

    this.prevUseDithering = this.useDithering;
    this.prevUseSampling = this.useSampling;
  }

  /**
   * Dithering calculation like legacy
   */
  private getDitheringAmount(width: number, height: number): number {
    if (width & 1 && height & 1) {
      return (((width - 1) * (height - 1)) >> 1) + (width >> 1) + (height >> 1);
    } else {
      return (width * height) >> 1;
    }
  }

  /**
   * Custom render method exactly like legacy
   */
  render(dt: number, renderTarget: THREE.WebGLRenderTarget, toScreen: boolean) {
    if (
      this.prevUseDithering !== this.useDithering ||
      this.prevUseSampling !== this.useSampling
    ) {
      this.resize();
    }

    const useSampling = this.useSampling;
    const fpsRatio = 1000 / Math.max(16.667, dt) / this.targetFPS;

    // Render motion vectors like legacy
    const state = fboHelper.getColorState();
    effectComposer.renderer.setClearColor(0, 1);
    effectComposer.renderer.setRenderTarget(this.motionRenderTarget!);
    effectComposer.renderer.clear(true, true);

    // Set motion materials like legacy
    if (effectComposer.scene) {
      effectComposer.scene.traverseVisible((obj: any) =>
        this.setObjectBeforeState(obj)
      );
      effectComposer.renderScene(this.motionRenderTarget);

      for (let i = 0, len = this.visibleCache.length; i < len; i++) {
        this.setObjectAfterState(this.visibleCache[i]);
      }
      this.visibleCache = [];
    }

    if (!useSampling) {
      // Render lines like legacy
      this.linesMaterial!.uniforms.u_maxDistance.value = this.maxDistance;
      this.linesMaterial!.uniforms.u_jitter.value = this.jitter;
      this.linesMaterial!.uniforms.u_fadeStrength.value = this.fadeStrength;
      this.linesMaterial!.uniforms.u_motionMultiplier.value =
        this.motionMultiplier * fpsRatio;
      this.linesMaterial!.uniforms.u_depthTest.value = this.depthTest ? 1 : 0;
      this.linesMaterial!.uniforms.u_opacity.value = this.opacity;
      this.linesMaterial!.uniforms.u_leaning.value = Math.max(
        0.001,
        Math.min(0.999, this.leaning)
      );
      this.linesMaterial!.uniforms.u_depthBias.value = Math.max(
        0.00001,
        this.depthBias
      );
      this.linesMaterial!.uniforms.u_texture.value = renderTarget.texture;

      effectComposer.renderer.setClearColor(0, 0);
      effectComposer.renderer.setRenderTarget(this.linesRenderTarget!);
      effectComposer.renderer.clear(true, true);
      effectComposer.renderer.render(this.linesScene!, this.linesCamera!);
    }

    fboHelper.setColorState(state);

    if (useSampling) {
      // Use sampling method like legacy
      this.samplingMaterial!.uniforms.u_maxDistance.value = this.maxDistance;
      this.samplingMaterial!.uniforms.u_fadeStrength.value = this.fadeStrength;
      this.samplingMaterial!.uniforms.u_motionMultiplier.value =
        this.motionMultiplier * fpsRatio;
      this.samplingMaterial!.uniforms.u_leaning.value = Math.max(
        0.001,
        Math.min(0.999, this.leaning)
      );
      this.samplingMaterial!.uniforms.u_texture.value = renderTarget.texture;

      effectComposer.render(this.samplingMaterial!, toScreen);
    } else {
      // Use lines method like legacy
      if (this.uniforms.u_lineAlphaMultiplier) {
        this.uniforms.u_lineAlphaMultiplier.value =
          1 + (this.useDithering ? 1 : 0);
      }
      super.render(dt, renderTarget, toScreen);
    }
  }

  /**
   * Set object before state like legacy
   */
  private setObjectBeforeState(obj: any) {
    if (obj.motionMaterial) {
      obj._tmpMaterial = obj.material;
      obj.material = obj.motionMaterial;
      obj.material.uniforms.u_motionMultiplier.value =
        obj.material.motionMultiplier;
    } else if (obj.material) {
      obj.visible = false;
    }
    this.visibleCache.push(obj);
  }

  /**
   * Set object after state like legacy
   */
  private setObjectAfterState(obj: any) {
    if (obj.motionMaterial) {
      obj.material = obj._tmpMaterial;
      obj._tmpMaterial = undefined;
      if (!this.skipMatrixUpdate) {
        obj.motionMaterial.uniforms.u_prevModelViewMatrix.value.copy(
          obj.modelViewMatrix
        );
      }
    } else {
      obj.visible = true;
    }
  }

  /**
   * Set quality using legacy quality keys
   * @param quality Quality key from settings
   */
  setQuality(quality: "best" | "high" | "medium" | "low") {
    const qualityMap = {
      best: 1,
      high: 0.75,
      medium: 0.5,
      low: 0.25,
    };

    this.fadeStrength = qualityMap[quality] || 0.5;

    // Set line alpha multiplier based on quality
    if (this.uniforms.u_lineAlphaMultiplier) {
      this.uniforms.u_lineAlphaMultiplier.value = this.fadeStrength;
    }
  }

  /**
   * Get motion blur main shader (exact legacy GLSL1)
   */
  private getMotionBlurShader(): string {
    return glsl`
      precision highp float;

      uniform sampler2D u_texture;
      uniform sampler2D u_linesTexture;
      uniform float u_lineAlphaMultiplier;

      in vec2 v_uv;
      out vec4 outColor;

      void main() {
          vec3 baseColor = texture(u_texture, v_uv).rgb;
          vec4 linesColor = texture(u_linesTexture, v_uv);

          // Mezcla alfa simple
          float alpha = linesColor.a * u_lineAlphaMultiplier;
          vec3 color = mix(baseColor, linesColor.rgb, alpha);

          outColor = vec4(color, 1.0);
      }

    `;
  }

  /**
   * Get motion blur lines vertex shader (exact legacy GLSL1)
   */
  private getMotionBlurLinesVertexShader(): string {
    return glsl`
      precision highp float;

      in vec3 position;

      uniform vec2 u_resolution;
      uniform sampler2D u_motionTexture;
      uniform float u_maxDistance;
      uniform float u_jitter;            // (no usado aquí, lo conservo por API)
      uniform float u_motionMultiplier;

      out vec2 v_velocity;
      out float v_alpha;

      void main() {
        vec2 uv = position.xy;

        // Lee motion (xy = velocidad, z = depth si existiera)
        vec2 velocity = texture(u_motionTexture, uv).xy * u_motionMultiplier;

        float distance = length(velocity);

        // Clamp de velocidad
        if (distance > u_maxDistance) {
          velocity = normalize(velocity) * u_maxDistance;
        }

        v_velocity = velocity;
        v_alpha = min(distance / u_maxDistance, 1.0);

        // Posición NDC del extremo de la línea
        vec2 screenPos = uv * 2.0 - 1.0;
        if (position.z > 0.5) {
          screenPos += velocity / u_resolution * 2.0;
        }

        gl_Position = vec4(screenPos, 0.0, 1.0);
      }
    `;
  }

  /**
   * Get motion blur lines fragment shader (exact legacy GLSL1)
   */
  private getMotionBlurLinesFragShader(): string {
    return glsl`
      precision highp float;

      uniform sampler2D u_texture;  // corregido (en singular)
      uniform float u_opacity;
      uniform float u_fadeStrength;

      in vec2 v_velocity;
      in float v_alpha;

      out vec4 outColor;

      void main() {
          float alpha = v_alpha * u_opacity * u_fadeStrength;
          vec3 color = vec3(1.0); // Líneas blancas

          outColor = vec4(color, alpha);
      }
    `;
  }

  /**
   * Get motion blur sampling shader (exact legacy GLSL1)
   */
  private getMotionBlurSamplingShader(): string {
    return glsl`
      precision highp float;

      uniform sampler2D u_texture;
      uniform sampler2D u_motionTexture;
      uniform vec2 u_resolution;
      uniform float u_maxDistance;
      uniform float u_fadeStrength;     // (no usada aquí; puedes usarla para ajustar 'weight' si quieres)
      uniform float u_motionMultiplier;
      uniform float u_leaning;

      in vec2 v_uv;

      out vec4 outColor;

      // Asegura un valor por defecto si no te lo pasa el bundler/loader
      #ifndef SAMPLE_COUNT
        #define SAMPLE_COUNT 8
      #endif

      void main() {
        vec2 velocity = texture(u_motionTexture, v_uv).xy * u_motionMultiplier;

        float distance = length(velocity);
        if (distance > u_maxDistance) {
          velocity = normalize(velocity) * u_maxDistance;
          distance = u_maxDistance;
        }

        vec3 color = vec3(0.0);
        float totalWeight = 0.0;

        // Muestreo a lo largo del vector de movimiento
        for (int i = 0; i < SAMPLE_COUNT; i++) {
          float t = float(i) / float(SAMPLE_COUNT - 1);
          t = mix(-u_leaning, 1.0 - u_leaning, t);

          vec2 sampleUV = v_uv + velocity * t / u_resolution;

          if (sampleUV.x >= 0.0 && sampleUV.x <= 1.0 &&
              sampleUV.y >= 0.0 && sampleUV.y <= 1.0) {

            float weight = 1.0 - abs(t);
            // Si quieres usar u_fadeStrength: weight = pow(weight, u_fadeStrength);
            color += texture(u_texture, sampleUV).rgb * weight;
            totalWeight += weight;
          }
        }

        if (totalWeight > 0.0) {
          color /= totalWeight;
        } else {
          color = texture(u_texture, v_uv).rgb;
        }

        outColor = vec4(color, 1.0);
      }
    `;
  }
}
