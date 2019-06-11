import { DEGREES_TO_RADIANS, RADIANS_TO_DEGREES } from "../core/CONFIG.js";
import { tempAxeX, tempAxeY, tempAxeZ, Y_AXIS } from "../core/Geom.js";
import { newMatrix3D, newVector3D } from "../core/Matrix3D.js";
import { MiniDispatcher } from "../core/MiniDispatcher.js";

export class Transform extends MiniDispatcher {
    name: string;

    _x = 0;
    _y = 0;
    _z = 0;

    _rotationX = 0;
    _rotationY = 0;
    _rotationZ = 0;

    _scaleX = 1;
    _scaleY = 1;
    _scaleZ = 1;

    _visible = true;

    pos: IVector3D;
    // qua: IVector3D;
    rot: IVector3D;
    sca: IVector3D;

    localMatrix: IMatrix3D;
    sceneMatrix: IMatrix3D;

    status = 0;

    get status_debug(){
        // trasnform = 0b1,
        // alpha = trasnform << 1,
        // vertex = alpha << 1,

        // //底层transfrom改变 child transform = ct;
        // area = vertex << 1,

        // ct = area << 1,
        // //底层hitArea改变
        // ca = area << 1,

        let{status} = this;

        let str = "";

        if(status & DChange.CHILD_TRANSFROM){
            str += "childTransfrom"
        }

        if(status & DChange.CHILD_ALPHA){
            str += "_childAlpha"
        }

        if(status & DChange.CHILD_HITAREA){
            str += "_childHitArea"
        }

        if(status & DChange.HIT_AREA){
            str += "_hitarea"
        }

        if(status & DChange.vertex){
            str += "_vertex"
        }

        if(status & DChange.alpha){
            str += "_alpha"
        }

        if(status & DChange.trasnform){
            str += "_trasnform"
        }

        return str;
    }

    parent: Transform;
    stage: Transform;

    pivotZero = false;
    pivotPonumber: IVector3D;


    childrens: Transform[] = [];

    constructor() {
        super();
        this.pos = newVector3D();
        this.rot = newVector3D();
        this.sca = newVector3D(1, 1, 1);

        this.localMatrix = newMatrix3D();
        this.sceneMatrix = newMatrix3D();
    }


    setChange(value: number) {
        this.status |= value;
        let{parent} = this;
        if(!parent) return;

        let statues = parent.status;
        if(value & DChange.trasnform){
            statues |= DChange.CHILD_TRANSFROM;
        }

        if(value & DChange.vertex){
            statues |= DChange.vertex;
        }

        value = value &= DChange.CHILD_ALL;

        parent.setChange(statues | value);
    }


    get visible(): boolean { return this._visible; }
    set visible(value: boolean) {
        if (this._visible != value) {
            this._visible = value;
            this.setChange(DChange.vertex)
        }
    }

    get scaleX(): number { return this._scaleX; }
    set scaleX(value: number) {
        if (this._scaleX == value) return;
        this._scaleX = value;
        this.sca.x = value;
        this.setChange(DChange.trasnform);
    }
    get scaleY(): number { return this._scaleY; }
    set scaleY(value: number) { this._scaleY = value; this.sca.y = value; this.setChange(DChange.trasnform); }
    get scaleZ(): number { return this._scaleZ; }
    set scaleZ(value: number) { this._scaleZ = value; this.sca.z = value; this.setChange(DChange.trasnform); }
    get rotationX(): number { return this._rotationX * RADIANS_TO_DEGREES; }
    get rotationY(): number { return this._rotationY * RADIANS_TO_DEGREES; }
    get rotationZ(): number { return this._rotationZ * RADIANS_TO_DEGREES; }


    set rotationX(value: number) {
        value %= 360; value *= DEGREES_TO_RADIANS;
        if (value == this._rotationX) return;
        this._rotationX = value; this.rot.x = value; this.setChange(DChange.trasnform);
    }
    set rotationY(value: number) {
        value %= 360; value *= DEGREES_TO_RADIANS;
        if (value == this._rotationY) return;
        this._rotationY = value; this.rot.y = value; this.setChange(DChange.trasnform);
    }
    set rotationZ(value: number) {
        value %= 360; value *= DEGREES_TO_RADIANS;
        if (value == this._rotationZ) return;
        this._rotationZ = value; this.rot.z = value; this.setChange(DChange.trasnform);
    }


    get rotation(): number {
        return this._rotationZ * RADIANS_TO_DEGREES;
    }

    set rotation(value: number) {
        value %= 360; value *= DEGREES_TO_RADIANS;
        if (value == this._rotationZ) return;
        this._rotationZ = value; this.rot.z = value; this.setChange(DChange.trasnform);
    }


    get x(): number { return this._x; }
    get y(): number { return this._y; }
    get z(): number { return this._z; }

    set x(value: number) {
        if (value == this._x) return;
        this._x = value; this.pos.x = value;
        this.setChange(DChange.trasnform);
    }
    set y(value: number) {
        if (value == this._y) return;
        this._y = value; this.pos.y = value;
        this.setChange(DChange.trasnform);
    }
    set z(value: number) {
        if (value == this._z) return;
        this._z = value; this.pos.z = value;
        this.setChange(DChange.trasnform);
    }


    setPos(x: number, y: number, z: number = 0, update = true) {
        if (this._x == x && this._y == y && this._z == z) return;
        this.pos.x = this._x = x;
        this.pos.y = this._y = y;
        this.pos.z = this._z = z;
        if (update) {
            this.setChange(DChange.trasnform);
        }
    }

    setEulers(value: IVector3D, update = true) {
        this._rotationX = value.x * DEGREES_TO_RADIANS;
        this._rotationY = value.y * DEGREES_TO_RADIANS;
        this._rotationZ = value.z * DEGREES_TO_RADIANS;
        if (update) {
            this.setChange(DChange.trasnform);
        }
    }

    /**
     * 当前方向Z轴移动
     * @param distance
     * 
     */
    forwardPos(distance: number, target?: IVector3D): void {
        const { pos } = this;
        this.localMatrix.m3_copyColumnTo(2, tempAxeX);
        tempAxeX.v3_normalize();
        if (undefined != target) {
            pos.x = -tempAxeX.x * distance + target.x;
            pos.y = -tempAxeX.y * distance + target.y;
            pos.z = -tempAxeX.z * distance + target.z;
        } else {
            pos.x += tempAxeX.x * distance;
            pos.y += tempAxeX.y * distance;
            pos.z += tempAxeX.z * distance;
        }
        this._x = pos.x;
        this._y = pos.y;
        this._z = pos.z;
        this.setChange(DChange.trasnform);
    }


    /**
     * 当前方向Y轴移动
     * @param distance
     * 
     */
    upPos(distance: number): void {
        this.localMatrix.m3_copyColumnTo(1, tempAxeX);
        tempAxeX.v3_normalize();
        this.pos.x += tempAxeX.x * distance;
        this.pos.y += tempAxeX.y * distance;
        this.pos.z += tempAxeX.z * distance;
        this._x = this.pos.x;
        this._y = this.pos.y;
        this._z = this.pos.z;
        this.setChange(DChange.trasnform);
    }


    /**
     * 当前方向X轴移动
     * @param distance
     * 
     */
    rightPos(distance: number): void {
        this.localMatrix.m3_copyColumnTo(0, tempAxeX);
        tempAxeX.v3_normalize();
        this.pos.x += tempAxeX.x * distance;
        this.pos.y += tempAxeX.y * distance;
        this.pos.z += tempAxeX.z * distance;
        this._x = this.pos.x;
        this._y = this.pos.y;
        this._z = this.pos.z;
        this.setChange(DChange.trasnform);
    }

    /**
     * 
     * @param rx
     * @param ry
     * @param rz
     * 
     */
    setRot(rx: number, ry: number, rz: number, update: Boolean = true): void {
        this.rot.x = this._rotationX = rx * DEGREES_TO_RADIANS;
        this.rot.y = this._rotationY = ry * DEGREES_TO_RADIANS;
        this.rot.z = this._rotationZ = rz * DEGREES_TO_RADIANS;
        if (update) {
            this.setChange(DChange.trasnform);
        }
    }


    /**
     * 
     * @param rx
     * @param ry
     * @param rz
     * 
     */
    setRotRadians(rx: number, ry: number, rz: number, update: Boolean = true): void {
        this.rot.x = this._rotationX = rx;
        this.rot.y = this._rotationY = ry;
        this.rot.z = this._rotationZ = rz;
        if (update) {
            this.setChange(DChange.trasnform);
        }
    }

    set scale(value: number) {
        this.setSca(value, value, value);
    }

    get scale(): number {
        let { _scaleX, _scaleY, _scaleZ } = this;
        if (_scaleX == _scaleY && _scaleX == _scaleZ) {
            return _scaleX;
        }
        return Math.min(_scaleX, _scaleY, _scaleZ);
    }

    setSca(sx: number, sy: number, sz: number, update: Boolean = true): void {
        this.sca.x = this._scaleX = sx;
        this.sca.y = this._scaleY = sy;
        this.sca.z = this._scaleZ = sz;
        if (update) {
            this.setChange(DChange.trasnform);
        }
    }



    setPivotPonumber(x: number, y: number, z: number): void {
        let { pivotPonumber } = this;
        if (undefined == pivotPonumber) { this.pivotPonumber = newVector3D() };
        pivotPonumber.x = x;
        pivotPonumber.y = y;
        pivotPonumber.z = z;
        this.pivotZero = (x != 0 || y != 0 || z != 0);
    }


    setTransform(matrix: ArrayLike<number>): void {
        const { localMatrix, pos, rot, sca } = this;
        localMatrix.set(matrix);
        localMatrix.m3_decompose(pos, rot, sca, Orientation3D.EULER_ANGLES);
        this._x = pos.x;
        this._y = pos.y;
        this._z = pos.z;

        this._rotationX = rot.x;
        this._rotationY = rot.y;
        this._rotationZ = rot.z;

        this._scaleX = sca.x;
        this._scaleY = sca.y;
        this._scaleZ = sca.z;

        this.setChange(DChange.trasnform);
    }


    //================================================================================================================================
    get numChildren() {
        return this.childrens.length;
    }


    remove(): void {
        if (this.parent) {
            this.parent.removeChild(this);
        }
    }


    addChild(child: Transform) {
        if (undefined == child || child == this) return;
        let childrens = this.childrens;
        let i = childrens.indexOf(child);
        if (i == -1) {
            if (child.parent) child.remove();
            childrens.push(child);
            child.parent = this;
            // child.setChange(DChange.base | DChange.batch);
            if (this.stage) {
                if (!child.stage) {
                    child.stage = this.stage;
                    child.addToStage();
                }
            }
        } else {
            childrens.splice(i, 1);
            childrens.push(child);
        }

        this.__afterAddChild(child);
    }


    addChildAt(child: Transform, index: number) {
        if (undefined == child || child == this) return;
        if (child.parent) child.remove();

        if (index < 0) {
            index = 0;
        } else if (index > this.childrens.length) {
            index = this.childrens.length;
        }

        this.childrens.splice(index, 0, child);

        child.parent = this;
        let { stage } = this;

        if (stage) {
            if (!child.stage) {
                child.stage = stage;
                child.addToStage();
            }
        }

        this.__afterAddChild(child);

    }



    getChildIndex(child: Transform): number {
        return this.childrens.indexOf(child);
    }

    removeChild(child: Transform) {

        if (undefined == child) {
            return;
        }

        var i: number = this.childrens.indexOf(child);
        if (i == -1) {
            return;
        }
        this.childrens.splice(i, 1);
        child.stage = undefined;
        child.parent = undefined;
        
        child.removeFromStage();

        this.__afterRemoveChild(child);
    }


    removeAllChild() {
        const { childrens } = this;
        let len = childrens.length;
        for (let i = 0; i < len; i++) {
            let child = childrens[i];
            child.stage = undefined;
            child.parent = undefined;
            child.removeFromStage();
        }

        if (len > 0) {
            this.__afterRemoveChild();
        }

        this.childrens.length = 0;
    }

    protected __afterAddChild(child:Transform){
        child.setChange(DChange.vertex | child.status);
    }

    protected __afterRemoveChild(child?:Transform){
        this.setChange(DChange.vertex);
    }

    removeFromStage() {
        const { childrens } = this;
        let len = childrens.length;
        for (let i = 0; i < len; i++) {
            let child = childrens[i];
            child.stage = undefined
            child.removeFromStage();
        }
    }


    addToStage() {
        const { childrens, stage } = this;
        let len = childrens.length;
        for (let i = 0; i < len; i++) {
            let child = childrens[i];
            child.stage = stage;
            child.addToStage();
        }
    }

    //======================================================================================================================================================

    /**
     * 
     */
    updateTransform() {
        const { localMatrix, pivotZero } = this;
        if (pivotZero) {
            const { pivotPonumber } = this;
            let { 0: x, 1: y, 2: z } = pivotPonumber;
            localMatrix.m3_identity();
            localMatrix.m3_translation(-x, -y, -z);
            localMatrix.m3_scale(this._scaleX, this._scaleY, this._scaleZ);
            localMatrix.m3_translation(this._x + x, this._y + y, this._z + z);
        } else {
            localMatrix.m3_recompose(this.pos, this.rot, this.sca)
        }

        this.status &= ~DChange.trasnform;
    }

    /**
     * 
     * 
     */
    updateSceneTransform(updateStatus = 0, parentSceneTransform?: IMatrix3D) {
        let { status, parent ,childrens ,sceneMatrix} = this;
        if (status & DChange.trasnform) {
            this.updateTransform();
            updateStatus |= DChange.trasnform;
        }

        if (updateStatus & DChange.trasnform) {
            if (parentSceneTransform) {
                sceneMatrix.m3_append(parentSceneTransform, false, this.localMatrix);
            } else {
                if (parent) {
                    sceneMatrix.m3_append(parent.sceneMatrix, false, this.localMatrix);
                } else {
                    sceneMatrix.set(this.localMatrix);
                }
            }
        }


        if( status & DChange.CHILD_ALL ){

            for (let i = 0; i < childrens.length; i++) {
                childrens[i].updateSceneTransform( updateStatus , sceneMatrix );
            }
            
            status &= ~DChange.trasnform;
        }



        return updateStatus;
    }





    lookat(target: IVector3D, upAxis: IVector3D = null) {
        let xAxis = tempAxeX;
        let yAxis = tempAxeY;
        let zAxis = tempAxeZ;

        const { localMatrix, _scaleX, _scaleY, _scaleZ, _x, _y, _z, rot } = this;

        if (undefined == upAxis) {
            upAxis = Y_AXIS;
        }


        zAxis.x = target.x - _x;
        zAxis.y = target.y - _y;
        zAxis.z = target.z - _z;
        zAxis.v3_normalize();

        xAxis.x = upAxis.y * zAxis.z - upAxis.z * zAxis.y;
        xAxis.y = upAxis.z * zAxis.x - upAxis.x * zAxis.z;
        xAxis.z = upAxis.x * zAxis.y - upAxis.y * zAxis.x;
        xAxis.v3_normalize();

        if (xAxis.v3_length < .05) {
            xAxis.x = upAxis.y;
            xAxis.y = upAxis.x;
            xAxis.z = 0;
            xAxis.v3_normalize();
        }

        yAxis.x = zAxis.y * xAxis.z - zAxis.z * xAxis.y;
        yAxis.y = zAxis.z * xAxis.x - zAxis.x * xAxis.z;
        yAxis.z = zAxis.x * xAxis.y - zAxis.y * xAxis.x;

        let raw = localMatrix;

        raw[0] = _scaleX * xAxis.x;
        raw[1] = _scaleX * xAxis.y;
        raw[2] = _scaleX * xAxis.z;
        raw[3] = 0;

        raw[4] = _scaleY * yAxis.x;
        raw[5] = _scaleY * yAxis.y;
        raw[6] = _scaleY * yAxis.z;
        raw[7] = 0;

        raw[8] = _scaleZ * zAxis.x;
        raw[9] = _scaleZ * zAxis.y;
        raw[10] = _scaleZ * zAxis.z;
        raw[11] = 0;

        raw[12] = _x;
        raw[13] = _y;
        raw[14] = _z;
        raw[15] = 1;

        localMatrix.m3_decompose(undefined, rot, undefined);

        // let v = transform.decompose();
        // xAxis = v[1];


        this._rotationX = rot.x;
        this._rotationY = rot.y;
        this._rotationZ = rot.z;


        if (zAxis.z < 0) {
            this._rotationY = rot.y = (Math.PI - rot.y);
            this._rotationX = rot.x = rot.x - Math.PI;
            this._rotationZ = rot.z = rot.z - Math.PI;
        }

        // this._rotationZ = rot.z = 0;

        this.setChange(DChange.trasnform);
    }


}