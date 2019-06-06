import { MiniDispatcher, EventX } from "./MiniDispatcher";
import { Link, LinkVO } from "./Link";
import { Engine, engineNow, TickLink } from "./Engine";

export class Timer extends MiniDispatcher implements ITickable {
	private _delay: number = 0;
	private currnetTime: number = 0;

	repeatCount: number = 0;
	running: Boolean = false;

	constructor(delay: number, repeatCount: number = 0) {
		super();
		this.delay = delay;
		this.repeatCount = repeatCount;
	}

	set delay(value: number) {
		if (value < 1) {
			value = 1;
		}
		if (this._delay == value) {
			return;
		}
		this._delay = value;
	}

	get delay(): number {
		return this._delay;
	}

	start(): void {
		this.currnetTime = 0;
		Engine.addTick(this);
	}

	stop(): void {
		Engine.removeTick(this);
		this.currnetTime = 0;
		// this._delay = 0;
		this.repeatCount = 0;
	}

	update(now: number, interval: number): void {
		this.currnetTime += interval;
		if (this.currnetTime >= this._delay) {
			this.simpleDispatch(TimerEventX.TIMER);
			this.currnetTime = this.currnetTime % this._delay;
		}

		if (this.repeatCount > 0) {
			this.repeatCount--;
			if (this.repeatCount <= 0) {
				this.simpleDispatch(TimerEventX.TIMER_COMPLETE);
				this.stop();
			}
		}
	}
}

export class GTimer {
	link: Link;
	timer: Timer;
	constructor(delay: number) {
		this.link = new Link();
		this.timer = new Timer(delay);
		this.timer.addEventListener(TimerEventX.TIMER, this.timerHandler, this);
	}

	timerHandler(event: EventX): void {
		for(let vo = this.link.getFrist();vo;vo = vo.next){
			if (vo.close)  continue;
			
			let func: Function = vo.data;
			let thisobj = vo.thisObj;
			if(undefined != func){
				if(vo.args){
					func.call(thisobj,vo.args)
				}else{
					func.call(thisobj);
				}
			}
		}
	}

	add(func: Function, thisobj:any, args?: any): LinkVO {
		let vo = this.link.add(func, thisobj,args);
		this.timer.start();
		return vo;
	}

	remove(func: Function, thisobj:any): void {
		let{link} = this;
		link.remove(func,thisobj);
		if (!link.length) {
			this.timer.stop();
		}
	}
}

export class GTimerCallLater extends GTimer {
	constructor() {
		super(10);
		// this.link.checkSameData = false;
	}

	later(f: Function, thisobj:any, time: number, args?: any,checksame:boolean = true) {
		if (undefined == f) {
			return;
		}
		this.link.checkSameData = checksame;
		let vo = super.add(f,thisobj, args);
		if(!vo.weight){
			vo.weight = engineNow + time;
		}
		return vo;
	}

	add(func: Function, thisobj:any, args?: any,checksame:boolean = true): LinkVO {
		return this.later(func,thisobj,10,args,checksame);
	}


	remove(func: Function, thisobj:any): void {
		let{link} = this;
		
		for(let vo = link.first;vo;vo = vo.next){
			if(vo.data == func && vo.thisObj == thisobj && vo.close == false){
				link.removeLink(vo);
			}
		}
		
		if (!link.length) {
			this.timer.stop();
		}
	}

	timerHandler(event: EventX): void {
		let now = engineNow;
		let{link}=this;
		let vo = link.getFrist();
		let cleanflag;
		while (vo) {
			let next = vo.next;
			if (false == vo.close) {
				if (now > vo.weight) {
					vo.close = true;
					vo.weight = 0;
					let func: Function = vo.data;
					func.call(vo.thisObj, vo.args);
					cleanflag = true;
				}
			}
			vo = next;
		}

		if(cleanflag){
			link.clean();
			// if (!link.length) {
				// this.timer.stop();
			// }
		}
	}
}


export let gameTick:TickLink = new TickLink()
export let skillTick:TickLink = new TickLink()

export let timerobj:{[key:number]:GTimer} = {};

export function getGTimer(time: number) {
	var gtimer = timerobj[time];
	if (undefined == gtimer) {
		timerobj[time] = gtimer = new GTimer(time);
	}
	return gtimer; 
}

export let time250 = getGTimer(250);
export let time500 = getGTimer(500);
export let time1000 = getGTimer(1000);
export let time3000 = getGTimer(3000);
export let time4000 = getGTimer(4000);
export let time5000 = getGTimer(5000);
export let callLater: GTimerCallLater = new GTimerCallLater();
