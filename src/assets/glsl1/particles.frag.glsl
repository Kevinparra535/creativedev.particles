// // chunk(common);
// // chunk(fog_pars_fragment);
// // chunk(shadowmap_pars_fragment);

// varying float vLife;
// uniform vec3 color1;
// uniform vec3 color2;

// void main() {

//     vec3 outgoingLight = mix(color2, color1, smoothstep(0.0, 0.7, vLife));

//     // chunk(shadowmap_fragment);

//     outgoingLight *= shadowMask;//pow(shadowMask, vec3(0.75));

//     // chunk(fog_fragment);
//     // chunk(linear_to_gamma_fragment);

//     gl_FragColor = vec4( outgoingLight, 1.0 );

// }

// GLSL 3
out vec4 fragColor;
precision mediump float;
// chunk(common);
// chunk(fog_pars_fragment);
// chunk(shadowmap_pars_fragment);

// Varyings/uniforms
in float vLife;
uniform vec3 color1;
uniform vec3 color2;

// Three.js common + fog chunks
#include <common>
#include <fog_pars_fragment>

void main() {
    vec3 outgoingLight = mix(color2, color1, smoothstep(0.0, 0.7, vLife));

            // Note: shadow modulation removed for maximum compatibility with custom pipeline.
            // Shadow casting is still supported via customDistanceMaterial on the mesh/points.

        fragColor = vec4(outgoingLight, 1.0);

        #ifdef USE_FOG
            #include <fog_fragment>
        #endif
}
