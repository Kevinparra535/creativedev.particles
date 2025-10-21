// varying vec2 v_rgbNW;
// varying vec2 v_rgbNE;
// varying vec2 v_rgbSW;
// varying vec2 v_rgbSE;
// varying vec2 v_rgbM;

// uniform vec2 u_resolution;
// uniform sampler2D u_texture;

// varying vec2 v_uv;

// #pragma glslify: fxaa = require(glsl-fxaa/fxaa.glsl)

// void main() {

//     vec2 fragCoord = v_uv * u_resolution;

//     gl_FragColor = fxaa(u_texture, fragCoord, u_resolution, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);

// }


// GLSL 3
#version 300 es
precision mediump float;

// 'varying' is replaced by 'in'
in vec2 v_rgbNW;
in vec2 v_rgbNE;
in vec2 v_rgbSW;
in vec2 v_rgbSE;
in vec2 v_rgbM;
in vec2 v_uv;

uniform vec2 u_resolution;
uniform sampler2D u_texture;

#pragma glslify: fxaa = require(glsl-fxaa/fxaa.glsl)

// Define a custom output variable for the fragment color
out vec4 fragColor;

void main() {

    // Use gl_FragCoord.xy if available, otherwise calculate from v_uv
    // vec2 fragCoord = gl_FragCoord.xy; 
    vec2 fragCoord = v_uv * u_resolution;

    // Use the new output variable instead of gl_FragColor
    // We assume the 'fxaa' function handles texture() calls internally
    fragColor = fxaa(u_texture, fragCoord, u_resolution, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);

}
