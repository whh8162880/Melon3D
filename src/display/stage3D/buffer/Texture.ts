import { Buffer3D } from "./Buffer3D.js";
import { gl, context3D } from "../Stage3D.js";
import { BitmapData } from "../../../core/BitmapData.js";
import { Program3D } from "./Program3D.js";
import { engineNow } from "../../../core/Engine.js";
import { loadRes, Loader } from "../../../core/Http.js";
import { RES_PERFIX } from "../../../core/CONFIG.js";
import { EventX } from "../../../core/MiniDispatcher.js";
import { IContext3DSetting } from "../Context3D.js";

export class Texture extends Buffer3D {
    key: number | string;
    data: ITextureSetting;
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
        let data = this.pixels;

        if (data instanceof BitmapData) {
            data = data.canvas;
        }

        if (undefined == tex) {
            this.texture = tex = gl.createTexture();
        }

        gl.bindTexture(WebGLConst.TEXTURE_2D, tex);



        let { data: textureData } = this;

        // g.pixelStorei(WebGLConst.UNPACK_FLIP_Y_WEBGL,true);
        //g.pixelStorei(WebGLConst.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);


        gl.texParameteri(WebGLConst.TEXTURE_2D, WebGLConst.TEXTURE_MAG_FILTER, textureData.mag);
        gl.texParameteri(WebGLConst.TEXTURE_2D, WebGLConst.TEXTURE_MIN_FILTER, textureData.mix);
        let pepeat = textureData.repeat;
        gl.texParameteri(WebGLConst.TEXTURE_2D, WebGLConst.TEXTURE_WRAP_S, pepeat);   //U方向上设置
        gl.texParameteri(WebGLConst.TEXTURE_2D, WebGLConst.TEXTURE_WRAP_T, pepeat);



        // if(textureData.mipmap){
        //     g.texParameteri(WebGLConst.TEXTURE_2D, WebGLConst.TEXTURE_MAG_FILTER, WebGLConst.LINEAR);
        //     g.texParameteri(WebGLConst.TEXTURE_2D, WebGLConst.TEXTURE_MIN_FILTER, WebGLConst.LINEAR_MIPMAP_LINEAR);
        //     g.texParameteri(WebGLConst.TEXTURE_2D, WebGLConst.TEXTURE_WRAP_S, WebGLConst.REPEAT);   //U方向上设置
        //     g.texParameteri(WebGLConst.TEXTURE_2D, WebGLConst.TEXTURE_WRAP_T, WebGLConst.REPEAT);   //v方向上设置
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
        //         （即第三个参数param的值是webWebGLConst.NEAREST或webWebGLConst.LINEAR）分别是最近点采样和线性采样，
        //         前者效率高单效果不好，后者效率不高单效果比较好。
        //  */


        // /**
        //  *  Mag Modes
        //  *      WebGLConst.NEAREST
        //  *      WebGLConst.LINEAR
        //  */
        // g.texParameteri(WebGLConst.TEXTURE_2D, WebGLConst.TEXTURE_MAG_FILTER, WebGLConst.NEAREST);
        // /**  Min Modes
        // *      WebGLConst.NEAREST
        // *      WebGLConst.LINEAR
        //        WebGLConst.NEAREST_MIPMAP_NEAREST;      limit:power of two   
        //        WebGLConst.NEAREST_MIPMAP_LINEAR;       limit:power of two
        //        WebGLConst.LINEAR_MIPMAP_LINEAR         limit:power of two
        //        WebGLConst.LINEAR_MIPMAP_NEAREST        limit:power of two
        // * */
        // //如果我们的贴图长宽不满足2的幂条件。那么MIN_FILTER 和 MAG_FILTER, 只能是 NEAREST或者LINEAR
        // g.texParameteri(WebGLConst.TEXTURE_2D, WebGLConst.TEXTURE_MIN_FILTER, WebGLConst.NEAREST);

        // g.texParameteri(WebGLConst.TEXTURE_2D, WebGLConst.TEXTURE_WRAP_S, WebGLConst.CLAMP_TO_EDGE);   //U方向上设置
        // g.texParameteri(WebGLConst.TEXTURE_2D, WebGLConst.TEXTURE_WRAP_T, WebGLConst.CLAMP_TO_EDGE);   //v方向上设置


        // }
        //如果我们的贴图长宽不满足2的幂条件。那么wrap_s 和 wrap_t 必须是 clap_to_edge
        //Wrapping Modes 
        //WebGLConst.REPEAT                  limit:power of two   
        //WebGLConst.MIRRORED_REPEAT         limit:power of two   
        //WebGLConst.CLAMP_TO_EDGE


        /**
            ====format=====
            WebGLConst.ALPHA
            WebGLConst.RGB
            WebGLConst.RGBA
            WebGLConst.LUMINANCE
            WebGLConst.LUMINANCE_ALPHA
            WebGLConst.DEPTH_COMPONENT
            WebGLConst.DEPTH_STENCIL
            */

        /**
            ===type====
            WebGLConst.UNSIGNED_BYTE
            WebGLConst.BYTE
            WebGLConst.SHORT
            WebGLConst.INT
            WebGLConst.FLOAT
            WebGLConst.UNSIGNED_BYTE;
            WebGLConst.UNSIGNED_INT
            WebGLConst.UNSIGNED_SHORT
            WebGLConst.UNSIGNED_SHORT_4_4_4_4;
            WebGLConst.UNSIGNED_SHORT_5_5_5_1;
            WebGLConst.UNSIGNED_SHORT_5_6_5;
            //halfFloat
            g.getExtension('OES_texture_half_float').HALF_FLOAT_OES
            g.getExtension('WEBGL_depth_texture').UNSIGNED_INT_24_8_WEBGL
            */

        let { width, height } = this;

        if (data) {
            gl.texImage2D(WebGLConst.TEXTURE_2D, 0, WebGLConst.RGBA, WebGLConst.RGBA, WebGLConst.UNSIGNED_BYTE, data);
            width = data.width;
            height = data.height;
        } else {
            if (!this.floatData) {
                this.floatData = new Uint8Array(width * height * 4);
            }
            gl.texImage2D(WebGLConst.TEXTURE_2D, 0, WebGLConst.RGBA, width, height, 0, WebGLConst.RGBA, WebGLConst.UNSIGNED_BYTE, this.floatData);
            // g.compressedTexImage2D()
        }





        //  createmipmap  limit:power of two

        if (textureData.mipmap) {
            gl.generateMipmap(WebGLConst.TEXTURE_2D);
        }

        // g.bindTexture(WebGLConst.TEXTURE_2D, null);

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
        var index_tex: WebGLUniformLocation;


        // if(this.data.url != "component"){
        //     console.log("active " + "TEXTURE" + index,this.pixels)
        // }
        index_tex = uniforms[variable];

        if (undefined == index_tex) {
            index_tex = gl.getUniformLocation(program.program, variable);
            uniforms[variable] = index_tex;
            // console.log(variable + " uploadContext ", this.key, index);
        }

        // var index_tex = gl.getUniformLocation(program.program, variable);
        if (undefined != index_tex) {
            gl.activeTexture(gl["TEXTURE" + index]);
            gl.uniform1i(index_tex, index);
            // g.bindTexture(WebGLConst.TEXTURE_2D, this.texture);
            if (false == this.readly) {
                this.awaken();
            } else {
                gl.bindTexture(WebGLConst.TEXTURE_2D, this.texture);
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

        if (b) {
            let { frameBuffer, renderBuffer, texture, width, height } = this;

            if (!frameBuffer) {
                this.frameBuffer = frameBuffer = gl.createFramebuffer();
            }

            gl.bindFramebuffer(WebGLConst.FRAMEBUFFER, frameBuffer);

            if (!renderBuffer) {
                this.renderBuffer = renderBuffer = gl.createRenderbuffer();
            }

            gl.bindRenderbuffer(WebGLConst.RENDERBUFFER, renderBuffer);
            gl.renderbufferStorage(WebGLConst.RENDERBUFFER, WebGLConst.DEPTH_COMPONENT16, width, height);
            gl.framebufferRenderbuffer(WebGLConst.FRAMEBUFFER, WebGLConst.DEPTH_ATTACHMENT, WebGLConst.RENDERBUFFER, renderBuffer);

            gl.framebufferTexture2D(WebGLConst.FRAMEBUFFER, WebGLConst.COLOR_ATTACHMENT0, WebGLConst.TEXTURE_2D, texture, 0);

            gl.bindRenderbuffer(WebGLConst.RENDERBUFFER, undefined);
            gl.bindFramebuffer(WebGLConst.FRAMEBUFFER, undefined);

        }

        return b;
    }

    recycle(): void {
        let { frameBuffer, renderBuffer, texture } = this;
        if (frameBuffer) {
            gl.deleteFramebuffer(frameBuffer);
            this.frameBuffer = undefined;
        }
        if (renderBuffer) {
            gl.deleteRenderbuffer(renderBuffer);
            this.renderBuffer = undefined;
        }
        if (texture) {
            gl.deleteTexture(texture);
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

        g.bindTexture(WebGLConst.TEXTURE_CUBE_MAP, tex);

        // g.pixelStorei(WebGLConst.UNPACK_FLIP_Y_WEBGL,true);

        g.texParameteri(WebGLConst.TEXTURE_CUBE_MAP, WebGLConst.TEXTURE_MAG_FILTER, textureData.mag);
        g.texParameteri(WebGLConst.TEXTURE_CUBE_MAP, WebGLConst.TEXTURE_MIN_FILTER, textureData.mix);
        let pepeat = textureData.repeat;
        g.texParameteri(WebGLConst.TEXTURE_CUBE_MAP, WebGLConst.TEXTURE_WRAP_S, pepeat);   //U方向上设置
        g.texParameteri(WebGLConst.TEXTURE_CUBE_MAP, WebGLConst.TEXTURE_WRAP_T, pepeat);



        // if(data){
        g.texImage2D(WebGLConst.TEXTURE_CUBE_MAP_POSITIVE_X, 0, WebGLConst.RGB, WebGLConst.RGB, WebGLConst.UNSIGNED_BYTE, px);
        g.texImage2D(WebGLConst.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, WebGLConst.RGB, WebGLConst.RGB, WebGLConst.UNSIGNED_BYTE, nx);
        g.texImage2D(WebGLConst.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, WebGLConst.RGB, WebGLConst.RGB, WebGLConst.UNSIGNED_BYTE, py);
        g.texImage2D(WebGLConst.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, WebGLConst.RGB, WebGLConst.RGB, WebGLConst.UNSIGNED_BYTE, ny);
        g.texImage2D(WebGLConst.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, WebGLConst.RGB, WebGLConst.RGB, WebGLConst.UNSIGNED_BYTE, pz);
        g.texImage2D(WebGLConst.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, WebGLConst.RGB, WebGLConst.RGB, WebGLConst.UNSIGNED_BYTE, nz);

        // g.texImage2D(WebGLConst.TEXTURE_CUBE_MAP, 0, WebGLConst.RGBA, WebGLConst.RGBA, WebGLConst.UNSIGNED_BYTE, data);
        // }else{
        //     g.texImage2D(WebGLConst.TEXTURE_CUBE_MAP_POSITIVE_X, 0,WebGLConst.RGBA,this.width,this.height,0,WebGLConst.RGBA,WebGLConst.UNSIGNED_BYTE,undefined);
        //     g.texImage2D(WebGLConst.TEXTURE_CUBE_MAP_NEGATIVE_X, 0,WebGLConst.RGBA,this.width,this.height,0,WebGLConst.RGBA,WebGLConst.UNSIGNED_BYTE,undefined);
        //     g.texImage2D(WebGLConst.TEXTURE_CUBE_MAP_POSITIVE_Y, 0,WebGLConst.RGBA,this.width,this.height,0,WebGLConst.RGBA,WebGLConst.UNSIGNED_BYTE,undefined);
        //     g.texImage2D(WebGLConst.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0,WebGLConst.RGBA,this.width,this.height,0,WebGLConst.RGBA,WebGLConst.UNSIGNED_BYTE,undefined);
        //     g.texImage2D(WebGLConst.TEXTURE_CUBE_MAP_POSITIVE_Z, 0,WebGLConst.RGBA,this.width,this.height,0,WebGLConst.RGBA,WebGLConst.UNSIGNED_BYTE,undefined);
        //     g.texImage2D(WebGLConst.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0,WebGLConst.RGBA,this.width,this.height,0,WebGLConst.RGBA,WebGLConst.UNSIGNED_BYTE,undefined);

        //     // g.texImage2D(WebGLConst.TEXTURE_CUBE_MAP,0,WebGLConst.RGBA,this.width,this.height,0,WebGLConst.RGBA,WebGLConst.UNSIGNED_BYTE,undefined);
        // }


        //  createmipmap  limit:power of two

        if (textureData.mipmap) {
            g.generateMipmap(WebGLConst.TEXTURE_CUBE_MAP);
        }

        g.bindTexture(WebGLConst.TEXTURE_CUBE_MAP, null);

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
        g.bindTexture(WebGLConst.TEXTURE_CUBE_MAP, this.texture);
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
