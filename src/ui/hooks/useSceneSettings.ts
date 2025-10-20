import { create } from "zustand";
import DefaultSettings, { amountMap } from "../../config/settings.config";
import type { AmountKey } from "../../config/settings.config";

export type SceneSettings = {
  amount: AmountKey;
  useTriangleParticles: boolean;
  followMouse: boolean;
  speed: number;
  dieSpeed: number;
  radius: number;
  curlSize: number;
  attraction: number;
  shadowDarkness: number;
  bgColor: string;
  color1: string;
  color2: string;
  fxaa: boolean;
  bloom: boolean;
  motionBlur: boolean;
  motionBlurQuality: "best" | "high" | "medium" | "low";

  // derived
  cols: number;
  rows: number;

  set<K extends keyof SceneSettings>(key: K, value: SceneSettings[K]): void;
  setAmount(amount: AmountKey): void;
};

export const useSceneSettings = create<SceneSettings>((set) => {
  const [cols, rows, radius] = amountMap[DefaultSettings.amount];

  return {
    amount: DefaultSettings.amount,
    useTriangleParticles: DefaultSettings.useTriangleParticles,
    followMouse: DefaultSettings.followMouse,
    speed: DefaultSettings.speed,
    dieSpeed: DefaultSettings.dieSpeed,
    radius,
    curlSize: DefaultSettings.curlSize,
    attraction: DefaultSettings.attraction,
    shadowDarkness: DefaultSettings.shadowDarkness,
    bgColor: DefaultSettings.bgColor,
    color1: DefaultSettings.color1,
    color2: DefaultSettings.color2,
    fxaa: DefaultSettings.fxaa,
    bloom: DefaultSettings.bloom,
    motionBlur: DefaultSettings.motionBlur,
    motionBlurQuality: DefaultSettings.motionBlurQuality,

    cols,
    rows,

    set: (key, value) => set({ [key]: value } as any),
    setAmount: (amount: AmountKey) => {
      const [w, h, r] = amountMap[amount];
      set({ amount, cols: w, rows: h, radius: r });
    },
  };
});

export default useSceneSettings;
