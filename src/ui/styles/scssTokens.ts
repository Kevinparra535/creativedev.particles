import { css } from 'styled-components';

// Spacing tokens (parity with SCSS)
export const spacing = {
  space: 'var(--space)',
  space_half: 'var(--space-half)',
  space_x2: 'var(--space-x2)',
  space_x3: 'var(--space-x3)',
  space_x4: 'var(--space-x4)',
  space_x5: 'var(--space-x5)',
  space_x6: 'var(--space-x6)',
  space_x7: 'var(--space-x7)'
};

// Color tokens (parity with SCSS)
export const colors = {
  primary: 'var(--color-primary)',
  secondary: 'var(--color-secondary)',
  variant: 'var(--color-variant)',
  variant_two: 'var(--color-variant-two)',
  variant_three: 'var(--color-variant-three)',
  variant_four: 'var(--color-variant-four)',
  variant_five: 'var(--color-variant-five)',
  variant_six: 'var(--color-variant-six)',

  mood_two_primary: 'var(--color-mood-two-primary)',
  mood_two_secondary: 'var(--color-mood-two-secondary)',
  mood_two_dark: 'var(--color-mood-two-dark)',
  mood_two_light: 'var(--color-mood-two-light)',

  mood_three_primary: 'var(--color-mood-three-primary)',
  mood_three_secondary: 'var(--color-mood-three-secondary)',
  mood_three_dark: 'var(--color-mood-three-dark)',
  mood_three_light: 'var(--color-mood-three-light)',

  mood_four_primary: 'var(--color-mood-four-primary)',
  mood_four_secondary: 'var(--color-mood-four-secondary)',
  mood_four_dark: 'var(--color-mood-four-dark)',
  mood_four_light: 'var(--color-mood-four-light)',

  mood_five_primary: 'var(--color-mood-five-primary)',
  mood_five_secondary: 'var(--color-mood-five-secondary)',
  mood_five_dark: 'var(--color-mood-five-dark)',
  mood_five_light: 'var(--color-mood-five-light)',

  negative: 'var(--color-negative)',
  warning: 'var(--color-warning)',
  info: 'var(--color-info)',
  check: 'var(--color-check)',

  bg_light: 'var(--color-bg-light)',
  bg_dark: 'var(--color-bg-dark)',
  light: 'var(--color-light)',
  dark: 'var(--color-dark)'
};

// Typography tokens
export const fonts = {
  heading: 'var(--font-heading)',
  body: 'var(--font-body)',
  mono: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", "Courier New", monospace)'
};

export const weights = {
  light: 400,
  normal: 500,
  medium: 600,
  bolder: 700,
  black: 800
};

// Mixins equivalents to SCSS
export const fontSize = (px: number) => {
  const rem = px / 16;
  return css`
    font-size: ${rem}rem;
    line-height: ${rem * 1.5}rem;
  `;
};

export const getOpacity = (colorCss: string, amount: number) => `color-mix(in srgb, ${colorCss} ${
  Math.max(0, Math.min(1, amount)) * 100
}%, transparent)`;

// SCSS breakpoints equivalents
export const scssBreakpoints = {
  tablet: '768px',
  'desktop-s': '992px',
  'desktop-m': '1200px',
  'desktop-ml': '1366px',
  'desktop-l': '1480px',
  'desktop-xl': '1780px'
} as const;

export const scssMedia = {
  tablet: `@media only screen and (min-width: ${scssBreakpoints.tablet})`,
  'desktop-s': `@media only screen and (min-width: ${scssBreakpoints['desktop-s']})`,
  'desktop-m': `@media only screen and (min-width: ${scssBreakpoints['desktop-m']})`,
  'desktop-ml': `@media only screen and (min-width: ${scssBreakpoints['desktop-ml']})`,
  'desktop-l': `@media only screen and (min-width: ${scssBreakpoints['desktop-l']})`,
  'desktop-xl': `@media only screen and (min-width: ${scssBreakpoints['desktop-xl']})`,
  'mobile-only': `@media only screen and (max-width: ${scssBreakpoints.tablet})`,
  'tablet-p-only': `@media only screen and (min-width: 768px) and (max-width: 992px) and (orientation: portrait)`,
  'tablet-l-only': `@media only screen and (min-width: 768px) and (max-width: 992px) and (orientation: landscape)`,
  'desktop-s-only': `@media only screen and (min-width: 768px) and (max-width: 1200px)`,
  'desktop-m-only': `@media only screen and (min-width: 1200px) and (max-width: 1480px)`
} as const;

export default {
  spacing,
  colors,
  fonts,
  weights,
  fontSize,
  getOpacity,
  scssBreakpoints,
  scssMedia
};
