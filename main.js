import WebGlUtils from './WebGlUtils.js';
import { vxShader, ftShader } from './utils.js'
import GameObject from './GameObject.js';

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class App extends WebGlUtils{
  selectedObject;
  gravity=0.1;
  shapesPerSec = 1;
  constructor(){
      super('#glcanvas', vxShader, ftShader);
      this.initEvents();
  }
   getRelativeMousePosition(event, target) {
    target = target || event.target;
    var rect = target.getBoundingClientRect();
  
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }
  initEvents = ()=>{
    this.canvas.addEventListener('mousedown', e => {
      let removed = false;
      e.preventDefault();
      for (var i=0; i<this.ObjectPool.length; i++) this.ObjectPool[i].uSelectColor[0] = 1.0;
      this.__renderObjects();
      var x,y,rect = e.target.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = rect.bottom - e.clientY;
      
      var pixels = new Uint8Array(4);

      this.gl.readPixels(x, y, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);
      this.ObjectPool.forEach((obj,i)=>{
        if (obj.uSelectColor[1] === (pixels[0]/255).toFixed(2)) {
          this.removeObjectAt(i)  
          removed = true;
        }
      })
      this.ObjectPool.forEach((obj,i)=>{
        obj.uSelectColor[0] = 0.0;
      })
      this.__renderObjects();
      if(!removed){

        const mouseX = -(x / this.gl.canvas.width  *  2 - 1)*13;
        const mouseY = -(y / this.gl.canvas.height * -2 + 1)*13;

        let obj = new GameObject(this);
        obj.setPosition(mouseX,mouseY)
        obj.setColor(Math.random(),Math.random(),Math.random())
        this.spawnObject(obj);
      }
    })
  }

  #lastSec=-1; 
  update(time,dt){
    this.clearGl();   
    // second counter
    const sec = parseInt(time)
    if(this.#lastSec !== sec){
      this.#lastSec = sec;
      // spawn a number of new object per second
      for (let i = 0; i < this.shapesPerSec; i++) {
        // handle random shapes and colors
        let obj = new GameObject(this);
        obj.setPosition(getRandomInt(9,-9),12)
        obj.setColor(Math.random(),Math.random(),Math.random())
        this.spawnObject(obj);
      }      
    }
    for (let i = 0; i < this.ObjectPool.length; i++) {
      this.ObjectPool[i].setPosition(0,-this.gravity*dt*100)
      if(this.ObjectPool[i].mm[13]< -15) this.removeObjectAt(i)
    }

    document.getElementById("shapeCount").innerText = this.ObjectPool.length;
  }
}
const app = new App();

document.querySelector('#increaseGravity').addEventListener('click', ()=>handleGravity(0.01));
document.querySelector('#decreaseGravity').addEventListener('click', ()=>handleGravity(-0.01));
function handleGravity(e){
  if(app.gravity+e < 0) return; 
  app.gravity += e
}

document.querySelector('#increaseShapesPerSec').addEventListener('click', ()=>handleShapesPerSec(1));
document.querySelector('#decreaseShapesPerSec').addEventListener('click', ()=>handleShapesPerSec(-1));
function handleShapesPerSec(e){
  if(app.shapesPerSec+e < 0) return; 
  app.shapesPerSec += e
}