declare module rf{

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


    const enum TimerEventX{
		TIMER = 'timer',
		TIMER_COMPLETE = 'timerComplete'
    }
    
    
    interface ITimeMixer{
		now:number;
		interval:number;
		speed:number;
		pause:boolean;
		parent:ITimeMixer;
		childs:ITimeMixer[];
		target:any;
    }
    

    interface IResizeable {
		resize?(width: number, height: number);
    }
    
	interface ITickable {
		update?(now: number, interval: number);
	}

}