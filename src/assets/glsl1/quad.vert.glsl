// attribute vec3 position;

// void main() {
//     gl_Position = vec4( position, 1.0 );
// }

// GLSL 3

in vec3 position;

void main() {
    gl_Position = vec4(position, 1.0);
}
