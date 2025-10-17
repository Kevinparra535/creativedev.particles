import {
  EffectComposer,
  Bloom,
  DepthOfField,
  Noise,
  Vignette,
  SMAA as Smaa,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import React, { useMemo } from "react";
import TemporalAccumulation from "./TemporalAccumulation";

export type PostFXProps = {
  enabled?: boolean;
  dof?: boolean;
  bloom?: boolean;
  noise?: boolean;
  vignette?: boolean;
  smaa?: boolean;
  temporalAccumulation?: boolean;
  trailStrength?: number; // 0..1 (0=no trail, 1=long trail)
  // Bloom tuning
  bloomIntensity?: number;
  bloomThreshold?: number;
  bloomSmoothing?: number;
  bloomHeight?: number;
  // DOF tuning
  dofFocusDistance?: number;
  dofFocalLength?: number;
  dofBokehScale?: number;
  dofHeight?: number;
  // Vignette tuning
  vignetteOffset?: number;
  vignetteDarkness?: number;
};

// Post-processing stack inspired by The-Spirit: SMAA → DOF → Bloom → Noise → Vignette
// Keep props conservative to maintain FPS; enable/disable via props.
const PostFX = ({
  enabled,
  dof = true,
  bloom = true,
  noise = true,
  vignette = true,
  smaa = true,
  temporalAccumulation = false,
  trailStrength = 0.6,
  bloomIntensity = 0.3,
  bloomThreshold = 0,
  bloomSmoothing = 0.9,
  bloomHeight = 300,
  dofFocusDistance = 0,
  dofFocalLength = 50,
  dofBokehScale = 1,
  dofHeight = 480,
  vignetteOffset = 0.3,
  vignetteDarkness = 1.2,
}: PostFXProps) => {
  const children = useMemo(() => {
    const nodes: React.ReactElement[] = [];
    if (smaa) nodes.push(<Smaa key="smaa" />);
    if (dof)
      nodes.push(
        <DepthOfField
          key="dof"
          focusDistance={dofFocusDistance}
          focalLength={dofFocalLength}
          bokehScale={dofBokehScale}
          height={dofHeight}
        />
      );
    if (bloom)
      nodes.push(
        <Bloom
          key="bloom"
          luminanceThreshold={bloomThreshold}
          luminanceSmoothing={bloomSmoothing}
          height={bloomHeight}
          intensity={bloomIntensity}
        />
      );
    if (noise)
      nodes.push(
        <Noise
          key="noise"
          opacity={0.02}
          premultiply
          blendFunction={BlendFunction.SCREEN}
        />
      );
    if (vignette)
      nodes.push(
        <Vignette
          key="vignette"
          eskil={false}
          offset={vignetteOffset}
          darkness={vignetteDarkness}
        />
      );
    return nodes;
  }, [
    smaa,
    dof,
    bloom,
    noise,
    vignette,
    dofFocusDistance,
    dofFocalLength,
    dofBokehScale,
    dofHeight,
    bloomThreshold,
    bloomSmoothing,
    bloomHeight,
    bloomIntensity,
    vignetteOffset,
    vignetteDarkness,
  ]);

  return enabled ? (
    <>
      {temporalAccumulation && (
        <TemporalAccumulation enabled persistence={trailStrength} />
      )}
      <EffectComposer multisampling={0}>{children}</EffectComposer>
    </>
  ) : null;
};

export default PostFX;
