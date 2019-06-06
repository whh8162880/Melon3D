export let RADIANS_TO_DEGREES: number = 180 / Math.PI;
export let DEGREES_TO_RADIANS: number = Math.PI / 180;

export function isPowerOfTwo(n: number): boolean {
    return (n !== 0) && ((n & (n - 1)) === 0);
}

export function wx_init(){
    let path =  wx.env.USER_DATA_PATH
    if(path){
        // wx.fileSystem = wx.getFileSystemManager();
        // FILE_ROOT = new wx.File(path)
    }
}


export var weixin = false;
export function setWeixin(value:boolean){
    weixin = value;
}

export var TEMP_RECT:Size = {} as Size;


export var max_vc = 60;
export var c_white:string = `rgb(255,255,255)`;


export var softKeyboard:boolean = false;


export var ROOT_PERFIX:string;

export var RES_PERFIX:string;

export var CONFIG_PERFIX:string;

export var FILE_ROOT:any;




