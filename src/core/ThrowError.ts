
export var ClientCheck = {
    /**
     * 是否做客户端检查
     */
    isClientCheck: true
}

/**
 * 错误前缀
 */
export var errorPrefix: string = "";

export interface ThrowError {
    (msg: string, err?: Error, alert?: boolean): void;
    MaxCount?: number;
    errorMsg?: string[];
}

/**
* 在内存中存储报错数据
* @param msg
* @private
*/
function getMsg(msg: string): string {
    return new Date()["format"]("[yyyy-MM-dd HH:mm:ss]", true) + "[info:]" + msg;
}

/**
 * 抛错
 * @param {string | Error}  msg 描述
 **/
export const ThrowError: ThrowError = function (msg: string, err?: Error, alert?: boolean) {
    msg = errorPrefix + msg;
    msg += `%c`;
    if (err) {
        msg += `\nError:\n[name]:${err.name},[message]:${err.message}`;
    } else {
        err = new Error();
    }
    msg += `\n[stack]:\n${err.stack}`;
    // if (DEBUG) {
    //     msg = getMsg(msg);
    // } else if (RELEASE) {
    //     msg = pushMsg(msg);
    // }
    console.log(msg, "color:red");
}