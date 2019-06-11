import { EventHandler, MiniDispatcher, EventX, IEventDispatcherX } from "./MiniDispatcher.js";
import { Link } from "./Link.js";
import { FILE_ROOT } from "./CONFIG.js";
import { engineNow } from "./Engine.js";
import { byte_inflate, amf_readObject } from "./AMF3.js";

export var HTTP_REPOSITORY:{[key:string]:Loader} = {};

export type LoaderType = new(perfix:string,url:string) => Loader;

export interface IResHandler {
    complete: EventHandler;
    thisObj: any;
}

export class Loader extends MiniDispatcher{
    status:LoadStates = LoadStates.WAIT;
    option:wx.IHttpOption;
    
    byte:number;

    loadUseTime:number;
    disposeTime:number;

    lastActiveTime:number;
    requstTimes:number;

    data:any;

    url:string;
    perfix:string;

    

    completeLink:Link;

    constructor(perfix:string,url:string,dataType:wx.HttpResponseType = wx.HttpResponseType.ARRAY_BUFFER,method:wx.HttpMethod = wx.HttpMethod.GET){
        super();

        HTTP_REPOSITORY[url] = this;
        
        let option:wx.IHttpOption;
        this.option = option = {} as wx.IHttpOption;

        this.url = url;
        this.perfix = perfix;

        url = url.replace(perfix,"");

        option.url = perfix + url;
        option.responseType = dataType;
        option.method = method;
        this.initOption(option);

        this.requstTimes = 0;
        this.completeLink = new Link();

    }


    accessSync(url:string){
        let file = FILE_ROOT.resolvePath(url);
        if(file.exists){
            
            return true;
        }
    }


    initOption(option:wx.IHttpOption){
        
    }

    load(){
        let{option} = this;
        if(option.method == wx.HttpMethod.GET){
            if(FILE_ROOT && this.accessSync(option.url) == true){
                //本地加载
                return;
            }
        }
        this.loadUseTime = engineNow;
        this.status = LoadStates.LOADING;
        this.doLoad(option);
    }

    doLoad(option:wx.IHttpOption){
        option.complete = this.preComplete.bind(this);
        wx.request(option);
    }


    complete(res:wx.IHttpData){
        this.data = res.data;
        
        let {statusCode,data} = res;

        let event = EventX.TEMP;
        event.currentTarget = this;

        if(statusCode >= 400 || statusCode == 0){
            this.status = LoadStates.FAILED;
            event.type = EventT.FAILED;
            event.data = undefined;
            
            console.log(`loadError ${this.perfix} ${this.url}`)
            // this.simpleDispatch(EventT.FAILED);
        }else{
            this.status = LoadStates.COMPLETE;
            this.lastActiveTime = engineNow;
            event.type = EventT.COMPLETE;
            event.data = data;

            // console.log(`loadComplete ${this.perfix} ${this.url}`)
            // this.simpleDispatch(EventT.COMPLETE,data);
        }

        let completeLink = this.completeLink;

        for(let vo = completeLink.getFrist();vo;vo = vo.next){
            let{data,thisObj} = vo;
            (data as Function).call(thisObj,event);
            vo.close = true;
        }

        completeLink.clean();


        this.dispatchEvent(event);
    }



    getFileByteLength(data){
        if(data instanceof ArrayBuffer){
            return data.byteLength;
        }else if(typeof data =="string"){
            return data.length;
        }
        return 0;
    }


    preComplete(res:wx.IHttpData){


        this.loadUseTime = engineNow - this.loadUseTime;

        let{data,statusCode} = res;

        if(statusCode == 200){
            this.byte = this.getFileByteLength(data);
            this.data = res.data = this.formatData(data);
        }
        
        this.complete(res);
    }


    formatData(data:string | object | ArrayBuffer){
        return data;
    }

}

export class AMFLoader extends Loader{

    inflate:boolean;
    formatData(data:string | object | ArrayBuffer){
        if(data instanceof ArrayBuffer){
            if(this.inflate){
                data = byte_inflate(new Uint8Array(data)).buffer;
            }
            return amf_readObject(data as ArrayBuffer);
        }
        return undefined;
    }

}
export class ImageLoader extends Loader{
    doLoad(option:wx.IHttpOption){
        let image = wx.createImage();
        image.crossOrigin = "Anonymous";
        image.onload = this.onLoaded.bind(this);
        image.onerror = this.onerror.bind(this);

        //微信小游戏 要做一下本地的缓存。
        //todo
        image.src = option.url;
    }

    getFileByteLength(data:HTMLImageElement){
        data.width.toFixed
        return data.width * data.height * 4;
    }

    onLoaded(e:Event){
        let data = e.currentTarget as HTMLImageElement;
        data.onload = undefined;
        data.onerror = undefined;
        let statusCode = 200;
        this.preComplete({data,statusCode})
    }

    onerror(e:Event){
        let data = e.currentTarget as HTMLImageElement
        data.onload = undefined;
        data.onerror = undefined;
        let statusCode = 404;
        this.preComplete({data,statusCode})
    }
}

/**
     * 同一时刻最大可以同时启动的下载线程数
     */
export var http_res_max_loader: number = 5;

export var http_current_loader_count:number = 0;

export var http_load_Link:Link = new Link();

export var http_loader:{[key:number]:LoaderType} = {}

export function loadRes(perfix:string, url: string, 
    complete?: EventHandler, thisObj?: any, 
    type?: ResType | LoaderType ,priority: LoadPriority = LoadPriority.low, 
    disposeTime: number = 30000):Loader {

        if(!url){
            console.warn(`request url is empty!`);
            return;
        }

        let loader = HTTP_REPOSITORY[url];
        if(!loader){
            let CLS:{new(perfix:string,url:string):Loader};
            if(undefined == type){
                CLS = Loader;
            }else{
                if(typeof type == "number"){
                    CLS = http_loader[type];
                }else{
                    CLS = type as {new(perfix:string,url:string):Loader};
                }
            }

            if(CLS){
                loader = new CLS(perfix,url);
            }else{
                switch(type){
                    case ResType.bin:
                        loader = new Loader(perfix,url);
                    break;
                    case ResType.text:
                        loader = new Loader(perfix,url,wx.HttpResponseType.TEXT);
                    break;
                    case ResType.amf:
                        loader = new AMFLoader(perfix,url);
                    break;
                    case ResType.amf_inflate:
                        loader = new AMFLoader(perfix,url);
                        (loader as AMFLoader).inflate = true;
                    break;
                    case ResType.image:
                        loader = new ImageLoader(perfix,url);
                }
            }
            
            http_load_Link.addByWeight(loader,priority);

            loader.completeLink.add(complete,thisObj);

            if(http_current_loader_count < http_res_max_loader){
                http_load_continue();
            }


        }else{
            switch(loader.status){
                case LoadStates.WAIT:
                    http_load_Link.addByWeight(loader,priority);
                    if(http_current_loader_count < http_res_max_loader){
                        http_load_continue();
                    }
                case LoadStates.LOADING:
                    loader.completeLink.add(complete,thisObj);
                break;
                case LoadStates.COMPLETE:
                    setTimeout(() => {
                        let e = EventX.TEMP;
                        e.type = EventT.COMPLETE;
                        e.data = loader.data;
                        e.currentTarget = loader;
                        complete.call(thisObj,e);
                    }, 20);
                break;
            }
        }

        loader.requstTimes ++;

        return loader;
}


export function http_load_continue(e?:EventX){
    let link = http_load_Link;
    let max = http_res_max_loader;
    let current = http_current_loader_count;

    if(link.lock) return;

    if(e){
        current --;
    }
    
    link.lock = true;

    for(let vo = link.getFrist();vo;vo = vo.next){
        if(current < max){
            let loader = vo.data;
            if(loader){
                loader.completeLink.add(http_load_continue,loader);
                loader.load();
                current ++;
                link.removeLink(vo);
            }
        }
    }

    link.lock = false;


    http_current_loader_count = current;

    if(link.length && current < max){
        http_load_continue();
    }
}



export function getFullUrl(url:string,extension?:string):string{
    if(!url) return url;
    if(extension && url.lastIndexOf(extension) == -1) {
        url += extension;
    }

    // if (url.indexOf("://") == -1) {
    //     url = perfix + url;
    // }

    return url;
}

export interface ILoaderTask {
    name?: string;
    data?: any;
    status: LoadStates;
}

export interface LoadTask{
    // on(type: EventT.PROGRESS | EventT.COMPLETE, listener: (e: EventX) => void, thisObject: any, priority?: number): void;
    on(type: string | number, listener: (e: EventX) => void, thisObject: any, priority?: number): void;
}

export class LoadTask extends MiniDispatcher implements IRecyclable {
    queue: { [key: string]: ILoaderTask } = {};
    total: number = 0;
    progress: number = 0;

    add(perfix:string,url: string,type:ResType|LoaderType,complete?:EventHandler,thisObj?:any): Loader {
        let res = loadRes(perfix,url, this.complteHandler, this, type);

        if(undefined != complete){
            res.completeLink.addByWeight(complete,1,thisObj);
        }
        
        this.queue[url] = res;
        this.total++;
        return res;
    }

    addTask(item: ILoaderTask & IEventDispatcherX) {
        this.queue[item.name] = item;
        this.total++;
        item.on(EventT.COMPLETE, this.complteHandler, this);
        item.on(EventT.FAILED, this.complteHandler, this)
    }


    complteHandler(event: EventX): void {

        let item = event.currentTarget;
        if(item instanceof MiniDispatcher){
            item.off(EventT.COMPLETE, this.complteHandler,this);
            item.off(EventT.FAILED, this.complteHandler,this);
        }
        
        const { queue } = this;
        let completeCount = 0;
        let totalCount = 0;
        for (let key in queue) {
            let item = queue[key];
            if (item.status >= LoadStates.COMPLETE) {
                completeCount++
            }
            totalCount++;
        }

        this.progress = completeCount;
        this.total = totalCount;

        this.simpleDispatch(EventT.PROGRESS, this);

        if (completeCount == totalCount) {
            this.simpleDispatch(EventT.COMPLETE, this);
        }
    }

    onRecycle(){
        this.queue = {};
        this.progress = this.total = 0;
    }
}


export function http_gc(now:number){

}
