import { newVector3D, newMatrix3D, newMatrix } from "./Matrix3D.js";
import { DEGREES_TO_RADIANS } from "./CONFIG.js";

export function size_checkIn(l:number,r:number,t:number,b:number,dx:number,dy:number,scale:number){
    return dx > l * scale && dx < r * scale && dy > t * scale && dy < b * scale;
}


export function size_intersection(a:Size,b:Size,c?:Size){
    c = c || {} as Size;
    let{x:ax,y:ay,w:aw,h:ah} = a;
    let{x:bx,y:by,w:bw,h:bh} = b;

    c.x = Math.max(ax,bx);
    c.y = Math.max(ay,by);
    c.w = Math.min(ax + aw,bx + bw) - c.x;
    c.h = Math.min(ay + ah,by + bh) - c.y;
    
    return c;
}

export let rgb_color_temp:IVector3D = new Float32Array([1,1,1,1]);


export function hexToCSS(d: number,a:number = 1): string {
    var r: number = ((d & 0x00ff0000) >>> 16) & 0xFF;
    var g: number = ((d & 0x0000ff00) >>> 8) & 0xFF;
    var b: number = d & 0x000000ff;
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'; //"rgba(0, 0, 200, 0.5)";
}


export function toRGB(color:number,out?:IVector3D){
    if(undefined == out){
        out = newVector3D();
    }
    out[0] = ((color & 0x00ff0000) >>> 16) / 0xFF;
    out[1] = ((color & 0x0000ff00) >>> 8) / 0xFF;
    out[2] = (color & 0x000000ff) / 0xFF;
    out[3] = 1.0;
    return out
}


export function toRGBA(color:number,out?:IVector3D){
    out = toRGB(color);
    out[3] = ((color & 0xff000000) >>> 24) / 0xFF;
    return out
}

export function toCSS(color:IVector3D):string{
    return `rgba(${color[0]*0xFF},${color[1]*0xFF},${color[2]*0xFF},${color[3]*0xFF})`;
}

/**
 * 有 `x` `y` 两个属性
 * 
 * @export
 * @interface Point
 */
export class Point {
    x: number;
    y: number;
    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    get length(): Number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }


}

/**
 * 矩形
 * 有`x`,`y`,`width`,`height` 4个属性
 * 
 * @export
 * @interface Rect
 * @extends {Point}
 * @extends {Size}
 */
export class Rect extends Point {
    w: number = 0;
    h: number = 0;
    constructor(x: number = 0, y: number = 0, w: number = 0, h: number = 0) {
        super(x, y);
        this.w = w;
        this.h = h;
    }


    clone(): Rect {
        return new Rect(this.x, this.y, this.w, this.h);
    }

}


export let tempAxeX: IVector3D = newVector3D();
export let tempAxeY: IVector3D = newVector3D();
export let tempAxeZ: IVector3D = newVector3D();

export let X_AXIS: IVector3D = newVector3D(1, 0, 0);
export let Y_AXIS: IVector3D = newVector3D(0, 1, 0);
export let Z_AXIS: IVector3D = newVector3D(0, 0, 1);



export let PI2: number = Math.PI * 2;

export let RAW_DATA_CONTAINER: Float32Array = new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1]);

export let TEMP_MATRIX3D: IMatrix3D = newMatrix3D();
export let TEMP_MATRIX2D: IMatrix = newMatrix();
// export let CALCULATION_MATRIX_2D:Matrix = new Matrix();
export let TEMP_VECTOR3D: IVector3D = newVector3D();

export let TEMP_MatrixComposeData:IMatrixComposeData = {x:0,y:0,scaleX:1,scaleY:1,rotaiton:0};



export interface IFunction{
    func:Function;
    thisobj:any;
}

export function newCallBackFunction(func:Function,thisobj:any){
    return {func:func,thisobj:thisobj} as IFunction;
}

export function callFunction(func:IFunction){
    func.func.call(func.thisobj);
}


/**
* 经纬度 定位信息
* 
* @export
* @interface Location
*/
export interface Location {
    /**维度*/
    latitude: number;
    /**精度*/
    longitude: number;
}

export interface LocationConstructor {
    /**
     * 根据两个经纬度获取距离(单位：米)
     * 
     * @param {Location} l1
     * @param {Location} l2 
     * @returns 距离(单位：米)
     */
    getDist(l1: Location, l2: Location): number
}

export var Location: LocationConstructor = {
    /**
     * 根据两个经纬度获取距离(单位：米)
     * 
     * @param {Location} l1
     * @param {Location} l2 
     * @returns 距离(单位：米)
     */
    getDist(l1: Location, l2: Location) {
        const dtr = DEGREES_TO_RADIANS;
        let radlat1 = l1.latitude * dtr;
        let radlat2 = l2.latitude * dtr;
        let a = radlat1 - radlat2;
        let b = (l1.longitude - l2.longitude) * dtr;
        return Math.asin(Math.sqrt(Math.sin(a * .5) ** 2 + Math.cos(radlat1) * Math.cos(radlat2) * (Math.sin(b * .5) ** 2))) * 12756274;
    }
}

export let EMPTY_POINT2D = new Point();
export let EMPTY_POINT2D_2 = new Point();
export let EMPTY_POINT2D_3 = new Point();

// export function m2dTransform(matrix:ArrayLike<number>,p:Point2D,out:Point2D){
//     const{
//         m11,m12,m13,
//         m21,m22,m23,
//         m31,m32,m33
//     } = matrix as any;
//     const{
//         x,y
//     } = p;
//     let dx = x * m11 + y * m21 + m31;
//     let dy = x * m12 + y * m22 + m32;
//     out.x = dx;
//     out.y = dy;
// }

export function m2dTransform(matrix:ArrayLike<number>,p:number[],out:number[]){
    const[
        m11,m12,m13,
        m21,m22,m23,
        m31,m32,m33 
        ] = matrix as any;
        
    let x = p[0] - m31;
    let y = p[1] - m32;
    let dx = x * m11 + y * m21;
    let dy = x * m12 + y * m22;
    out[0] = dx + m31;
    out[1] = dy + m32;
}