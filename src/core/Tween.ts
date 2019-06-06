import { Link } from "./Link.js";
import { recyclable } from "./ClassUtils.js";
import { LoadStates } from "./Http.js";
import { MiniDispatcher } from "./MiniDispatcher.js";
import { defaultTimeMixer, Engine } from "./Engine.js";
import { DEGREES_TO_RADIANS } from "./CONFIG.js";
//===========================================================================================
// Tweener
//===========================================================================================

export type EaseFunction = (t: number, b: number, c: number, d: number, ...args) => number;

export type TweenUpdateFunction = (tweener: ITweener) => void;

export interface ITweenerItem {
    k: string;   //property
    s: number;   //startValue
    e: number;   //endValue
    d: number;   //d = e - s;
    n?: number;
    ease?:EaseFunction;
}

export interface ITweener {
    caster:any;
    st: number;
    duration: number;
    l: number;
    tm: ITimeMixer;
    data: ITweenerItem[];
    ease: EaseFunction;
    update: TweenUpdateFunction;
    complete: TweenUpdateFunction;
    thisObj: any;
    completed:boolean;
}

export function ease_default(t: number, b: number, c: number, d: number): number {
    return c * t / d + b;
}

export function ease_quartic_in(t: number, b: number, c: number, d: number): number {
    return c * (t /= d) * t * t * t + b;
}
export function ease_quartic_out(t: number, b: number, c: number, d: number): number {
    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
}
export function ease_quartic_inout(t: number, b: number, c: number, d: number): number {
    if ((t /= d / 2) < 1)
        return c / 2 * t * t * t * t + b;
    return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
}

export function ease_back_in(t: number, b: number, c: number, d: number): number {
    let s = 1.70158;
    return c * (t /= d) * t * ((s + 1) * t - s) + b
}
export function ease_back_out(t: number, b: number, c: number, d: number): number {
    let s = 5;//1.70158;
    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
}
export function ease_back_inout(t: number, b: number, c: number, d: number): number {
    let s = 1.70158;
    if ((t /= d / 2) < 1)
        return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
    return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
}

export var tween_ease_function:{[key:string]:EaseFunction} = {
    "Quadratic.out":ease_quartic_out,
    "Quadratic.in":ease_quartic_in,
    "Quadratic.inout":ease_quartic_inout
}


export var tweenLink: Link = new Link();

export function tweener_createItem(eo: { [key: string]: number }, so?: { [key: string]: number},target?: any,data?:ITweenerItem[],tweener?:ITweener){
    let l = 0, e = 0, d = 0, s = 0;
    if(!data){
        data = [];
    }
    for (let k in eo) {
        if (target) {
            s = target[k];
            if (undefined != s) {
                s = (so && undefined != so[k]) ? so[k] : s;
            }else{
                s = 0;
            }
        } else {
            s = (so && undefined != so[k]) ? so[k] : 0;
        }
        e = eo[k];
        data[l++] = { k: k, s: s, e: e, d: e - s, n: 0 }
    }
    if(tweener){
        tweener.l = l;
    }
    return data;
}

export function createTweener(eo: { [key: string]: number }, duration: number, tm: ITimeMixer, target?: any, ease?: EaseFunction, so?: { [key: string]: number }) {
    let tweener = { data: [], caster: target, tm: tm, st: tm.now, ease: ease ? ease : ease_default, duration: duration } as ITweener;
    let { data } = tweener;
    tweener_createItem(eo,so,target,data,tweener);
    // let l = 0, e = 0, d = 0, s = 0;
    // for (let k in eo) {
    //     if (target) {
    //         s = target[k];
    //         if (undefined != s) {
    //             s = (so && undefined != so[k]) ? so[k] : s;
    //         }else{
    //             s = 0;
    //         }
    //     } else {
    //         s = (so && undefined != so[k]) ? so[k] : 0;
    //     }
    //     e = eo[k];
    //     data[l++] = { k: k, s: s, e: e, d: e - s, n: 0 }
    // }
    // tweener.l = l;
    return tweener;
}

export function tween_lerp_pro(a:any,b:any,n:number,pro:{[key:string]:number},ease?:EaseFunction){
    if(!ease) ease = ease_default;

    for(let key in pro){
        let s = a[key];
        let e = b[key];
        if(s === undefined || e === undefined){
            continue;
        }
        if(s != e){
            pro[key] = ease(n,s,e-s,1);
        }else{
            pro[key] = s;
        }
        
    }
}


export function tweenTo(eo: { [key: string]: number }, duration: number, tm: ITimeMixer, target?: any, ease?: EaseFunction, so?: { [key: string]: number }) {
    let tweener = createTweener(eo, duration, tm, target, ease, so);
    if (tweener.l > 0) {
        tweenLink.add(tweener);
    }
    return tweener;
}

export function tweenUpdate() {
    for (let vo = tweenLink.getFrist(); vo; vo = vo.next) {
        if (vo.close == false) {
            let tweener = vo.data as ITweener;
            const { caster, l, data, ease, tm, st, duration, update, thisObj } = tweener;
            let now = tm.now - st;
            if (now >= duration) {
                tweenEnd(tweener);
            } else {
                for (let i = 0; i < l; i++) {
                    let item = data[i];
                    const { k, s, d } = item;//data[i];
                    item.n = ease(now, s, d, duration);
                    if (caster) {
                        caster[k] = item.n;
                    }
                }
                if (undefined != update) {
                    update.call(thisObj, tweener);
                }
            }

        }
    }
}

export function tweenEnd(tweener: ITweener) {
    if(tweener.completed) return;
    const { caster, l, data, update,complete, thisObj} = tweener as ITweener;
    for (let i = 0; i < l; i++) {
        let item = data[i];
        const { k, e } = item;
        item.n = e;
        if (caster) {
            caster[k] = e;
        }
    }
    tweener.completed = true;
    if(undefined != update){
        update.call(thisObj, tweener);
    }

    if (undefined != complete) {
        complete.call(thisObj, tweener);
    }
    tweenLink.remove(tweener);
    // tweener.completed = true;
}

export function tweenStop(tweener: ITweener) {
    if(tweener.completed) return;
    tweenLink.remove(tweener);
    tweener.completed = true;
}



export let ScriptTweenIns:{[key:string]:{ new(): STweenBase }};

export function scriptTween_play(target:any,data:IPANEL_TWEEN_DATA[],tm:ITimeMixer, mx?:number, my?:number,dtype?:number, property?:any){
    let tween = recyclable(ScriptTween);
    tween.play(target,data,tm, mx, my,dtype, property);
    return tween;
}

export function random_number(num:number|number[]){
    if(num instanceof Array){
        return num[0] + Math.random() * (num[1] - num[0]);
    }
    return ~~num ? +num : 0;
}


export class STweenBase implements ITickable{
    type:string;
    target:any;
    stween:ScriptTween;
    data:IPANEL_TWEEN_DATA;
    status:LoadStates;
    ease:EaseFunction;
    tweenItems:ITweenerItem[];
    st:number;
    lifeTime:number;

    needupdate:boolean = true;

    dtype:number;
    mx:number;
    my:number;
    property:any;


    start(){
        let{type,data,target} = this;

        let eo = {};
        
        eo[type] = (undefined != data.to) ? random_number(data.to) : target[type];

        if(data.duration <= 0){
            target[type] = eo[type];
            this.complete();
        }else{
            let so = {};
            so[type] = (undefined != data.from) ? random_number(data.from) : target[type];
            this.tweenItems = tweener_createItem(eo,so);
            this.needupdate = true;
        }
    }

    update(now: number, interval: number){
        let{tweenItems,data,target,ease,st,lifeTime}=this;

        // if(!data){
        //     console.log("?");
        // }

        
        let duration = ~~data.duration;

        if(isNaN(lifeTime) || lifeTime < duration){
            this.lifeTime = lifeTime = duration;
        }
        now -= st;
        if (now >= lifeTime) {
            this.complete();
        } else {
            if(!tweenItems){
                return;
            }

            if(now > duration){
                now = duration;
            }

            let n = tweenItems.length;
            for(let i = 0;i<n;i++){
                let element = tweenItems[i];
                if(element){
                    const { k, s, d } = element;
                    target[k] = ease(now, s, d, duration);
                    // console.log(k,target[k])
                }
            }
        }
    }

    stop(){
        this.tweenItems = undefined;
        this.complete();
    }

    complete(){
        let{tweenItems,target}=this;
        if(tweenItems){
            tweenItems.forEach(element => {
                if(element){
                    const { k,e } = element;
                    target[k] = e;
                }
            });
        }
        this.status = LoadStates.COMPLETE;
        this.data = undefined;
        this.target = undefined;
        this.tweenItems = undefined;
        this.stween = undefined;
        // this.needupdate = true;
        this.lifeTime = 0;
    }
}



export class STweenPro extends STweenBase{
    start(){
        let{data,target} = this;

        let so = data.so ? data.so : {};
        let eo = data.eo ? data.eo : {};

        for(let type in so){
            if(eo[type] === undefined){
                eo[type] = target[type];
            }
        }

        for(let type in eo){
            if(so[type] === undefined){
                so[type] = target[type];
            }
        }

        if(data.duration <= 0){
            for(let type in eo){
                target[type] = eo[type];
            }

            this.complete();
        }else{
            this.tweenItems = tweener_createItem(eo,so);
        }
    }
}

export class STweenLiner extends STweenBase{
    start(){
        let{type,data,target} = this;

        let so:{x?:number,y?:number} = {};
        let eo:{x?:number,y?:number} = {};


        let degree = target.rotation;
        degree += random_number(data.degree);
        degree += ~~data.offsetDegree;
        degree *= DEGREES_TO_RADIANS;

        let len = random_number(data.len);

        so.x = target._x;
        so.y = target._y;

        eo.x = so.x + len * Math.cos(degree);
        eo.y = so.y + len * Math.sin(degree);


        if(data.duration <= 0){
            target.x = eo.x;
            target.y = eo.y;
            this.complete();
        }else{
            this.tweenItems = tweener_createItem(eo,so);
        }
    }
}

export class ScriptTween extends MiniDispatcher implements ITickable{
    target:any;
    tweens:STweenBase[];
    tm:ITimeMixer;
    
    play(target:any,data:IPANEL_TWEEN_DATA[],tm:ITimeMixer, mx?:number, my?:number,dtype?:number, property?:any){
        this.target = target;
        let{tweens} = this;
        if(!tweens){
                this.tweens = tweens = [];
        }
        this.tm = tm ? tm : defaultTimeMixer;
        let st = tm.now;

        let n = data.length;

        for(let i=0;i<n;i++){
            let element = data[i];
            let{type}=element;
            let c = ScriptTweenIns[type];
            if(c){
                let t = recyclable(c);
                t.type = type;
                t.data = element;
                t.target = target;
                t.dtype = dtype;
                t.mx = mx;
                t.my = my;
                t.property = property;
                t.status = LoadStates.WAIT;
                t.ease = tween_ease_function[element.ease] ? tween_ease_function[element.ease] : ease_default;
                t.st = st + element.time;
                t.stween = this;
                tweens.push(t);
            }
        }

        Engine.addTick(this);
        this.update(0,0);
    }

    playPro(target:any,tm:ITimeMixer,duration:number,to:{[key:string]:number},from?:{[key:string]:number},time:number = 0){
        let{tweens} = this;
        if(!tweens){
                this.tweens = tweens = [];
        }
        this.tm = tm;
        let t = recyclable(STweenPro);
        t.type = "pro";
        t.data = {so:from,eo:to,duration:duration,time:time} as IPANEL_TWEEN_DATA;
        t.target = target;
        t.status = LoadStates.WAIT;
        t.ease = ease_default;
        t.st = tm.now + time;
        t.stween = this;
        tweens.push(t);

        Engine.addTick(this);
        this.update(0,0);
        
        return t;
    }


    update(now: number, interval: number){
        let runing = 0;
        let{tweens,tm} = this;
        now = tm.now;

        let n = tweens.length;
        for(let i = 0;i<n;i++){
            let element = tweens[i];
            let{status,data}=element;
            if(status != LoadStates.COMPLETE){
                runing ++;
                if(status == LoadStates.WAIT){
                    if(now >= element.st){
                        element.status = LoadStates.LOADING;
                        element.start();
                        if(data.duration > 0 && element.needupdate){
                            element.update(now,tm.interval);
                        }
                    }
                }else{
                    if(element.needupdate){
                        element.update(now,tm.interval);
                    }
                }
            }
        }

        if(0 == runing){
            //complete
            this.simpleDispatch(EventT.COMPLETE);
            Engine.removeTick(this);

            this.target = undefined;
            tweens.length = 0;
        }
    }

    stop(){
        Engine.removeTick(this);
        let{tweens} = this;
        this.target = undefined;
        if(tweens) tweens.length = 0;
    }
}



