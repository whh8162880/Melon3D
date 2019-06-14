import { DisplayObject } from "./DisplayObject.js";
import { Graphics } from "./Graphics.js";
import { vertex_ui_variable } from "./stage3D/Geometry.js";

export class Sprite extends DisplayObject{

    parent:Sprite;
    stage:Sprite;
    childrens: Sprite[];
    
    mouseEnabled = true;
    mouseChildren = true;
    
    bounds:IBounds;
    nativeRender:boolean;

    $graphics:Graphics;
    variables:IVariables;

    constructor(variables?:IVariables){
        super();
        this.variables = variables || vertex_ui_variable;
    }

    get graphics(){
        let{$graphics} = this;
        if(!$graphics){
            this.$graphics = $graphics = new Graphics(this);
        }
        return $graphics;
    }

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