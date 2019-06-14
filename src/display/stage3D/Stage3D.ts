import { singleton } from "../../core/ClassUtils.js";
import { isMobile } from "../../core/Engine.js";
import { Context3D } from "./Context3D.js";
import { Sprite } from "../Sprite.js";
import { Mouse } from "../../core/Mouse.js";


export var context3D: Context3D;
export var gl:WebGLRenderingContext;
export var ROOT : Stage3D;

export class Stage3D extends Sprite{
    canvas: HTMLCanvasElement;

    constructor(){
        super();
        ROOT = this;
    }

    names = [  "webgl", "experimental-webgl","webkit-3d", "moz-webgl"];
    requestContext3D(canvas: HTMLCanvasElement): boolean {
        this.canvas = canvas;
        let contextAttributes:any = {};
        if(isMobile){
            contextAttributes.antialias = false;
        }else{
            contextAttributes.antialias = true;
        }

        contextAttributes.stencil = false;
        contextAttributes.depth = true;

        let {names} = this;
        for (let i = 0; i < names.length; i++) {
            try {
                gl = this.canvas.getContext(names[i],contextAttributes) as WebGLRenderingContext;
            } catch (e) {

            }
            if (gl) {
                break;
            }
        }

        if (undefined == gl) {
            this.simpleDispatch(EventT.ERROR, "webgl is not available");
            return false;
        }
        context3D = singleton(Context3D);
        singleton(Mouse).init();
        // Capabilities.init();
        // mainKey.init();
        // KeyManagerV2.resetDefaultMainKey();

        this.simpleDispatch(EventT.CONTEXT3D_CREATE, gl);
        return true;
    }


    resize(width: number, height: number) {
        
    }
}