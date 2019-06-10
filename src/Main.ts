import { App } from "./App.js";
import { Transform } from "./display/Transform.js";

export class Main extends App{
    init(canvas:HTMLCanvasElement){
        super.init(canvas);


        let root = new Transform();
        let child = new Transform();


        root.addChild(child);

        this.addChild(root);
    }
}