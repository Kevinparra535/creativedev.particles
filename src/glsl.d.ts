declare module "*.glsl" { const src: string; export default src; }
declare module "*.vert" { const src: string; export default src; }
declare module "*.frag" { const src: string; export default src; }

declare module "glslify" {
  function glsl(literals: TemplateStringsArray, ...placeholders: unknown[]): string;
  export default glsl;
}