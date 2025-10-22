/**
 * Simple BEM helpers for consistent class naming when needed alongside styled-components.
 * Usage examples:
 *  - bem('button') => 'button'
 *  - bem('button', 'icon') => 'button__icon'
 *  - bem('button', 'icon', 'active') => 'button__icon--active'
 *  - bemMods('button', null, { primary: true, size: 'lg' }) => ['button--primary','button--size-lg']
 */

export const be = (block: string, element: string) => `${block}__${element}`;

export const bem = (block: string, element?: string | null, modifier?: string | null) => {
  let base = block;
  if (element) base = `${base}__${element}`;
  if (modifier) base = `${base}--${modifier}`;
  return base;
};

export const bemMods = (
  block: string,
  element: string | null,
  mods: Record<string, boolean | string | number | undefined | null>
): string[] => {
  const base = element ? `${block}__${element}` : block;
  const out: string[] = [];
  for (const [key, val] of Object.entries(mods)) {
    if (val === false || val == null) continue;
    if (val === true) out.push(`${base}--${key}`);
    else out.push(`${base}--${key}-${String(val)}`);
  }
  return out;
};

export const classes = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(' ');
