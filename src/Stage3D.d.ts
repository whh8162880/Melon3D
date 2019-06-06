
declare type PosKey = "x" | "y.js";
declare type SizeKey = "width" | "height";

/**
 * 包含 x,y两个点的结构
 * 
 * @export
 * @interface Point2D
 */
declare interface Point2D {
    x: number;
    y: number;
}
/**
 * 包含 x,y,z 三个点的结构
 * 
 * @export
 * @interface Point3D
 * @extends {Point2D}
 */
declare interface Point3D extends Point2D {
    z: number;
}
/**
 * 包含 x,y,z,w 四个点的结构
 * 
 * @export
 * @interface Point3DW
 * @extends {Point3D}
 */
declare interface Point3DW extends Point3D {
    w: number;
}

declare interface Size extends Point2D{
    w:number;
    h:number;
}

declare const enum WebGLConst{
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



declare const enum Align{
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


declare const enum ExtensionDefine{
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

declare const enum Orientation3D {
    EULER_ANGLES,// = "eulerAngles",
    AXIS_ANGLE,// = "axisAngle",
    QUATERNION,// = "quaternion",
}

declare interface IOffsetResize{
    stageWidth:number;//实际舞台尺寸
    stageHeight:number;
    ox:number;//偏移值
    oy:number;
    sx:number;//缩放
    sy:number;
}


declare interface IArrayBase {
    clone<T>(): T | Object;
    buffer:ArrayBuffer;
    set(array: ArrayLike<number> | IArrayBase, offset?: number): void;
    readonly length: number;
    [n: number]: number;
}

declare interface IVector3D extends IArrayBase {
    x: number;
    y: number;
    z: number;
    w: number;
    v3_lengthSquared: number;
    v2_length: number;
    v3_length: number;
    v3_add(v: IVector3D | ArrayLike<number>, out?:IVector3D): IVector3D;
    v3_sub(v: IVector3D | ArrayLike<number>, out?:IVector3D): IVector3D;
    v3_scale(v: number);
    v4_scale(v: number);
    v3_normalize(from?: ArrayLike<number>);
    v3_dotProduct(t: ArrayLike<number>);
    v3_crossProduct(t: ArrayLike<number>, out?: IVector3D | number[]);
    v3_applyMatrix4(e: ArrayLike<number>, out?: IVector3D | number[])
}

declare interface IMatrixComposeData{
    x:number;
    y:number;
    scaleX:number;
    scaleY:number;
    rotaiton:number;
}

declare interface IMatrix extends IArrayBase {
    m2_identity();
    m2_append(m2: ArrayLike<number> | IArrayBase, prepend?: boolean, from?: ArrayLike<number>):IMatrix;
    m2_scale(scalex:number,scaley:number);
    m2_rotate(angle:number);
    m2_transformVector(v: IVector3D | number[], result?: IVector3D | number[]);
    m2_decompose(result?:IMatrixComposeData):IMatrixComposeData;
    m2_recompose(value:IMatrixComposeData):IMatrix;
    m2_clone():IMatrix;
}

declare interface IMatrix3D extends IArrayBase {
    m3_identity(from?:ArrayLike<number>):IMatrix3D;
    m3_append(m3: ArrayLike<number> | IArrayBase, prepend?: boolean, from?: ArrayLike<number>):IMatrix3D;
    m3_rotation(degrees: number, axis: IVector3D | number[], prepend?: boolean, from?: ArrayLike<number>):IMatrix3D;
    m3_scale(x: number, y: number, z: number, prepend?: boolean, from?: ArrayLike<number>):IMatrix3D;
    m3_translation(x: number, y: number, z: number, prepend?: boolean, from?: ArrayLike<number>):IMatrix3D;
    m3_invert(from?: ArrayLike<number>,pos?:boolean):IMatrix3D;
    m3_decompose(pos: IVector3D | number[], rot: IVector3D | number[], sca: IVector3D | number[], orientationStyle?: Orientation3D):void;
    m3_recompose(pos: IVector3D | number[], rot: IVector3D | number[], sca: IVector3D | number[], orientationStyle?: Orientation3D):IMatrix3D;
    m3_copyColumnFrom(column: number, vector3D: IVector3D | number[]):void;
    m3_copyColumnTo(column: number, vector3D: IVector3D | number[]):void;
    m3_transformVector(v: IVector3D | number[], result?: IVector3D | number[]):void;
    m3_transformVectors(vin: ArrayLike<number>, vout: Float32Array | number[]):void;
    m3_transformRotation(v: IVector3D | number[], result?: IVector3D | number[]):void;
    m3_getMaxScaleOnAxis():number;
    m3_toString(scale:number):void;
}


declare interface Float32Array extends IMatrix3D,IVector3D,IMatrix{
    x:number;
    y:number;
    z:number;
    w:number;
    update(data32PerVertex: number, offset: number, v: number): void;
    wPoint1(position: number, x: number, y?: number, z?: number, w?: number): void
    wPoint2(position: number, x: number, y: number, z?: number, w?: number): void
    wPoint3(position: number, x: number, y: number, z: number, w?: number): void
    wPoint4(position: number, x: number, y: number, z: number, w: number): void
}

declare interface IShaderSetting{
    skey:string;
    useEye?:boolean;
    usePos?:boolean;
    useQua2mat?:boolean;
    useNormal?:boolean;
    useColor?:boolean;
    useShadow?:boolean;
    useInvm?:boolean;
}

declare interface IBounds{
    max : IVector3D;
    min : IVector3D;
    center : IVector3D;
}

declare interface IVariable{
    size:number;
    offset:number;
}


declare interface Buffer3D extends IRecyclable{
    preusetime:number
    gctime:number
    readly:boolean;
    awaken():void;
    sleep():void
}

declare interface IMeshData{
    vertex:Float32Array;
    variables:{ [key: string]: IVariable };
    numVertices:number;
    numTriangles:number;
    data32PerVertex:number;
    vertexBuffer:any;
    bounds:IBounds;

    nameLabelY?:number;
    index?:Uint16Array;
    indexBuffer?:any;
}

declare interface ITextureData{
    key:string;
    url:string;
    mipmap:boolean;
    mag:number;
    mix:number;
    repeat:number;
}





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