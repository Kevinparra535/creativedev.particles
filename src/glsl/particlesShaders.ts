import glsl from "glslify";

const particlesFragmentShader = glsl`
precision highp float;

in float vLife;
uniform vec3 color1;
uniform vec3 color2;

out vec4 outColor;

void main() {
  vec3 outgoingLight = mix(color2, color1, smoothstep(0.0, 0.7, vLife));
  outColor = vec4(outgoingLight, 1.0);
}
`;

const particlesVertexShader = glsl`
precision highp float;

// NO declares: position, modelMatrix, viewMatrix, projectionMatrix (los inyecta Three)
uniform sampler2D texturePosition;

out float vLife;

void main() {
  // position.xy se asume malla: inyectado por Three
  vec4 positionInfo = texture(texturePosition, position.xy);

  vec4 worldPosition = modelMatrix * vec4(positionInfo.xyz, 1.0);
  vec4 mvPosition    = viewMatrix   * worldPosition;

  vLife = positionInfo.w;

  gl_PointSize = 1300.0 / length(mvPosition.xyz) * smoothstep(0.0, 0.2, positionInfo.w);
  gl_Position  = projectionMatrix * mvPosition;
}
`;

const particlesDistanceFragmentShader = glsl`
precision highp float;

uniform vec3 lightPos;
in vec4 vWorldPosition;

out vec4 outColor;

vec4 pack1K(float depth) {
  depth /= 1000.0;
  const vec4 bitSh = vec4(256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0);
  const vec4 bitMsk = vec4(0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0);
  vec4 res = fract(depth * bitSh);
  res -= res.xxyz * bitMsk;
  return res;
}

void main() {
  float depth = length(vWorldPosition.xyz - lightPos.xyz);
  outColor = pack1K(depth);
}
`;

const particlesDistanceVertexShader = glsl`
precision highp float;

uniform sampler2D texturePosition;

out vec4 vWorldPosition;

void main() {
  vec4 positionInfo = texture(texturePosition, position.xy);
  vec4 worldPosition = modelMatrix * vec4(positionInfo.xyz, 1.0);
  vec4 mvPosition    = viewMatrix * worldPosition;

  gl_PointSize = 50.0 / length(mvPosition.xyz);
  vWorldPosition = worldPosition;
  gl_Position = projectionMatrix * mvPosition;
}
`;

const particlesMotionVertexShader = glsl`
precision highp float;

uniform sampler2D texturePosition;
uniform sampler2D texturePrevPosition;

uniform mat4 u_prevModelViewMatrix; // <- personalizado, sí va

out vec2 v_motion;

void main() {
  vec4 positionInfo     = texture(texturePosition, position.xy);
  vec4 prevPositionInfo = texture(texturePrevPosition, position.xy);

  vec4 mvPosition = modelViewMatrix * vec4(positionInfo.xyz, 1.0);

  gl_PointSize = 1300.0 / length(mvPosition.xyz) * smoothstep(0.0, 0.2, positionInfo.w);

  vec4 pos     = projectionMatrix * mvPosition;
  vec4 prevPos = projectionMatrix * u_prevModelViewMatrix * vec4(prevPositionInfo.xyz, 1.0);

  v_motion = (pos.xy / pos.w - prevPos.xy / prevPos.w) * 0.5 * step(positionInfo.w, prevPositionInfo.w);

  gl_Position = pos;
}
`;

const trianglesVertexShader = glsl`
precision highp float;

in vec3 positionFlip;     // atributo personalizado
in vec2 fboUV;            // atributo personalizado

uniform sampler2D texturePosition; // personalizado
uniform float flipRatio;           // personalizado
// NO declares: position/matrices

out float vLife;

void main() {
  vec4 positionInfo = texture(texturePosition, fboUV);
  vec3 pos = positionInfo.xyz;

  vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
  vec4 mvPosition    = viewMatrix * worldPosition;

  vLife = positionInfo.w;

  vec3 offset = (position + (positionFlip - position) * flipRatio)
              * smoothstep(0.0, 0.2, positionInfo.w);

  gl_Position = projectionMatrix * (mvPosition + vec4(offset, 0.0));
}
`;

const trianglesDistanceShader = glsl`
precision highp float;

in vec3 positionFlip;  // personalizado
in vec2 fboUV;         // personalizado

uniform sampler2D texturePosition; // personalizado
uniform float flipRatio;           // personalizado

out vec4 vWorldPosition;

void main() {
  vec4 positionInfo = texture(texturePosition, fboUV);
  vec3 pos = positionInfo.xyz;

  vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
  vec4 mvPosition    = viewMatrix * worldPosition;

  vWorldPosition = worldPosition;

  vec3 offset = (position + (positionFlip - position) * flipRatio)
              * smoothstep(0.0, 0.2, positionInfo.w);

  gl_Position = projectionMatrix * (mvPosition + vec4(offset, 0.0));
}
`;

const trianglesMotionShader = glsl`
precision highp float;

in vec3 positionFlip;
in vec2 fboUV;

uniform sampler2D texturePosition;
uniform sampler2D texturePrevPosition;

uniform float flipRatio;
uniform mat4 u_prevModelViewMatrix; // personalizado
// NO declares: modelViewMatrix/projectionMatrix

out vec2 v_motion;

void main() {
  vec4 positionInfo     = texture(texturePosition, fboUV);
  vec4 prevPositionInfo = texture(texturePrevPosition, fboUV);

  vec3 flipOffset = (position + (positionFlip - position) * flipRatio)
                  * smoothstep(0.0, 0.2, positionInfo.w);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(positionInfo.xyz + flipOffset, 1.0);

  vec4 pos     = projectionMatrix * modelViewMatrix       * vec4(positionInfo.xyz, 1.0);
  vec4 prevPos = projectionMatrix * u_prevModelViewMatrix * vec4(prevPositionInfo.xyz, 1.0);

  v_motion = (pos.xy / pos.w - prevPos.xy / prevPos.w) * 0.5 * step(positionInfo.w, prevPositionInfo.w);
}
`;

export {
  particlesVertexShader,
  particlesFragmentShader,
  particlesDistanceVertexShader,
  particlesDistanceFragmentShader,
  particlesMotionVertexShader,
  trianglesVertexShader,
  trianglesDistanceShader,
  trianglesMotionShader,
};
