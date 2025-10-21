// uniform sampler2D texturePosition;

// // varying vec4 vWorldPosition;

// attribute vec3 positionFlip;
// attribute vec2 fboUV;

// uniform float flipRatio;

// void main() {

//     vec4 positionInfo = texture2D( texturePosition, fboUV );
//     vec3 pos = positionInfo.xyz;

//     vec4 worldPosition = modelMatrix * vec4( pos, 1.0 );
//     vec4 mvPosition = viewMatrix * worldPosition;

//     // vWorldPosition = worldPosition;

//     gl_Position = projectionMatrix * (mvPosition + vec4((position + (positionFlip - position) * flipRatio), 0.0));

// }


// GLSL 3

uniform sampler2D texturePosition;

// out vec4 vWorldPosition;

in vec3 positionFlip;
in vec2 fboUV;

uniform float flipRatio;

void main() {

    vec4 positionInfo = texture(texturePosition, fboUV);
    vec3 pos = positionInfo.xyz;

    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
    vec4 mvPosition = viewMatrix * worldPosition;

    // vWorldPosition = worldPosition;

    gl_Position = projectionMatrix * (mvPosition + vec4((position + (positionFlip - position) * flipRatio), 0.0));
}
