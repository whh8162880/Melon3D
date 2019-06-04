/// <reference path="./Extend.ts" />

module rf{

    export interface IOffsetResize{
        stageWidth:number;//实际舞台尺寸
        stageHeight:number;
        ox:number;//偏移值
        oy:number;
        sx:number;//缩放
        sy:number;
    }

    export var weixin:boolean = false;

    export var worker:Worker;

    export let gl:WebGLRenderingContext;

    export let pixelRatio:number = 1;

    //显示屏宽高
    export var sceneWidth:number = 0;
    export var sceneHeight:number = 0;

    //可显示区域宽高
    export var windowWidth:number = 0;
    export var windowHeight:number = 0;

    //context3d宽高
    export var innerWidth:number = 0;
    export var innerHeight:number = 0;

    export var lockStageArea:boolean

    //需求显示宽高 支持外部传参
    export var stageWidth:number = 0;
    export var stageHeight:number = 0;

    export var offsetResize:IOffsetResize;

    // export var scissorScaleX:number = 1;
    // export var scissorScaleY:number = 1;

    export var contextMatrix3D:IMatrix3D;
    export var contextMatrix2D:IMatrix3D;
    export var contextInvMatrix:IMatrix3D;

    // export let canvasleft:number = 0;
    // export let canvastop:number = 0;


    export var scissorRect:Size;

    export var TEMP_RECT:Size = {} as Size;

    export var isWindowResized:boolean = false;
    export var max_vc = 60;
    export let c_white:string = `rgb(255,255,255)`;
    
    export let pixelFont:number = 1;
    export let pixelScale:number = 1;
    export let isMobile:boolean;
    export let platform:string;

    export let softKeyboard:boolean = false;


    export var ROOT_PERFIX:string;

    export var RES_PERFIX:string;

    export var CONFIG_PERFIX:string;

    export var FILE_ROOT;

    


    export const enum DebugDefine{
        CANVAS = "canvas_Event"
    }

    
    export const enum ExtensionDefine{
        JPG = ".jpg",
        PNG = ".png",
        KM = ".km",
        DAT = ".dat",
        P3D = ".p3d",
        PARTICLE = ".pa",
        SKILL = ".sk",
        KF = ".kf",
        ANI = ".ha",
        PAK = ".hp"
    }

    export const enum Align{
        TOP_LEFT,
        TOP_CENTER,
        TOP_RIGHT,
        MIDDLE_LEFT,
        MIDDLE_CENTER,
        MIDDLE_RIGHT,
        BOTTOM_LEFT,
        BOTTOM_CENTER,
        BOTTOM_RIGHT,
    }
    
    export function isPowerOfTwo(n: number): boolean {
        return (n !== 0) && ((n & (n - 1)) === 0);
    }


    export const enum WebGLConst{
        ONE = 1,
        /**
         * Passed to `blendFunc` or `blendFuncSeparate` to multiply a component by the source's alpha.
         */
        SRC_ALPHA = 0x0302,
        /**
         * Passed to `blendFunc` or `blendFuncSeparate` to multiply a component by one minus the source's alpha.
         */
        ONE_MINUS_SRC_ALPHA = 0x0303,
        NONE = 0,

        FRONT = 0x404,

        /**
         * Passed to `cullFace` to specify that only back faces should be drawn.
         */
        BACK = 0x0405,
        /**
         * 
         */
        CLAMP_TO_EDGE = 0x812F,
        /**
         * 
         */
        NEAREST = 0x2600,

        LINEAR = 0x2601,

        /**
         * Passed to `depthFunction` or `stencilFunction` to specify depth or stencil tests will always pass. i.e. Pixels will be drawn in the order they are drawn.
         */
        ALWAYS = 0x0207,
        /**
         * Passed to `depthFunction` or `stencilFunction` to specify depth or stencil tests will pass if the new depth value is less than or equal to the stored value.
         */
        LEQUAL = 0x0203
    }





    export function wx_init(){
        let path =  wx.env.USER_DATA_PATH
        if(path){
            // wx.fileSystem = wx.getFileSystemManager();
            // FILE_ROOT = new wx.File(path)
        }
    }

}
