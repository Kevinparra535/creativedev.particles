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
}: PostFXProps) => {
  const children = useMemo(() => {
    const nodes: React.ReactElement[] = [];
    if (smaa) nodes.push(<Smaa key="smaa" />);
    if (dof)
      nodes.push(
        <DepthOfField
          key="dof"
          focusDistance={0}
          focalLength={50}
          bokehScale={1}
          height={480}
        />
      );
    if (bloom)
      nodes.push(
        <Bloom
          key="bloom"
          luminanceThreshold={0}
          luminanceSmoothing={0.9}
          height={300}
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
        <Vignette key="vignette" eskil={false} offset={0.1} darkness={1.1} />
      );
    return nodes;
  }, [smaa, dof, bloom, noise, vignette]);

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
