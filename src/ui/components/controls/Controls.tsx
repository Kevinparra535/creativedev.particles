import { folder, useControls } from "leva";
import DefaultSettings, {
  amountList,
  amountMap,
  motionBlurQualityList,
} from "../../../config/settings.config";
import type {
  MotionBlurQualityKey,
  AmountKey,
} from "../../../config/settings.config";

const Controls = () => {
  useControls(
    {
      Simulator: folder(
        {
          amount: {
            options: amountList,
            value: DefaultSettings.amount,
            onChange: (val: AmountKey) => {
              const [w, h, r] = amountMap[val];
              DefaultSettings.amount = val;
              DefaultSettings.simulatorTextureWidth = w;
              DefaultSettings.simulatorTextureHeight = h;
              DefaultSettings.radius = r;
              // Note: Changing amount requires re-seeding sim. Reload is simplest for now.
            },
          },
          speed: {
            value: DefaultSettings.speed,
            min: 0,
            max: 3,
            step: 0.01,
            onChange: (v: number) => (DefaultSettings.speed = v),
          },
          dieSpeed: {
            value: DefaultSettings.dieSpeed,
            min: 0.0005,
            max: 0.05,
            step: 0.0005,
            onChange: (v: number) => (DefaultSettings.dieSpeed = v),
          },
          radius: {
            value: DefaultSettings.radius,
            min: 0.2,
            max: 3,
            step: 0.01,
            onChange: (v: number) => (DefaultSettings.radius = v),
          },
          curlSize: {
            value: DefaultSettings.curlSize,
            min: 0.001,
            max: 0.05,
            step: 0.001,
            onChange: (v: number) => (DefaultSettings.curlSize = v),
          },
          attraction: {
            value: DefaultSettings.attraction,
            min: -2,
            max: 2,
            step: 0.01,
            onChange: (v: number) => (DefaultSettings.attraction = v),
          },
          followMouse: {
            value: DefaultSettings.followMouse,
            onChange: (v: boolean) => (DefaultSettings.followMouse = v),
          },
        },
        { collapsed: false }
      ),
      Rendering: folder(
        {
          shadowDarkness: {
            value: DefaultSettings.shadowDarkness,
            min: 0,
            max: 1,
            step: 0.01,
            onChange: (v: number) => (DefaultSettings.shadowDarkness = v),
          },
          useTriangleParticles: {
            value: DefaultSettings.useTriangleParticles,
            onChange: (v: boolean) =>
              (DefaultSettings.useTriangleParticles = v),
          },
          color1: {
            value: DefaultSettings.color1,
            onChange: (v: string) => (DefaultSettings.color1 = v),
          },
          color2: {
            value: DefaultSettings.color2,
            onChange: (v: string) => (DefaultSettings.color2 = v),
          },
          bgColor: {
            value: DefaultSettings.bgColor,
            onChange: (v: string) => (DefaultSettings.bgColor = v),
          },
        },
        { collapsed: false }
      ),
      "Post-Processing": folder(
        {
          fxaa: {
            value: DefaultSettings.fxaa,
            onChange: (v: boolean) => (DefaultSettings.fxaa = v),
          },
          motionBlur: {
            value: DefaultSettings.motionBlur,
            onChange: (v: boolean) => (DefaultSettings.motionBlur = v),
          },
          motionBlurPause: {
            value: DefaultSettings.motionBlurPause,
            onChange: (v: boolean) => (DefaultSettings.motionBlurPause = v),
          },
          motionBlurQuality: {
            options: motionBlurQualityList,
            value: DefaultSettings.motionBlurQuality,
            onChange: (v: MotionBlurQualityKey) =>
              (DefaultSettings.motionBlurQuality = v),
          },
          motionMultiplier: {
            value: 7,
            min: 0.1,
            max: 15,
          },
          bloom: {
            value: DefaultSettings.bloom,
            onChange: (v: boolean) => (DefaultSettings.bloom = v),
          },
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
