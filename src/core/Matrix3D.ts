//Matrix3D算法相关
const rf_v3_identity = [0, 0, 0, 1];
const rf_m3_identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const rf_m2_identity = [1, 0, 0, 0, 1, 0, 0, 0, 1];
const rf_m3_temp = new Float32Array(16);

interface IArrayBase {
    clone(): IArrayBase;
    buffer:ArrayBuffer;
    set(array: ArrayLike<number> | IArrayBase, offset?: number): void;
    readonly length: number;
    [n: number]: number;
}


interface IMatrix3D extends IArrayBase {
    m3_identity(from?:ArrayLike<number>):IMatrix3D;
    m3_append(m3: ArrayLike<number> | IArrayBase, prepend?: boolean, from?: ArrayLike<number>):IMatrix3D;
    m3_rotation(degrees: number, axis: IVector3D | number[], prepend?: boolean, from?: ArrayLike<number>):IMatrix3D;
    m3_scale(x: number, y: number, z: number, prepend?: boolean, from?: ArrayLike<number>):IMatrix3D;
    m3_translation(x: number, y: number, z: number, prepend?: boolean, from?: ArrayLike<number>):IMatrix3D;
    m3_invert(from?: ArrayLike<number>,pos?:boolean):IMatrix3D;
    m3_decompose(pos: IVector3D | number[], rot: IVector3D | number[], sca: IVector3D | number[], orientationStyle?: rf.Orientation3D):void;
    m3_recompose(pos: IVector3D | number[], rot: IVector3D | number[], sca: IVector3D | number[], orientationStyle?: rf.Orientation3D):IMatrix3D;
    m3_copyColumnFrom(column: number, vector3D: IVector3D | number[]):void;
    m3_copyColumnTo(column: number, vector3D: IVector3D | number[]):void;
    m3_transformVector(v: IVector3D | number[], result?: IVector3D | number[]):void;
    m3_transformVectors(vin: ArrayLike<number>, vout: Float32Array | number[]):void;
    m3_transformRotation(v: IVector3D | number[], result?: IVector3D | number[]):void;
    m3_getMaxScaleOnAxis():void;
    m3_toString(scale:number):void;
}

/*********************************************************
 * Matrix3D
********************************************************/
Object.defineProperties(Float32Array.prototype, {
    m3_identity: {
        value: function (from?:ArrayLike<number>) {
            if(!from){
                from = rf_m3_identity;
            }
            this.set(from);
            return this;
        }
    },

    m3_toString:{
        value: function(scale:number){
            let str = "";
            for(let i=0;i<16;i++){
                let d = this[i]
                d = ((i+1) % 4) == 0 ? d : d / scale;
                str += d+","
            }
            return str.slice(0,str.length-1);
        }
    },

    m3_append: {
        value: function (m3: ArrayLike<number>, prepend?: boolean, from?: ArrayLike<number>) {
            let a: ArrayLike<number>;
            let b: ArrayLike<number>;
            if (!prepend) {
                a = from ? from : this;
                b = m3
            } else {
                a = m3;
                b = from ? from : this;
            }
            const [
                a11, a12, a13, a14,
                a21, a22, a23, a24,
                a31, a32, a33, a34,
                a41, a42, a43, a44
            ] = a as any;//目前typescript还没支持  TypedArray destructure，不过目前已经标准化，后面 typescript 应该会支持

            const [
                b11, b12, b13, b14,
                b21, b22, b23, b24,
                b31, b32, b33, b34,
                b41, b42, b43, b44
            ] = b as any;

            this[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
            this[1] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
            this[2] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
            this[3] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

            this[4] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
            this[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
            this[6] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
            this[7] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

            this[8] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
            this[9] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
            this[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
            this[11] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

            this[12] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
            this[13] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
            this[14] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
            this[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

            return this;
        }
    },

    m3_rotation: {
        value: function (angle: number, axis: Float32Array | number[], prepend?: boolean, from?: ArrayLike<number>) {
            let c = Math.cos(angle);
            let s = Math.sin(angle);
            let t = 1 - c;
            const { 0: x, 1: y, 2: z } = axis;
            let tx = t * x, ty = t * y;
            let b = rf_m3_temp;
            b.set([
                tx * x + c,     tx * y + s * z ,    tx * z - s * y,     0,
                tx * y - s * z, ty * y + c,         ty * z + s * x,     0,
                tx * z + s * y, ty * z - s * x,     t * z * z + c,      0,
                0, 0, 0, 1
            ]);
            return this.m3_append(b, prepend, from);
        }
    },


    m3_scale: {
        value: function (x: number, y: number, z: number, prepend?: boolean, from?: ArrayLike<number>) {
            if (from) this.set(from);
            if (prepend) {
                this[0] *= x; this[4] *= y; this[8] *= z;
                this[1] *= x; this[5] *= y; this[9] *= z;
                this[2] *= x; this[6] *= y; this[10] *= z;
                this[3] *= x; this[7] *= y; this[11] *= z;
            } else {
                this[0] *= x; this[1] *= y; this[2] *= z;
                this[4] *= x; this[5] *= y; this[6] *= z;
                this[8] *= x; this[9] *= y; this[10] *= z;
                this[12] *= x; this[13] *= y; this[14] *= z;
            }
            return this;
        }
    },

    m3_translation: {
        value: function (x: number, y: number, z: number, prepend?: boolean, from?: ArrayLike<number>) {
            if (prepend) {
                let b = rf_m3_temp;
                b.set(rf_m3_identity);
                b[12] = x;
                b[13] = y;
                b[14] = z;
                this.m3_append(b, undefined, from);
            } else {
                from = from ? from : this;
                this[12] = from[12] + x;
                this[13] = from[13] + y;
                this[14] = from[14] + z;
            }
            return this;
        }
    },

    m3_invert: {
        value: function (from?: ArrayLike<number>,pos:boolean = true) {
            from = from ? from : this;
            var a = from[0], b = from[1], c = from[2], d = from[3],
                e = from[4], f = from[5], g = from[6], h = from[7],
                i = from[8], j = from[9], k = from[10], l = from[11],
                m = from[12], n = from[13], o = from[14], p = from[15],
                q = a * f - b * e, r = a * g - c * e,
                s = a * h - d * e, t = b * g - c * f,
                u = b * h - d * f, v = c * h - d * g,
                w = i * n - j * m, x = i * o - k * m,
                y = i * p - l * m, z = j * o - k * n,
                A = j * p - l * n, B = k * p - l * o,
                ivd = 1 / (q * B - r * A + s * z + t * y - u * x + v * w);
            this[0] = (f * B - g * A + h * z) * ivd;
            this[1] = (-b * B + c * A - d * z) * ivd;
            this[2] = (n * v - o * u + p * t) * ivd;
            this[3] = (-j * v + k * u - l * t) * ivd;
            this[4] = (-e * B + g * y - h * x) * ivd;
            this[5] = (a * B - c * y + d * x) * ivd;
            this[6] = (-m * v + o * s - p * r) * ivd;
            this[7] = (i * v - k * s + l * r) * ivd;
            this[8] = (e * A - f * y + h * w) * ivd;
            this[9] = (-a * A + b * y - d * w) * ivd;
            this[10] = (m * u - n * s + p * q) * ivd;
            this[11] = (-i * u + j * s - l * q) * ivd;
            if(pos){
                this[12] = (-e * z + f * x - g * w) * ivd;
                this[13] = (a * z - b * x + c * w) * ivd;
                this[14] = (-m * t + n * r - o * q) * ivd;
            }else{
                this[12] = 0;
                this[13] = 0;
                this[14] = 0;
            }
            this[15] = (i * t - j * r + k * q) * ivd;
            return this;
        }
    },

    /**
     * @param orientationStyle
        EULER_ANGLES = 0
        AXIS_ANGLE = 1
        QUATERNION = 2
     */
    m3_decompose: {
        value: function (pos: Float32Array | number[], rot: Float32Array | number[], sca: Float32Array | number[], orientationStyle?: rf.Orientation3D) {
            if (undefined == orientationStyle) {
                orientationStyle = rf.Orientation3D.EULER_ANGLES;
            }

            let [
                m0, m1, m2, m3,
                m4, m5, m6, m7,
                m8, m9, m10, m11,
                m12, m13, m14, m15
            ] = this as any;

            if (undefined != pos) {
                pos[0] = m12;
                pos[1] = m13;
                pos[2] = m14;
            }

            const { sqrt, atan2 } = Math;

            const sx = sqrt(m0 * m0 + m1 * m1 + m2 * m2);
            const sy = sqrt(m4 * m4 + m5 * m5 + m6 * m6);
            let sz = sqrt(m8 * m8 + m9 * m9 + m10 * m10);
            //determine 3*3
            if (m0 * (m5 * m10 - m6 * m9) - m1 * (m4 * m10 - m6 * m8) + m2 * (m4 * m9 - m5 * m8) < 0) {
                sz = -sz;
            }

            if (undefined != sca) {
                sca[0] = sx;
                sca[1] = sy;
                sca[2] = sz;
            }


            if(undefined != rot){
                m0 /= sx; m1 /= sx; m2 /= sx;
                m4 /= sy; m5 /= sy; m6 /= sy;
                m8 /= sz; m9 /= sz; m10 /= sz;
    
    
                switch (orientationStyle) {
                    case rf.Orientation3D.EULER_ANGLES: //EULER_ANGLES
                        rot[1] = Math.asin(-m2);
                        if (m2 != 1 && m2 != -1) {
                            rot[0] = atan2(m6, m10);
                            rot[2] = atan2(m1, m0);
                        } else {
                            rot[2] = 0;
                            rot[0] = atan2(-m4, m5);
                        }
                        break;
                    case rf.Orientation3D.QUATERNION: //QUATERNION
                        const tr = m0 + m5 + m10;
                        if (tr > 0) {
                            let rw = sqrt(1 + tr) / 2;
                            rot[3] = rw;
                            rw *= 4;
                            rot[0] = (m6 - m9) / rw;
                            rot[1] = (m8 - m2) / rw;
                            rot[2] = (m1 - m4) / rw;
                        } else if ((m0 > m5) && (m0 > m10)) {
                            let rx = sqrt(1 + m0 - m5 - m10) / 2;
                            rot[0] = rx;
                            rx *= 4;
                            rot[3] = (m6 - m9) / rx;
                            rot[1] = (m1 + m4) / rx;
                            rot[2] = (m8 + m2) / rx;
                        } else if (m5 > m10) {
                            rot[1] = sqrt(1 + m5 - m0 - m10) / 2;
                            rot[0] = (m1 + m4) / (4 * rot[1]);
                            rot[3] = (m8 - m2) / (4 * rot[1]);
                            rot[2] = (m6 + m9) / (4 * rot[1]);
                        } else {
                            rot[2] = sqrt(1 + m10 - m0 - m5) / 2;
                            rot[0] = (m8 + m2) / (4 * rot[2]);
                            rot[1] = (m6 + m9) / (4 * rot[2]);
                            rot[3] = (m1 - m4) / (4 * rot[2]);
                        }
                        break;
                    case rf.Orientation3D.AXIS_ANGLE://AXIS_ANGLE
                        rot[3] = Math.acos((m0 + m5 + m10 - 1) / 2);
                        var len: number = Math.sqrt((m6 - m9) * (m6 - m9) + (m8 - m2) * (m8 - m2) + (m1 - m4) * (m1 - m4));
                        if(len == 0){
                            rot[0] = 0;
                            rot[1] = 0;
                            rot[2] = 0;
                        }else{
                            rot[0] = (m6 - m9) / len;
                            rot[1] = (m8 - m2) / len;
                            rot[2] = (m1 - m4) / len;
                        }
                        
                        break;
                }
            }

           
        }
    },

    m3_recompose: {
        value: function (pos: Float32Array | number[], rot: Float32Array | number[], sca: Float32Array | number[], orientationStyle?: rf.Orientation3D) {
            if (undefined == orientationStyle) {
                orientationStyle = rf.Orientation3D.EULER_ANGLES;
            }

            const { 0: scale_0_1_2, 1: scale_4_5_6, 2: scale_8_9_10 } = sca;
            if (scale_0_1_2 == 0 || scale_4_5_6 == 0 || scale_8_9_10 == 0) return;

            const { 0: c0x, 1: c0y, 2: c0z } = pos;
            const { 0: c1x, 1: c1y, 2: c1z, 3: c1w } = rot;

            const { cos, sin } = Math;

            switch (orientationStyle) {
                case rf.Orientation3D.EULER_ANGLES://Orientation3D.EULER_ANGLES:
                    {
                        var cx = cos(c1x);
                        var cy = cos(c1y);
                        var cz = cos(c1z);
                        var sx = sin(c1x);
                        var sy = sin(c1y);
                        var sz = sin(c1z);
                        this[0] = cy * cz * scale_0_1_2;
                        this[1] = cy * sz * scale_0_1_2;
                        this[2] = -sy * scale_0_1_2;
                        this[3] = 0;
                        this[4] = (sx * sy * cz - cx * sz) * scale_4_5_6;
                        this[5] = (sx * sy * sz + cx * cz) * scale_4_5_6;
                        this[6] = sx * cy * scale_4_5_6;
                        this[7] = 0;
                        this[8] = (cx * sy * cz + sx * sz) * scale_8_9_10;
                        this[9] = (cx * sy * sz - sx * cz) * scale_8_9_10;
                        this[10] = cx * cy * scale_8_9_10;
                        this[11] = 0;
                        this[12] = c0x;
                        this[13] = c0y;
                        this[14] = c0z;
                        this[15] = 1;
                    }
                    break;
                default:
                    {
                        var x = c1x;
                        var y = c1y;
                        var z = c1z;
                        var w = c1w;
                        if (orientationStyle == rf.Orientation3D.AXIS_ANGLE/*Orientation3D.AXIS_ANGLE*/) {
                            const w_2 = w / 2;
                            const sinW_2 = sin(w_2);
                            x *= sinW_2;
                            y *= sinW_2;
                            z *= sinW_2;
                            w = cos(w_2);
                        };
                        this[0] = (1 - 2 * y * y - 2 * z * z) * scale_0_1_2;
                        this[1] = (2 * x * y + 2 * w * z) * scale_0_1_2;
                        this[2] = (2 * x * z - 2 * w * y) * scale_0_1_2;
                        this[3] = 0;
                        this[4] = (2 * x * y - 2 * w * z) * scale_4_5_6;
                        this[5] = (1 - 2 * x * x - 2 * z * z) * scale_4_5_6;
                        this[6] = (2 * y * z + 2 * w * x) * scale_4_5_6;
                        this[7] = 0;
                        this[8] = (2 * x * z + 2 * w * y) * scale_8_9_10;
                        this[9] = (2 * y * z - 2 * w * x) * scale_8_9_10;
                        this[10] = (1 - 2 * x * x - 2 * y * y) * scale_8_9_10;
                        this[11] = 0;
                        this[12] = c0x;
                        this[13] = c0y;
                        this[14] = c0z;
                        this[15] = 1;
                    }
                    break;
            }
            return this;
        }
    },

    m3_copyColumnFrom: {
        value: function (column: number, vector3D: ArrayLike<number>) {
            column *= 4
            this[column] = vector3D[0];
            this[column + 1] = vector3D[1];
            this[column + 2] = vector3D[2];
            this[column + 3] = vector3D[3];
        }
    },

    m3_copyColumnTo: {
        value: function (column: number, vector3D: Float32Array | number[]) {
            column *= 4
            vector3D[0] = this[column];
            vector3D[1] = this[column + 1];
            vector3D[2] = this[column + 2];
            vector3D[3] = this[column + 3];
        }
    },

    m3_transformVector: {
        value: function (v: Float32Array | number[], result?: IVector3D | number[]) {
            let { 0: x, 1: y, 2: z , 3 : w } = v;
            // w = 1;
            if (undefined == result) {
                result = new Float32Array(rf_v3_identity);
            }
            result[0] = x * this[0] + y * this[4] + z * this[8] + w * this[12];
            result[1] = x * this[1] + y * this[5] + z * this[9] + w * this[13];
            result[2] = x * this[2] + y * this[6] + z * this[10] + w *this[14];
            result[3] = x * this[3] + y * this[7] + z * this[11] + w *this[15];

            return result;
        }
    },

    m3_transformVectors: {
        value: function (vin: ArrayLike<number>, vout: Float32Array | number[]) {
            let i = 0;
            let v = [0, 0, 0];
            let v2 = [0, 0, 0];
            while (i + 3 <= vin.length) {
                v[0] = vin[i];
                v[1] = vin[i + 1];
                v[2] = vin[i + 2];
                this.transformVector(v, v2);  //todo: simplify operation
                vout[i] = v2[0];
                vout[i + 1] = v2[1];
                vout[i + 2] = v2[2];
                i += 3;
            }
        }
    },


    m3_transformRotation: {
        value: function (v: Float32Array | number[], result?: IVector3D | number[]) {
            const { 0: x, 1: y, 2: z } = v;
            if (undefined == result) {
                result = new Float32Array(rf_v3_identity);
            }
            result[0] = x * this[0] + y * this[4] + z * this[8];
            result[1] = x * this[1] + y * this[5] + z * this[9];
            result[2] = x * this[2] + y * this[6] + z * this[10];
            // result[3] = x * this[3] + y * this[7] + z * this[11];

            return result;
        }
    },
    m3_getMaxScaleOnAxis: {
        value: function(){
            let scaleXSq = this[ 0 ] * this[ 0 ] + this[ 1 ] * this[ 1 ] + this[ 2 ] * this[ 2 ];
            let scaleYSq = this[ 4 ] * this[ 4 ] + this[ 5 ] * this[ 5 ] + this[ 6 ] * this[ 6 ];
            let scaleZSq = this[ 8 ] * this[ 8 ] + this[ 9 ] * this[ 9 ] + this[ 10 ] * this[ 10 ];
            return Math.sqrt( Math.max( scaleXSq, scaleYSq, scaleZSq ) );
        }
        

    }
})

interface IVector3D extends IArrayBase {
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

Object.defineProperties(Float32Array.prototype, {
    v3_lengthSquared: {
        get() {
            const { 0: x, 1: y, 2: z } = this;
            return x * x + y * y + z * z;
        }
    },

    v2_length:{
        get() {
            const { 0: x, 1: y} = this;
            return Math.sqrt(x * x + y * y);
        }
    },

    v3_length: {
        get() {
            const { 0: x, 1: y, 2: z } = this;
            return Math.sqrt(x * x + y * y + z * z);
        }
    },
    v3_add: {
        value: function (v: IVector3D | ArrayLike<number>, out?:IVector3D) {
            let o = out || new Float32Array(4);
            for (let i = 0; i < 3; i++) o[i] = this[i] + v[i];
            return o;
        }
    },
    v3_sub: {
        value: function (v: IVector3D | ArrayLike<number>, out?:IVector3D) {
            let o = out || new Float32Array(4);
            for (let i = 0; i < 3; i++) o[i] = this[i] - v[i];
            return o;
        }
    },
    v3_scale: {
        value: function (v: number) {
            this[0] *= v;
            this[1] *= v;
            this[2] *= v;
        }
    },
    v4_scale: {
        value: function (v: number) {
            this[0] *= v;
            this[1] *= v;
            this[2] *= v;
            this[3] *= v;
        }
    },
    v3_normalize: {
        value: function (from?: ArrayLike<number>) {
            if(from){
                this[0] = from[0];
                this[1] = from[1];
                this[2] = from[2];
            }
            
            let leng = this.v3_length;
            if (leng != 0) {
                let v = 1 / leng;
                this[0] *= v;
                this[1] *= v;
                this[2] *= v;
            }
        }
    },
    v3_dotProduct: {
        value: function (t: ArrayLike<number>) {
            return this[0] * t[0] + this[1] * t[1] + this[2] * t[2];
        }
    },
    v3_crossProduct: {
        value: function (t: ArrayLike<number>, out?: IVector3D | number[]) {
            const { 0: x, 1: y, 2: z } = this;
            const { 0: ax, 1: ay, 2: az } = t;

            if (undefined == out) {
                out = new Float32Array(4);
            }

            out[0] = y * az - z * ay;
            out[1] = z * ax - x * az;
            out[2] = x * ay - y * ax;

            return out;
        }
    },

    v3_applyMatrix4:{
        value: function (e: ArrayLike<number>, out?: IVector3D | number[]) {
            const { 0: x, 1: y, 2: z } = this;

            if (undefined == out) {
                out = this;
            }

            var w = 1 / ( e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] );

            out[0] = ( e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z + e[ 12 ] ) * w;
            out[1] = ( e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z + e[ 13 ] ) * w;
            out[2] = ( e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] ) * w;
            out[3] = 1
            return out;
        }
    }

})

interface IMatrixComposeData{
    x:number;
    y:number;
    scaleX:number;
    scaleY:number;
    rotaiton:number;
}

interface IMatrix extends IArrayBase {
    m2_identity();
    m2_append(m2: ArrayLike<number> | IArrayBase, prepend?: boolean, from?: ArrayLike<number>):IMatrix;
    m2_scale(scalex:number,scaley:number);
    m2_rotate(angle:number);
    m2_transformVector(v: IVector3D | number[], result?: IVector3D | number[]);
    m2_decompose(result?:IMatrixComposeData):IMatrixComposeData;
    m2_recompose(value:IMatrixComposeData):IMatrix;
    m2_clone():IMatrix;
}

Object.defineProperties(Float32Array.prototype, {
    m2_identity: {
        value: function () {
            this.set(rf_m2_identity);
        }
    },


    m2_clone: {
        value: function () {
            return new Float32Array(this);
        }
    },

    m2_scale: {
        value: function (scalex:number,scaley:number) {
            this[0] *= scalex;
            this[4] *= scaley;
        }
    },

    m2_rotate:{
        value:function(angle:number){
            let cos = Math.cos(angle);
            let sin = Math.sin(angle);

            let arr = new Float32Array(9)
            arr[0] = cos;
            arr[1] = sin;
            arr[3] = -sin;
            arr[4] = cos;
            this.m2_append(arr)
        }
    },

    m2_transformVector: {
        value: function (v: Float32Array | number[], result?: IVector3D | number[]) {
            let { 0: x, 1: y} = v;
            // w = 1;
            if (undefined == result) {
                result = new Float32Array(rf_v3_identity);
            }
            result[0] = x * this[0] + y * this[3] + this[6]
            result[1] = x * this[1] + y * this[4] + this[7];
            
            return result;
        }
    },

    m2_append: {
        value: function (m2: ArrayLike<number>, prepend?: boolean, from?: ArrayLike<number>) {
            let a: ArrayLike<number>;
            let b: ArrayLike<number>;
            if (!prepend) {
                a = from ? from : this;
                b = m2
            } else {
                a = m2;
                b = from ? from : this;
            }
            const [
                a11, a12, a13,
                a21, a22, a23,
                a31, a32, a33,
            ] = a as any;//目前typescript还没支持  TypedArray destructure，不过目前已经标准化，后面 typescript 应该会支持

            const [
                b11, b12, b13,
                b21, b22, b23,
                b31, b32, b33,
            ] = b as any;

            this[0] = a11 * b11 + a12 * b21 + a13 * b31;
            this[1] = a11 * b12 + a12 * b22 + a13 * b32;
            this[2] = a11 * b13 + a12 * b23 + a13 * b33;

            this[3] = a21 * b11 + a22 * b21 + a23 * b31;
            this[4] = a21 * b12 + a22 * b22 + a23 * b32;
            this[5] = a21 * b13 + a22 * b23 + a23 * b33;

            this[6] = a31 * b11 + a32 * b21 + a33 * b31;
            this[7] = a31 * b12 + a32 * b22 + a33 * b32;
            this[8] = a31 * b13 + a32 * b23 + a33 * b33;
            return this;
        }
    },


    m2_decompose: {
        value: function (result?:IMatrixComposeData) {

            let{
                0:m0,1:m1,2:m2,
                3:m3,4:m4,5:m5,
                6:m6,7:m7
            }= this as any;

            let sx = Math.sqrt(m0*m0 + m1*m1) , sy = Math.sqrt(m3*m3 + m4*m4);

            let x = m6,y = m7;

            let rotaiton = Math.acos(m0/sx) * rf.RADIANS_TO_DEGREES;

            if(!result){
                result = {x:x,y:y,scaleX:sx,scaleY:sy,rotaiton:rotaiton} as IMatrixComposeData;
            }else{
                result.x = x;
                result.y = y;
                result.scaleX = sx;
                result.scaleY = sy;
                result.rotaiton = rotaiton;
            }

            return result;
        }
    },

    m2_recompose: {
        value: function (value:IMatrixComposeData){
            let x = value.x === undefined ? 0 : value.x;
            let y = value.y === undefined ? 0 : value.y;
            let sx = value.scaleX === undefined ? 1 :  value.scaleX;
            let sy = value.scaleY === undefined ? 1 :  value.scaleY;
            let rotaiton = value.rotaiton  === undefined ? 0 : value.rotaiton;

            rotaiton *= rf.DEGREES_TO_RADIANS;

            let cos = Math.cos(rotaiton),sin = Math.sin(rotaiton);

            this[0] = sx * cos;
            this[1] = -sin;
            this[3] = sin;
            this[4] = cos * sy;
            this[6] = x;
            this[7] = y;
        }
    }
});


interface Float32Array extends IMatrix3D, IMatrix, IVector3D {

}

module rf {

    export const enum Orientation3D {
        EULER_ANGLES,// = "eulerAngles",
        AXIS_ANGLE,// = "axisAngle",
        QUATERNION,// = "quaternion",
    }

    const DEG_2_RAD = Math.PI / 180;

    export function newMatrix3D(v?: ArrayLike<number> | ArrayBuffer) {
        let out: Float32Array;
        if (v instanceof ArrayBuffer) {
            out = new Float32Array(v);
        } else {
            if (undefined != v) {
                out = new Float32Array(v);
            } else {
                out = new Float32Array(rf_m3_identity);
            }
        }
        return out;
    }

    export function newMatrix(v?: ArrayLike<number> | ArrayBuffer) {
        let out: Float32Array;
        if (v instanceof ArrayBuffer) {
            out = new Float32Array(v);
        } else {
            if (undefined != v) {
                out = new Float32Array(v);
            } else {
                out = new Float32Array(rf_m2_identity);
            }
        }
        return out;
    }

    export function newVector3D(x?: ArrayLike<number> | ArrayBuffer | number, y?: number, z?: number, w?: number) {
        if (undefined == x) {
            return new Float32Array(rf_v3_identity);
        }

        if (x instanceof ArrayBuffer) {
            return new Float32Array(x);
        }

        if (undefined == y) {
            y = 0;
        }
        if (undefined == z) {
            z = 0;
        }
        if (undefined == w) { 
            w = 0;
        }
        return new Float32Array([Number(x), y, z, w]);
    }


    export function matrix2d_clearScale(matrix:IMatrix){
    
    }

    export function qua_lerp(qa: IVector3D, qb: IVector3D, t: number,out?:IVector3D) {
        const { 0: qax, 1: qay, 2: qaz, 3: qaw } = qa;
        const { 0: qbx, 1: qby, 2: qbz, 3: qbw } = qb;

        if(!out){
            out = newVector3D();
        }
        // shortest direction
        if (qax * qbx + qay * qby + qaz * qbz + qaw * qbw < 0) {
            out[0] = qax + t * (-qbx - qax);
            out[1] = qay + t * (-qby - qay);
            out[2] = qaz + t * (-qbz - qaz);
            out[3] = qaw + t * (-qbw - qaw);
        }else{
            out[0] = qax + t * (qbx - qax);
            out[1] = qay + t * (qby - qay);
            out[2] = qaz + t * (qbz - qaz);
            out[3] = qaw + t * (qbw - qaw)
        }
        return out;
    }


    export function qua_slerp(qa: IVector3D, qb: IVector3D, t: number,out?:IVector3D) {
        let x:number,y:number,z:number,w:number;
        let { 0: x1, 1: y1, 2: z1, 3: w1 } = qa;
        let { 0: x2, 1: y2, 2: z2, 3: w2 } = qb;
        let dot = x1 * x2 + y1 * y2 + z1 * z2 + w1 * w2;
        if(dot < 0){
            dot = -dot;
            w2 = -w2;
            x2 = -x2;
            y2 = -y2;
            z2 = -z2;
        }

        if (dot < 0.95) {
            let angle = Math.acos(dot);
            let s = 1/Math.sin(angle);
            let s1 = Math.sin(angle*(1 - t))*s;
            let s2 = Math.sin(angle*t)*s;
            w = w1*s1 + w2*s2;
            x = x1*s1 + x2*s2;
            y = y1*s1 + y2*s2;
            z = z1*s1 + z2*s2;
        }else {
            w = w1 + t*(w2 - w1);
            x = x1 + t*(x2 - x1);
            y = y1 + t*(y2 - y1);
            z = z1 + t*(z2 - z1);
            let len = 1.0/Math.sqrt(w*w + x*x + y*y + z*z);
            w *= len;
            x *= len;
            y *= len;
            z *= len;
        }



        if(!out){
            out = newVector3D();
        }

        out[0] = x;
        out[1] = y;
        out[2] = z;
        out[3] = w;

        return out;
    }


    export function pos_lerp(ap: IVector3D, bp: IVector3D, t: number,out?:IVector3D) {
        const { 0: x, 1: y, 2: z } = ap;
        if(!out){
            out = newVector3D();
        }
        out[0] = x + t * (bp[0] - x);
        out[1] = y + t * (bp[1] - y);
        out[2] = z + t * (bp[2] - z);
        return out;
    }

}

