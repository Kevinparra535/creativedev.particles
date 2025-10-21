// varying vec2 v_rgbNW;
// varying vec2 v_rgbNE;
// varying vec2 v_rgbSW;
// varying vec2 v_rgbSE;
// varying vec2 v_rgbM;

// attribute vec3 position;
// attribute vec2 uv;

// uniform vec2 u_resolution;

// varying vec2 v_uv;

// #pragma glslify: texcoords = require(glsl-fxaa/texcoords.glsl)

// void main() {

//    vec2 fragCoord = uv * u_resolution;
//    texcoords(fragCoord, u_resolution, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);

//     v_uv = uv;
//     gl_Position = vec4( position, 1.0 );

// }


// GLSL 3


// 'varying' is replaced by 'out' in the vertex shader
out vec2 v_rgbNW;
out vec2 v_rgbNE;
out vec2 v_rgbSW;
out vec2 v_rgbSE;
out vec2 v_rgbM;

// 'attribute' is replaced by 'in'
in vec3 position;
in vec2 uv;

uniform vec2 u_resolution;

out vec2 v_uv; // Also changed from varying to out

#pragma glslify: texcoords = require(glsl-fxaa/texcoords.glsl)

void main() {
    vec2 fragCoord = uv * u_resolution;
    // Assuming 'texcoords' function is GLSL 3.x compatible
    texcoords(fragCoord, u_resolution, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);

    v_uv = uv;
    // gl_Position is still a valid built-in in GLSL 3.x
    gl_Position = vec4(position, 1.0);
}
