import * as THREE from "three";
import * as fboHelper from "../utils/fboHelper";
import effectComposer from "./EffectComposer";
import FXAAEffect from "./effects/FXAAEffect";
import BloomEffect from "./effects/BloomEffect";
import MotionBlurEffect from "./effects/MotionBlurEffect";

/**
 * Legacy-compatible postprocessing system
 * Replicates the exact functionality of legacy postprocessing.js
 */
class PostProcessing {
  // Effects
  private fxaaEffect?: FXAAEffect;
  private bloomEffect?: BloomEffect;
  private motionBlurEffect?: MotionBlurEffect;

  // Visualization target for debugging
  visualizeTarget?: THREE.Texture;

  /**
   * Initialize postprocessing system
   * @param renderer WebGL renderer
   * @param scene Scene to render
   * @param camera Camera to use
   */
  init(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera
  ) {
    // Initialize effect composer
    effectComposer.init(renderer, scene, camera);

    // Initialize FXAA effect
    this.fxaaEffect = new FXAAEffect();
    this.fxaaEffect.initFXAA();
    effectComposer.addEffect(this.fxaaEffect);

    // Initialize Motion Blur effect
    this.motionBlurEffect = new MotionBlurEffect();
    this.motionBlurEffect.initMotionBlur();
    effectComposer.addEffect(this.motionBlurEffect);

    // Initialize Bloom effect
    this.bloomEffect = new BloomEffect();
    this.bloomEffect.initBloom();
    effectComposer.addEffect(this.bloomEffect);
  }

  /**
   * Resize postprocessing pipeline
   * @param width New width
   * @param height New height
   */
  resize(width: number, height: number) {
    effectComposer.resize(width, height);
  }

  /**
   * Render postprocessing pipeline
   * @param dt Delta time
   */
  render(dt: number) {
    effectComposer.renderQueue(dt);

    // Legacy visualization target support
    if (this.visualizeTarget) {
      fboHelper.copy(this.visualizeTarget);
    }
  }

  /**
   * Get FXAA effect
   */
  getFXAA() {
    return this.fxaaEffect;
  }

  /**
   * Get Bloom effect
   */
  getBloom() {
    return this.bloomEffect;
  }

  /**
   * Get Motion Blur effect
   */
  getMotionBlur() {
    return this.motionBlurEffect;
  }

  /**
   * Enable/disable FXAA
   * @param enabled Whether to enable FXAA
   */
  setFXAAEnabled(enabled: boolean) {
    if (this.fxaaEffect) {
      this.fxaaEffect.enabled = enabled;
    }
  }

  /**
   * Enable/disable Bloom
   * @param enabled Whether to enable Bloom
   */
  setBloomEnabled(enabled: boolean) {
    if (this.bloomEffect) {
      this.bloomEffect.enabled = enabled;
    }
  }

  /**
   * Enable/disable Motion Blur
   * @param enabled Whether to enable Motion Blur
   */
  setMotionBlurEnabled(enabled: boolean) {
    if (this.motionBlurEffect) {
      this.motionBlurEffect.enabled = enabled;
    }
  }

  /**
   * Dispose all resources
   */
  dispose() {
    effectComposer.dispose();

    this.fxaaEffect?.dispose();
    this.bloomEffect?.dispose();
    this.motionBlurEffect?.dispose();
  }
}

// Create singleton instance like legacy
const postProcessing = new PostProcessing();
export default postProcessing;
