/// <reference path="./ClassUtils.ts" />
/// <reference path="./Link.ts" />
/// <reference path="./MiniDispatcher.ts" />

namespace rf {
	export interface IResizeable {
		resize?(width: number, height: number);
	}
	export interface ITickable {
		update?(now: number, interval: number);
	}

	export class EngineEvent {
		static VISIBILITY_CHANGE: string = 'visibility_change';
		static FPS_CHANGE: string = 'FPS_CHANGE';
	}

	const enum Time {
		/**
		 * 一秒
		 */
		ONE_SECOND = 1000,
		/**
		 * 五秒
		 */
		FIVE_SECOND = 5000,
		/**
		 * 一分种
		 */
		ONE_MINUTE = 60000,
		/**
		 * 五分种
		 */
		FIVE_MINUTE = 300000,
		/**
		 * 半小时
		 */
		HALF_HOUR = 1800000,
		/**
		 * 一小时
		 */
		ONE_HOUR = 3600000,
		/**
		 * 一天
		 */
		ONE_DAY = 86400000,
		/**
		 * 一周
		 */
		ONE_WEEK = 604800000
	}


	//===========================================================================================
	// 		TimeMixer
	//===========================================================================================
	export interface ITimeMixer{
		now:number;
		interval:number;
		speed:number;
		pause:boolean;
		parent:ITimeMixer;
		childs:ITimeMixer[];
		target:any;
	}
	
	export function newTimeMixer(target:any,now = 0,tm?:ITimeMixer,speed = 1){
		let t = {target,now,speed,parent:tm,childs:[]} as ITimeMixer;
		if(tm){ tm.childs.push(t); }
		return t;
	}

	export function removeTimeMixer(tm:ITimeMixer){
		let{parent} = tm;
		if(parent){
			parent.childs.remove(tm);
		}
		
	}

	export function tm_add(t:ITimeMixer,interval:number){
		if(!t.pause){
			t.interval = interval *= t.speed;
			t.now += interval;
			let childs = t.childs;
			for (let i = 0; i < childs.length; i++) {
				const element = childs[i];
				tm_add(element,interval);
			}
		}
		return t.now;
	}


	export function tm_set(t:ITimeMixer,now:number){
		let interval = now - t.now ;
		t.now = now;
		let childs = t.childs;
		for (let i = 0; i < childs.length; i++) {
			const element = childs[i];
			tm_add(element,interval);
		}
	}

	

	export let nativeMouseX:number = 0;
	export let nativeMouseY:number = 0;

	export let originMouseX:number = 0;
	export let originMouseY:number = 0;

	export let nextUpdateTime:number = 0;

	export var lastUpdateTime:number = 0;

	export var lastUpdateDate:number = 0;

	export let frameInterval: number = 0;

	//当前程序运行了多长时间
	export let engineNow:number = 0;

	const _sharedDate = new Date();

	let _utcOffset = -_sharedDate.getTimezoneOffset() * Time.ONE_MINUTE;

	export function getUTCTime(time: number) {
		return time + _utcOffset;
	}

	export function getFormatTime(time: number, format: string, isRaw = true):string {
		if (isRaw) {
			time = this.getUTCTime(time);
		}
		_sharedDate.setTime(time);
		return _sharedDate.format(format);
	}

	export function getProxTime(sec:number){
		sec *= 1000;
		if(sec < 1800){
			return Math.ceil(sec/60) + "分钟"
		}else if(sec < Time.ONE_DAY){
			return Math.ceil(sec/3600) + "小时"
		}else if(sec <Time.ONE_WEEK){
			return Math.ceil(sec/Time.ONE_DAY) + "天";
		}else{
			return "7天"
		}
	}

	export const getT: ({ (): number }) = Date.now;

	// export const getT: ({ (): number }) = window.performance ? performance.now.bind(performance) : Date.now;


	export const defaultTimeMixer:ITimeMixer = newTimeMixer(undefined,0.0,undefined,1.0);


	export function setContextMatrix(width:number,height:number,x:number,y:number){

		console.log("setContextMatrix",width,height,x,y);
		let o = offsetResize;
		offsetResize = o = {stageWidth, stageHeight, ox:0, oy:0, sx:1, sy:1};

		let sx = width / stageWidth;
		let sy = height / stageHeight;
		//stageWidth 不变
		// if(sx > sy){
		// 	sw = Math.round(width/sy);
		// 	o.ox = sw - stageWidth >> 1;
		// 	o.sx = sw / o.stageWidth;
		// 	o.stageWidth = sw;
		// }else 
		if(sx < sy){
			let sh = Math.round(height/sx);
			o.oy = sh - stageHeight >> 1;
			o.sy = sh / o.stageHeight;
			o.stageHeight = sh;
		}

		let h = height;
		let p = stageWidth / stageHeight;
		let w = Math.round(h * p);
		
		if(w > width){
			w = width;
			h = width / p;
		}
		let s =  (w * pixelRatio) / stageWidth;
		// ((width - w) >> 1) * pixelRatio
		// innerHeight -= offy * 2;

		pixelFont = isMobile ? s : 1;
		// pixelFont = 1.025;//h / stageHeight * pixelRatio;
		let m = contextMatrix2D;
		m.m3_identity();
		// m.m3_translation((sceneWidth - stageWidth) >> 1,(sceneHeight - stageHeight)>>1,0);
		m.m3_scale(s,s,1);//固定的缩放比例 y会有偏差
		m.m3_translation(Math.round(((width - w) >> 1) * pixelRatio),0,0);//全屏显示不做y偏移
		m.m3_translation(x,y,0);
		contextInvMatrix.m3_invert(m);

		m = contextMatrix3D;
		m.m3_identity();
		// m.m3_scale(s,s,1);

		if(!weixin){
			let container2d:{[key:string]:string} = {};
			container2d.transform = `matrix3d(${contextMatrix2D.m3_toString(pixelRatio)})`;
			wx.resetCssStyle({container2d});
		}

	}




	export function defaultResize(width:number,height:number){
		// windowWidth = width;
		// windowHeight = height;
		
		innerWidth = width * pixelRatio;
		innerHeight = height * pixelRatio;

		// console.log(softKeyboard,width,height);

		if(isMobile){
			if(softKeyboard){
				// onResizeKeboard(width,height);
				return;
			}
		}

		if(lockStageArea){
			setContextMatrix(width,height,0,0);
		}else{
			stageWidth = innerWidth;
			stageHeight = innerHeight;
			pixelScale = pixelRatio;

			offsetResize = {stageWidth, stageHeight, ox:0, oy:0, sx:1, sy:1};
		}
	}

	export let resizeStageSizeFunction:Function = defaultResize;
	
	// export let engie_animation_request:Function = undefined;
	export class Engine {
		//当前程序开始时间
		static startTime: number = 0;

		//上一帧到本帧间隔时间
		static interval: number = 0;
		//窗口是否最小化
		static hidden: boolean = false;
		//窗口最小化开始时间
		static hiddenTime: number = 0;
		//一秒内刷新次数
		static fps: number = 0;
		//一秒内执行代码使用时间
		static code: number = 0;

		static ticklink = new Link();
		private static resizeLink: Link = new Link();
		private static _frameRate: number = 60;
		private static _nextProfileTime: number = 0;
		private static _fpsCount: number = 0;
		private static _codeTime: number = 0;

		

		static setDisplayArea(width:number,height:number){
			lockStageArea = true;
			stageWidth = width;
			stageHeight = height;
			isWindowResized = true;
		}
		



		static start(): void {
			
			Engine.startTime = Date.now();
			engineNow = 0;
			Engine.frameRate = Engine._frameRate;
			nextUpdateTime = frameInterval;
			lastUpdateTime = Engine.startTime; 
			Engine._nextProfileTime = 1000;

			//动画ENTER_FRAME;
			let animationRequest = requestAnimationFrame;

			function onAnimationChange(time): void {
				animationRequest(onAnimationChange);


				let interval = time - lastUpdateTime;
				let now:number;
				if(interval < 0){
					//时间重置了
					now = Date.now() - Engine.startTime;
					interval = now - engineNow;
					nextUpdateTime = now;
				}else{
					now = interval + engineNow;
				}

				if(now < nextUpdateTime){
					return;
				}

				lastUpdateTime = time;
				lastUpdateDate = Date.now();

				tm_add(defaultTimeMixer,interval);
				nextUpdateTime += frameInterval;
				engineNow = now;
				Engine.update(now, interval);
				Engine.profile();
			}

			animationRequest(onAnimationChange);

			wx.onWindowResize((res:wx.IWindowResizeData) => {
				let{windowWidth:width,windowHeight:height}=res;
				if(windowWidth != width || windowHeight != height){
					windowWidth = width;
					windowHeight = height;
					isWindowResized = true;
				}
			})


			resizeStageSizeFunction(windowWidth,windowHeight);

			// //窗口最大化最小化监听
			// var hidden, state, visibilityChange;
			// if (typeof document['hidden'] !== 'undefined') {
			// 	hidden = 'hidden';
			// 	visibilityChange = 'visibilitychange';
			// 	state = 'visibilityState';
			// } else if (typeof document['mozHidden'] !== 'undefined') {
			// 	hidden = 'mozHidden';
			// 	visibilityChange = 'mozvisibilitychange';
			// 	state = 'mozVisibilityState';
			// } else if (typeof document['msHidden'] !== 'undefined') {
			// 	hidden = 'msHidden';
			// 	visibilityChange = 'msvisibilitychange';
			// 	state = 'msVisibilityState';
			// } else if (typeof document['webkitHidden'] !== 'undefined') {
			// 	hidden = 'webkitHidden';
			// 	visibilityChange = 'webkitvisibilitychange';
			// 	state = 'webkitVisibilityState';
			// }

			// document.addEventListener(
			// 	visibilityChange,
			// 	function () {
			// 		let stateDesc: string = document[state];
			// 		let hidden: boolean = stateDesc.toLocaleLowerCase().indexOf('hidden') != -1;
			// 		Engine.hidden = hidden;
			// 		if (hidden) {
			// 			Engine.hiddenTime = Date.now();
			// 		} else {
			// 			if (0 != Engine.hiddenTime) {
			// 				let delayTime: number = Date.now() - Engine.hiddenTime;
			// 				Engine.startTime += delayTime;
			// 				Engine._nextProfileTime += delayTime;
			// 				nextUpdateTime += delayTime;
			// 				Engine.hiddenTime = 0;
			// 			}
			// 		}
			// 		ROOT.simpleDispatch(EngineEvent.VISIBILITY_CHANGE, hidden);
			// 	},
			// 	false
			// );
		}

		static addResize(value: IResizeable): void {
			Engine.resizeLink.add(value);
			let {stageWidth, stageHeight} = offsetResize;
			value.resize(stageWidth, stageHeight);
		}

		static removeResize(value: IResizeable): void {
			Engine.resizeLink.remove(value);
		}

		static resize(width: number, height: number): void {
			//todo other
			// console.log("Engine resize");
			let vo = Engine.resizeLink.getFrist();
			while (vo) {
				let next = vo.next;
				if (false == vo.close) {
					let value: IResizeable = vo.data;
					value.resize(width, height);
				}
				vo = next;
			}
		}

		static addTick(tick: ITickable): void {
			Engine.ticklink.add(tick);
		}

		static removeTick(tick: ITickable): void {
			Engine.ticklink.remove(tick);
		}

		static update(now: number, interval: number): void {
			if (isWindowResized) {
				isWindowResized = false;
				resizeStageSizeFunction(windowWidth,windowHeight);
				Engine.resize(offsetResize.stageWidth, offsetResize.stageHeight);
			}

			let vo = Engine.ticklink.getFrist();
			while (vo) {
				let next = vo.next;
				if (false == vo.close) {
					let tick: ITickable = vo.data;
					if(!tick.update || !(tick.update instanceof Function)){
						console.log("errrrrr tick,,,", tick, tick.update, vo)
					}else{
						tick.update(now, interval);
					}
				}
				vo = next;
			}
			// ROOT.simpleDispatch(EventT.ENTER_FRAME);
		}

		static set frameRate(value: number) {
			Engine._frameRate = value;
			frameInterval = 1000 / value;
		}

		static get frameRate(): number {
			return Engine._frameRate;
		}

		static profile(): void {
			let now: number = getTimer();
			let interval = now - Engine._nextProfileTime;

			Engine._fpsCount++;
			Engine._codeTime += now - engineNow;

			if (interval > 0) {
				if(interval > 2000){
					Engine._nextProfileTime = now + 1000;
				}else{
					Engine._nextProfileTime += 1000;
				}
				
				Engine.fps = Engine._fpsCount;
				Engine.code = Engine._codeTime;
				Engine._fpsCount = 0;
				Engine._codeTime = 0;

				// ROOT.simpleDispatch(EngineEvent.FPS_CHANGE);
			}
		}
	}

	export function getTimer(): number {
		return engineNow + getT() - lastUpdateDate;
	}

	export class TimerEventX extends EventX {
		static TIMER: string = 'timer';
		static TIMER_COMPLETE: string = 'timerComplete';
	}

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

	export class TickLink implements ITickable{
		link:Link;

		constructor(){
			this.link = new Link();
			Engine.addTick(this);
		}

		addTick(tick: ITickable): void {
			this.link.add(tick);
		}

		removeTick(tick: ITickable): void {
			this.link.remove(tick);
		}

		update(now: number, interval: number){
			let vo = this.link.getFrist();
			while (vo) {
				let next = vo.next;
				if (false == vo.close) {
					let tick: ITickable = vo.data;
					if(!tick.update || !(tick.update instanceof Function)){
						console.log("errrrrr tick,,,,", tick, vo)
					}else{
						tick.update(now, interval);
					}
				}
				vo = next;
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
}
