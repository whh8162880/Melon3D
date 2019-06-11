import { App } from "./App.js";
import { context3D } from "./display/stage3D/Stage3D.js";
import { VertexInfo } from "./display/stage3D/Geometry.js";
import { stageWidth, stageHeight, Engine } from "./core/Engine.js";

export class Main extends App{
    init(canvas:HTMLCanvasElement){
        super.init(canvas);

        Engine.start();

        let config = wx.getSystemInfoSync();



        context3D.configureBackBuffer(config.screenWidth,config.screenHeight);
        let vertex = [
            -1,1,
            1,1,
            1,-1,
            -1,-1
        ]

        let vertexInfo = new VertexInfo(vertex,2,{"pos":{size:2,offset:0},"data32PerVertex":{size:2,offset:0}})

        let vertexBuffer = context3D.createVertexBuffer(vertexInfo,2);


        let vs = `
            uniform vec2 pos;
            void main(){
                gl_Position = vec4(pos,0.0,0.0);
            }
        `

        let fs = `
            void main(){
                gl_FragColor = vec4(1.0,1.0,0.0,1.0);
            }
        `

        context3D.clear();
        let program = context3D.createProgram(vs,fs);
        context3D.setProgram(program);
        vertexBuffer.uploadContext(program);
        context3D.drawTriangles(context3D.getIndexByQuad(1),2)



        // let root = new Transform();
        // let child = new Transform();


        // root.addChild(child);
        // this.addChild(root);

        // child.x = 100;

        // this.updateSceneTransform();
    }
}