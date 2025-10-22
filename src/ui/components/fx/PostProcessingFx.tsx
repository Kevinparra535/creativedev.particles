import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

import DefaultSettings, { motionBlurQualityMap } from '@/config/settings.config';
import { useSceneSettings } from '@/ui/hooks/useSceneSettings';

import PostProcessing from '@/assets/postprocessing/PostProcessing';

import * as fboHelper from '@/utils/fboHelper';

/**
 * Legacy PostProcessing integration for React Three Fiber
 * Uses the exact legacy postprocessing.js system
 */
const PostProcessingFx = () => {
  const { gl, scene, camera, size } = useThree();
  const s = useSceneSettings();
  const postProcessingRef = useRef<typeof PostProcessing | null>(null);
  const initializeRef = useRef(false);

  // Initialize legacy postprocessing system once
  useEffect(() => {
    if (!initializeRef.current) {
      console.log('🎭 Initializing Legacy PostProcessing System...');

      // Initialize FBO helper first (legacy pattern)
      fboHelper.init(gl);

      // Initialize postprocessing system
      PostProcessing.init(gl, scene, camera);

      // Initialize defaults like legacy
      const motion = PostProcessing.getMotionBlur();
      if (motion) {
        motion.maxDistance = 120;
        motion.motionMultiplier = 7;
        motion.linesRenderTargetScale = motionBlurQualityMap[DefaultSettings.motionBlurQuality];
        motion.resize();
      }

      postProcessingRef.current = PostProcessing;
      initializeRef.current = true;

      console.log('✅ Legacy PostProcessing initialized');
    }
  }, [gl, scene, camera]);

  // Handle resize
  useEffect(() => {
    if (postProcessingRef.current) {
      postProcessingRef.current.resize(size.width, size.height);
      console.log('📏 PostProcessing resized:', size.width, 'x', size.height);
    }
  }, [size.width, size.height]);

  // Handle settings changes (toggles and quality)
  useEffect(() => {
    if (!postProcessingRef.current) return;

    postProcessingRef.current.setFXAAEnabled(s.fxaa);
    postProcessingRef.current.setBloomEnabled(s.bloom);
    postProcessingRef.current.setMotionBlurEnabled(s.motionBlur);

    const motion = postProcessingRef.current.getMotionBlur();
    if (motion) {
      motion.linesRenderTargetScale = motionBlurQualityMap[s.motionBlurQuality];
      motion.maxDistance = s.motionBlurMaxDistance;
      motion.motionMultiplier = s.motionBlurMultiplier;
      motion.resize();
    }

    // Bloom params
    const bloom = postProcessingRef.current.getBloom();
    if (bloom) {
      bloom.setRadius(s.bloomRadius);
      bloom.setAmount(s.bloomAmount);
    }
  }, [
    s.fxaa,
    s.bloom,
    s.bloomRadius,
    s.bloomAmount,
    s.motionBlur,
    s.motionBlurQuality,
    s.motionBlurMaxDistance,
    s.motionBlurMultiplier
  ]);

  // Render loop using legacy pattern
  useFrame((_state, delta) => {
    const motion = postProcessingRef.current?.getMotionBlur();
    if (motion) {
      // Legacy: motionBlur.skipMatrixUpdate = !(dieSpeed || speed) && motionBlurPause
      motion.skipMatrixUpdate = !(s.dieSpeed || s.speed) && DefaultSettings.motionBlurPause;
    }

    // Legacy render pattern: render(dt)
    postProcessingRef.current?.render(delta);
  });

  return null; // This component doesn't render anything itself
};

export default PostProcessingFx;
