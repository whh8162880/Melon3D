import { Recyclable, recyclable } from "./ClassUtils";
import { Link } from "./Link";

export type EventHandler = (event: EventX) => void;

export interface IEventDispatcherX {
	on(type: string | number, listener: Function, thisObject: any, priority?: number, ones?: boolean): void;
	off(type: string | number, listener: Function, thisObject: any): void;
	has?(type: string | number): boolean;
	dispatchEvent(event: EventX): boolean;
	simpleDispatch?(type: string | number, data?: any, bubbles?: boolean): boolean;
}


export class EventX implements IRecyclable {

	static TEMP: EventX = new EventX();

	type: string | number = undefined;
	data: any;
	bubbles: boolean;
	target: IEventDispatcherX;
	currentTarget: IEventDispatcherX;

	stopPropagation: boolean;
	stopImmediatePropagation: boolean;

	constructor(type?: string | number, data?: any, bubbles?: boolean) {
		this.type = type;
		this.data = data;
		this.bubbles = bubbles;
	}

	onRecycle(): void {
		this.data = undefined;
		this.type = undefined;
		this.target = undefined;
		this.currentTarget = undefined;
		this.bubbles = false;
		this.stopPropagation = false;
		this.stopImmediatePropagation = false;
	}
}

/**
 * 
 * @author crl
 * 
 */
export class MiniDispatcher implements IEventDispatcherX, IRecyclable {
	mEventListeners: { [key: string]: Recyclable<Link> };
	mTarget: IEventDispatcherX;

	/** Creates an EventDispatcher. */
	constructor(target: IEventDispatcherX = null) {
		if (target == null) {
			target = this;
		}
		this.mTarget = target;
	}

	/** Registers an event listener at a certain object. */

	on(type: string | number, listener: Function, thisObject: any, priority: number = 0, ones = false): void {
		if (undefined == this.mEventListeners) {
			this.mEventListeners = {};
		}
		var signal: Link = this.mEventListeners[type];
		if (signal == null) {
			signal = this.mEventListeners[type] = recyclable(Link);
		}
		if (signal.lock) {
			let extend = signal.extendparam;
			if (!extend) {
				signal.extendparam = extend = [];
			}
			for (let i = 0; i < extend.length; i++) {
				const element = extend[i];
				if (element[0] == listener && element[2] == thisObject) {
					element[1] = priority;
					return;
				}
			}
			extend.push([listener, priority, thisObject, ones]);
		} else {
			signal.addByWeight(listener, priority, thisObject).ones = ones;
		}
	}

	/** Removes an event listener from the object. */
	off(type: string | number, listener: Function, thisObject: any): void {
		if (undefined != this.mEventListeners) {
			var signal: Recyclable<Link> = this.mEventListeners[type];
			if (undefined == signal) return;
			signal.remove(listener, thisObject);

			let { extendparam } = signal;
			if (extendparam) {
				for (let i = 0; i < extendparam.length; i++) {
					const element = extendparam[i];
					if (element[0] == listener && element[2] == thisObject) {
						extendparam.splice(i, 1);
						break;
					}
				}
			}

			// if (0 >= signal.length) {
			// 	signal.recycle();
			// 	this.mEventListeners[type] = undefined;
			// }
		}
	}
	/** Removes all event listeners with a certain type, or all of them if type is null. 
	 *  Be careful when removing all event listeners: you never know who else was listening. */
	removeEventListeners(type: string = undefined): void {
		var signal: Recyclable<Link>;

		if (type && this.mEventListeners) {
			signal = this.mEventListeners[type];
			if (signal) {
				signal.recycle();
				this.mEventListeners[type] = undefined;
			}
			delete this.mEventListeners[type];
		} else if (this.mEventListeners) {
			for (type in this.mEventListeners) {
				signal = this.mEventListeners[type];
				if (signal) {
					signal.extendparam = undefined;
					signal.recycle();
					this.mEventListeners[type] = undefined;
				}
			}
			this.mEventListeners = undefined
		}
	}

	/** Dispatches an event to all objects that have registered listeners for its type. 
	 *  If an event with enabled 'bubble' property is dispatched to a display object, it will 
	 *  travel up along the line of parents, until it either hits the root object or someone
	 *  stops its propagation manually. */
	dispatchEvent(event: EventX): boolean {
		let { mEventListeners } = this;
		if (!mEventListeners || !mEventListeners[event.type]) {
			return false;
		}

		event.currentTarget = this.mTarget;
		let signal = mEventListeners[event.type];
		// let vo: LinkVO = signal.getFrist();
		signal.lock = true;
		for (let vo = signal.getFrist(); vo; vo = vo.next) {
			if (event.stopPropagation || event.stopImmediatePropagation) {
				break;
			}
			if (false == vo.close) {
				let f: Function = vo.data;
				if (undefined != f) {
					if (f.length == 2) {
						f.call(vo.thisObj, event, event.data);
					}else{
						f.call(vo.thisObj, event);
					}
				}
				if (vo.ones) {
					vo.close = true;
				}
			}
		}
		signal.lock = false;

		let { extendparam } = signal;
		if (extendparam) {
			for (let i = 0; i < extendparam.length; i++) {
				const [listener, priority, thisObject, ones] = extendparam[i];
				signal.addByWeight(listener, priority, thisObject, ones);
			}
			signal.extendparam = undefined;
		}

		return false == event.stopPropagation;
	}

	simpleDispatch(type: string | number, data: any = undefined, bubbles: boolean = false): boolean {
		if (!bubbles && (undefined == this.mEventListeners || undefined == this.mEventListeners[type])) {
			return false;
		}

		let event: Recyclable<EventX> = recyclable(EventX);
		event.type = type;
		event.data = data;
		event.bubbles = bubbles;
		event.target = this.mTarget;
		let bool: boolean = this.dispatchEvent(event);
		event.recycle();
		return bool;
	}

	/** Returns if there are listeners registered for a certain event type. */
	has(type: string | number): boolean {
		if (undefined == this.mEventListeners) {
			return false;
		}
		let signal: Link = this.mEventListeners[type];
		if (undefined == signal || 0 >= signal.length) {
			return false;
		}

		return true;
	}

	onRecycle(): void {
		this.removeEventListeners();
	}


	addEventListener = this.on;
	removeEventListener = this.off;

	hasEventListener = this.has;
}