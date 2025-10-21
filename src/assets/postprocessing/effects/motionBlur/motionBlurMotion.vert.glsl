
// // chunk(morphtarget_pars_vertex);
// // chunk(skinning_pars_vertex);

// uniform mat4 u_prevModelViewMatrix;

// varying vec2 v_motion;

// void main() {

//     // chunk(skinbase_vertex);
//     // chunk(begin_vertex);

//     // chunk(morphtarget_vertex);
//     // chunk(skinning_vertex);

//     vec4 pos = projectionMatrix * modelViewMatrix * vec4( transformed, 1.0 );
//     vec4 prevPos = projectionMatrix * u_prevModelViewMatrix * vec4( transformed, 1.0 );
//     gl_Position = pos;
//     v_motion = (pos.xy / pos.w - prevPos.xy / prevPos.w) * 0.5;

// }

// GLSL 3
#version 300 es
precision mediump float; // Add default precision

// chunk(morphtarget_pars_vertex);
// chunk(skinning_pars_vertex);
// These chunks must define 'transformed' as an 'in' variable 
// if they expect it from an attribute, or compute it internally.

uniform mat4 u_prevModelViewMatrix;

// 'varying' is replaced by 'out' in the vertex shader
out vec2 v_motion;

void main() {

    // chunk(skinbase_vertex);
    // chunk(begin_vertex);

    // chunk(morphtarget_vertex);
    // chunk(skinning_vertex);

    // 'transformed' is likely defined within the chunks above or as an 'in' variable
    vec4 pos = projectionMatrix * modelViewMatrix * vec4( transformed, 1.0 );
    vec4 prevPos = projectionMatrix * u_prevModelViewMatrix * vec4( transformed, 1.0 );

    gl_Position = pos; // gl_Position is still valid

    // Assign to the 'out' variable
    v_motion = (pos.xy / pos.w - prevPos.xy / prevPos.w) * 0.5;

}
s