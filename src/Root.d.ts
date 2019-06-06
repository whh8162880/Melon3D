
interface ILaunchData{
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


interface IPANEL_TWEEN_DATA{
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
