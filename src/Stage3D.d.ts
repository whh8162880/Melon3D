declare module rf{
    interface IShaderSetting{
        skey:string;
        useEye?:boolean;
        usePos?:boolean;
        useQua2mat?:boolean;
        useNormal?:boolean;
        useColor?:boolean;
        useShadow?:boolean;
        useInvm?:boolean;
    }

    interface IBounds{
        max : IVector3D;
        min : IVector3D;
        center : IVector3D;
    }


    interface IMeshData{
        vertex:Float32Array;
        variables:{ [key: string]: IVariable };
        numVertices:number;
        numTriangles:number;
        data32PerVertex:number;
        vertexBuffer:VertexBuffer3D;
        bounds:IBounds;

        nameLabelY?:number;
        index?:Uint16Array;
        indexBuffer?:IndexBuffer3D;
    }

    interface ITextureData{
        key:string;
        url:string;
        mipmap:boolean;
        mag:number;
        mix:number;
        repeat:number;
    }
}