export class Material {
    cull = WebGLConst.NONE;
    srcFactor = WebGLConst.SRC_ALPHA;
    dstFactor = WebGLConst.ONE_MINUS_SRC_ALPHA;
    depthMask = false;
    passCompareMode = WebGLConst.LEQUAL;
}