import glsl from "glslify";
import { curl4 } from "./helpers";

const quadVert = glsl`
precision highp float;
in vec3 position;
void main() { gl_Position = vec4(position, 1.0); }
`;

const throughFrag = glsl`
precision highp float;
uniform vec2 resolution;
uniform sampler2D uTexture;
out vec4 outColor;
void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  outColor = texture(uTexture, uv);
}
`;

const positionFrag = glsl`
precision highp float;
uniform vec2 resolution;
uniform sampler2D texturePosition;
uniform sampler2D textureDefaultPosition;
uniform float time;
uniform float speed;
uniform float dieSpeed;
uniform float radius;
uniform float curlSize;
uniform float attraction;
uniform float initAnimation;
uniform vec3 mouse3d;
uniform float followMouse; // 1.0 when enabled, 0.0 when disabled

out vec4 outColor;

${curl4}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;

  vec4 positionInfo = texture(texturePosition, uv);
  vec3 position = mix(vec3(0.0, -200.0, 0.0), positionInfo.xyz, smoothstep(0.0, 0.3, initAnimation));
  float life = positionInfo.a - dieSpeed;

  // Base position during init animation
  vec3 baseFollow = vec3(0.0, -(1.0 - initAnimation) * 200.0, 0.0);
  float t = smoothstep(0.2, 0.7, initAnimation);
  // When followMouse=0.0, use baseFollow; when 1.0, allow blending towards mouse
  vec3 targetFollow = mix(baseFollow, mouse3d, t);
  vec3 followPosition = mix(baseFollow, targetFollow, followMouse);

  if (life < 0.0) {
    positionInfo = texture(textureDefaultPosition, uv);
    position = positionInfo.xyz * (1.0 + sin(time * 15.0) * 0.2 + (1.0 - initAnimation)) * 0.4 * radius;
    position += followPosition;
    life = 0.5 + fract(positionInfo.w * 21.4131 + time);
  } else {
    vec3 delta = followPosition - position;
    position += delta * (0.005 + life * 0.01) * attraction * (1.0 - smoothstep(50.0, 350.0, length(delta))) * speed;
    position += curl(position * curlSize, time, 0.1 + (1.0 - life) * 0.1) * speed;
  }

  outColor = vec4(position, life);
}
`;

export { quadVert, throughFrag, positionFrag };
