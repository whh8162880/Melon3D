import { context3D, gl } from "../Stage3D.js";
import { Buffer3D } from "./Buffer3D.js";

export class Program3D extends Buffer3D {
    program: WebGLProgram;

    private vShader: WebGLShader;

    private fShader: WebGLShader

    vertexCode: string;
    fragmentCode: string;

    uniforms: Object = {};
    attribs: Object = {};

    setting: IShaderSetting;


    constructor() {
        super();
        this.gctime = 60000;
    }

    awaken(): boolean {
        if (undefined != this.program) {
            return true;
        }

        if (!this.vertexCode || !this.fragmentCode) {
            console.log("vertexCode or fragmentCode is empty")
            return false;
        }

        //创建 vertexShader
        this.vShader = this.createShader(this.vertexCode, WebGLConst.VERTEX_SHADER);
        this.fShader = this.createShader(this.fragmentCode, WebGLConst.FRAGMENT_SHADER);
        this.program = gl.createProgram();

        gl.attachShader(this.program, this.vShader);
        gl.attachShader(this.program, this.fShader);
        gl.linkProgram(this.program);
        if (!gl.getProgramParameter(this.program, WebGLConst.LINK_STATUS)) {
            this.dispose();
            console.log(`create program error:${gl.getProgramInfoLog(this.program)}`);
            return false;
        }

        //加入资源管理
        context3D.bufferLink.add(this, this, undefined);
        this.readly = true;
        return true;
    }


    dispose(): void {
        if (this.vShader) {
            gl.detachShader(this.program, this.vShader);
            gl.deleteShader(this.vShader);
            this.vShader = null;
        }

        if (this.fShader) {
            gl.detachShader(this.program, this.fShader);
            gl.deleteShader(this.fShader);
            this.fShader = null;
        }

        if (this.program) {
            gl.deleteProgram(this.program);
            this.program = null;
        }
    }

    recycle(): void {
        this.dispose();
        // this.vertexCode = undefined;
        // this.fragmentCode = undefined;
        this.preusetime = 0;
        this.readly = false;

        this.uniforms = {};
        this.attribs = {};
        // context3D.bufferLink.remove(this);
    }
    /*
        * load shader from html file by document.getElementById
        */
    private createShader(code: string, type: number) {
        let g = gl;
        var shader = g.createShader(type);
        g.shaderSource(shader, code);
        g.compileShader(shader);
        // Check the result of compilation
        if (!g.getShaderParameter(shader, WebGLConst.COMPILE_STATUS)) {
            let error: string = g.getShaderInfoLog(shader);
            g.deleteShader(shader);
            console.log(error);
            throw new Error(error);
        }
        return shader;
    }
}