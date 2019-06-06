import { DisplayObject } from "./DisplayObject.js";

export class Sprite extends DisplayObject{
    
    mouseEnabled = true;
    mouseChildren = true;
    getObjectByPoint(dx: number, dy: number,scale:number): DisplayObject{
        return undefined;
    }
}