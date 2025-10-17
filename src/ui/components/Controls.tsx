import { folder, useControls } from "leva";
import settings, { amountList, amountMap, motionBlurQualityList } from "../../config/settings.config";
import type { MotionBlurQualityKey, AmountKey } from "../../config/settings.config";

const Controls = () => {
  useControls(
    {
      Simulator: folder(
        {
          amount: {
            options: amountList,
            value: settings.amount as AmountKey,
            onChange: (val: AmountKey) => {
              const [w, h, r] = amountMap[val];
              settings.amount = val;
              settings.simulatorTextureWidth = w;
              settings.simulatorTextureHeight = h;
              settings.radius = r;
              // Note: Changing amount requires re-seeding sim. Reload is simplest for now.
            },
          },
          speed: { value: settings.speed, min: 0, max: 3, step: 0.01, onChange: (v: number) => (settings.speed = v) },
          dieSpeed: {
            value: settings.dieSpeed,
            min: 0.0005,
            max: 0.05,
            step: 0.0005,
            onChange: (v: number) => (settings.dieSpeed = v),
          },
          radius: { value: settings.radius, min: 0.2, max: 3, step: 0.01, onChange: (v: number) => (settings.radius = v) },
          curlSize: { value: settings.curlSize, min: 0.001, max: 0.05, step: 0.001, onChange: (v: number) => (settings.curlSize = v) },
          attraction: { value: settings.attraction, min: -2, max: 2, step: 0.01, onChange: (v: number) => (settings.attraction = v) },
          followMouse: { value: settings.followMouse, onChange: (v: boolean) => (settings.followMouse = v) },
        },
        { collapsed: false }
      ),
      Rendering: folder(
        {
          shadowDarkness: {
            value: settings.shadowDarkness,
            min: 0,
            max: 1,
            step: 0.01,
            onChange: (v: number) => (settings.shadowDarkness = v),
          },
          useTriangleParticles: {
            value: settings.useTriangleParticles,
            onChange: (v: boolean) => (settings.useTriangleParticles = v),
          },
          color1: { value: settings.color1, onChange: (v: string) => (settings.color1 = v) },
          color2: { value: settings.color2, onChange: (v: string) => (settings.color2 = v) },
          bgColor: { value: settings.bgColor, onChange: (v: string) => (settings.bgColor = v) },
        },
        { collapsed: false }
      ),
      "Post-Processing": folder(
        {
          fxaa: { value: settings.fxaa, onChange: (v: boolean) => (settings.fxaa = v) },
          motionBlur: { value: settings.motionBlur, onChange: (v: boolean) => (settings.motionBlur = v) },
          motionBlurPause: {
            value: settings.motionBlurPause,
            onChange: (v: boolean) => (settings.motionBlurPause = v),
          },
          motionBlurQuality: {
            options: motionBlurQualityList as MotionBlurQualityKey[],
            value: settings.motionBlurQuality as MotionBlurQualityKey,
            onChange: (v: MotionBlurQualityKey) => (settings.motionBlurQuality = v),
          },
          motionMultiplier: {
            value: 7,
            min: 0.1,
            max: 15,
          },
          bloom: { value: settings.bloom, onChange: (v: boolean) => (settings.bloom = v) },
          bloomRadius: { value: 1, min: 0, max: 3 },
          bloomAmount: { value: 1, min: 0, max: 3 },
        },
        { collapsed: false }
      ),
    },
    { store: undefined }
  );
  return null;
};

export default Controls;
