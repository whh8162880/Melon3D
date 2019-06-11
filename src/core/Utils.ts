export function getQualifiedClassName(value:any):string {
    let type = typeof value;
    if (!value || (type != "object"&&!value.prototype)) {
        return type;
    }
    let prototype:any = value.prototype ? value.prototype : Object.getPrototypeOf(value);
    if (prototype.hasOwnProperty("__class__")) {
        return prototype["__class__"];
    }
    let constructorString:string = prototype.constructor.toString().trim();
    let index:number = constructorString.indexOf("(");
    let className:string = constructorString.substring(9, index);
    Object.defineProperty(prototype, "__class__", {
        value: className,
        enumerable: false,
        writable: true
    });
    return className;
}

export function getQualifiedSuperclassName(value:any):string {
    if (!value || (typeof value != "object" && !value.prototype)) {
        return null;
    }
    let prototype:any = value.prototype ? value.prototype : Object.getPrototypeOf(value);
    let superProto = Object.getPrototypeOf(prototype);
    if (!superProto) {
        return null;
    }
    let superClass = getQualifiedClassName(superProto.constructor);
    if (!superClass) {
        return null;
    }
    return superClass;
}

export function is(instance: any, ref: { new(): any }): boolean {
    if (!instance || typeof instance != "object") {
        return false;
    }
    let prototype:any = Object.getPrototypeOf(instance);
    let types = prototype ? prototype.__types__ : null;
    if (!types) {
        return false;
    }
    return (types.indexOf(getQualifiedClassName(ref)) !== -1);
}


export function toString(instance:any,defaultValue:string = ""){
    if(!instance){
        return defaultValue;
    } 

    
}


export function clone(from:any,to?:any){
    if(!to){
        to = {};
    }
    for(let key in from){
        to[key] = from[key];
    }
    return to;
}


export function properties(target: any, key: string) {
    let old = target[key];
    Object.defineProperty(target, key, {
        get() {
            return old;
        },

        set(value: any) {
            old = value;
        },
        configurable: true,
        enumerable: true
    })
}