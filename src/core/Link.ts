import { Recyclable, recyclable } from "./ClassUtils";
import { callLater } from "./Timer";

export class LinkVO implements IRecyclable {

    close:boolean = true;
    data: any;
    ones?:boolean

    // set data(value:any){
    //     this._data = value;
    // }

    // get data(){
    //     return this._data;
    // }
    args: any;
    thisObj:any;

    next: Recyclable<LinkVO> ;
    pre: Recyclable<LinkVO> ;

    weight: number = 0;

    time:number = 0;

    onRecycle() {
        this.data = undefined;
        this.args = undefined;
        this.thisObj = undefined;
        this.next = undefined;
        this.pre = undefined;
        this.weight = 0;
        this.close = true;
    }

    onSpawn(){
        this.close = false;
    }
}

export class Link {

    last: Recyclable<LinkVO> = undefined;
    first: Recyclable<LinkVO> = undefined;

    id:string;
    length: number = 0;
    warningMax: number = 200;
    checkSameData: boolean = true;

    lock:boolean = false;

    extendparam:any;

    getFrist(): Recyclable<LinkVO> {

        // if(this.length > this.warningMax){
        //     console.log("waring!!!Link length to looooooong! "+this.length);
        // }

        if (undefined == this.first) return undefined;
        let vo: Recyclable<LinkVO> = this.first;
        while (vo) {
            if (false == vo.close) {
                return vo;
            }
            vo = vo.next;
        }

        // if(this.length > 100){
        // console.log("link :: "+this.length)
        // }
        return undefined;
    }

    getLast(): Recyclable<LinkVO> {
        if (undefined == this.last) return undefined;
        let vo: Recyclable<LinkVO> = this.last;
        while (vo) {
            if (false == vo.close) {
                return vo;
            }
            vo = vo.pre
        }
        return undefined;
    }


    getValueLink(value: any,thisObj:object): Recyclable<LinkVO> {
        let vo: Recyclable<LinkVO> = this.getFrist();
        if (undefined == vo) return undefined;
        while (vo) {
            if (false == vo.close) {
                if (value == vo.data && thisObj == vo.thisObj) {
                    return vo;
                }
            }
            vo = vo.next;
        }
        return undefined;
    }


    add(value: any, thisObj?:object, args?: any): Recyclable<LinkVO> {
        if (!value) return undefined;
        var vo: Recyclable<LinkVO>
        if (this.checkSameData) {
            vo = this.getValueLink(value,thisObj);
            if (vo && vo.close == false) return vo;
        }


        vo = recyclable(LinkVO);
        vo.data = value;
        vo.args = args;
        vo.thisObj = thisObj;
        this.length++;

        if (undefined == this.first) {
            this.first = this.last = vo;
        } else {
            vo.pre = this.last;
            this.last.next = vo;
            this.last = vo
        }


        return vo;
    }


    addByWeight(value: any, weight: number, thisObj?:object, args?: any): Recyclable<LinkVO> {
        if (!value) return undefined;
        var vo: Recyclable<LinkVO>

        if (this.checkSameData) {
            vo = this.getValueLink(value,thisObj);
            if (vo && vo.close == false) {
                if (weight == vo.weight) {
                    return vo;
                }
                vo.close = true;
            }
        }

        vo = recyclable(LinkVO);
        vo.weight = weight;
        vo.data = value;
        vo.thisObj = thisObj;
        vo.args = args;
        this.length++;

        if (undefined == this.first) {
            this.first = this.last = vo;
        } else {
            let tempvo = this.getFrist();
            if (undefined == tempvo) {
                vo.pre = this.last;
                this.last.next = vo;
                this.last = vo;
            } else {
                while (tempvo) {
                    if (false == tempvo.close) {
                        if (tempvo.weight < weight) {
                            vo.next = tempvo;
                            vo.pre = tempvo.pre;
                            if (undefined != tempvo.pre) {
                                tempvo.pre.next = vo;
                            }
                            tempvo.pre = vo;
                            if (tempvo == this.first) {
                                this.first = vo;
                            }
                            break;
                        }
                    }
                    tempvo = tempvo.next;
                }

                if(undefined == tempvo){
                    vo.pre = this.last;
                    this.last.next = vo;
                    this.last = vo;
                }
            }
        }
        return vo;
    }


    remove(value: any,thisObj?:any): void {
        let vo: Recyclable<LinkVO> = this.getValueLink(value,thisObj);
        if (!vo) return;
        this.removeLink(vo);
    }

    removeLink(vo: Recyclable<LinkVO>): void {
        this.length--;
        vo.close = true;
        vo.data = null;
        callLater.later(this.clean,this,500);
    }

    clean(): void {
        let vo = this.first;
        var next;
        this.length = 0;
        while (vo) {
            next = vo.next;
            if (true == vo.close) {
                if (vo == this.first) {
                    this.first = vo.next;
                    if(undefined != this.first){
                        this.first.pre = undefined;
                    }
                } else {
                    vo.pre.next = vo.next;
                }

                if (vo == this.last) {
                    this.last = vo.pre;
                    if(undefined != this.last){
                        this.last.next = undefined;
                    }
                } else {
                    vo.next.pre = vo.pre;
                }
                vo.recycle();
            } else {
                this.length++;
            }
            vo = next;
        }
    }


    pop(): any {
        let vo = this.getLast();
        if (vo) {
            let data = vo.data;
            this.removeLink(vo);
            return data;
        }
        return undefined;
    }

    shift(): any {
        let vo = this.getFrist();
        if (vo) {
            let data = vo.data;
            this.removeLink(vo);
            return data;
        }
        return undefined;
    }

    exec(f: Function): void {
        if (undefined == f) return;
        let vo = this.getFrist();
        while (vo) {
            let next = vo.next;
            if (false == vo.close) {
                f(vo.data);
            }
            vo = vo.next;
        }
    }


    onRecycle(): void {
        let vo = this.first;
        var next;
        while (vo) {
            next = vo.next;
            vo.recycle();
            vo = next;
        }
        this.first = this.last = undefined;
        this.length = 0;
        this.checkSameData = true;
    }

    toString(): string {
        let vo = this.getFrist();
        let s: string = "list:";
        while (vo) {
            let next = vo.next;
            if (false == vo.close) {
                s += vo.data + ","
            }
            vo = vo.next;
        }
        return s;
    }


    get datas(){
        let arr = [];
        for(let vo = this.getFrist();vo;vo = vo.next){
            if(vo.close == false){
                arr.push(vo.data);
            }
        }
        return arr;
    }
}

export interface LinkItem extends IRecyclable{
    __next?:LinkItem;
    __pre?:LinkItem;
}