// uniform sampler2D u_texture;

// varying vec2 v_uv;

// void main() {
//     gl_FragColor = texture2D( u_texture, v_uv );
// }


// GLSL 3
#version 300 es
out vec4 fragColor;
precision mediump float;
uniform sampler2D u_texture;

in vec2 v_uv;

void main() {
    fragColor = texture( u_texture, v_uv );
}
