/**
 * Math utilities migrated from legacy utils/math.js with TypeScript types.
 */

export const PI = Math.PI;
export const TAU = PI * 2;

/** Returns 0 if val < edge else 1 */
export function step(edge: number, val: number): 0 | 1 {
  return val < edge ? 0 : 1;
}

/** Smoothstep between edge0 and edge1. Returns 0..1 with cubic Hermite smoothing. */
export function smoothstep(edge0: number, edge1: number, val: number): number {
  const t = unMix(edge0, edge1, val);
  return t * t * (3 - 2 * t);
}

/** Clamp val to [min, max] */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/** Linear interpolation clamped to [0,1] */
export function mix(min: number, max: number, t: number): number {
  return t <= 0 ? min : t >= 1 ? max : min + (max - min) * t;
}

/** Unmix: maps val in [min, max] to [0,1] with clamping */
export function unMix(min: number, max: number, val: number): number {
  return val <= min ? 0 : val >= max ? 1 : (val - min) / (max - min);
}

/** Linear interpolation without clamping t */
export function unClampedMix(min: number, max: number, t: number): number {
  return min + (max - min) * t;
}

/** Inverse lerp without clamping result */
export function upClampedUnMix(min: number, max: number, val: number): number {
  return (val - min) / (max - min);
}

/** Fractional part */
export function fract(val: number): number {
  return val - Math.floor(val);
}

/** Hash based on sine. Deterministic for numeric input. */
export function hash(val: number): number {
  return fract(Math.sin(val) * 43758.5453123);
}

/** 2D hash from val1 and val2. */
export function hash2(val1: number, val2: number): number {
  return fract(Math.sin(val1 * 12.9898 + val2 * 4.1414) * 43758.5453);
}

/** Sign function returning -1, 0, or 1 */
export function sign(val: number): -1 | 0 | 1 {
  return val ? (val < 0 ? -1 : 1) : 0;
}

// Legacy aliases
export const lerp = mix;
export const unLerp = unMix;
export const unClampedLerp = unClampedMix;
export const unClampedUnLerp = upClampedUnMix;
