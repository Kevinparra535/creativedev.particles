
// uniform sampler2D u_texture;
// uniform sampler2D u_motionTexture;

// uniform vec2 u_resolution;
// uniform float u_maxDistance;
// uniform float u_motionMultiplier;
// uniform float u_leaning;

// varying vec2 v_uv;


// void main() {

//     vec2 motion = texture2D( u_motionTexture, v_uv ).xy;

//     vec2 offset = motion * u_resolution * u_motionMultiplier;
//     float offsetDistance = length(offset);
//     if(offsetDistance > u_maxDistance) {
//         offset = normalize(offset) * u_maxDistance;
//     }
//     vec2 delta = - offset / u_resolution * 2.0 / float(SAMPLE_COUNT);
//     vec2 pos = v_uv - delta * u_leaning * float(SAMPLE_COUNT);
//     vec3 color = vec3(0.0);

//     for(int i = 0; i < SAMPLE_COUNT; i++) {
//         color += texture2D( u_texture, pos ).rgb;
//         pos += delta;
//     }

//     gl_FragColor = vec4( color / float(SAMPLE_COUNT), 1.0 );

// }


// GLSL 3

precision mediump float;

uniform sampler2D u_texture;
uniform sampler2D u_motionTexture;

uniform vec2 u_resolution;
uniform float u_maxDistance;
uniform float u_motionMultiplier;
uniform float u_leaning;

// 'varying' is replaced by 'in'
in vec2 v_uv;

// Define a custom output variable for the fragment color
out vec4 fragColor;

void main() {

    // texture2D() is replaced by texture()
    vec2 motion = texture( u_motionTexture, v_uv ).xy;

    vec2 offset = motion * u_resolution * u_motionMultiplier;
    float offsetDistance = length(offset);
    if(offsetDistance > u_maxDistance) {
        offset = normalize(offset) * u_maxDistance;
    }

    // Note: GLSL 3.x ES requires loop counters to be integers
    // Assuming SAMPLE_COUNT is an integer constant/macro
    vec2 delta = - offset / u_resolution * 2.0 / float(SAMPLE_COUNT);
    vec2 pos = v_uv - delta * u_leaning * float(SAMPLE_COUNT);
    vec3 color = vec3(0.0);

    // Standard for loops are fine in GLSL 3.x ES
    for(int i = 0; i < SAMPLE_COUNT; i++) {
        color += texture( u_texture, pos ).rgb; // Use texture()
        pos += delta;
    }

    // gl_FragColor is replaced by fragColor
    fragColor = vec4( color / float(SAMPLE_COUNT), 1.0 );

}
