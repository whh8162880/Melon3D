import { Link } from "../../core/Link";
import { VertexInfo } from "./Geometry.js";
import { VertexBuffer3D, IndexBuffer3D, Texture, RTTexture, CubeTexture, Program3D, Buffer3D } from "./Buffer3D.js";
import { recyclable, Recyclable } from "../../core/ClassUtils";
import { ThrowError } from "../../core/ThrowError";
import { BitmapData } from "../../core/BitmapData";
import { engineNow } from "../../core/Engine";
import { Size, TEMP_VECTOR3D, size_intersection } from "../../core/Geom";
import { TEMP_RECT } from "../../core/CONFIG";
import { newMatrix3D } from "../../core/Matrix3D";
import { gl } from "./Stage3D.js";


export var scissorRect:Size;
export var contextMatrix3D = newMatrix3D();
export var contextMatrix2D = newMatrix3D();
export var contextInvMatrix = newMatrix3D();

// export const enum Context3DCompareMode {
// 	ALWAYS = 'always',
// 	EQUAL = 'equal',
// 	GREATER = 'greater',
// 	GREATER_EQUAL = 'greaterEqual',
// 	LESS = 'less',
// 	LESS_EQUAL = 'lessEqual',
// 	NEVER = 'never',
// 	NOT_EQUAL = 'notEqual'
// }

export const enum Context3DTextureFormat {
	BGRA = 'bgra'
}

// export class Context3DBlendFactor {
// 	static ONE: number;
// 	static ZERO: number;

// 	static SOURCE_COLOR: number;
// 	static DESTINATION_COLOR: number;

// 	static SOURCE_ALPHA: number;
// 	static DESTINATION_ALPHA: number;

// 	static ONE_MINUS_SOURCE_COLOR: number;
// 	static ONE_MINUS_DESTINATION_COLOR: number;

// 	static ONE_MINUS_SOURCE_ALPHA: number;
// 	static ONE_MINUS_DESTINATION_ALPHA: number;

// 	static init(): void {
// 		Context3DBlendFactor.ONE = GL.ONE;
// 		Context3DBlendFactor.ZERO = GL.ZERO;
// 		Context3DBlendFactor.SOURCE_COLOR = GL.SRC_COLOR;
// 		Context3DBlendFactor.DESTINATION_COLOR = GL.DST_COLOR;
// 		Context3DBlendFactor.SOURCE_ALPHA = GL.SRC_ALPHA;
// 		Context3DBlendFactor.DESTINATION_ALPHA = GL.DST_ALPHA;
// 		Context3DBlendFactor.ONE_MINUS_SOURCE_COLOR = GL.ONE_MINUS_SRC_COLOR;
// 		Context3DBlendFactor.ONE_MINUS_DESTINATION_COLOR = GL.ONE_MINUS_DST_COLOR;
// 		Context3DBlendFactor.ONE_MINUS_SOURCE_ALPHA = GL.ONE_MINUS_SRC_ALPHA;
// 		Context3DBlendFactor.ONE_MINUS_DESTINATION_ALPHA = GL.ONE_MINUS_DST_ALPHA;
// 		//CONSTANT_COLOR
// 		//ONE_MINUS_CONSTANT_COLOR
// 		//ONE_MINUS_CONSTANT_ALPHA
// 	}
// }

export const enum Context3DVertexBufferFormat {
	BYTES_4 = 4,
	FLOAT_1 = 1,
	FLOAT_2 = 2,
	FLOAT_3 = 3,
	FLOAT_4 = 4
}

// export const enum Context3DTriangleFace {
// 	BACK = 'back', //CCW
// 	FRONT = 'front', //CW
// 	FRONT_AND_BACK = 'frontAndBack',
// 	NONE = 'none'
// }

// export const enum Context3DConst{
// 	CULL = 0b1,
// 	DEEP = CULL<<1,
// 	FACTOR = DEEP<<1
// }

export interface IContext3DSetting{
	cull:number;
	depth:boolean;
	logarithmicDepthBuffer:boolean;
	use_logdepth_ext:boolean;
	depthMode:number;
	src:number;
	dst:number;
}

export class Context3D {
	//todo:enableErrorChecking https://www.khronos.org/webgl/wiki/Debugging

	bufferLink:Link;
	triangles:number;
	dc:number;
	logarithmicDepthBuffer:boolean = true;
	use_logdepth_ext:boolean = false;
	// change:number;
	
	setting:IContext3DSetting;
	

	_clearBit: number;
	render_setting:IContext3DSetting;

	createEmptyContext3DSetting(){
		let setting = {} as IContext3DSetting;
		setting.cull = WebGLConst.NONE;
		setting.depth = true;
		setting.depthMode = WebGLConst.LEQUAL;
		setting.src = WebGLConst.SRC_ALPHA;
		setting.dst = WebGLConst.ONE_MINUS_SRC_ALPHA;
		return setting;
	}
	
	constructor() {
		this.bufferLink = new Link();
		this.bufferLink.warningMax = 3000;
		// this.bufferLink.checkSameData = false;
		// this.change = 0;
		// ROOT.on(EngineEvent.FPS_CHANGE,this.gc,this)
	}

	backBufferWidth:number;
	backBufferHeight:number;
	antiAlias:number;
	texIndex:number = 0;
	configureBackBuffer(width: number,height: number,antiAlias: number = 0,enableDepthAndStencil: boolean = true): void {


		console.log("configureBackBuffer:" + width + "  " +height);

		let g = gl;
		g.canvas.width = width;
		g.canvas.height = height;

		this.backBufferWidth = width;
		this.backBufferHeight = height;
		g.viewport(0, 0, width, height);

		this._clearBit = g.COLOR_BUFFER_BIT | g.DEPTH_BUFFER_BIT | g.STENCIL_BUFFER_BIT;

		g.disable(g.DEPTH_TEST);
		g.disable(g.CULL_FACE);
		// this._clearBit = 
		g.enable(g.BLEND);
		g.colorMask(true, true, true, true);
		
		this.setting = this.createEmptyContext3DSetting();
		this.render_setting = {} as IContext3DSetting;


		g.activeTexture(g.TEXTURE0);
		g.activeTexture(g.TEXTURE1);

		// g.frontFace(g.CW);
		// g.enable(g.BLEND);
	}


	lossScissor(rect:Size){
		let current = scissorRect;
		let g = gl;
		if(current && !rect){
			g.disable(g.SCISSOR_TEST);
		}
		scissorRect = rect;
		if(rect){
			let{y,h}=rect;
			y = Math.max(this.backBufferHeight - y - h,0);
			gl.scissor(rect.x,y,rect.w,h);
		}
	}




	setScissor(rect:Size,sceneX:number,sceneY:number){

		let current = scissorRect;

		let temp_rect = TEMP_RECT;

		let x:number;
		let y:number;
		let w:number;
		let h:number;

		if(!rect){
			if(current){
				let g = gl;
				g.disable(g.SCISSOR_TEST);
			}
		}else{

			x = rect.x;
			y = rect.y;
			w = rect.w;
			h = rect.h;

			let v = TEMP_VECTOR3D;
			v.x = sceneX - x;		//todo  这里应该是加号（+）才对
			v.y = sceneY - y;		//todo  这里应该是加号（+）才对
			v.z = 0;
			v.w = 1;
			contextMatrix2D.m3_transformVector(v,v);
			x = v.x;
			y = v.y;

			v.x = sceneX - rect.x + w;		//todo  这里应该是加号（+）才对
			v.y = sceneY - rect.y + h;		//todo  这里应该是加号（+）才对
			contextMatrix2D.m3_transformVector(v,v);
			w = v.x - x;
			h = v.y - y;

			if(!current){
				let g = gl;
				g.enable(g.SCISSOR_TEST);
				temp_rect.x = x;
				temp_rect.y = y;
				temp_rect.w = w;
				temp_rect.h = h;

			}else{
				temp_rect.x = x;
				temp_rect.y = y;
				temp_rect.w = w;
				temp_rect.h = h;
				size_intersection(current,temp_rect,temp_rect);
				x = temp_rect.x;
				y = temp_rect.y;
				w = temp_rect.w;
				h = temp_rect.h;
			}
			
			scissorRect = {x,y,w,h};


		}

		y = Math.max(this.backBufferHeight - y - h,0);
		gl.scissor(x,y,w,h);

		if(current){
			return {x:current.x,y:current.y,w:current.w,h:current.h};
		}else{
			return undefined;
		}

		
	}


	
	clear(red: number = 0.0,green: number = 0.0,blue: number = 0.0,alpha: number = 1.0,depth: number = 1.0,stencil: number /*uint*/ = 0,	mask: number /* uint */ = 0xffffffff): void {
		let g = gl;
		// g.clearColor(red, green, blue, alpha);
		// g.clearDepth(depth); // TODO:dont need to call this every time
		// g.clearStencil(stencil); //stencil buffer
		g.clear(this._clearBit);
	}

	
	updateSetting(render_setting:IContext3DSetting){
		let g = gl;
		const{cull,depth,depthMode,src,dst}=this.setting;


		//剔除这个 暂时不用
		if(cull != render_setting.cull){
			if(cull == 0){
				g.disable(g.CULL_FACE);
			}else{
				g.enable(g.CULL_FACE);
				g.cullFace(cull);
			}
			render_setting.cull = cull;
		}


		if(depth != render_setting.depth || depthMode != render_setting.depthMode){
			// depthMode:
			// gl.NEVER（永不通过）
			// gl.LESS（如果传入值小于深度缓冲值，则通过）
			// gl.EQUAL（如果传入值等于深度缓冲区值，则通过）
			// gl.LEQUAL（如果传入值小于或等于深度缓冲区值，则通过）
			// gl.GREATER（如果传入值大于深度缓冲区值，则通过）
			// gl.NOTEQUAL（如果传入的值不等于深度缓冲区值，则通过）
			// gl.GEQUAL（如果传入值大于或等于深度缓冲区值，则通过）
			// gl.ALWAYS（总是通过）
			render_setting.depth = depth;
			render_setting.depthMode = depthMode;
			if(depth == false && render_setting.depthMode == g.ALWAYS){
				g.disable(g.DEPTH_TEST);
				g.depthMask(depth);
				g.depthFunc(depthMode);
			}else{
				g.enable(g.DEPTH_TEST);
				g.depthMask(depth);
				g.depthFunc(depthMode);
			}
		}

		if(src != render_setting.src || dst != render_setting.dst){
			render_setting.src = src;
			render_setting.dst = dst;
			g.blendFunc(src, dst);
		}
	}


	// cull:number;
	// setCulling(cull: number): void {
	// 	if(this.cull == cull){
	// 		return;
	// 	}
	// 	this.cull = cull;
	// 	this.change |= Context3DConst.CULL;
	// }

	/**
	 * 
	 * @param depthMask 
	 * @param passCompareMode 
	 * 
	 * 
	 * @constant Context3DCompareMode.LESS=GL.LESS
	 * @constant Context3DCompareMode.NEVER=GL.NEVER
	 * @constant Context3DCompareMode.EQUAL=GL.EQUAL
	 * @constant Context3DCompareMode.GREATER=GL.GREATER
	 * @constant Context3DCompareMode.NOT_EQUAL=GL.NOTEQUAL
	 * @constant Context3DCompareMode.ALWAYS=GL.ALWAYS
	 * @constant Context3DCompareMode.LESS_EQUAL=GL.LEQUAL
	 * @constant Context3DCompareMode.GREATER_EQUAL=L.GEQUAL
	 */
	// depthMask:boolean;
	// passCompareMode:number;
	// setDepthTest(depthMask: boolean, passCompareMode: number): void {

	// 	if(this.depthMask == depthMask && this.passCompareMode == passCompareMode){
	// 		return;
	// 	}
	// 	this.depthMask = depthMask;
	// 	this.passCompareMode = passCompareMode;
	// 	this.change |= Context3DConst.DEEP;
	// }


	/**
		Context3DBlendFactor.ONE = GL.ONE;
		Context3DBlendFactor.ZERO = GL.ZERO;
		Context3DBlendFactor.SOURCE_COLOR = GL.SRC_COLOR;
		Context3DBlendFactor.DESTINATION_COLOR = GL.DST_COLOR;
		Context3DBlendFactor.SOURCE_ALPHA = GL.SRC_ALPHA;
		Context3DBlendFactor.DESTINATION_ALPHA = GL.DST_ALPHA;
		Context3DBlendFactor.ONE_MINUS_SOURCE_COLOR = GL.ONE_MINUS_SRC_COLOR;
		Context3DBlendFactor.ONE_MINUS_DESTINATION_COLOR = GL.ONE_MINUS_DST_COLOR;
		Context3DBlendFactor.ONE_MINUS_SOURCE_ALPHA = GL.ONE_MINUS_SRC_ALPHA;
		Context3DBlendFactor.ONE_MINUS_DESTINATION_ALPHA = GL.ONE_MINUS_DST_ALPHA;
		*/
	// sourceFactor:number;
	// destinationFactor:number;
	// setBlendFactors(sourceFactor: number, destinationFactor: number): void {
	// 	if(this.sourceFactor == sourceFactor && this.destinationFactor == destinationFactor){
	// 		return;
	// 	}
	// 	this.sourceFactor = sourceFactor;
	// 	this.destinationFactor = destinationFactor;
		
	// 	this.change |= Context3DConst.FACTOR;
	// }


	attribarray:{[key:string]:boolean} = {};

	createVertexBuffer(data: number[] | Float32Array | VertexInfo, data32PerVertex: number = -1, startVertex: number = 0, numVertices: number = -1,CLS?:{new ():VertexBuffer3D}) {
		if(!CLS){
			CLS = VertexBuffer3D;
		}
		let buffer = recyclable(CLS);
		if(data instanceof VertexInfo){
			buffer.data32PerVertex = data.data32PerVertex;
		}else{
			if(data32PerVertex == -1){
				ThrowError("mast set data32PerVertex")
				return null;
			}
			buffer.data32PerVertex = data32PerVertex;
		}
		buffer.uploadFromVector(data, startVertex, numVertices);
		return buffer;
	}

	// private indexs: { [key: number]: IndexBuffer3D };
	indexByte:IndexBuffer3D;

	getIndexByQuad(quadCount: number): IndexBuffer3D {
		let count = 10000;
		if (quadCount > count) {
			ThrowError("你要这么多四边形干嘛？");
			return null;
		}

		// if (undefined == this.indexs) {
		// 	this.indexs = {};
		// }
		// let buffer = this.indexs[quadCount];
		// let length = quadCount * 6;
		// if (undefined == buffer) {

			// let array = new Uint16Array(length)

		if (undefined == this.indexByte) {
			let byte = new Uint16Array(count * 6);
			count *= 4;
			let j = 0;
			for (var i: number = 0; i < count; i += 4) {
				byte[j++] = i;
				byte[j++] = i + 1;
				byte[j++] = i + 3;
				byte[j++] = i + 1;
				byte[j++] = i + 2;
				byte[j++] = i + 3;
			}
			this.indexByte = this.createIndexBuffer(byte);
		}

		return this.indexByte;
			// array.set(this.indexByte.slice(0, length));
			// this.indexs[quadCount] = buffer = this.createIndexBuffer(array);
		// }
		// return buffer;
	}

	createIndexBuffer(data: number[] | Uint16Array | ArrayBuffer): IndexBuffer3D {
		let buffer = recyclable(IndexBuffer3D);
		if(data instanceof ArrayBuffer){
			buffer.uploadFromVector(new Uint16Array(data));
		}else{
			buffer.uploadFromVector(data);
		}
		return buffer
	}

	defauleMag:number = WebGLConst.NEAREST

	getTextureData(url:string,mipmap?:boolean,mag?:number,mix?:number,repeat?:number,y?:boolean){
		let{defauleMag} = this;
		let data = {} as ITextureData;
		data.url = url;
		data.mipmap = undefined != mipmap ? mipmap : false;
		data.mag = undefined != mag ? mag : defauleMag;
		data.mix = undefined != mix ? mix : defauleMag;
		data.repeat = undefined != repeat ? repeat : WebGLConst.CLAMP_TO_EDGE;
		return data;
	}



	textureObj:{[key:string]:Texture} = {};

	createTexture(key:ITextureData,pixels?: ImageBitmap | ImageData | HTMLVideoElement | HTMLImageElement | HTMLCanvasElement | BitmapData): Texture {
		let texture = recyclable(Texture);
		texture.key = key.key ? key.key : (key.key = `${key.url}_${key.mipmap}_${key.mag}_${key.mix}_${key.repeat}`);
		texture.data = key;
		texture.pixels = pixels;
		
		if(pixels){
			texture.width = pixels.width;
			texture.height = pixels.height;
		}
		
		this.textureObj[key.key] = texture;
		return texture;
	}

	createEmptyTexture(key:ITextureData,width: number, height: number): Texture {
		let texture = recyclable(Texture);
		texture.key = key.key ? key.key : (key.key = `${key.url}_${key.mipmap}_${key.mag}_${key.mix}_${key.repeat}`);
		texture.data = key;
		texture.width = width;
		texture.height = height;
		this.textureObj[key.key] = texture;
		return texture;
	}


	createRttTexture(key:ITextureData,width: number, height: number): RTTexture {
		let texture = new RTTexture();
		texture.key = key.key ? key.key : (key.key = `${key.url}_${key.mipmap}_${key.mag}_${key.mix}_${key.repeat}`);
		texture.data = key;
		texture.width = width;
		texture.height = height;
		this.textureObj[key.key] = texture;
		return texture;
	}

	createCubeTexture(key:ITextureData): CubeTexture {
		let texture = new CubeTexture();
		texture.key = key.key ? key.key : (key.key = `${key.url}_${key.mipmap}_${key.mag}_${key.mix}_${key.repeat}`);
		texture.data = key;
		// texture.width = width;
		// texture.height = height;
		this.textureObj[key.key] = texture;
		return texture;
	}



	rttTextures:RTTexture[] = [];

	setRenderToTexture(texture:RTTexture,enableDepthAndStencil: boolean = true,antiAlias: number = 0,surfaceSelector: number /*int*/ = 0,colorOutputIndex: number /*int*/ = 0){
		let g = gl;

		this.rttTextures.push(texture);

		if(!texture.readly){
			if(false == texture.awaken()){
				return;
			}
		}

		let{frameBuffer,renderBuffer,texture:textureObj,width,height,cleanColor} = texture;
		g.viewport(0,0,width,height);
		g.bindFramebuffer(g.FRAMEBUFFER,frameBuffer);

		if (enableDepthAndStencil) {
			texture.cleanBit = g.COLOR_BUFFER_BIT | g.DEPTH_BUFFER_BIT | g.STENCIL_BUFFER_BIT;
		} else {
			texture.cleanBit = g.COLOR_BUFFER_BIT | g.DEPTH_BUFFER_BIT | g.STENCIL_BUFFER_BIT;
		}

		texture.setting.src = -1;

		if(cleanColor){
			g.clearColor(cleanColor.x,cleanColor.y,cleanColor.z,cleanColor.w);
		}else{
			g.clearColor(0,0,0,0);
		}

		texture.preusetime = engineNow;


		g.clear(texture.cleanBit);
		
		
	}
	
	setRenderToBackBuffer(): void {
		let g = gl;
		let {rttTextures,render_setting} = this;
		rttTextures.pop();

		let texture = rttTextures[rttTextures.length - 1];
		if(texture){
			let{frameBuffer,width,height}=texture;
			g.bindFramebuffer(g.FRAMEBUFFER, frameBuffer);
			g.viewport(0,0,width,height);
		}else{
			let{backBufferWidth,backBufferHeight}=this;
			g.bindFramebuffer(g.FRAMEBUFFER, null);
			g.viewport(0,0,backBufferWidth,backBufferHeight);
		}

		
		
		render_setting.cull = 0;
		render_setting.depth = false;
		render_setting.depthMode = 0;
		render_setting.src = 0;
		render_setting.dst = 0;
		
	}

	programs: { [key: string]: Recyclable<Program3D> } = {};

	createProgram(vertexCode: string, fragmentCode: string, key?: string): Recyclable<Program3D> {
		var program: Recyclable<Program3D>
		if (undefined != key) {
			program = this.programs[key];
			if (undefined == program) {
				this.programs[key] = program = recyclable(Program3D);
			}
		} else {
			program = recyclable(Program3D);
		}
		program.vertexCode = vertexCode;
		program.fragmentCode = fragmentCode;
		return program;
	}

	/**
	 * 
	 * @param variable 
	 * @param data 
	 * @param format FLOAT_1 2 3 4
	 */
	setProgramConstantsFromVector(variable: string, data: number | number[] | Float32Array | ArrayLike<number>, format: number,array:boolean = true,numstr:string = "f"): void {
		let p = this.cProgram;
		let uniforms = p.uniforms;
		let g = gl;
		var index;
		if(true == (variable in uniforms)){
			index = uniforms[variable];
		}else{
			index = g.getUniformLocation(p.program, variable);
			uniforms[variable] = index;
		}

		if (undefined != index) {
			if(array){
				g['uniform' + format + numstr+'v'](index, data);
			}else{
				g['uniform' + format + numstr](index, data);
			}
			
		}
	}

	/**
	*  @variable must predefined in glsl
	*/
	setProgramConstantsFromMatrix(variable: string, rawData: ArrayLike<number>): void {
		let p = this.cProgram;
		let uniforms = p.uniforms;
		let g = gl;
		var index;
		if(true == (variable in uniforms)){
			index = uniforms[variable];
		}else{
			index = g.getUniformLocation(p.program, variable);
			uniforms[variable] = index;
		}
		if (undefined != index) {
			g.uniformMatrix4fv(index, false, rawData as Float32Array);
		}
	}

	cProgram: Program3D;
	setProgram(program: Program3D) {
		if (!program) return 

		program.preusetime = engineNow;

		if (false == program.readly) {
			if (false == program.awaken()) {
				ThrowError("program create error!");
				return -1;
			}
		}else{
			if(program == this.cProgram) return 1;
		}

		this.cProgram = program;
		gl.useProgram(program.program);
		return 0;
	}


	drawTriangles(indexBuffer: IndexBuffer3D, numTriangles:number,setting?:IContext3DSetting,offset = 0): void {
		let g = gl;
		this.updateSetting(setting || this.render_setting);
		if(undefined != indexBuffer){
			if (false == indexBuffer.readly) {
				if (false == indexBuffer.awaken()) {
					throw new Error("create indexBuffer error!");
				}
			}
			indexBuffer.preusetime = engineNow;
			// g.drawArrays(g.TRIANGLES,0,numTriangles)
			g.bindBuffer(g.ELEMENT_ARRAY_BUFFER, indexBuffer.buffer);
			g.drawElements(g.TRIANGLES, numTriangles * 3, g.UNSIGNED_SHORT, offset * 6);
		}else{
			g.drawArrays(g.TRIANGLES,0,numTriangles * 3);
		}
		
		this.triangles += numTriangles;
		this.dc ++;

		// while(this.texIndex > 1){
		// 	this.texIndex -- ;
		// 	gl.texture
		// }
		// g.activeTexture(g.TEXTURE0);

		this.texIndex = 0;
	}


	/*
		*  [Webgl only]
		*   For instance indices = [1,3,0,4,1,2]; will draw 3 lines :
		*   from vertex number 1 to vertex number 3, from vertex number 0 to vertex number 4, from vertex number 1 to vertex number 2
		*/
	// drawLines(indexBuffer: IndexBuffer3D, numTriangles:number, firstIndex: number = 0, numLines: number = -1): void {
	// 	if(this.change){
	// 		this.updateSetting();
	// 	}

	// 	if(undefined != indexBuffer){
	// 		if (false == indexBuffer.readly) {
	// 			if (false == indexBuffer.awaken()) {
	// 				throw new Error("create indexBuffer error!");
	// 			}
	// 		}
	// 		indexBuffer.preusetime = engineNow;
	// 		let g = gl;
	// 		g.bindBuffer(g.ELEMENT_ARRAY_BUFFER, indexBuffer.buffer);
	// 		g.drawElements(g.LINES, numTriangles < 0 ? indexBuffer.numIndices : numTriangles * 3, g.UNSIGNED_SHORT, firstIndex * 2);
	// 	}

	// 	this.triangles += numTriangles;
	// 	this.dc ++;
	// }

	// /*
	//  * [Webgl only]
	//  *  For instance indices = [1,2,3] ; will only render vertices number 1, number 2, and number 3 
	//  */
	// drawPoints(indexBuffer: IndexBuffer3D, firstIndex: number = 0, numPoints: number = -1): void {
	// 	if (false == indexBuffer.readly) {
	// 		if (false == indexBuffer.awaken()) {
	// 			throw new Error("create indexBuffer error!");
	// 		}
	// 	}
	// 	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer.buffer);
	// 	gl.drawElements(gl.POINTS, numPoints < 0 ? indexBuffer.numIndices : numPoints, gl.UNSIGNED_SHORT, firstIndex * 2);
	// }

	// /**
	//  * [Webgl only]
	//  * draws a closed loop connecting the vertices defined in the indexBuffer to the next one
	//  */
	// drawLineLoop(indexBuffer: IndexBuffer3D, firstIndex: number = 0, numPoints: number = -1): void {
	// 	if (false == indexBuffer.readly) {
	// 		if (false == indexBuffer.awaken()) {
	// 			throw new Error("create indexBuffer error!");
	// 		}
	// 	}
	// 	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer.buffer);
	// 	gl.drawElements(gl.LINE_LOOP, numPoints < 0 ? indexBuffer.numIndices : numPoints, gl.UNSIGNED_SHORT, firstIndex * 2);
	// }

	// /**
	//  * [Webgl only]
	//  * It is similar to drawLineLoop(). The difference here is that WebGL does not connect the last vertex to the first one (not a closed loop).
	//  */
	// drawLineStrip(indexBuffer: IndexBuffer3D, firstIndex: number = 0, numPoints: number = -1): void {
	// 	if (false == indexBuffer.readly) {
	// 		if (false == indexBuffer.awaken()) {
	// 			throw new Error("create indexBuffer error!");
	// 		}
	// 	}
	// 	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer.buffer);
	// 	gl.drawElements(
	// 		gl.LINE_STRIP,
	// 		numPoints < 0 ? indexBuffer.numIndices : numPoints,
	// 		gl.UNSIGNED_SHORT,
	// 		firstIndex * 2
	// 	);
	// }

	// /**
	// * [Webgl only]
	// *  indices = [0, 1, 2, 3, 4];, then we will generate the triangles:(0, 1, 2), (1, 2, 3), and(2, 3, 4).
	// */
	// drawTriangleStrip(indexBuffer: IndexBuffer3D): void {
	// 	if (false == indexBuffer.readly) {
	// 		if (false == indexBuffer.awaken()) {
	// 			throw new Error("create indexBuffer error!");
	// 		}
	// 	}
	// 	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer.buffer);
	// 	gl.drawElements(gl.TRIANGLE_STRIP, indexBuffer.numIndices, gl.UNSIGNED_SHORT, 0);
	// }

	// /**
	//  * [Webgl only]
	//  * creates triangles in a similar way to drawTriangleStrip(). 
	//  * However, the first vertex defined in the indexBuffer is taken as the origin of the fan(the only shared vertex among consecutive triangles).
	//  * In our example, indices = [0, 1, 2, 3, 4]; will create the triangles: (0, 1, 2) and(0, 3, 4).
	//  */
	// drawTriangleFan(indexBuffer: IndexBuffer3D): void {
	// 	if (false == indexBuffer.readly) {
	// 		if (false == indexBuffer.awaken()) {
	// 			throw new Error("create indexBuffer error!");
	// 		}
	// 	}
	// 	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer.buffer);
	// 	gl.drawElements(gl.TRIANGLE_FAN, indexBuffer.numIndices, gl.UNSIGNED_SHORT, 0);
	// }

	/**
	*   In webgl we dont need to call present , browser will do this for us.
	*/
	// present(): void { }

	// private enableTex(keyInCache): void {
	// 	var tex: Texture = this._texCache[keyInCache];
	// 	gl.activeTexture(gl['TEXTURE' + tex.textureUnit]);

	// 	gl.TEXTURE31\
	// 	var l: WebGLUniformLocation = gl.getUniformLocation(this._linkedProgram.program, keyInCache);
	// 	gl.uniform1i(l, tex.textureUnit); // TODO:multiple textures
	// }

	gc(now:number){
		let link = this.bufferLink;
		let vo = link.getFrist();
		var hasChange = false
		while(vo){
			if(false == vo.close){
				let buffer:Recyclable<Buffer3D> = vo.data;
				if(now - buffer.preusetime > buffer.gctime){
					buffer.recycle();
					vo.close = true;
					hasChange = true;
				}
			}
			vo = vo.next;
		}
		if(hasChange) link.clean();
	}


	toString():string{
		let link = this.bufferLink;
		let vo = link.getFrist();
		let v=0,t=0,p=0,i=0;
		while(vo){
			if(false == vo.close){
				let buffer:Recyclable<Buffer3D> = vo.data;
				if(buffer instanceof VertexBuffer3D){
					v ++;
				}else if(buffer instanceof IndexBuffer3D){
					i ++;
				}else if(buffer instanceof Texture){
					t ++;
				}else if(buffer instanceof Program3D){
					p ++;
				}
			}
			vo = vo.next;
		}
		return `p:${p} i:${i} v:${v} t:${t}`;
	}
}


/**
 * todo
 */
export function webGLSimpleReport(): Object {
	//http://webglreport.com/

	// Vertex Shader
	// Max Vertex Attributes:
	// Max Vertex Uniform Vectors:
	// Max Vertex Texture Image Units:
	// Max Varying Vectors:

	let g = gl;

	g.getParameter(g.MAX_VERTEX_ATTRIBS);
	g.getParameter(g.MAX_VERTEX_UNIFORM_VECTORS);
	g.getParameter(g.MAX_FRAGMENT_UNIFORM_VECTORS);
	g.getParameter(g.MAX_VARYING_VECTORS);
	g.getParameter(g.MAX_TEXTURE_IMAGE_UNITS);



	// Fragment Shader
	// Max Fragment Uniform Vectors:
	// Max Texture Image Units:
	// float/int precision:highp/highp



	return {};
}
