import { Sprite } from "./display/Sprite.js";
import { Stage3D, context3D, ROOT } from "./display/stage3D/Stage3D.js";
import { singleton } from "./core/ClassUtils.js";

export class App extends Sprite implements ITickable,IResizeable{

    init(canvas:HTMLCanvasElement){
        wx.no_maincanvas = canvas;

        //创建webgl
        let stage3d = singleton(Stage3D);
        if(false == stage3d.requestContext3D(canvas)){
            console.log("GL create fail");
            return;
        }

        //初始化所有需求的属性
        
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
        context3D.configureBackBuffer(innerWidth,innerHeight,0);
        ROOT.resize(innerWidth,innerHeight);
    }

    update(now: number, interval: number){

    }
}