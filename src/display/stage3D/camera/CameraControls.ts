module rf{
    export class TrackballControls{
        object:Camera;
        target:IVector3D;
        mouseSitivity:number = 0.3;
        distance:number;
        lock:boolean = true;
        up_axis:IVector3D;
        constructor(object:Camera, up_axis?:IVector3D){
            this.object = object;
            this.target = newVector3D();
            
            this.up_axis = up_axis || Y_AXIS;

            this.distance = this.object.pos.v3_sub(this.target).v3_length;
            // scene.on(MouseEventX.MouseDown,this.mouseDownHandler,this);
            // scene.on(MouseEventX.MouseWheel,this.mouseWheelHandler,this);
            // scene.on(MouseEventX.MouseRightDown,this.mouseRightDownHandler,this);

            this.updateSun();
        }

        updateSun(){
            // const{object,target}=this;
            // let sun = scene.sun;
            // sun.x = object._x - target.x;
            // sun.y = object._y - target.y;
            // sun.z = object._z - target.z;
        }

        set tdistance(value:number){
            // console.log(value);
            this.distance = value;
            this.object.forwardPos(value,this.target);
        }

        get tdistance():number{
            return this.distance;
        }


        tweener:ITweener;

        mouseWheelHandler(event:EventX){
           
            // const{distance} = this;

            let distance = this.object.pos.v3_sub(this.target).v3_length;
            this.distance = distance;

            let{wheel}=event.data;
            let step = 1;
            if(Math.abs(wheel) < 5000 && distance<5000){
                step = distance / 5000;
            }

            wheel *= step;

            let{tweener}=this;
            if(tweener){
                tweenStop(tweener);
            }
            this.tweener = tweenTo({tdistance: distance+wheel*2},Math.abs(wheel)*2,defaultTimeMixer,this);
            
            // this.object.z += e.deltaY > 0 ? 1: -1
            // this.distance = this.object.pos.subtract(this.target).length;
        }

        mouseDownHandler(event:EventX){
            ROOT.on(MouseEventX.MouseMove,this.mouseMoveHandler,this);
            ROOT.on(MouseEventX.MouseUp,this.mouseUpHandler,this);
            this.distance = this.object.pos.v3_sub(this.target).v3_length;
        }

        mouseUpHandler(e:EventX){
            ROOT.off(MouseEventX.MouseMove,this.mouseMoveHandler,this);
            ROOT.off(MouseEventX.MouseUp,this.mouseUpHandler,this);
        }

        mouseMoveHandler(e:EventX){
            const{object,target,mouseSitivity,distance}=this;
            const{ox,oy}=e.data
            // let dx:number = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            // let dy:number = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
            // dx *= pixelRatio;
            // dy *= pixelRatio;

            let speed = (distance > 1000) ? mouseSitivity : mouseSitivity * distance / 1000;
            speed = Math.max(speed,0.1);

            let r0 = 0;
            let r1 = 0;


            
            if(this.lock){
                var transform:IMatrix3D = TEMP_MATRIX3D;
                transform.m3_identity();
                transform.m3_translation(0, 0, -distance);

                

                if(this.up_axis[1] == 1){

                    r0 = object.rotationX + oy*speed;
                    r1 = object.rotationY + ox*speed;

                    transform.m3_rotation(r0 * DEGREES_TO_RADIANS,X_AXIS);
                    transform.m3_rotation(r1 * DEGREES_TO_RADIANS,Y_AXIS);
                    transform.m3_rotation(-object._rotationZ, Z_AXIS);
                }else if(this.up_axis[2] == 1){
                    r0 = object.rotationX + oy*speed;
                    r1 = object.rotationZ + ox*speed;

                    transform.m3_rotation(r0 * DEGREES_TO_RADIANS,X_AXIS);
                    transform.m3_rotation(-object._rotationY, Y_AXIS);
                    transform.m3_rotation(r1 * DEGREES_TO_RADIANS,Z_AXIS);
                }
                
				transform.m3_translation(target.x, target.y, target.z);
                object.setPos(transform[12],transform[13],transform[14]);
            }else{
                if(this.up_axis[1] == 1){
                    r0 = object.rotationX + oy*speed;
                    r1 = object.rotationY + ox*speed;
                }else if(this.up_axis[2] == 1){
                    r0 = object.rotationX + oy*speed;
                    r1 = object.rotationZ + ox*speed;
                }

                
            }

            if(this.up_axis[1] == 1){
                object.rotationX = r0;
                object.rotationY = r1;
            }else if(this.up_axis[2] == 1){
                object.rotationX = r0;
                object.rotationZ = r1;
            }
            
            this.updateSun();
        }



        mouseRightDownHandler(event:EventX){
            ROOT.on(MouseEventX.MouseMove,this.mouseRightMoveHandler,this);
            ROOT.on(MouseEventX.MouseRightUp,this.mouseRightUpHandler,this);
        }


        mouseRightMoveHandler(event:EventX){
            let{ox,oy}=event.data;
            const{object,target}=this;
            oy *= (this.distance / object.originFar);

            if(this.up_axis[1] == 1){
                target.y += oy;
            }else if(this.up_axis[2] == 1){
                target.z += oy;
            }

            object.lookat(target, this.up_axis);
            // object.setPos(object._x,object._y += oy ,object._z);
            // object.status = 1;

            this.updateSun();
            

        }

        mouseRightUpHandler(event:EventX){
            ROOT.off(MouseEventX.MouseMove,this.mouseRightMoveHandler,this);
            ROOT.off(MouseEventX.MouseRightUp,this.mouseRightUpHandler,this);
        }

        
    }
}
