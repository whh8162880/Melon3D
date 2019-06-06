declare const enum DChange {
    trasnform = 0b1,
    alpha = trasnform << 1,
    vertex = alpha << 1,
    vcdata = vertex << 1,
    //底层transfrom改变
    ct = vcdata << 1,
    area = ct << 1,
    //底层htiArea改变
    ca = area << 1,
    c_all = (ct | ca),  
    ac = (area | ca),
    ta = (trasnform | alpha),
    batch = (vertex | vcdata),
    base = (trasnform | alpha | area | ct),
    /**
     *  自己有transform变化 或者 下层有transform变化
     */
    t_all = (trasnform | alpha | ct),
}


