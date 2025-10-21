// uniform sampler2D u_texture;
// uniform vec2 u_resolution;
// uniform float u_aspect;

// uniform float u_reduction;
// uniform float u_boost;

// varying vec2 v_uv;

// void main() {

//   vec4 color = texture2D( u_texture, v_uv );

//   vec2 center = u_resolution * 0.5;
//   float vignette = length( v_uv - vec2(0.5) ) * u_aspect;
//   vignette = u_boost - vignette * u_reduction;

//   color.rgb *= vignette;
//   gl_FragColor = color;

// }


// GLSL 3
#version 300 es
precision mediump float;

uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_aspect;

uniform float u_reduction;
uniform float u_boost;

// 'varying' is replaced by 'in'
in vec2 v_uv;

// Define a custom output variable for the fragment color
out vec4 fragColor;

void main() {

  // texture2D() is replaced by texture()
  vec4 color = texture( u_texture, v_uv );

  vec2 center = u_resolution * 0.5;
  float vignette = length( v_uv - vec2(0.5) ) * u_aspect;
  vignette = u_boost - vignette * u_reduction;

  color.rgb *= vignette;
  // gl_FragColor is replaced by fragColor
  fragColor = color;

}
