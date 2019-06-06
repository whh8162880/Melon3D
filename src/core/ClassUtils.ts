export interface IDisposable {
    dispose(): void;
}

/**
 * 创建器
 */
export type Creator<T> = { new(): T } | { (): T };
/**
 * 
 * 调整ClassFactory
 * @export
 * @class ClassFactory
 * @template T
 */
export class ClassFactory<T>{

    private _creator: Creator<T>;

    private _props: Partial<T>;

    /**
     * @param {Creator<T>} creator 
     * @param {Partial<T>} [props] 属性模板
     * @memberof ClassFactory
     */
    constructor(creator: Creator<T>, props?: Partial<T>) {
        this._creator = creator;
        if (props != undefined) this._props = props;
    }

    /**
     * 获取实例
     * 
     * @returns 
     */
    get() {
        let ins = new (this._creator as any)();
        let p = this._props;
        for (let key in p) {
            ins[key] = p[key];
        }
        return ins;
    }
}


export function pro_copy(to:object,pros:object){
    for(let key in pros){
        to[key] = pros[key];
    }
}

/**
 * 回收池
 * @author 3tion
 *
 */
export class RecyclablePool<T> {

    private _pool: T[];
    private _max: number;
    private _creator: Creator<T>;

    get(params?:object): T {
        var ins: T & IRecyclable;
        var pool = this._pool;
        if (pool.length) {
            ins = pool.pop();
        } else {
            ins = new (this._creator as any)();
        }

        if(params){
            pro_copy(ins,params);
        }

        if (typeof ins.onSpawn === "function") {
            ins.onSpawn();
        }
        // if (DEBUG) {
        ins._insid = _recid++;
        // }
        return ins;
    }

    /**
     * 回收
     */
    recycle(t: T) {
        let pool = this._pool;
        let idx = pool.indexOf(t);
        if (!~idx) {//不在池中才进行回收
            if (typeof (t as IRecyclable).onRecycle === "function") {
                (t as IRecyclable).onRecycle();
            }
            if (pool.length < this._max) {
                pool.push(t);
            }
        }
    }

    constructor(TCreator: Creator<T>, max = 100) {
        this._pool = [];
        this._max = max;
        this._creator = TCreator;
    }
}
export type Recyclable<T> = T & { recycle(): void };

// if (DEBUG) {
    var _recid = 0;
// }


/**
 * 获取一个recyclable的对象
 * 
 * @export
 * @template T 
 * @param {({ new(): T & { _pool?: RecyclablePool<T> } })} clazz 
 */
export function recyclable<T>(clazz: { new(): T & { _pool?: RecyclablePool<T> } }, addInstanceRecycle?: boolean,params?:object): Recyclable<T>
/**
 * 使用创建函数进行创建
 * 
 * @export
 * @template T 
 * @param {({ (): T & { _pool?: RecyclablePool<T> } })} clazz 
 * @param {true} addInstanceRecycle
 */
export function recyclable<T>(clazz: { (): T & { _pool?: RecyclablePool<T> } }, addInstanceRecycle?: boolean,params?:object): Recyclable<T>
export function recyclable<T>(clazz: Creator<T> & { _pool?: RecyclablePool<T> }, addInstanceRecycle?: boolean,params?:object): Recyclable<T> {
    let pool: RecyclablePool<T>;
    if (clazz.hasOwnProperty("_pool")) {
        pool = clazz._pool;
    }
    if (!pool) {
        if (addInstanceRecycle) {
            pool = new RecyclablePool(function () {
                let ins = new (clazz as any)();
                ins.recycle = recycle;
                return ins;
            })

        } else {
            pool = new RecyclablePool(clazz);
            let pt = clazz.prototype;
            if (!pt.hasOwnProperty("recycle")) {
                pt.recycle = recycle;
            }
            // clazz.prototype.recycle = recycle;
        }
        Object.defineProperty(clazz, "_pool", {
            value: pool
        })
    }
    return pool.get(params) as Recyclable<T>;
    function recycle() {
        pool.recycle(this);
    }
}

/**
 * 单例工具
 * @param clazz 要做单例的类型
 */
export function singleton<T>(clazz: { new(): T; _instance?: T }): T {
    let instance: T;
    if (clazz.hasOwnProperty("_instance")) {
        instance = clazz._instance;
    }
    if (!instance) {
        instance = new clazz;
        Object.defineProperty(clazz, "_instance", {
            value: instance
        })
    }
    return instance;
}