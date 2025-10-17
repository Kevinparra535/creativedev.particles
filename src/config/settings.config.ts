// Typed reinterpretation of The-Spirit legacy settings.js
// Provides strong types, defaults, and URL param parsing.

export type AmountKey =
  | "4k"
  | "8k"
  | "16k"
  | "32k"
  | "65k"
  | "131k"
  | "252k"
  | "524k"
  | "1m"
  | "2m"
  | "4m";

// [width, height, radius]
export const amountMap: Record<AmountKey, [number, number, number]> = {
  "4k": [64, 64, 0.29],
  "8k": [128, 64, 0.42],
  "16k": [128, 128, 0.48],
  "32k": [256, 128, 0.55],
  "65k": [256, 256, 0.6],
  "131k": [512, 256, 0.85],
  "252k": [512, 512, 1.2],
  "524k": [1024, 512, 1.4],
  "1m": [1024, 1024, 1.6],
  "2m": [2048, 1024, 2],
  "4m": [2048, 2048, 2.5],
};

export const amountList = Object.keys(amountMap) as AmountKey[];

export type MotionBlurQualityKey = "best" | "high" | "medium" | "low";

export const motionBlurQualityMap: Record<MotionBlurQualityKey, number> = {
  best: 1,
  high: 0.5,
  medium: 1 / 3,
  low: 0.25,
};

export const motionBlurQualityList = Object.keys(
  motionBlurQualityMap
) as MotionBlurQualityKey[];

export interface SettingsConfig {
  // diagnostics
  useStats: boolean;
  isMobile: boolean;

  // particle amount / simulator texture
  amount: AmountKey;
  simulatorTextureWidth: number;
  simulatorTextureHeight: number;

  // particle behavior
  useTriangleParticles: boolean;
  followMouse: boolean;
  speed: number; // 1
  dieSpeed: number; // 0.015
  radius: number; // from amountMap[amount][2]
  curlSize: number; // 0.02
  attraction: number; // 1
  shadowDarkness: number; // 0.45

  // colors / bg
  bgColor: string; // '#343434'
  color1: string; // '#ffffff'
  color2: string; // '#ffffff'

  // post processing toggles
  fxaa: boolean;
  motionBlurQuality: MotionBlurQualityKey; // 'medium'
  motionBlur: boolean; // true
  motionBlurPause: boolean; // false
  bloom: boolean; // true
}

function getIsMobile(ua: string): boolean {
  return /(iPad|iPhone|Android)/i.test(ua);
}

// Parses a URL like legacy's settings.js but using URLSearchParams.
export function getInitialSettings(url?: string, ua?: string): SettingsConfig {
  const hasWindow = (globalThis as any)?.window !== undefined;
  const w: Window | undefined = hasWindow
    ? ((globalThis as any).window as Window)
    : undefined;
  const search = w ? w.location.search : url ? new URL(url).search : "";
  const params = new URLSearchParams(search);

  // amount
  const amountParam = (params.get("amount") || "65k") as AmountKey;
  const amount: AmountKey = amountList.includes(amountParam)
    ? amountParam
    : "65k";
  const [simulatorTextureWidth, simulatorTextureHeight, radius] =
    amountMap[amount];

  // motion blur quality
  const mbqParam = (params.get("motionBlurQuality") ||
    "medium") as MotionBlurQualityKey;
  const motionBlurQuality: MotionBlurQualityKey =
    motionBlurQualityList.includes(mbqParam) ? mbqParam : "medium";

  const userAgent = ua || (w ? w.navigator.userAgent : "");

  const settings: SettingsConfig = {
    useStats: false,
    isMobile: getIsMobile(userAgent),

    amount,
    simulatorTextureWidth,
    simulatorTextureHeight,

    useTriangleParticles: true,
    followMouse: true,
    speed: 1,
    dieSpeed: 0.015,
    radius,
    curlSize: 0.02,
    attraction: 1,
    shadowDarkness: 0.45,

    bgColor: "#343434",
    color1: "#ffffff",
    color2: "#ffffff",

    fxaa: false,
    motionBlurQuality,
    motionBlur: true,
    motionBlurPause: false,
    bloom: true,
  };

  return settings;
}

// Convenience: default export initialized from the current environment.
const DefaultSettings: SettingsConfig = getInitialSettings();
export default DefaultSettings;
