
// uniform float u_motionMultiplier;

// varying vec2 v_motion;

// void main() {

//         gl_FragColor = vec4( v_motion * u_motionMultiplier, gl_FragCoord.z, 1.0 );

// }


// GLSL 3
#version 300 es
precision mediump float;

uniform float u_motionMultiplier;

// 'varying' is replaced by 'in'
in vec2 v_motion;

// Define a custom output variable for the fragment color
out vec4 fragColor;

void main() {
    // gl_FragColor is replaced by fragColor
    // gl_FragCoord is still available in GLSL 3.x ES
    fragColor = vec4( v_motion * u_motionMultiplier, gl_FragCoord.z, 1.0 );
}
