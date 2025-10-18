import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import PostProcessing from "../../postprocessing/PostProcessing";
import * as fboHelper from "../../utils/fboHelper";
import DefaultSettings from "../../config/settings.config";

/**
 * Legacy PostProcessing integration for React Three Fiber
 * Uses the exact legacy postprocessing.js system
 */
const LegacyPostProcessing = () => {
  const { gl, scene, camera, size } = useThree();
  const postProcessingRef = useRef<typeof PostProcessing | null>(null);
  const initializeRef = useRef(false);

  // Initialize legacy postprocessing system once
  useEffect(() => {
    if (!initializeRef.current) {
      console.log("🎭 Initializing Legacy PostProcessing System...");

      // Initialize FBO helper first (legacy pattern)
      fboHelper.init(gl);

      // Initialize postprocessing system
      PostProcessing.init(gl, scene, camera);

      postProcessingRef.current = PostProcessing;
      initializeRef.current = true;

      console.log("✅ Legacy PostProcessing initialized");
    }
  }, [gl, scene, camera]);

  // Handle resize
  useEffect(() => {
    if (postProcessingRef.current) {
      postProcessingRef.current.resize(size.width, size.height);
      console.log("📏 PostProcessing resized:", size.width, "x", size.height);
    }
  }, [size.width, size.height]);

  // Handle settings changes
  useEffect(() => {
    if (!postProcessingRef.current) return;

    // Update FXAA enabled state
    postProcessingRef.current.setFXAAEnabled(DefaultSettings.fxaa);

    // Update Bloom enabled state
    // postProcessingRef.current.setBloomEnabled(DefaultSettings.bloom);

    // Update Motion Blur enabled state
    // postProcessingRef.current.setMotionBlurEnabled(DefaultSettings.motionBlur);

    // Update motion blur quality
    // const motionBlur = postProcessingRef.current.getMotionBlur();
    // if (motionBlur) {
      // motionBlur.setQuality(DefaultSettings.motionBlurQuality);
    // }
  }, [
    DefaultSettings.fxaa,
    DefaultSettings.bloom,
    DefaultSettings.motionBlur,
    DefaultSettings.motionBlurQuality,
  ]);

  // Render loop using legacy pattern
  useFrame((_state, delta) => {
    if (postProcessingRef.current) {
      // Legacy render pattern: render(dt)
      postProcessingRef.current.render(delta);
    }
  });

  return null; // This component doesn't render anything itself
};

export default LegacyPostProcessing;
