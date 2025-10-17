import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { glslify } from "vite-plugin-glslify";
import glsl from "vite-plugin-glsl";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    glslify(),
    glsl({
      include: "**/*.{glsl,wgsl,vert,frag}",
      defaultExtension: "glsl",
      warnDuplicatedImports: false,
      watch: true,
    }),
  ],
});
