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

  // Legacy compatibility - mouse tracking
  mouse?: any; // THREE.Vector2 - set at runtime
  mouse3d?: any; // THREE.Vector3 - set at runtime
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

  // Merge search and hash params with hash taking precedence (legacy behavior)
  const href = w ? w.location.href : url || "";
  let searchParams = new URLSearchParams();
  let hashParams = new URLSearchParams();

  try {
    if (w) {
      if (w.location.search) searchParams = new URLSearchParams(w.location.search.slice(1));
      if (w.location.hash) hashParams = new URLSearchParams(w.location.hash.slice(1));
    } else if (url) {
      const u = new URL(url);
      if (u.search) searchParams = new URLSearchParams(u.search.slice(1));
      if (u.hash) hashParams = new URLSearchParams(u.hash.slice(1));
    }
  } catch {
    // Fallback parsing if URL constructor fails
    const qIdx = href.indexOf("?");
    const hIdx = href.indexOf("#");
    const searchStr = qIdx >= 0 ? href.slice(qIdx + 1, hIdx >= 0 ? hIdx : undefined) : "";
    const hashStr = hIdx >= 0 ? href.slice(hIdx + 1) : "";
    if (searchStr) searchParams = new URLSearchParams(searchStr);
    if (hashStr) hashParams = new URLSearchParams(hashStr);
  }

  // Build final params map where hash overrides search
  const params = new URLSearchParams(searchParams);
  for (const [k, v] of hashParams.entries()) params.set(k, v);

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
// This will be recreated on each module load (including page reloads)
let DefaultSettings: SettingsConfig = getInitialSettings();

// Function to reinitialize settings (useful for testing or dynamic updates)
export function reinitializeSettings(): SettingsConfig {
  DefaultSettings = getInitialSettings();
  return DefaultSettings;
}

export default DefaultSettings;
