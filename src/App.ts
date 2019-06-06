import { Sprite } from "./display/Sprite.js";
import { singleton } from "./core/ClassUtils.js";
import { Mouse } from "./core/Mouse.js";



export function log(str:string){

}

export class App extends Sprite implements ITickable,IResizeable{



    init(canvas:HTMLCanvasElement){

        wx.no_maincanvas = canvas;

        singleton(Mouse).init();

        // var b:boolean = ROOT.requestContext3D(canvas);
        // if(false == b){
        //     console.log("GL create fail");
        //     return;
        // }
        
        // this.initCanvas(canvas);
        // this.initContainer(ROOT.camera2D,true);
        
        // state_Setup()
        // mainKey.init()

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


