// varying vec2 v_uv;

// void main() {
//     v_uv = uv;
//     gl_Position = vec4( position, 1.0 );
// }

// GLSL 3

precision mediump float;

// Implicit attributes 'position' and 'uv' become explicit 'in' variables
in vec3 position; 
in vec2 uv;

// 'varying' is replaced by 'out' in the vertex shader
out vec2 v_uv;

void main() {
    v_uv = uv;
    // gl_Position is still valid
    gl_Position = vec4( position, 1.0 );
}
