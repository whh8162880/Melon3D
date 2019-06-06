import { Transform } from "./Transform";

    export class DisplayObject extends Transform{

        parent:DisplayObject;

        _alpha = 1.0;
        sceneAlpha = 1.0;

        invSceneMatrix : IMatrix3D;

        constructor(){
            super();
        }


        updateSceneTransform(updateStatus = 0,parentSceneTransform?:IMatrix3D) {
            super.updateSceneTransform(updateStatus,parentSceneTransform);


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

            return updateStatus;
        }
        
    }