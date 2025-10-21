// GLSL 1
// uniform sampler2D u_texture;
// uniform sampler2D u_blurTexture;

// uniform float u_amount;

// varying vec2 v_uv;

// void main()
// {

//     vec3 baseColor = texture2D(u_texture, v_uv).rgb;
//     vec3 blurColor = texture2D(u_blurTexture, v_uv).rgb;
//     vec3 color = mix(baseColor, 1.0 - ((1.0 - baseColor) * (1.0 - blurColor)), u_amount);
//     // vec3 color = mix(baseColor, max(baseColor, blurColor), u_amount);

//     gl_FragColor = vec4(color, 1.0);

// }

// GLSL 3
#version 300 es
precision mediump float;

uniform sampler2D u_texture;
uniform sampler2D u_blurTexture;

uniform float u_amount;

// 'varying' is replaced by 'in'
in vec2 v_uv; 

// Define a custom output variable for the fragment color
out vec4 fragColor; 

void main()
{
    // texture2D() is replaced by texture()
    vec3 baseColor = texture(u_texture, v_uv).rgb;
    vec3 blurColor = texture(u_blurTexture, v_uv).rgb;
    
    vec3 color = mix(baseColor, 1.0 - ((1.0 - baseColor) * (1.0 - blurColor)), u_amount);
    // vec3 color = mix(baseColor, max(baseColor, blurColor), u_amount);

    // Assign the final color to the output variable instead of gl_FragColor
    fragColor = vec4(color, 1.0);
}

