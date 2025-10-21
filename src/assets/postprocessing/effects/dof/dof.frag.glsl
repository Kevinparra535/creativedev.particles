// uniform vec2 u_resolution;
// uniform sampler2D u_texture;
// uniform sampler2D u_distance;
// uniform vec2 u_mouse;
// uniform float u_dofDistance;
// uniform vec2 u_delta;
// uniform float u_amount;

// void main() {

//     vec2 resolutionInverted = 1.0 / u_resolution;
//     vec2 uv = gl_FragCoord.xy * resolutionInverted;

//     float centerZ = texture2D( u_distance, uv ).a;
//     // float mouseCenterZ = texture2D( u_distance, (u_mouse + 1.0) * 0.5 ).r;
//     // mouseCenterZ = mix(mouseCenterZ, uCameraDistance, step(-0.1, -mouseCenterZ));
//     // float bias = smoothstep(0.0, 300.0, distance(centerZ, mouseCenterZ));

//     float bias = smoothstep(0.0, 300.0, distance(centerZ, u_dofDistance));

//     vec2 d = u_delta * resolutionInverted * bias * u_amount;

//     vec4 sum = vec4(0.0);
//     vec4 center = texture2D( u_texture, uv );
//     d *= length(center.xyz);
//     sum += texture2D( u_texture, ( uv - d * 4. ) ) * 0.051;
//     sum += texture2D( u_texture, ( uv - d * 3. ) ) * 0.0918;
//     sum += texture2D( u_texture, ( uv - d * 2. ) ) * 0.12245;
//     sum += texture2D( u_texture, ( uv - d * 1. ) ) * 0.1531;
//     sum += center * 0.1633;
//     sum += texture2D( u_texture, ( uv + d * 1. ) ) * 0.1531;
//     sum += texture2D( u_texture, ( uv + d * 2. ) ) * 0.12245;
//     sum += texture2D( u_texture, ( uv + d * 3. ) ) * 0.0918;
//     sum += texture2D( u_texture, ( uv + d * 4. ) ) * 0.051;

//     gl_FragColor = sum;
// }

// GLSL 3

precision mediump float;

uniform vec2 u_resolution;
uniform sampler2D u_texture;
uniform sampler2D u_distance;
uniform vec2 u_mouse;
uniform float u_dofDistance;
uniform vec2 u_delta;
uniform float u_amount;

// Define a custom output variable for the fragment color
out vec4 fragColor;

void main() {

    vec2 resolutionInverted = 1.0 / u_resolution;
    // gl_FragCoord is still available in GLSL 3.x ES
    vec2 uv = gl_FragCoord.xy * resolutionInverted;

    // texture2D() is replaced by texture()
    float centerZ = texture( u_distance, uv ).a;
    // float mouseCenterZ = texture( u_distance, (u_mouse + 1.0) * 0.5 ).r;
    // mouseCenterZ = mix(mouseCenterZ, uCameraDistance, step(-0.1, -mouseCenterZ));
    // float bias = smoothstep(0.0, 300.0, distance(centerZ, mouseCenterZ));

    float bias = smoothstep(0.0, 300.0, distance(centerZ, u_dofDistance));

    vec2 d = u_delta * resolutionInverted * bias * u_amount;

    vec4 sum = vec4(0.0);
    vec4 center = texture( u_texture, uv ); // Use texture()
    d *= length(center.xyz);
    sum += texture( u_texture, ( uv - d * 4. ) ) * 0.051;
    sum += texture( u_texture, ( uv - d * 3. ) ) * 0.0918;
    sum += texture( u_texture, ( uv - d * 2. ) ) * 0.12245;
    sum += texture( u_texture, ( uv - d * 1. ) ) * 0.1531;
    sum += center * 0.1633;
    sum += texture( u_texture, ( uv + d * 1. ) ) * 0.1531;
    sum += texture( u_texture, ( uv + d * 2. ) ) * 0.12245;
    sum += texture( u_texture, ( uv + d * 3. ) ) * 0.0918;
    sum += texture( u_texture, ( uv + d * 4. ) ) * 0.051;

    // gl_FragColor is replaced by fragColor
    fragColor = sum;
}
