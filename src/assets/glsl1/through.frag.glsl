// uniform vec2 resolution;
// uniform sampler2D texture;

// void main() {
//     vec2 uv = gl_FragCoord.xy / resolution.xy;
//     gl_FragColor = texture2D( texture, uv );
// }


// GLSL 3
#version 300 es
out vec4 fragColor;
precision mediump float;
uniform vec2 resolution;
uniform sampler2D texture;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    fragColor = texture(texture, uv);
}
