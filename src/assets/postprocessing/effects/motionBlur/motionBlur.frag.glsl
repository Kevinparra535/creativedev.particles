// uniform sampler2D u_texture;
// uniform sampler2D u_linesTexture;
// uniform float u_lineAlphaMultiplier;

// varying vec2 v_uv;

// void main() {

//     vec3 base = texture2D( u_texture, v_uv.xy ).rgb;
//     vec4 lines = texture2D( u_linesTexture, v_uv.xy );

//     vec3 color = (base + lines.rgb * u_lineAlphaMultiplier) / (lines.a * u_lineAlphaMultiplier + 1.0);

//     gl_FragColor = vec4( color, 1.0 );

// }


// GLSL 3
#version 300 es
precision mediump float;

uniform sampler2D u_texture;
uniform sampler2D u_linesTexture;
uniform float u_lineAlphaMultiplier;

// 'varying' is replaced by 'in'
in vec2 v_uv;

// Define a custom output variable for the fragment color
out vec4 fragColor;

void main() {
    // texture2D() is replaced by texture()
    vec3 base = texture( u_texture, v_uv.xy ).rgb;
    vec4 lines = texture( u_linesTexture, v_uv.xy );

    vec3 color = (base + lines.rgb * u_lineAlphaMultiplier) / (lines.a * u_lineAlphaMultiplier + 1.0);

    // gl_FragColor is replaced by fragColor
    fragColor = vec4( color, 1.0 );
}
