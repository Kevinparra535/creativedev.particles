import glsl from "glslify";

const motionBlurFragShader = glsl``;

const motionBlurVertexShader = glsl``;

const motionBlurLinesFragShader = glsl``;

const motionBlurLinesVertexShader = glsl``;

const motionBlurMotionFragShader = glsl`
precision highp float;

uniform float u_motionMultiplier;

in vec2 v_motion;      // reemplaza 'varying' por 'in'
out vec4 outColor;     // reemplaza 'gl_FragColor' por 'outColor'

void main() {
  // Empaqueta el motion vector y la profundidad en RGBA
  outColor = vec4(v_motion * u_motionMultiplier, gl_FragCoord.z, 1.0);
}
`;

const motionBlurMotionVertexShader = glsl`
precision highp float;

uniform mat4 u_prevModelViewMatrix;

out vec2 v_motion;

// Chunks estándar de Three (GLSL3-ready)
#include <common>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>

void main() {
  // Configuración de skinning/morph targets
  #include <skinbase_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>

  // 'transformed' lo define <begin_vertex>/<morph>/<skinning>
  vec4 pos     = projectionMatrix * modelViewMatrix      * vec4(transformed, 1.0);
  vec4 prevPos = projectionMatrix * u_prevModelViewMatrix * vec4(transformed, 1.0);

  gl_Position = pos;
  v_motion = (pos.xy / pos.w - prevPos.xy / prevPos.w) * 0.5;
}
`;

export {
  motionBlurMotionVertexShader,
  motionBlurMotionFragShader,
  motionBlurVertexShader,
  motionBlurFragShader,
  motionBlurLinesVertexShader,
  motionBlurLinesFragShader,
};
