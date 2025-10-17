import { useControls } from "leva";
import LowQualityParticles from "../../components/particles/LowQualityParticles";
import { usePerformanceOptimization } from "../../../core/presentation/usePerformanceOptimization";
import PostFX from "../../components/PostFX";

const Scene1 = () => {
  // Performance-aware post-processing control via Leva + hook
  const { currentQuality } = usePerformanceOptimization();
  const postFx = useControls("PostFX", {
    auto: { value: true },
    enabled: { value: true },
    // toggles
    dof: { value: true },
    bloom: { value: true },
    noise: { value: true },
    vignette: { value: true },
    smaa: { value: true },
    temporalAccumulation: { value: false },
    trailStrength: { value: 0.6, min: 0, max: 0.98, step: 0.01 },
    // tuning
    bloomIntensity: { value: 0.3, min: 0, max: 2, step: 0.01 },
    bloomThreshold: { value: 0, min: 0, max: 1, step: 0.01 },
    bloomSmoothing: { value: 0.9, min: 0, max: 1, step: 0.01 },
    bloomHeight: { value: 300, min: 128, max: 2048, step: 1 },
    dofFocusDistance: { value: 0, min: 0, max: 1, step: 0.001 },
    dofFocalLength: { value: 50, min: 1, max: 150, step: 1 },
    dofBokehScale: { value: 1, min: 0, max: 5, step: 0.01 },
    dofHeight: { value: 480, min: 128, max: 2048, step: 1 },
    vignetteOffset: { value: 0.3, min: 0, max: 1, step: 0.01 },
    vignetteDarkness: { value: 1.2, min: 0, max: 3, step: 0.01 },
  });
  const effectivePostEnabled = postFx.auto
    ? Boolean(currentQuality?.postProcessing)
    : postFx.enabled;

  const { count, radius, pointSize, attract, falloff } = useControls(
    "Low Quality Particles",
    {
      count: { value: 10000, min: 1000, max: 50000, step: 1000 },
      radius: { value: 2, min: 0.5, max: 5, step: 0.1 },
      pointSize: { value: 8, min: 1, max: 20, step: 0.5 },
      attract: { value: 0.02, min: 0, max: 0.1, step: 0.001 },
      falloff: { value: 1.5, min: 0.1, max: 5, step: 0.1 },
    }
  );

  return (
    <>
      <LowQualityParticles
        count={count}
        radius={radius}
        pointSize={pointSize}
        attract={attract}
        falloff={falloff}
      />
      <PostFX
        enabled={effectivePostEnabled}
        dof={postFx.dof}
        bloom={postFx.bloom}
        noise={postFx.noise}
        vignette={postFx.vignette}
        smaa={postFx.smaa}
        temporalAccumulation={postFx.temporalAccumulation}
        trailStrength={postFx.trailStrength}
        bloomIntensity={postFx.bloomIntensity}
        bloomThreshold={postFx.bloomThreshold}
        bloomSmoothing={postFx.bloomSmoothing}
        bloomHeight={postFx.bloomHeight}
        dofFocusDistance={postFx.dofFocusDistance}
        dofFocalLength={postFx.dofFocalLength}
        dofBokehScale={postFx.dofBokehScale}
        dofHeight={postFx.dofHeight}
        vignetteOffset={postFx.vignetteOffset}
        vignetteDarkness={postFx.vignetteDarkness}
      />
    </>
  );
};

export default Scene1;
