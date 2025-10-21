
// uniform sampler2D u_texture;
// uniform vec2 u_delta;

// varying vec2 v_uv;

// void main()
// {

//     vec3 color = texture2D( u_texture, v_uv ).rgb * 0.1633;

//     vec2 delta = u_delta;
//     color += texture2D( u_texture,  v_uv - delta ).rgb * 0.1531;
//     color += texture2D( u_texture,  v_uv + delta ).rgb * 0.1531;

//     delta += u_delta;
//     color += texture2D( u_texture,  v_uv - delta ).rgb * 0.12245;
//     color += texture2D( u_texture,  v_uv + delta ).rgb * 0.12245;

//     delta += u_delta;
//     color += texture2D( u_texture,  v_uv - delta ).rgb * 0.0918;
//     color += texture2D( u_texture,  v_uv + delta ).rgb * 0.0918;

//     delta += u_delta;
//     color += texture2D( u_texture,  v_uv - delta ).rgb * 0.051;
//     color += texture2D( u_texture,  v_uv + delta ).rgb * 0.051;

//     gl_FragColor = vec4(color, 1.0);

// }


// GLSL 3

precision mediump float;

uniform sampler2D u_texture;
uniform vec2 u_delta;

// 'varying' is replaced by 'in'
in vec2 v_uv;

// Define a custom output variable for the fragment color
out vec4 fragColor;

void main()
{
    // texture2D() is replaced by texture()
    vec3 color = texture( u_texture, v_uv ).rgb * 0.1633;

    vec2 delta = u_delta;
    color += texture( u_texture,  v_uv - delta ).rgb * 0.1531;
    color += texture( u_texture,  v_uv + delta ).rgb * 0.1531;

    delta += u_delta;
    color += texture( u_texture,  v_uv - delta ).rgb * 0.12245;
    color += texture( u_texture,  v_uv + delta ).rgb * 0.12245;

    delta += u_delta;
    color += texture( u_texture,  v_uv - delta ).rgb * 0.0918;
    color += texture( u_texture,  v_uv + delta ).rgb * 0.0918;

    delta += u_delta;
    color += texture( u_texture,  v_uv - delta ).rgb * 0.051;
    color += texture( u_texture,  v_uv + delta ).rgb * 0.051;

    // Assign the final color to the output variable instead of gl_FragColor
    fragColor = vec4(color, 1.0);
}
