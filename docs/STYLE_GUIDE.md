# Style Guide (adapted to styled-components)

Based on your design system (SCSS) and applied to the current stack with styled-components. It keeps the philosophy and ordering, with equivalent utilities in TypeScript.

## Principles

- Keep it simple and reuse as much as possible.
- Code that looks like it was written by one person.
- Write for scalability.

## Structure and conventions

- Methodology: BEM for class names when you use `className` or global styles.
- Per-component style files: `ComponentName.styled.ts` (plural not always applicable for components; for groups, e.g., `Buttons.styled.ts`).
- Classes in singular and lowercase when used (e.g., `.gallery__button`).
- Name images relative to their block (e.g., `hero_background.png`).

### BEM in styled-components

Even though styled-components generates classes, we can keep BEM semantics in the component hierarchy and in auxiliary `className`s:

```tsx
import styled from 'styled-components';

// Block
export const Button = styled.button`
  /* properties */
`;

// Element
export const ButtonIcon = styled.span`
  /* properties */
`;

// Modifier (via prop)
export const ButtonPrimary = styled(Button)`
  /* variant properties */
`;
```

If you need explicit BEM classes (for testing/analytics), use `src/utils/bem.ts`:

```ts
import { bem, be, bemMods, classes } from '@/utils/bem';
const block = 'button';
const iconEl = be(block, 'icon'); // 'button__icon'
const mods = bemMods(block, null, { primary: true, size: 'lg' }); // ['button--primary', 'button--size-lg']
```

## Syntax

1. Space after the selector and before `{}` (styled-components encourages this).
2. Spaces for indentation.
3. Space after `:` in declarations.
4. Visually separate CSS blocks (blank line between logical groups).
5. Avoid deep nesting (max one level).
6. Mixins for size, text styles, and numeric font sizes.

## Property order

- Box model: display, width/height, margin/padding, border, box-sizing
- Positioning: position, top/right/bottom/left, z-index
- Typography: font, font-weight, font-size, line-height, text-transform, text-decoration, letter-spacing
- Decoration: color, background, shadows, filters, opacity, transitions
- Variables: use of `var(--...)`
- Mixins: styled-components helpers

## Equivalent mixins (src/ui/styles/scssTokens.ts)

Available:
- `fontSize(px)` → font size and relative `line-height`.
- `size(width, height?)` → sets `width` and `height` (omit height to mirror width).
- `textStyle({ transform, decoration, weight })` → typography shortcuts.
- `fontWeight(key | number)` → maps `light|normal|medium|bolder|black` or accepts a number.
- `getOpacity(color, amount)` → `color-mix` with transparency.
- `getContrastColor(bg, opts?)` and `contrastText(bg)` → readable text color against a background.

Example:

```tsx
import styled from 'styled-components';
import { fontSize, size, textStyle, spacing, colors, contrastText } from '@/ui/styles/scssTokens';

export const Button = styled.button`
  /* Box model */
  display: inline-flex;
  ${size(220, 40)};
  padding: ${spacing.space_half} ${spacing.space};
  border: 0;
  border-radius: 8px;

  /* Positioning */
  position: relative;

  /* Typography */
  ${textStyle({ transform: 'uppercase', weight: 'medium' })};
  ${fontSize(13)};

  /* Decoration */
  background: ${colors.dark};
  ${contrastText(colors.dark)};
  transition: background-color 0.2s ease;

  /* Variables / Additional mixins */
`;
```

## Variables and themes

- Use CSS variables from `GlobalStyles` (base.ts) and themes from `theme.ts`.
- Prefer `var(--color-...)` for colors and `spacing` from the token store.

## BEM + styled-components example

```tsx
import styled from 'styled-components';
import { be } from '@/utils/bem';

export const Card = styled.article.attrs({ className: 'card' })`
  display: block;
  padding: var(--space);
  background: var(--color-bg-light);
`;

export const CardTitle = styled.h3.attrs({ className: be('card', 'title') })`
  margin: 0 0 var(--space-half) 0;
  font-family: var(--font-heading);
`;
```

## Testing and accessibility

- Use `getContrastColor` to ensure sufficient (WCAG) contrast between background and text.
- Keep adequate touch targets and a clear visual hierarchy.

---

This guide keeps the intention of the original SCSS system but adapts it to a styled-components and TypeScript tokens workflow.
