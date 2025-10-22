# Styling System (SCSS → styled-components)

This project migrates SCSS tokens and mixins into a coherent styled-components setup while keeping parity with the original design language.

## What you get

- Global CSS variables mirroring SCSS tokens (spacing, colors, typography)
- Global font-face declarations for Poppins (body) and Montserrat (headings)
- A `light` theme that can be applied dynamically
- TypeScript helpers that replicate SCSS mixins and tokens

## Files

- Global variables: `src/ui/styles/base.ts`
  - Declares CSS variables on `html` for:
    - Spacings: `--space, --space-x2, ...`
    - Colors: `--color-primary, --color-dark, ...`
    - Typography tokens: `--font-heading, --font-body, --weight-*`
  - Exposes JS helpers via `cssVariables` with SCSS-like aliases.

- Fonts: `src/ui/styles/fonts.ts`
  - `GlobalFonts` injects @font-face for Poppins and Montserrat
  - Defines `--font-body` and `--font-heading` variables

- SCSS Tokens in TS: `src/ui/styles/scssTokens.ts`
  - `spacing`, `colors`, `fonts`, `weights`
  - `fontSize(px)` – equivalent to `@include font-size($size)`
  - `getOpacity(color, amount)` – equivalent to `get-opacity($color, $amount)`
  - `scssMedia` – equivalents for `vendors/breakpoints.scss`

- Themes: `src/ui/styles/theme.ts`
  - `themes.light` – light palette bound to CSS variables
  - `themeUtils.applyTheme(name)` – applies theme variables to `:root`

## Applying the theme

In `src/ui/App.tsx`, the light theme is applied by default:

```tsx
useEffect(() => {
  themeUtils.applyTheme('light');
}, []);
```

To switch theme at runtime:

```ts
import { themeUtils } from '@/ui/styles/theme';

themeUtils.applyTheme('space'); // or 'neon', 'ocean', 'forest', 'light'
```

## Using tokens in styled-components

- Spacings (parity with SCSS):

```ts
import styled from 'styled-components';
import { cssVariables } from '@/ui/styles/base';

export const Box = styled.div`
  padding: ${cssVariables.spacing.space_x2};
  margin-top: ${cssVariables.spacing.space};
`;
```

- Colors (parity with SCSS):

```ts
import styled from 'styled-components';
import { cssVariables } from '@/ui/styles/base';

export const Title = styled.h1`
  color: ${cssVariables.scssColors.color_dark};
`;
```

- Typography + mixins:

```ts
import styled from 'styled-components';
import { fontSize } from '@/ui/styles/scssTokens';

export const Heading = styled.h1`
  font-family: var(--font-heading);
  ${fontSize(30)}
  font-weight: var(--weight-bolder);
`;
```

- Breakpoints (SCSS vendor parity):

```ts
import styled from 'styled-components';
import { scssMedia } from '@/ui/styles/scssTokens';

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;

  ${scssMedia.tablet} {
    grid-template-columns: 1fr 1fr;
  }

  ${scssMedia['desktop-m']} {
    grid-template-columns: repeat(3, 1fr);
  }
`;
```

## Notes

- For best performance, prefer WOFF2 formats for fonts if available.
- You can make `var(--font-body)` the default in `GlobalStyles` (already applied) and use `var(--font-heading)` for headings.
- If you want to remove SCSS entirely, remove unused imports from `src/ui/assets/scss/index.scss` once the migration is complete.
