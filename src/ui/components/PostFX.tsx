import {
  EffectComposer,
  Bloom,
  FXAA as FXAAEffect,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useSceneSettings } from "../hooks/useSceneSettings";

type Props = {
  enabled?: boolean;
};

export default function PostFX(props: Readonly<Props>) {
  const { enabled = true } = props;
  const s = useSceneSettings();
  if (!enabled) return null;
  return (
    <EffectComposer multisampling={0}>
      <FXAAEffect enabled={s.fxaa} />
      <Bloom
        enabled={s.bloom}
        intensity={0.2}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        blendFunction={BlendFunction.ADD}
      />
    </EffectComposer>
  );
}
