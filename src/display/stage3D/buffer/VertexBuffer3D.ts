import { Buffer3D } from "./Buffer3D.js";
import { VertexInfo } from "../Geometry.js";
import { context3D, gl } from "../Stage3D.js";
import { Program3D } from "./Program3D.js";
import { ThrowError } from "../../../core/ThrowError.js";
import { engineNow } from "../../../core/Engine.js";

export class VertexBuffer3D extends Buffer3D {

    // private varibles: { [key: string]: { size: number, offset: number } } = undefined;
    numVertices: number = 0;
    data32PerVertex: number = 0;
    data: VertexInfo;

    buffer: WebGLBuffer = null;
    constructor() {
        super();
    }
    recycle(): void {
        let att = context3D.attribarray;
        let { buffer, attribarray } = this;

        if (buffer) {

            for (let t in attribarray) {
                attribarray[t] = false;
                att[t] = false;
                gl.bindBuffer(WebGLConst.ARRAY_BUFFER, buffer);
                gl.disableVertexAttribArray(~~t);
            }

            gl.deleteBuffer(buffer);
            this.buffer = undefined;
        }
        this.readly = false;
        this.preusetime = 0;






        // this.numVertices = 0;
        // this.data32PerVertex = 0;
        // this.data = null;
        // context3D.bufferLink.remove(this);
    }
    awaken(): boolean {
        if (!this.data || !this.data32PerVertex || !this.numVertices) {
            this.readly = false;
            ThrowError("vertexBuffer3D unavailable");
            return false;
        }
        let g = gl;
        if (undefined == this.buffer) {
            this.buffer = g.createBuffer();
        }
        g.bindBuffer(WebGLConst.ARRAY_BUFFER, this.buffer);
        g.bufferData(WebGLConst.ARRAY_BUFFER, this.data.vertex, WebGLConst.STATIC_DRAW);
        g.bindBuffer(WebGLConst.ARRAY_BUFFER, null);
        this.readly = true;
        //加入资源管理
        context3D.bufferLink.add(this);
        return true;
    }

    uploadFromVector(data: number[] | Float32Array | VertexInfo, startVertex: number = 0, numVertices: number = -1): void {

        if (data instanceof VertexInfo) {
            this.data = data;
            this.numVertices = data.numVertices;
            this.readly = false;
            return;
        }

        if (0 > startVertex) {
            startVertex = 0;
        }
        var nd: Float32Array;
        let data32PerVertex = this.data32PerVertex;
        if (numVertices != -1) {
            this.numVertices = data.length / data32PerVertex;
            if (this.numVertices - startVertex < numVertices) {
                ThrowError("numVertices out of range");
                return;
            }

            if (this.numVertices != numVertices && startVertex == 0) {
                this.numVertices = numVertices;
                nd = new Float32Array(data32PerVertex * numVertices);
                nd.set(data.slice(startVertex * data32PerVertex, numVertices * data32PerVertex));
                data = nd;
            }
        }

        if (0 < startVertex) {
            if (numVertices == -1) {
                numVertices = data.length / data32PerVertex - startVertex;
            }
            nd = new Float32Array(data32PerVertex * numVertices);
            nd.set(data.slice(startVertex * data32PerVertex, numVertices * data32PerVertex));
            data = nd;
            this.numVertices = numVertices;
        } else {
            if (false == (data instanceof Float32Array)) {
                data = new Float32Array(data);
            }
            this.numVertices = data.length / data32PerVertex;
        }
        this.data = new VertexInfo(<Float32Array>data, data32PerVertex);
    }


    // regVariable(variable: string, offset: number, size: number): void {
    //     if (undefined == this.varibles) {
    //         this.varibles = {};
    //     }
    //     this.varibles[variable] = { size: size, offset: offset * 4 };
    // }

    attribarray: object = {};

    uploadContext(program: Program3D): void {
        if (false == this.readly) {
            if (false == this.awaken()) {
                throw new Error("create VertexBuffer error!");
            }
        }
        let loc = -1;
        let att = context3D.attribarray;
        let attribs = program.attribs;
        let p = program.program;
        let attribarray = this.attribarray;
        gl.bindBuffer(WebGLConst.ARRAY_BUFFER, this.buffer);
        // if(type == false){
        let variables = this.data.variables
        for (let variable in variables) {
            if (true == (variable in attribs)) {
                loc = attribs[variable];
            } else {
                loc = gl.getAttribLocation(p, variable);
                attribs[variable] = loc;
            }
            if (loc < 0) {
                continue;
            }
            let o = variables[variable];
            gl.vertexAttribPointer(loc, o.size, WebGLConst.FLOAT, false, this.data32PerVertex * 4, o.offset * 4);
            attribarray[loc] = true;
            if (true != att[loc]) {
                gl.enableVertexAttribArray(loc);
                att[loc] = true;
            }
        }
        // }
        this.preusetime = engineNow;
    }
}