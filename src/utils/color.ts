export type RGB = { r: number; g: number; b: number };

const clamp255 = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

export const hexToRgb = (hex: string): RGB | null => {
  const h = hex.replace(/^#/, '').toLowerCase();
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16);
    const g = parseInt(h[1] + h[1], 16);
    const b = parseInt(h[2] + h[2], 16);
    return { r, g, b };
  }
  if (h.length === 6 || h.length === 8) {
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return { r, g, b };
  }
  return null;
};

export const rgbStringToRgb = (rgb: string): RGB | null => {
  const m = rgb.replace(/\s+/g, '').match(/^rgba?\(([^)]+)\)$/i);
  if (!m) return null;
  const parts = m[1].split(',');
  if (parts.length < 3) return null;
  const parsePart = (p: string) => {
    if (p.endsWith('%')) {
      const v = parseFloat(p);
      if (Number.isNaN(v)) return null;
      return clamp255((v / 100) * 255);
    }
    const v = parseFloat(p);
    if (Number.isNaN(v)) return null;
    return clamp255(v);
  };
  const r = parsePart(parts[0]!);
  const g = parsePart(parts[1]!);
  const b = parsePart(parts[2]!);
  if (r == null || g == null || b == null) return null;
  return { r, g, b };
};

/**
 * Converts an HSL color string to RGB color object.
 *
 * @param hsl - The HSL color string in format "hsl(h, s%, l%)" or "hsla(h, s%, l%, a)"
 * @returns RGB color object with r, g, b properties (0-255 range) or null if parsing fails
 *
 * @example
 * ```typescript
 * const rgb = hslStringToRgb("hsl(120, 50%, 75%)");
 * // Returns: { r: 159, g: 223, b: 159 }
 *
 * const invalid = hslStringToRgb("invalid");
 * // Returns: null
 * ```
 */
export const hslStringToRgb = (hsl: string): RGB | null => {
  const m = hsl.replace(/\s+/g, '').match(/^hsla?\(([^)]+)\)$/i);
  if (!m) return null;
  const parts = m[1].split(',');
  if (parts.length < 3) return null;
  const h = parseFloat(parts[0]!);
  const s = parts[1]!.endsWith('%') ? parseFloat(parts[1]!) / 100 : parseFloat(parts[1]!);
  const l = parts[2]!.endsWith('%') ? parseFloat(parts[2]!) / 100 : parseFloat(parts[2]!);
  if ([h, s, l].some((v) => Number.isNaN(v))) return null;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hh = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  let r1 = 0,
    g1 = 0,
    b1 = 0;
  if (hh >= 0 && hh < 1) [r1, g1, b1] = [c, x, 0];
  else if (hh >= 1 && hh < 2) [r1, g1, b1] = [x, c, 0];
  else if (hh >= 2 && hh < 3) [r1, g1, b1] = [0, c, x];
  else if (hh >= 3 && hh < 4) [r1, g1, b1] = [0, x, c];
  else if (hh >= 4 && hh < 5) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];
  const m0 = l - c / 2;
  return {
    r: clamp255((r1 + m0) * 255),
    g: clamp255((g1 + m0) * 255),
    b: clamp255((b1 + m0) * 255)
  };
};

export const toRgb = (color: string): RGB | null => {
  if (!color) return null;
  const c = color.trim();
  if (c.startsWith('#')) return hexToRgb(c);
  if (/^rgba?\(/i.test(c)) return rgbStringToRgb(c);
  if (/^hsla?\(/i.test(c)) return hslStringToRgb(c);
  return null;
};

export const relativeLuminance = ({ r, g, b }: RGB): number => {
  const srgb = [r, g, b].map((v) => v / 255);
  const lin = srgb.map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * lin[0]! + 0.7152 * lin[1]! + 0.0722 * lin[2]!;
};

export const getContrastColor = (
  background: string,
  options?: { light?: string; dark?: string; strategy?: 'wcag' | 'yiq'; wcagThreshold?: number }
): string => {
  const light = options?.light ?? '#ffffff';
  const dark = options?.dark ?? '#000000';
  const strategy = options?.strategy ?? 'wcag';
  const rgb = toRgb(background);

  if (rgb) {
    if (strategy === 'wcag') {
      const L = relativeLuminance(rgb);
      const threshold = options?.wcagThreshold ?? 0.179;
      return L > threshold ? dark : light;
    } else {
      const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
      return yiq >= 128 ? dark : light;
    }
  }
  return dark;
};

// Convenience: return an inline style object for React/DOM
export const contrastTextStyle = (
  background: string,
  light = '#ffffff',
  dark = '#000000'
): { color: string } => ({ color: getContrastColor(background, { light, dark }) });
