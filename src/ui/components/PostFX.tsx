import {
  EffectComposer,
  FXAA as Fxaa,
  Bloom,
} from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";
import { useControls } from "leva";
import settings from "../../config/settings.config";

// Minimal composer: FXAA + Bloom, with placeholders for motion blur toggles.
// We can later replace with a vector-based motion blur effect.

const PostFX = () => {
  const gui = useControls("Post-Processing", {
    fxaa: { value: settings.fxaa },
    motionBlur: { value: settings.motionBlur },
    motionBlurPause: { value: settings.motionBlurPause },
    motionBlurQuality: {
      options: ["best", "high", "medium", "low"],
      value: settings.motionBlurQuality,
    },
    motionMultiplier: { value: 7, min: 0.1, max: 15 },
    bloom: { value: settings.bloom },
    bloomRadius: { value: 1, min: 0, max: 3 },
    bloomAmount: { value: 1, min: 0, max: 3 },
  });

  // Simple mapping from our quality to buffer scale
  const scaleByQuality: Record<string, number> = {
    best: 1,
    high: 0.5,
    medium: 1 / 3,
    low: 0.25,
  };
  const motionScale = scaleByQuality[gui.motionBlurQuality] ?? 1 / 3;
  // Placeholder: future custom motion blur pass will use motionMultiplier and quality.

  return (
    <EffectComposer
      // Temporal AA-like persistence can be explored later; keep default for now
      multisampling={0}
      enableNormalPass={false}
      // Use quality scale to reduce internal resolution when motion blur is enabled
      resolutionScale={gui.motionBlur ? motionScale : 1}
    >
      {gui.fxaa ? <Fxaa /> : <></>}
      {/* TODO: Custom MotionBlur pass (vectors or temporal accumulation) */}
      {gui.bloom ? (
        <Bloom
          intensity={gui.bloomAmount}
          luminanceThreshold={0.7}
          luminanceSmoothing={0.2}
          kernelSize={KernelSize.MEDIUM}
          mipmapBlur
        />
      ) : (
        <></>
      )}
    </EffectComposer>
  );
};

export default PostFX;
