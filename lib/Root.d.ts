
declare interface ILaunchData{
    ticket:string;
    time:number;
    md5:string;
    ip:string;
    pid:string;
    sid:number;
    platform:string;
    params:object;
    demo:number;
    domain:string;
    resroot:string;
    configroot:string;
    canvas:HTMLCanvasElement;
    bg:string;
}


declare interface IPANEL_TWEEN_DATA{
    type:string;
    time:number;
    duration?:number;
    lifetime?:number;

    offsetDegree?:number | number[];
    ease?:string;

    from?:number | number[];
    to?:number | number[];

    len?:number | number[];
    degree?:number | number[];

    so?:{[key:string]:number};
    eo?:{[key:string]:number};

    ef?:string;
    p?:any;
    t?:any;
    sp?:number;

    rt?:boolean
}



/**
 * 加载优先级枚举
 */
declare const enum LoadPriority {
    low,
    middle,
    high,
    max,
}

declare const enum LoadStates {
    WAIT,
    LOADING,
    COMPLETE,
    FAILED
}

/**
 * 资源类型
 */
declare const enum ResType {
    /**
     * 二进制
     */
    bin,

    amf,

    amf_inflate,
    /**
     * 文本
     */
    text,
    /**
     * 音乐
     */
    sound,
    /**
     * 图片
     */
    image
}

declare module Zlib{
    class Inflate{
        constructor(byte:Uint8Array);
        decompress():Uint8Array;
    } 
}

declare function parseInt(s: number, radix?: number): number;




declare interface IRecyclable {
    /**
     * 回收时触发
     */
    onRecycle?: { () };
    /**
     * 启用时触发
     */
    onSpawn?: { () };

    /**
     * 回收对象的唯一自增标识  
     * 从回收池取出后，会变化  
     * 此属性只有在`DEBUG`时有效
     */
    _insid?: number;
}




declare const enum EventT {
    ENTER_FRAME = 1,
    RESIZE,
    FAILED,
    COMPLETE,
    PLAY_COMPLETE,
    MOVE_COMPLETE,
    CAST_COMPLETE,
    NAVIGATION_LOC_COMPLETE,
    CONTEXT3D_CREATE,
    CHANGE,
    CANCEL,
    SCROLL,
    OPEN,
    CLOSE,
    SELECT,
    DISPOSE,
    DATA,
    ERROR,
    PROGRESS,
    IO_ERROR,
    MESSAGE,
    RECYCLE,
    ADD_TO_STAGE,
    REMOVE_FROM_STAGE,
    COMPLETE_LOADED,
    MVC_PANEL_OPEN,
    MVC_PANEL_HIDE,
    PANEL_LOAD_START,
    PANEL_LOAD_END,
    FOCUS_IN
}


declare const enum MouseEventX {
    MouseDown = 50,
    MouseMiddleDown,
    MouseRightDown,
    MouseUp,
    MouseMiddleUp,
    MouseRightUp,
    CLICK,
    RightClick,
    middleClick,
    MouseWheel,
    MouseMove,
    ROLL_UP,
    ROLL_DOWN,
    ROLL_LEFT,
    ROLL_RIGHT
}

declare interface IMouseEventData {
    id: number;
    mouseDownX: number;
    mouseDownY: number;
    x: number;
    y: number;
    ox: number;
    oy: number;
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
    wheel: number;
    time:number;
    target:any;
    identifier:number;
}