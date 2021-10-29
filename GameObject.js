class GameObject {
    constructor(state) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.mm = mat4.create();
        this.uSelectColor = [0.0, ((state.ObjectPool.length / 100) + 0.1).toFixed(2), 0.0, 0.0];
        this.uFragColor = [255,0,0,255]
        this.attributes = {
            aPosition: {
                size: 3,
                offset: 0,
                bufferData: new Float32Array([
                    //----- triangle 1
                    -1,-1,0, //bottom 
                    1,-1,0, //bottom right 
                    1,1,0,  //top right

                    //----- triangle 2
                    -1,1,0, //top left
                    1,1,0, // top right
                    -1,-1,0, // bottom left
                ])
            },
            

        };
        this.indices = new Uint8Array([
            0, 1, 2, 0, 2, 3,
        ]);
    }
      
    setPosition(x,y){
        mat4.translate(this.mm, this.mm,[x,y,0]);
    }
    setColor(r,g,b){
        this.uFragColor = [r, g, b,1]
    }
};

export default GameObject