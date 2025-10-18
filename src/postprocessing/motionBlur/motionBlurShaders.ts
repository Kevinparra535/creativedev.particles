import glsl from "glslify";

const motionBlurFragShader = glsl`
precision highp float;

uniform sampler2D u_texture;
uniform sampler2D u_linesTexture;
uniform float u_lineAlphaMultiplier;

in vec2 v_uv;
out vec4 outColor;

void main() {
  vec3 base  = texture(u_texture, v_uv).rgb;
  vec4 lines = texture(u_linesTexture, v_uv);

  // Mezcla de color con compensación por alfa
  vec3 color = (base + lines.rgb * u_lineAlphaMultiplier)
             / (lines.a * u_lineAlphaMultiplier + 1.0);

  outColor = vec4(color, 1.0);
}
`;

const motionBlurLinesFragShader = glsl`
precision highp float;

uniform sampler2D u_motionTexture;
uniform float u_depthTest;
uniform float u_opacity;
uniform float u_leaning;
uniform float u_fadeStrength;
uniform float u_depthBias;
uniform float u_useDepthWeight;

in vec3 v_color;
in float v_ratio;
in float v_depth;
in vec2 v_uv;

out vec4 outColor;

void main() {
  vec3 motion = texture(u_motionTexture, v_uv).xyz;

  float alpha = smoothstep(0.0, u_leaning, v_ratio) * (1.0 - smoothstep(u_leaning, 1.0, v_ratio));
  alpha = pow(alpha, u_fadeStrength) * u_opacity;

  if (alpha < 0.00392157) {
    discard;
  }

  float threshold = v_depth * step(0.0001, motion.z);
  alpha *= max(1.0 - u_depthTest, smoothstep(threshold - u_depthBias, threshold, motion.z));

  outColor = vec4(v_color * alpha, alpha);
}
`;

const motionBlurLinesVertexShader = glsl`
precision highp float;

in vec3 position;

uniform sampler2D u_texture;
uniform sampler2D u_motionTexture;

uniform vec2 u_resolution;
uniform float u_maxDistance;
uniform float u_jitter;
uniform float u_motionMultiplier;
uniform float u_leaning;

out vec3 v_color;
out float v_ratio;
out float v_depth;
out vec2 v_uv;

void main() {
  // Color base desde la textura
  v_color = texture(u_texture, position.xy).rgb;

  // Determina el lado (izq/der) para interpolaciones
  float side = step(0.001, position.z);
  v_ratio = side;

  // Lee el motion vector y la profundidad
  vec3 motion = texture(u_motionTexture, position.xy).xyz;
  v_depth = motion.z;

  // Calcula desplazamiento basado en el motion map
  vec2 offset = motion.xy * u_resolution * u_motionMultiplier;
  float offsetDistance = length(offset);

  // Limita el desplazamiento máximo
  if (offsetDistance > u_maxDistance) {
    offset = normalize(offset) * u_maxDistance;
  }

  // Posición final en clip space
  vec2 pos = position.xy * 2.0 - 1.0
           - offset / u_resolution * 2.0
           * (1.0 - position.z * u_jitter)
           * (side - u_leaning);

  v_uv = pos * 0.5 + 0.5;
  gl_Position = vec4(pos, 0.0, 1.0);
}
`;

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

const motionBlurSamplingShader = glsl`
precision highp float;

uniform sampler2D u_texture;
uniform sampler2D u_motionTexture;

uniform vec2 u_resolution;
uniform float u_maxDistance;
uniform float u_motionMultiplier;
uniform float u_leaning;

in vec2 v_uv;
out vec4 outColor;

// Si no la defines desde el bundler, deja una por defecto:
// #define SAMPLE_COUNT 8
#ifndef SAMPLE_COUNT
  #define SAMPLE_COUNT 8
#endif

void main() {
  vec2 motion = texture(u_motionTexture, v_uv).xy;

  vec2 offset = motion * u_resolution * u_motionMultiplier;
  float offsetDistance = length(offset);
  if (offsetDistance > u_maxDistance) {
    offset = normalize(offset) * u_maxDistance;
  }

  // Paso por muestra (en UV) y posición inicial
  vec2 delta = -offset / u_resolution * 2.0 / float(SAMPLE_COUNT);
  vec2 pos   = v_uv - delta * u_leaning * float(SAMPLE_COUNT);

  vec3 color = vec3(0.0);
  for (int i = 0; i < SAMPLE_COUNT; i++) {
    color += texture(u_texture, pos).rgb;
    pos   += delta;
  }

  outColor = vec4(color / float(SAMPLE_COUNT), 1.0);
}
`;

export {
  motionBlurMotionVertexShader,
  motionBlurMotionFragShader,
  motionBlurFragShader,
  motionBlurLinesVertexShader,
  motionBlurLinesFragShader,
  motionBlurSamplingShader,
};
