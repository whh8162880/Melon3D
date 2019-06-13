import { Buffer3D } from "./Buffer3D.js";
import { ThrowError } from "../../../core/ThrowError.js";
import { gl, context3D } from "../Stage3D.js";

export class IndexBuffer3D extends Buffer3D {
    numIndices: number;
    data: Uint16Array;
    buffer: WebGLBuffer;
    quadid: number = -1;
    constructor() {
        super();
    }
    recycle(): void {
        if (this.buffer) {
            gl.deleteBuffer(this.buffer);
            this.buffer = undefined;
        }
        this.readly = false;
        this.preusetime = 0;

        // this.numIndices = 0;
        // this.data = null;
        // context3D.bufferLink.remove(this);
    }
    awaken(): boolean {
        if (true == this.readly) {
            // if (DEBUG) {
            if (undefined == this.buffer) {
                ThrowError("indexBuffer readly is true but buffer is null");
                return false;
            }
            // }
            return true;
        }
        if (!this.data) {
            this.readly = false;
            ThrowError("indexData unavailable");
            return false;
        }
        if (undefined == this.buffer) {
            this.buffer = gl.createBuffer();
        }
        gl.bindBuffer(WebGLConst.ELEMENT_ARRAY_BUFFER, this.buffer);
        gl.bufferData(WebGLConst.ELEMENT_ARRAY_BUFFER, this.data, WebGLConst.STATIC_DRAW);
        gl.bindBuffer(WebGLConst.ELEMENT_ARRAY_BUFFER, null);
        //加入资源管理
        this.readly = true;
        context3D.bufferLink.add(this);
    }
    uploadFromVector(data: number[] | Uint16Array, startOffset: number = 0, count: number = -1): void {

        if (0 > startOffset) {
            startOffset = 0;
        }

        if (count != -1) {
            if (this.numIndices - startOffset < count) {
                ThrowError("VectorData out of range");
                return;
            }
        }

        if (0 < startOffset) {
            if (-1 == count) {
                count = data.length - startOffset;
            }
            let nd = new Uint16Array(count);
            nd.set(data.slice(startOffset, startOffset + count));
            data = nd;
        } else {
            if (false == (data instanceof Uint16Array)) {
                data = new Uint16Array(data);
            }
        }

        this.numIndices = data.length;
        this.data = <Uint16Array>data;
    }
}