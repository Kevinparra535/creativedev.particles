// varying vec2 v_uv;

// void main() {
//     v_uv = uv;
//     gl_Position = vec4( position, 1.0 );
// }


// GLSL 3
#version 300 es
out vec2 v_uv;

void main() {
    v_uv = uv;
    gl_Position = vec4( position, 1.0 );
}
