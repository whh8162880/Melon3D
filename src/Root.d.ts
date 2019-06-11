
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