import { Transform } from "./Transform.js";

export class DisplayObject extends Transform{

    parent:DisplayObject;

    _alpha = 1.0;
    sceneAlpha = 1.0;

    invSceneMatrix : IMatrix3D;

    constructor(){
        super();
    }


    updateSceneTransform(updateStatus = 0,parentSceneTransform?:IMatrix3D) {

        let{status,parent} = this;
        if(status & DChange.alpha){
            updateStatus |= DChange.alpha;
            this.status &= ~DChange.alpha;
        }

        if(updateStatus & DChange.alpha){
            if(parent){
                this.sceneAlpha = parent.sceneAlpha * this._alpha;
            }else{
                this.sceneAlpha = this._alpha;
            }
        }

        super.updateSceneTransform( updateStatus , parentSceneTransform );

        return updateStatus;
    }
    
}