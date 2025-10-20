import { EffectComposer, Bloom, FXAA as FXAAEffect } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

type Props = {
  enabled?: boolean;
};

export default function PostFX(props: Readonly<Props>) {
  const { enabled = true } = props;
  if (!enabled) return null;
  return (
    <EffectComposer multisampling={0}>
      <FXAAEffect />
      <Bloom intensity={0.2} luminanceThreshold={0.2} luminanceSmoothing={0.9} blendFunction={BlendFunction.ADD} />
    </EffectComposer>
  );
}
