///<reference path="../../core/Config.ts"/>
///<reference path="Geometry.ts"/>
module rf {
    export const enum VA {
        pos = "pos",
        normal = "normal",
        tangent = "tangent",
        color = "color",
        uv = "uv",
        index = "index",
        weight = "weight"
    }

    export const enum FS {
        diff = "diff",
        SHADOW = "shadow"
    }

    export const enum VC {
        m = "m",
        mv = "mv",
        invm = "invm",
        sunmvp = "sunmvp",
        p = "p",
        mvp = "mvp",
        ui = "ui",
        lightDirection = "lightDirection",
        originFar = "originFar",
        logDepthFar = "logDepthFar",
        vc_diff = "vc_diff",
        vc_emissive = "vc_emissive",
        vc_bones = "bones"
    }

    export class Buffer3D implements IRecyclable {
        preusetime = 0;
        gctime = 3000;
        readly: boolean = false;
        constructor() { }
        awaken(): void { };
        sleep(): void { };
        onRecycle(): void {
            this.readly = false;
            this.preusetime = 0;
        }
    }
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
            let g = gl;

            //创建 vertexShader
            this.vShader = this.createShader(this.vertexCode, g.VERTEX_SHADER);
            this.fShader = this.createShader(this.fragmentCode, g.FRAGMENT_SHADER);
            this.program = g.createProgram();

            g.attachShader(this.program, this.vShader);
            g.attachShader(this.program, this.fShader);
            g.linkProgram(this.program);
            if (!g.getProgramParameter(this.program, gl.LINK_STATUS)) {
                this.dispose();
                console.log(`create program error:${g.getProgramInfoLog(this.program)}`);
                return false;
            }

            //加入资源管理
            context3D.bufferLink.add(this, this, undefined);
            this.readly = true;
            return true;
        }


        dispose(): void {
            let g = gl;
            if (this.vShader) {
                g.detachShader(this.program, this.vShader);
                g.deleteShader(this.vShader);
                this.vShader = null;
            }

            if (this.fShader) {
                g.detachShader(this.program, this.fShader);
                g.deleteShader(this.fShader);
                this.fShader = null;
            }

            if (this.program) {
                g.deleteProgram(this.program);
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
            if (!g.getShaderParameter(shader, g.COMPILE_STATUS)) {
                let error: string = g.getShaderInfoLog(shader);
                g.deleteShader(shader);
                console.log(error);
                throw new Error(error);
            }
            return shader;
        }
    }


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
            let g = gl;
            let att = context3D.attribarray;
            let { buffer, attribarray } = this;

            if (buffer) {

                for (let t in attribarray) {
                    attribarray[t] = false;
                    att[t] = false;
                    g.bindBuffer(g.ARRAY_BUFFER, buffer);
                    g.disableVertexAttribArray(~~t);
                }

                g.deleteBuffer(buffer);
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
            g.bindBuffer(g.ARRAY_BUFFER, this.buffer);
            g.bufferData(g.ARRAY_BUFFER, this.data.vertex, g.STATIC_DRAW);
            g.bindBuffer(g.ARRAY_BUFFER, null);
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
            let g = gl;
            let att = context3D.attribarray;
            let attribs = program.attribs;
            let p = program.program;
            let attribarray = this.attribarray;
            g.bindBuffer(g.ARRAY_BUFFER, this.buffer);
            // if(type == false){
            let variables = this.data.variables
            for (let variable in variables) {
                if (true == (variable in attribs)) {
                    loc = attribs[variable];
                } else {
                    loc = g.getAttribLocation(p, variable);
                    attribs[variable] = loc;
                }
                if (loc < 0) {
                    continue;
                }
                let o = variables[variable];
                g.vertexAttribPointer(loc, o.size, g.FLOAT, false, this.data32PerVertex * 4, o.offset * 4);
                attribarray[loc] = true;
                if (true != att[loc]) {
                    g.enableVertexAttribArray(loc);
                    att[loc] = true;
                }
            }
            // }
            this.preusetime = engineNow;
        }
    }

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
            let g = gl;
            if (undefined == this.buffer) {
                this.buffer = g.createBuffer();
            }
            g.bindBuffer(g.ELEMENT_ARRAY_BUFFER, this.buffer);
            g.bufferData(g.ELEMENT_ARRAY_BUFFER, this.data, g.STATIC_DRAW);
            g.bindBuffer(g.ELEMENT_ARRAY_BUFFER, null);
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


    //TODO:cube texture

    export class Texture extends Buffer3D {
        key: number | string;
        data: ITextureData;
        texture: WebGLTexture;
        width: number = 0;
        height: number = 0;
        // uv:number[];
        pixels: ImageBitmap | ImageData | HTMLVideoElement | HTMLImageElement | HTMLCanvasElement | BitmapData;
        floatData: Uint8Array;
        constructor() {
            super();
        }


        awaken(): boolean {

            let tex = this.texture;
            let g = gl;
            let data = this.pixels;

            if (data instanceof BitmapData) {
                data = data.canvas;
            }

            if (undefined == tex) {
                this.texture = tex = g.createTexture();
            }

            g.bindTexture(g.TEXTURE_2D, tex);



            let { data: textureData } = this;

            // g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL,true);
            //g.pixelStorei(g.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);


            g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, textureData.mag);
            g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, textureData.mix);
            let pepeat = textureData.repeat;
            g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, pepeat);   //U方向上设置
            g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, pepeat);



            // if(textureData.mipmap){
            //     g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
            //     g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR_MIPMAP_LINEAR);
            //     g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.REPEAT);   //U方向上设置
            //     g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.REPEAT);   //v方向上设置
            // }else{
            //     //设置纹理参数 https://blog.csdn.net/a23366192007/article/details/51264454
            // /**
            //  * void texParameteri(GLenum target, GLenum pname, GLint param) ;
            //     @pname:是纹理的参数：只能是下列四个
            //         GL_TEXTURE_MIN_FILTER：指定纹理图片缩小时用到的算法
            //         GL_TEXTURE_MAG_FILTER：指定纹理图片放大时用到的算法 
            //         GL_TEXTURE_WRAP_S ：纹理包装算法，在s(u)方向 
            //         GL_TEXTURE_WRAP_T ：纹理包装算法，在t(v)方向
            //     @param:是第二个参数的值（value）
            //         放大和缩小所用的算法只有两个 NEAREST和LINEAR,
            //         （即第三个参数param的值是webgl.NEAREST或webgl.LINEAR）分别是最近点采样和线性采样，
            //         前者效率高单效果不好，后者效率不高单效果比较好。
            //  */


            // /**
            //  *  Mag Modes
            //  *      gl.NEAREST
            //  *      gl.LINEAR
            //  */
            // g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.NEAREST);
            // /**  Min Modes
            // *      gl.NEAREST
            // *      gl.LINEAR
            //        gl.NEAREST_MIPMAP_NEAREST;      limit:power of two   
            //        gl.NEAREST_MIPMAP_LINEAR;       limit:power of two
            //        gl.LINEAR_MIPMAP_LINEAR         limit:power of two
            //        gl.LINEAR_MIPMAP_NEAREST        limit:power of two
            // * */
            // //如果我们的贴图长宽不满足2的幂条件。那么MIN_FILTER 和 MAG_FILTER, 只能是 NEAREST或者LINEAR
            // g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.NEAREST);

            // g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);   //U方向上设置
            // g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);   //v方向上设置


            // }
            //如果我们的贴图长宽不满足2的幂条件。那么wrap_s 和 wrap_t 必须是 clap_to_edge
            //Wrapping Modes 
            //g.REPEAT                  limit:power of two   
            //g.MIRRORED_REPEAT         limit:power of two   
            //g.CLAMP_TO_EDGE


            /**
                ====format=====
                g.ALPHA
                g.RGB
                g.RGBA
                g.LUMINANCE
                g.LUMINANCE_ALPHA
                g.DEPTH_COMPONENT
                g.DEPTH_STENCIL
             */

            /**
                ===type====
                g.UNSIGNED_BYTE
                g.BYTE
                g.SHORT
                g.INT
                g.FLOAT
                g.UNSIGNED_BYTE;
                g.UNSIGNED_INT
                g.UNSIGNED_SHORT
                g.UNSIGNED_SHORT_4_4_4_4;
                g.UNSIGNED_SHORT_5_5_5_1;
                g.UNSIGNED_SHORT_5_6_5;
                //halfFloat
                g.getExtension('OES_texture_half_float').HALF_FLOAT_OES
                g.getExtension('WEBGL_depth_texture').UNSIGNED_INT_24_8_WEBGL
             */

            let { width, height } = this;

            if (data) {
                g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, data);
                width = data.width;
                height = data.height;
            } else {
                if (!this.floatData) {
                    this.floatData = new Uint8Array(width * height * 4);
                }
                g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, width, height, 0, g.RGBA, g.UNSIGNED_BYTE, this.floatData);
                // g.compressedTexImage2D()
            }





            //  createmipmap  limit:power of two

            if (textureData.mipmap) {
                g.generateMipmap(g.TEXTURE_2D);
            }

            // g.bindTexture(g.TEXTURE_2D, null);

            this.readly = true;


            // this.uv = [1/width,1/height];

            //加入资源管理
            context3D.bufferLink.add(this);

            return true;
        }

        uploadContext(program: Program3D, variable: string): void {
            // if (false == this.readly) {
            //     // console.log(this.key + " awaken");
            //     this.awaken();
            // }

            let index = context3D.texIndex++;

            let uniforms = program.uniforms;
            let g = gl;
            var index_tex: WebGLUniformLocation;


            // if(this.data.url != "component"){
            //     console.log("active " + "TEXTURE" + index,this.pixels)
            // }
            index_tex = uniforms[variable];

            if (undefined == index_tex) {
                index_tex = g.getUniformLocation(program.program, variable);
                uniforms[variable] = index_tex;
                // console.log(variable + " uploadContext ", this.key, index);
            }

            // var index_tex = gl.getUniformLocation(program.program, variable);
            if (undefined != index_tex) {
                g.activeTexture(g["TEXTURE" + index]);
                g.uniform1i(index_tex, index);
                // g.bindTexture(g.TEXTURE_2D, this.texture);
                if (false == this.readly) {
                    this.awaken();
                } else {
                    g.bindTexture(g.TEXTURE_2D, this.texture);
                }
            }

            // context3D.setProgramConstantsFromVector("texuv",[1/this.width,1/this.height])

            this.preusetime = engineNow;

        }


        status: LoadStates = LoadStates.WAIT;

        load(url?: string) {
            if (undefined == url) {
                url = this.data.url as string;
            }
            if (LoadStates.WAIT == this.status) {
                this.status = LoadStates.LOADING;
                loadRes(RES_PERFIX, url, this.loadComplete, this, ResType.image);
            }
        }

        loadComplete(e: EventX) {
            if (e.type == EventT.COMPLETE) {
                this.status = LoadStates.COMPLETE;
                let image = e.data;
                this.width = image.width;
                this.height = image.height;
                this.pixels = image;
            } else {
                this.status = LoadStates.FAILED;
            }
        }


        recycle(): void {
            if (this.texture) {
                gl.deleteTexture(this.texture);
                this.texture = undefined;
            }
            this.readly = false;
            // console.log(this.key + " recycle");
            // if (this.pixels) {
            //     this.pixels = undefined;
            // }
            // this.width = 0;
            // this.height = 0;
        }
    }


    export class RTTexture extends Texture {
        frameBuffer: WebGLFramebuffer;
        renderBuffer: WebGLRenderbuffer;
        setting: IContext3DSetting = {} as IContext3DSetting;
        cleanBit: number;
        cleanColor: IVector3D;

        awaken() {
            let b = super.awaken();
            let g = gl;

            if (b) {
                let { frameBuffer, renderBuffer, texture, width, height } = this;

                if (!frameBuffer) {
                    this.frameBuffer = frameBuffer = g.createFramebuffer();
                }

                g.bindFramebuffer(g.FRAMEBUFFER, frameBuffer);

                if (!renderBuffer) {
                    this.renderBuffer = renderBuffer = g.createRenderbuffer();
                }

                g.bindRenderbuffer(g.RENDERBUFFER, renderBuffer);
                g.renderbufferStorage(g.RENDERBUFFER, g.DEPTH_COMPONENT16, width, height);
                g.framebufferRenderbuffer(g.FRAMEBUFFER, g.DEPTH_ATTACHMENT, g.RENDERBUFFER, renderBuffer);

                g.framebufferTexture2D(g.FRAMEBUFFER, g.COLOR_ATTACHMENT0, g.TEXTURE_2D, texture, 0);

                g.bindRenderbuffer(g.RENDERBUFFER, undefined);
                g.bindFramebuffer(g.FRAMEBUFFER, undefined);

            }

            return b;
        }

        recycle(): void {
            let g = gl;
            let { frameBuffer, renderBuffer, texture } = this;
            if (frameBuffer) {
                g.deleteFramebuffer(frameBuffer);
                this.frameBuffer = undefined;
            }
            if (renderBuffer) {
                g.deleteRenderbuffer(renderBuffer);
                this.renderBuffer = undefined;
            }
            if (texture) {
                g.deleteTexture(texture);
                this.texture = undefined;
            }
            this.readly = false;
        }
    }


    export class CubeTexture extends Texture {
        frameBuffer: WebGLFramebuffer;
        renderBuffer: WebGLRenderbuffer;
        setting: IContext3DSetting = {} as IContext3DSetting;

        files: string[] = ["nx", 'ny', 'nz', 'px', 'py', 'pz'];

        //nx, ny, nz, px, py, pz
        cubePixels: (ImageBitmap | ImageData | HTMLVideoElement | HTMLImageElement | HTMLCanvasElement)[];

        awaken(): boolean {

            let tex = this.texture;
            let g = gl;


            let data: HTMLCanvasElement[] = [];

            let [nx, ny, nz, px, py, pz] = this.cubePixels as any;

            let { data: textureData } = this;

            if (undefined == tex) {
                this.texture = tex = g.createTexture();
            }

            g.bindTexture(g.TEXTURE_CUBE_MAP, tex);

            // g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL,true);

            g.texParameteri(g.TEXTURE_CUBE_MAP, g.TEXTURE_MAG_FILTER, textureData.mag);
            g.texParameteri(g.TEXTURE_CUBE_MAP, g.TEXTURE_MIN_FILTER, textureData.mix);
            let pepeat = textureData.repeat;
            g.texParameteri(g.TEXTURE_CUBE_MAP, g.TEXTURE_WRAP_S, pepeat);   //U方向上设置
            g.texParameteri(g.TEXTURE_CUBE_MAP, g.TEXTURE_WRAP_T, pepeat);



            // if(data){
            g.texImage2D(g.TEXTURE_CUBE_MAP_POSITIVE_X, 0, g.RGB, g.RGB, g.UNSIGNED_BYTE, px);
            g.texImage2D(g.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, g.RGB, g.RGB, g.UNSIGNED_BYTE, nx);
            g.texImage2D(g.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, g.RGB, g.RGB, g.UNSIGNED_BYTE, py);
            g.texImage2D(g.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, g.RGB, g.RGB, g.UNSIGNED_BYTE, ny);
            g.texImage2D(g.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, g.RGB, g.RGB, g.UNSIGNED_BYTE, pz);
            g.texImage2D(g.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, g.RGB, g.RGB, g.UNSIGNED_BYTE, nz);

            // g.texImage2D(g.TEXTURE_CUBE_MAP, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, data);
            // }else{
            //     g.texImage2D(g.TEXTURE_CUBE_MAP_POSITIVE_X, 0,g.RGBA,this.width,this.height,0,gl.RGBA,gl.UNSIGNED_BYTE,undefined);
            //     g.texImage2D(g.TEXTURE_CUBE_MAP_NEGATIVE_X, 0,g.RGBA,this.width,this.height,0,gl.RGBA,gl.UNSIGNED_BYTE,undefined);
            //     g.texImage2D(g.TEXTURE_CUBE_MAP_POSITIVE_Y, 0,g.RGBA,this.width,this.height,0,gl.RGBA,gl.UNSIGNED_BYTE,undefined);
            //     g.texImage2D(g.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0,g.RGBA,this.width,this.height,0,gl.RGBA,gl.UNSIGNED_BYTE,undefined);
            //     g.texImage2D(g.TEXTURE_CUBE_MAP_POSITIVE_Z, 0,g.RGBA,this.width,this.height,0,gl.RGBA,gl.UNSIGNED_BYTE,undefined);
            //     g.texImage2D(g.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0,g.RGBA,this.width,this.height,0,gl.RGBA,gl.UNSIGNED_BYTE,undefined);

            //     // g.texImage2D(g.TEXTURE_CUBE_MAP,0,g.RGBA,this.width,this.height,0,gl.RGBA,gl.UNSIGNED_BYTE,undefined);
            // }


            //  createmipmap  limit:power of two

            if (textureData.mipmap) {
                g.generateMipmap(g.TEXTURE_CUBE_MAP);
            }

            g.bindTexture(g.TEXTURE_CUBE_MAP, null);

            this.readly = true;

            //加入资源管理
            context3D.bufferLink.add(this);

            return true;
        }

        uploadContext(program: Program3D, variable: string): void {
            if (false == this.readly) {
                this.awaken();
            }

            let index = context3D.texIndex++;

            let uniforms = program.uniforms;
            let g = gl;
            var index_tex;

            g.activeTexture(gl["TEXTURE" + index]);
            g.bindTexture(g.TEXTURE_CUBE_MAP, this.texture);
            if (true == uniforms.hasOwnProperty(variable)) {
                index_tex = uniforms[variable];
            } else {
                index_tex = g.getUniformLocation(program.program, variable);
                uniforms[variable] = index_tex;
            }

            // var index_tex = gl.getUniformLocation(program.program, variable);
            if (undefined != index_tex) {
                g.uniform1i(index_tex, index);
            }


            this.preusetime = engineNow;

        }


        status: LoadStates = LoadStates.WAIT;

        load(url?: string, type: string = '.jpg') {
            if (undefined == url) {
                url = this.data.url as string;
            }
            if (url.charAt(url.length - 1) != '/') {
                url += '/';
            }
            this.cubePixels = []
            if (LoadStates.WAIT == this.status) {
                this.status = LoadStates.LOADING;
                let files = this.files;
                for (let i = 0; i < files.length; i++) {
                    const face = files[i];
                    loadRes(RES_PERFIX, url + face + type, this.loadComplete, this, ResType.image);
                }
            }
        }

        loadComplete(e: EventX) {
            if (e.type == EventT.COMPLETE) {
                let res = e.currentTarget as Loader;
                let image = e.data;
                this.width = image.width;
                this.height = image.height;

                let index = res.url.lastIndexOf('/');
                let fname = res.url.slice(index + 1);
                fname = fname.split('.')[0]
                index = this.files.indexOf(fname)

                this.cubePixels[index] = image;
                let b = true;
                for (let i: number = 0; i < 6; ++i) {
                    let pixels = this.cubePixels[i];
                    if (pixels == undefined) {
                        b = false;
                    }
                }
                if (b) {
                    this.status = LoadStates.COMPLETE;
                }
            } else {
                this.status = LoadStates.FAILED;
            }
        }


        recycle(): void {
            if (this.texture) {
                gl.deleteTexture(this.texture);
                this.texture = undefined;
            }
            this.readly = false;

        }

    }


}

