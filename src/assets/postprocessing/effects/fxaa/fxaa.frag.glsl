// uniform vec2 u_resolution;
// uniform sampler2D u_texture;

// #pragma glslify: fxaa = require(glsl-fxaa)

// void main() {
//     gl_FragColor = fxaa(u_texture, gl_FragCoord.xy, u_resolution);
// }


// GLSL 3
#version 300 es
precision mediump float;

uniform vec2 u_resolution;
uniform sampler2D u_texture;

// The pragma directive remains as this is handled by your build system (glslify)
#pragma glslify: fxaa = require(glsl-fxaa)

// Define a custom output variable for the fragment color
out vec4 fragColor;

void main() {
    // We assume the 'fxaa' function provided by glslify is compatible with GLSL 3.x
    // (meaning it uses 'texture()' internally instead of 'texture2D()').
    
    // gl_FragCoord is still valid in GLSL 3.x ES
    // gl_FragColor is replaced by fragColor
    fragColor = fxaa(u_texture, gl_FragCoord.xy, u_resolution);
}
