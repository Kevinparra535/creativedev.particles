# Style Guide (Adaptado a styled-components)

Basado en tu sistema de diseño (SCSS) y aplicado al stack actual con styled-components. Mantiene la filosofía y el orden, con utilidades equivalentes en TypeScript.

## Principios

- Manténlo simple y reutiliza lo más posible.
- Código que parezca escrito por una sola persona.
- Escribe pensando en escalabilidad.

## Estructura y Convenciones

- Metodología: BEM para nombres de clases cuando uses `className` o estilos globales.
- Archivos de estilos por componente: `ComponentName.styled.ts` (plural no aplica siempre en componentes, pero si creas agrupaciones: `Buttons.styled.ts`).
- Clases en singular y minúscula cuando se usen (ej: `.gallery__button`).
- Nombra imágenes relativo al bloque (ej: `hero_background.png`).

### BEM en styled-components

Aunque styled-components genera clases, podemos conservar la semántica BEM en la jerarquía de componentes y en `className` auxiliares:

```tsx
import styled from 'styled-components';

// Bloque
export const Button = styled.button`
  /* propiedades */
`;

// Elemento
export const ButtonIcon = styled.span`
  /* propiedades */
`;

// Modificador (por prop)
export const ButtonPrimary = styled(Button)`
  /* propiedades de variante */
`;
```

Si necesitas clases BEM explícitas (por testing/analytics), usa `src/utils/bem.ts`:

```ts
import { bem, be, bemMods, classes } from '@/utils/bem';
const block = 'button';
const iconEl = be(block, 'icon'); // 'button__icon'
const mods = bemMods(block, null, { primary: true, size: 'lg' }); // ['button--primary', 'button--size-lg']
```

## Sintaxis

1. Espacio después del selector y antes de `{}` (styled-components ya fomenta esto).
2. Indentación con espacios.
3. Espacio después de `:` en declaraciones.
4. Bloques CSS separados visualmente (línea en blanco entre grupos lógicos).
5. Evitar anidación excesiva (máx. 1 nivel).
6. Mixins para tamaño, estilos de texto y tamaños de fuente numéricos.

## Orden de propiedades

- Box model: display, width/height, margin/padding, border, box-sizing
- Positioning: position, top/right/bottom/left, z-index
- Typography: font, font-weight, font-size, line-height, text-transform, text-decoration, letter-spacing
- Decoration: color, background, shadows, filters, opacity, transitions
- Variables: uso de `var(--...)`
- Mixins: helpers de styled-components

## Mixins equivalentes (src/ui/styles/scssTokens.ts)

Disponibles:
- `fontSize(px)` → tamaño de fuente y `line-height` relativo.
- `size(width, height?)` → setea `width` y `height` (si omites height = width).
- `textStyle({ transform, decoration, weight })` → atajos para tipografía.
- `fontWeight(key | number)` → mapea `light|normal|medium|bolder|black` o usa un número.
- `getOpacity(color, amount)` → `color-mix` con transparencia.
- `getContrastColor(bg, opts?)` y `contrastText(bg)` → color de texto legible según fondo.

Ejemplo:

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

  /* Variables / Mixins adicionales */
`;
```

## Variables y Temas

- Usa variables CSS definidas en `GlobalStyles` (base.ts) y temas desde `theme.ts`.
- Preferir `var(--color-...)` para colores y `spacing` del store de tokens.

## Ejemplo BEM + styled-components

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

## Testing y Accesibilidad

- Usa `getContrastColor` para asegurar contraste suficiente (WCAG) entre fondo y texto.
- Mantén tamaños de toque adecuados y jerarquía visual clara.

---

Esta guía mantiene la intención del sistema original en SCSS pero adaptada al flujo de trabajo con styled-components y tokens TypeScript.
