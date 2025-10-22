import Effect from '../Effect';

import fxaaFrag from '@/assets/postprocessing/effects/fxaa/fxaa.frag.glsl?raw';
import lowFxaaFrag from '@/assets/postprocessing/effects/fxaa/lowFxaa.frag.glsl?raw';
import lowFxaaVert from '@/assets/postprocessing/effects/fxaa/lowFxaa.vert.glsl?raw';

/**
 * FXAA (Fast Approximate Anti-Aliasing) Effect
 * Legacy-compatible implementation using GLSL3 and glslify
 */
export default class FXAAEffect extends Effect {
  initFXAA({ lowQuality = false } = {}): void {
    const vs = lowQuality ? lowFxaaVert : '';
    const fs = lowQuality ? lowFxaaFrag : fxaaFrag;

    super.init({
      uniforms: {},
      vertexShader: vs,
      fragmentShader: fs,
      isRawMaterial: true
    });
  }
}
