import { Sprite } from "./Sprite";

export class Graphics {

    target: Sprite;
    geometry: IGeometry;

    constructor(target:Sprite){
        this.target = target;
        this.geometry = {numVertices:0,variables:target.variables} as IGeometry;
    }


    clear(){

    }



    end(){
        
    }



}