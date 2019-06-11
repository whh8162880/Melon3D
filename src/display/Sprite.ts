import { DisplayObject } from "./DisplayObject.js";

export class Sprite extends DisplayObject{

    parent:Sprite;
    stage:Sprite;
    childrens: Sprite[];
    
    mouseEnabled = true;
    mouseChildren = true;
    
    bounds:IBounds;
    rendeable:boolean;

    getObjectByPoint(dx: number, dy: number,scale:number): DisplayObject{
        return undefined;
    }

    setChange(value: number) {
        this.status |= value;
        let{parent} = this;
        if(!parent) return;

        let statues = parent.status;
        if(value & DChange.trasnform){
            statues |= DChange.CHILD_TRANSFROM;
        }

        if(value & DChange.HIT_AREA){
            statues |= DChange.CHILD_HITAREA;
        }

        if(value & DChange.alpha){
            statues |= DChange.CHILD_ALPHA;
        }

        if(value & DChange.vertex){
            statues |= DChange.vertex;
        }

        value = (value &= DChange.CHILD_ALL);

        parent.setChange(statues | value);
    }
}