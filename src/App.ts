import { Sprite } from "./display/Sprite.js";
import { Stage3D } from "./display/stage3D/Stage3D.js";
import { singleton } from "./core/ClassUtils.js";

export class App extends Sprite implements ITickable,IResizeable{

    init(canvas:HTMLCanvasElement){
        wx.no_maincanvas = canvas;

        let stage3d = singleton(Stage3D);
        if(false == stage3d.requestContext3D(canvas)){
            console.log("GL create fail");
            return;
        }
        
        // this.initCanvas(canvas);
        // this.initContainer(ROOT.camera2D,true);
        

        // Engine.addResize(this);
        // Engine.addTick(this);

        // let c = context3D;

        // pass_init_mesh();

        // ROOT.addEventListener(EngineEvent.FPS_CHANGE,this.gcChangeHandler,this);
        // this.nextGCTime = engineNow + this.gcDelay;

        
    }



    resize(width: number, height: number){

    }

    update(now: number, interval: number){

    }
}