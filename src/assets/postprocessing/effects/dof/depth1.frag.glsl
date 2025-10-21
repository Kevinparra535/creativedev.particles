
// uniform vec2 u_mouse;

// uniform sampler2D u_distance;

// void main() {

//     gl_FragColor = vec4(texture2D( u_distance, (u_mouse + 1.0) * 0.5).a, 0.0, 0.0, 1.0);

// }


// GLSL 3

precision mediump float;

uniform vec2 u_mouse;
uniform sampler2D u_distance;

// Define a custom output variable for the fragment color
out vec4 fragColor;

void main() {
    // texture2D() is replaced by texture()
    // gl_FragColor is replaced by fragColor
    fragColor = vec4(texture(u_distance, (u_mouse + 1.0) * 0.5).a, 0.0, 0.0, 1.0);
}
