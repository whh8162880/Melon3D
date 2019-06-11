declare const enum DChange {
    trasnform = 0b1,
    HIT_AREA = trasnform << 1,
    alpha = HIT_AREA << 1,

    vertex = alpha << 1,

    //底层transfrom改变 child transform = ct;
    CHILD_TRANSFROM = vertex << 1,
    //底层htiArea改变
    CHILD_HITAREA = CHILD_TRANSFROM << 1,
    //底层Alpha变化
    CHILD_ALPHA = CHILD_HITAREA << 1,

    CHILD_ALL = (CHILD_TRANSFROM | CHILD_ALPHA),  
    // ac = (area | ca),
    // ta = (trasnform | alpha),
    // batch = vertex,
    // base = (trasnform | alpha | area | ct),
    /**
     *  自己有transform变化 或者 下层有transform变化
     */
    // t_all = (trasnform | alpha | ct),
}


