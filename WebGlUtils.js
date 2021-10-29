class WebGlUtils {
    canvas;
    gl;
    program;
    uMVPMatrix;
    vm;
    pm;
    mvp;
    uSelectColor;
    uFragColor;
    uNormalMatrix;
    ObjectPool = [];
    uScale;
    texture;

    constructor(canvasId,vertexShader,fragmentShader){
        this.canvas = document.querySelector(canvasId);
        this.gl = this.canvas.getContext('webgl');
   
        this.gl.viewportWidth = this.canvas.clientWidth;
        this.gl.viewportHeight = this.canvas.clientHeight;

        this.program = this.initShaderProgram(vertexShader, fragmentShader);
        this.uMVPMatrix = this.gl.getUniformLocation(this.program, 'uMVPMatrix');

        this.vm = mat4.create();
        this.pm = mat4.create(); 
        this.mvp = mat4.create();

        this.uSelectColor = this.gl.getUniformLocation(this.program, 'uSelectColor');
        this.uFragColor = this.gl.getUniformLocation(this.program, 'uFragColor');
        
        this.changeFov(45);
        mat4.translate(this.pm,this.pm,[0,0,-15]);

        requestAnimationFrame(this.__render);
    }
    #then;
    __render = (now)=>{
          
        now *= 0.001;
        // Subtract the previous time from the current time
        var deltaTime = now - this.#then;
        // Remember the current time for the next frame.
        this.#then = now;
        this.update(now,deltaTime);
        this.__renderObjects();


        requestAnimationFrame(this.__render);
    }
    __renderObjects(){
        
        for (const obj of this.ObjectPool){
            this.program.renderBuffers(obj);
            var n = obj.indices.length;

            mat4.copy(this.mvp, this.pm);
            mat4.multiply(this.mvp, this.mvp, this.vm);
            mat4.multiply(this.mvp, this.mvp, obj.mm);
            this.gl.uniformMatrix4fv(this.uMVPMatrix, false, this.mvp);

            this.gl.drawElements(this.gl.TRIANGLES, n, this.gl.UNSIGNED_BYTE, 0);
        }
    }
    initShaderProgram(vShader, fShader){
        const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vShader);
        const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fShader);
      
        const shaderProgram = this.gl.createProgram();
        this.gl.attachShader(shaderProgram, vertexShader);
        this.gl.attachShader(shaderProgram, fragmentShader);
        this.gl.linkProgram(shaderProgram);
      
        if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
          alert('Unable to initialize the shader program: ' + this.gl.getProgramInfoLog(shaderProgram));
          return null;
        }
      

        shaderProgram.renderBuffers = (obj) => {
            const indexBuffer = this.gl.createBuffer();
            const attributes = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_ATTRIBUTES);
            
            for (let i=0; i<attributes; i++) {
                var name = this.gl.getActiveAttrib(this.program, i).name;
    
                var objAttribute = obj.attributes[name];
                var buffer = this.gl.createBuffer();
        
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);

                this.gl.bufferData(this.gl.ARRAY_BUFFER, objAttribute.bufferData, this.gl.STATIC_DRAW);
        
                var attr = this.gl.getAttribLocation(shaderProgram, name);
        
                this.gl.enableVertexAttribArray(attr);
                this.gl.vertexAttribPointer(
                attr,
                objAttribute.size,
                this.gl.FLOAT,
                false,
                objAttribute.bufferData.BYTES_PER_ELEMENT*obj.stride,
                objAttribute.bufferData.BYTES_PER_ELEMENT*objAttribute.offset
                );
            }
            if (obj.indices) {
                this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
                this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, obj.indices, this.gl.STATIC_DRAW);
            }
            if(obj.uSelectColor) this.gl.uniform4fv(this.uSelectColor,obj.uSelectColor);
            if(obj.uFragColor) this.gl.uniform4fv(this.uFragColor,obj.uFragColor);
            
        }
    
      
        return shaderProgram;
    }
      
    loadShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
          alert('An error occurred compiling the shaders: ' + this.gl.getShaderInfoLog(shader));
          this.gl.deleteShader(shader);
          return null;
        }
        return shader;
    }

    clearGl(){
        this.gl.clearColor(0.9, 0.9, 0.9, 1.0);
        this.gl.clearDepth(1.0);    
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);   
        this.gl.useProgram(this.program); 
    }

    spawnObject(obj){
        this.ObjectPool.push(obj)
    }
    removeObject(obj){
        for (let i = 0; i < this.ObjectPool.length; i++) {
            if(this.ObjectPool[i].id === obj.id) this.ObjectPool.splice(i,1);
        }
        console.log(this.ObjectPool)
    }      
    removeObjectAt(index){
        this.ObjectPool.splice(index,1);
    }
    changeFov(e){

        const fieldOfView = e * Math.PI / 180;
        const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        mat4.perspective(this.pm,fieldOfView, aspect, 0.1, 100);
        mat4.lookAt(this.vm,
          vec3.fromValues(0,0,-10),
          vec3.fromValues(0,0,0),
          vec3.fromValues(0,1,0)
        );
    }
};

export default WebGlUtils;