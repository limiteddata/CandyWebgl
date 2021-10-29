

// Vertex shader
const vxShader = `
    attribute vec4 aPosition;

    uniform mat4 uMVPMatrix;


    void main(void) {

        gl_Position =  uMVPMatrix * aPosition;

    }
`;
// Fragment shader 
const ftShader = `


    uniform highp vec4 uSelectColor;
    uniform highp vec4 uFragColor;

    void main(void) {

    if(uSelectColor[0] == 1.0) gl_FragColor = vec4(uSelectColor[1],uSelectColor[2],uSelectColor[3],255);
    else gl_FragColor = uFragColor ;
    }
`;

export { vxShader, ftShader}