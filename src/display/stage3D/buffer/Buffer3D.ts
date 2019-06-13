
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

export class Buffer3D {
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








//TODO:cube texture




