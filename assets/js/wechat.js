var wx;
(function (wx) {
    var buffers = {};
    var audios = [];
    wx.createInnerAudioContext = function () {
        return new InnerAudioContext(new (window["AudioContext"] || window["webkitAudioContext"] || window["mozAudioContext"])());
    };
    var InnerAudioContext = (function () {
        function InnerAudioContext(audiocontext) {
            this.autoplay = false;
            this.loop = false;
            this._vol = 1;
            this.audiocontext = audiocontext;
            if (audiocontext) {
                this.volNode = audiocontext.createGain();
                this.volNode.connect(audiocontext.destination);
            }
            this.childs = {};
        }
        Object.defineProperty(InnerAudioContext.prototype, "volume", {
            get: function () {
                return this._vol;
            },
            set: function (val) {
                var _a = this, volNode = _a.volNode, childs = _a.childs;
                this._vol = val;
                if (volNode) {
                    volNode.gain.value = val;
                }
                else {
                    for (var key in childs) {
                        var target = childs[key].target;
                        if (!target.ended)
                            target.volume = val;
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InnerAudioContext.prototype, "src", {
            set: function (val) {
                var _a = this, autoplay = _a.autoplay, loop = _a.loop, childs = _a.childs, audiocontext = _a.audiocontext;
                var audioObj = childs[val];
                if (audiocontext) {
                    var thisobj_1 = this;
                    if (audiocontext.state == "suspended") {
                        audiocontext.resume().then(function () {
                            thisobj_1.src = val;
                        });
                        return;
                    }
                    this.childs[val] = audioObj = this.createsource(autoplay, loop);
                    var buffer = buffers[val];
                    if (!buffer) {
                        var request_1 = new XMLHttpRequest();
                        request_1.open("GET", val);
                        request_1.responseType = "arraybuffer";
                        request_1.onreadystatechange = function () {
                            if (request_1.readyState === 4) {
                                if (request_1.status === 200) {
                                    audiocontext.decodeAudioData(request_1.response, function (decodeBuffer) {
                                        audioObj.duration = decodeBuffer.duration;
                                        buffers[val] = decodeBuffer;
                                        if (audiocontext.state == "running") {
                                            thisobj_1.playSingle(decodeBuffer, val, autoplay, loop, true);
                                        }
                                    });
                                }
                            }
                        };
                        request_1.send();
                    }
                    else {
                        if (audiocontext.state == "running") {
                            audioObj.starttime = new Date().getTime();
                            audioObj.duration = buffers[val].duration;
                            this.playSingle(buffers[val], val, autoplay, loop);
                        }
                    }
                }
                else {
                    if (!audioObj)
                        this.childs[val] = audioObj = getFreeAudio(autoplay, loop);
                    audioObj.target.src = val;
                    if (!loop) {
                        audioObj.target.onended = this.audioEnd.bind(this);
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        InnerAudioContext.prototype.play = function () {
            var _a = this, childs = _a.childs, audiocontext = _a.audiocontext;
            if (audiocontext) {
                if (audiocontext.state == "suspended") {
                    var thisobj_2 = this;
                    audiocontext.resume().then(function () { thisobj_2.play(); });
                    return;
                }
            }
            for (var key in childs) {
                var _b = childs[key], target = _b.target, loop = _b.loop, autoplay = _b.autoplay;
                if (target instanceof HTMLAudioElement) {
                    target.play();
                }
                else {
                    this.playSingle(buffers[key], key, autoplay, loop);
                }
            }
        };
        InnerAudioContext.prototype.pause = function () {
            var _a = this, audiocontext = _a.audiocontext, childs = _a.childs;
            if (audiocontext) {
                audiocontext.suspend();
            }
            else {
                for (var key in childs) {
                    var target = childs[key].target;
                    if (!target.ended)
                        target.pause();
                }
            }
        };
        InnerAudioContext.prototype.stop = function () {
            var _a = this, audiocontext = _a.audiocontext, childs = _a.childs;
            for (var key in childs) {
                var needdel = true;
                var _b = childs[key], target = _b.target, loop = _b.loop;
                if (target instanceof HTMLAudioElement) {
                    target.pause();
                    target.currentTime = 0;
                    target.onended = undefined;
                    if (loop) {
                        needdel = false;
                    }
                    else {
                        childs[key].target = target = undefined;
                    }
                }
                else {
                    if (target) {
                        target.buffer = null;
                        target.onended = undefined;
                        target.disconnect();
                        childs[key].target = target = undefined;
                    }
                    if (loop)
                        needdel = false;
                }
                if (needdel)
                    delete childs[key];
            }
            if (audiocontext)
                audiocontext.suspend();
            this.childs = childs;
        };
        InnerAudioContext.prototype.destroy = function () {
        };
        InnerAudioContext.prototype.playSingle = function (data, key, autoplay, loop, needJump) {
            var _a = this, childs = _a.childs, audiocontext = _a.audiocontext, volNode = _a.volNode;
            if (audiocontext) {
                if (audiocontext.state == "suspended") {
                    var thisobj_3 = this;
                    var vo_1 = data;
                    audiocontext.resume().then(function () {
                        thisobj_3.playSingle(vo_1, key, autoplay, loop, needJump);
                    });
                    return;
                }
                if (audiocontext.state == "running") {
                    var ctime = 0;
                    var audioObj = childs[key];
                    childs[key] = audioObj = this.createsource(autoplay, loop, audioObj);
                    var starttime = audioObj.starttime, duration = audioObj.duration, target = audioObj.target;
                    if (data) {
                        if ((starttime + duration) >= audiocontext.currentTime) {
                            console.log("超出播放区域", key, starttime, duration, audiocontext.currentTime);
                            return;
                        }
                        ctime = needJump ? (audiocontext.currentTime - starttime) : 0;
                    }
                    else {
                        starttime = audiocontext.currentTime;
                    }
                    target.buffer = data ? data : buffers[key];
                    target.connect(volNode);
                    target.start(ctime);
                }
            }
        };
        InnerAudioContext.prototype.audioEnd = function (e) {
            var _audio = e.currentTarget;
            var childs = this.childs;
            for (var key in childs) {
                var target = childs[key].target;
                if (target == _audio) {
                    _audio.onended = undefined;
                    delete childs[key];
                    break;
                }
            }
        };
        InnerAudioContext.prototype.endHandler = function (e) {
            var _audio = e.currentTarget;
            var childs = this.childs;
            for (var key in childs) {
                var target = childs[key].target;
                if (target == _audio) {
                    _audio.buffer = null;
                    _audio.onended = undefined;
                    _audio.disconnect();
                    _audio = undefined;
                    delete childs[key];
                    break;
                }
            }
        };
        InnerAudioContext.prototype.createsource = function (autoplay, loop, target) {
            var audiocontext = this.audiocontext;
            var source = audiocontext.createBufferSource();
            source.loop = loop;
            if (!loop)
                source.onended = this.endHandler.bind(this);
            if (target) {
                var os = target.target;
                if (os) {
                    os.buffer = null;
                    os.onended = undefined;
                    os.disconnect();
                    os = undefined;
                }
                target = undefined;
            }
            return { autoplay: autoplay, loop: loop, target: source, starttime: audiocontext.currentTime };
        };
        return InnerAudioContext;
    }());
    wx.InnerAudioContext = InnerAudioContext;
    function getFreeAudio(autoplay, loop) {
        var audio;
        for (var i = 0; i < audios.length; i++) {
            audio = audios[i];
            if (audio.ended || (audio.paused && audio.currentTime == 0)) {
                audio.autoplay = autoplay;
                audio.loop = loop;
                return { autoplay: autoplay, loop: loop, target: audio };
            }
        }
        audio = new Audio();
        audio.autoplay = autoplay;
        audio.loop = loop;
        audios.push(audio);
        return { autoplay: autoplay, loop: loop, target: audio };
    }
})(wx || (wx = {}));
var wx;
(function (wx) {
    wx.cookie = {};
    function cookie_init() {
        var str = document.cookie + ";";
        var o = /data=(.*?);/.exec(str);
        if (!o) {
            return;
        }
        try {
            wx.cookie = JSON.parse(o[1]);
        }
        catch (error) {
            wx.cookie = {};
        }
    }
    wx.cookie_init = cookie_init;
    function cookie_flush() {
        var data = "data=" + JSON.stringify(wx.cookie);
        document.cookie = data;
    }
    wx.cookie_flush = cookie_flush;
})(wx || (wx = {}));
var wx;
(function (wx) {
    function createCanvas() {
        if (typeof OffscreenCanvas == "function") {
            return new OffscreenCanvas(1, 1);
        }
        return document.createElement("canvas");
    }
    wx.createCanvas = createCanvas;
    function createImage() {
        return document.createElement("img");
    }
    wx.createImage = createImage;
    function setPreferredFramesPerSecond(fps) {
    }
    wx.setPreferredFramesPerSecond = setPreferredFramesPerSecond;
    function getSystemInfoSync() {
        var info = {};
        var pixelRatio = window.devicePixelRatio;
        if (~~pixelRatio == 0) {
            var getPixelRatio = function (context) {
                var backingStore = context.backingStorePixelRatio ||
                    context.webkitBackingStorePixelRatio ||
                    context.mozBackingStorePixelRatio ||
                    context.msBackingStorePixelRatio ||
                    context.oBackingStorePixelRatio ||
                    context.backingStorePixelRatio || 1;
                return (window.devicePixelRatio || 1) / backingStore;
            };
            pixelRatio = getPixelRatio(document.createElement("canvas").getContext("2d"));
        }
        info.pixelRatio = pixelRatio;
        var scene = window.screen;
        info.screenWidth = scene.width;
        info.screenHeight = scene.height;
        info.windowWidth = window.innerWidth;
        info.windowHeight = window.innerHeight;
        wx.no_ismobile = "ontouchstart" in document;
        var userAgentInfo = navigator.userAgent.toLocaleLowerCase();
        if (userAgentInfo.search(/ios|iphone|ipad/) != -1) {
            info.platform = "iPhone";
            wx.no_ismobile = true;
        }
        else if (userAgentInfo.search(/android|pad/) != -1) {
            info.platform = "android";
            wx.no_ismobile = true;
        }
        else {
            info.platform = "pc";
            wx.no_ismobile = false;
        }
        wx.no_systemInfo = info;
        window.addEventListener("focusin", windowFocusHandler);
        window.addEventListener("focusout", windowFocusHandler);
        return info;
    }
    wx.getSystemInfoSync = getSystemInfoSync;
    function windowFocusHandler(e) {
        if (e.target instanceof HTMLInputElement && e.target.id == "txt_input") {
            if (e.type == "focusin") {
                wx.no_softKeyboard = true;
                console.log("开启键盘");
            }
            else if (wx.no_softKeyboard) {
                wx.no_softKeyboard = false;
                console.log("关闭键盘");
                wx.hideKeyboard();
            }
        }
    }
    function onWindowResize(callback) {
        var innerWidth = window.innerWidth, innerHeight = window.innerHeight;
        wx.no_stageWidth = innerWidth;
        wx.no_stageHeight = innerHeight;
        window.onresize = function (e) {
            var innerWidth = window.innerWidth, innerHeight = window.innerHeight;
            if (wx.no_ismobile) {
                if (wx.no_stageWidth < innerWidth) {
                    wx.no_stageWidth = innerWidth;
                }
                if (wx.no_stageHeight < innerHeight) {
                    wx.no_stageHeight = innerHeight;
                }
                else if (wx.no_stageHeight > innerHeight) {
                }
                else {
                    if (wx.no_softKeyboard) {
                        console.log("Resize 关闭键盘");
                        wx.no_softKeyboard = false;
                        wx.hideKeyboard();
                    }
                }
            }
            callback({ windowWidth: innerWidth, windowHeight: innerHeight });
        };
    }
    wx.onWindowResize = onWindowResize;
    function resetCssStyle(style) {
        for (var id in style) {
            var element = document.getElementById(id);
            if (element) {
                var setting = style[id];
                var styles = element.style;
                for (var key in setting) {
                    styles[key] = setting[key];
                }
            }
        }
    }
    wx.resetCssStyle = resetCssStyle;
    var focustimer;
    function onShow(callback) {
        window.onfocus = function (e) {
            focustimer = setTimeout(focusLater, 100, callback);
        };
    }
    wx.onShow = onShow;
    function focusLater(callback) {
        callback();
        clearTimeout(focustimer);
        focustimer = undefined;
    }
    function onHide(callback) {
        window.onblur = function (e) {
            callback();
            clearTimeout(focustimer);
            focustimer = undefined;
        };
    }
    wx.onHide = onHide;
    function onAudioInterruptionBegin(callback) {
    }
    wx.onAudioInterruptionBegin = onAudioInterruptionBegin;
    function onAudioInterruptionEnd(callback) {
    }
    wx.onAudioInterruptionEnd = onAudioInterruptionEnd;
})(wx || (wx = {}));
var wx;
(function (wx) {
    function downloadFile(option) {
    }
    wx.downloadFile = downloadFile;
    var DownloadTask = (function () {
        function DownloadTask(option) {
            this.option = option;
        }
        DownloadTask.prototype.abort = function () {
        };
        DownloadTask.prototype.onProgressUpdate = function (callback) {
        };
        return DownloadTask;
    }());
    wx.DownloadTask = DownloadTask;
    function request(option) {
        var xhr;
        if (window["XMLHttpRequest"]) {
            xhr = new window["XMLHttpRequest"]();
        }
        else {
            xhr = new window["ActiveXObject"]("MSXML2.XMLHTTP");
        }
        var header = option.header, responseType = option.responseType, method = option.method, url = option.url, data = option.data;
        xhr.onreadystatechange = function (e) {
            if (xhr.readyState == xhr.OPENED) {
                if (header) {
                    for (var key in header) {
                        xhr.setRequestHeader(key, header[key]);
                    }
                }
            }
            if (xhr.readyState == 4) {
                var data_1;
                if (xhr.response != undefined) {
                    data_1 = xhr.response;
                }
                else if (responseType == "text") {
                    return xhr.responseText;
                }
                else if (responseType == "arraybuffer" && /msie 9.0/i.test(navigator.userAgent)) {
                    var w = window;
                    return w["convertResponseBodyToText"](xhr["responseBody"]);
                }
                var statusCode = xhr.status;
                var complete = option.complete;
                if (undefined != complete) {
                    complete({ data: data_1, statusCode: statusCode });
                }
            }
        };
        xhr.responseType = responseType;
        xhr.open(method, url, true);
        xhr.send(data);
    }
    wx.request = request;
})(wx || (wx = {}));
var wx;
(function (wx) {
    function getFileSystemManager() {
        return undefined;
    }
    wx.getFileSystemManager = getFileSystemManager;
    var FileSystemManager = (function () {
        function FileSystemManager() {
        }
        FileSystemManager.prototype.appendFileSync = function (filePath, data, encoding) {
        };
        FileSystemManager.prototype.accessSync = function (path) {
            return false;
        };
        FileSystemManager.prototype.copyFileSync = function (srcPath, destPath) {
        };
        FileSystemManager.prototype.getSavedFileList = function (option) {
        };
        FileSystemManager.prototype.getFileInfo = function (option) {
        };
        FileSystemManager.prototype.removeSavedFile = function (option) {
        };
        FileSystemManager.prototype.mkdir = function (option) {
        };
        FileSystemManager.prototype.mkdirSync = function (dirPath) {
        };
        FileSystemManager.prototype.readFile = function (option) {
        };
        FileSystemManager.prototype.writeFile = function (option) {
        };
        FileSystemManager.prototype.readdir = function (option) {
        };
        FileSystemManager.prototype.rmDir = function (option) {
        };
        FileSystemManager.prototype.rename = function (option) {
        };
        FileSystemManager.prototype.stat = function (option) {
        };
        FileSystemManager.prototype.statSync = function (path) {
        };
        FileSystemManager.prototype.unlink = function (option) {
        };
        FileSystemManager.prototype.unzip = function (option) {
        };
        return FileSystemManager;
    }());
    wx.FileSystemManager = FileSystemManager;
    var Stats = (function () {
        function Stats() {
        }
        Stats.prototype.isDirectory = function () {
        };
        Stats.prototype.isFile = function () {
        };
        return Stats;
    }());
    wx.Stats = Stats;
})(wx || (wx = {}));
var wx;
(function (wx) {
    var keyboardInputCallBack;
    var keyboardConfirmCallBack;
    var keyboardCompleteCallBack;
    function onKeyboardInput(callback) {
        keyboardInputCallBack = callback;
    }
    wx.onKeyboardInput = onKeyboardInput;
    function offKeyboardInput(callback) {
        if (callback == keyboardInputCallBack) {
            keyboardInputCallBack = undefined;
        }
    }
    wx.offKeyboardInput = offKeyboardInput;
    function onKeyboardConfirm(callback) {
        keyboardConfirmCallBack = callback;
    }
    wx.onKeyboardConfirm = onKeyboardConfirm;
    function offKeyboardConfirm(callback) {
        if (callback == keyboardConfirmCallBack) {
            keyboardConfirmCallBack = undefined;
        }
    }
    wx.offKeyboardConfirm = offKeyboardConfirm;
    function onKeyboardComplete(callback) {
        keyboardCompleteCallBack = callback;
    }
    wx.onKeyboardComplete = onKeyboardComplete;
    function offKeyboardComplete(callback) {
        if (keyboardCompleteCallBack == callback) {
            keyboardCompleteCallBack = undefined;
        }
    }
    wx.offKeyboardComplete = offKeyboardComplete;
    function showKeyboard(option) {
        var defaultValue = option.defaultValue, maxLength = option.maxLength, confirmHold = option.confirmHold, confirmType = option.confirmType, x = option.x, y = option.y, style = option.style;
        for (var id in style) {
            var element = document.getElementById(id);
            if (element) {
                var setting = style[id];
                var styles = element.style;
                for (var key in setting) {
                    styles[key] = setting[key];
                }
            }
        }
        var input = document.getElementById("txt_input");
        if (input) {
            maxLength = ~~maxLength;
            if (maxLength <= 0) {
                maxLength = 100;
            }
            input.focus();
            input.value = defaultValue ? defaultValue : "";
            input.maxLength = maxLength;
            input.onchange = function (e) {
                if (undefined != keyboardInputCallBack) {
                    keyboardInputCallBack(input);
                }
            };
        }
    }
    wx.showKeyboard = showKeyboard;
    function hideKeyboard(option) {
        var input = document.getElementById("txt_input");
        if (input) {
            input.style.visibility = "hidden";
            input.onchange = undefined;
        }
        if (undefined != keyboardCompleteCallBack) {
            keyboardCompleteCallBack(input);
        }
    }
    wx.hideKeyboard = hideKeyboard;
    function updateKeyboard(option) {
        var value = option.value;
        var input = document.getElementById("txt_input");
        if (input) {
            input.value = value;
            if (undefined != keyboardInputCallBack) {
                keyboardInputCallBack(input);
            }
        }
    }
    wx.updateKeyboard = updateKeyboard;
})(wx || (wx = {}));
var wx;
(function (wx) {
    wx.logs = [];
    function dateFtt(fmt, date) {
        var o = {
            "M+": date.getMonth() + 1,
            "d+": date.getDate(),
            "h+": date.getHours(),
            "m+": date.getMinutes(),
            "s+": date.getSeconds(),
            "q+": Math.floor((date.getMonth() + 3) / 3),
            "S": date.getMilliseconds()
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }
    wx.dateFtt = dateFtt;
    function showLog(value) {
        if (!wx.textarea) {
            wx.textarea = document.getElementById("debugArea");
            if (!wx.textarea) {
                wx.textarea = document.createElement("textArea");
                wx.textarea.id = "debugArea";
                wx.textarea.name = "debugArea";
                wx.textarea.readOnly = true;
                var style = wx.textarea.style;
                style.width = "100%";
                style.height = "100%";
                style.position = "absolute";
                style.background = "rgba(0,0,0,0.2)";
                style.top = "0px";
                style.color = "rgb(255,255,255)";
                style.resize = "none";
                style.border = "none";
            }
        }
        if (value) {
            var container2d = document.getElementById("container2d");
            container2d.appendChild(wx.textarea);
            log();
        }
        else {
            wx.textarea.remove();
        }
    }
    wx.showLog = showLog;
    function log(msg, color) {
        if (msg) {
            wx.logs.push(dateFtt("[hh:mm:ss]", new Date()) + " " + msg);
        }
        if (wx.textarea) {
            var msgs = wx.logs;
            if (wx.logs.length > 100) {
                msgs = wx.logs.slice(wx.logs.length - 100);
            }
            wx.textarea.value = msgs.join("\n");
            var scrollHeight = wx.textarea.scrollHeight, clientHeight = wx.textarea.clientHeight;
            wx.textarea.scrollTop = scrollHeight - clientHeight;
        }
    }
    wx.log = log;
})(wx || (wx = {}));
if (typeof global != "undefined") {
    global["wx"] = wx;
}
var wx;
(function (wx) {
    var toucheEventData = {};
    function onTouchStart(callBack) {
        var eventData = toucheEventData;
        if (!wx.no_ismobile) {
            document.onmousedown = function (e) {
                eventData.event = e;
                callBack(eventData);
            };
            document.oncontextmenu = function (event) {
                event.preventDefault();
            };
        }
        else {
            wx.no_maincanvas.ontouchstart = function (e) {
                e.preventDefault();
                callBack(e);
            };
        }
    }
    wx.onTouchStart = onTouchStart;
    function onTouchMove(callBack) {
        var eventData = toucheEventData;
        if (!wx.no_ismobile) {
            document.onmousemove = function (e) {
                eventData.event = e;
                callBack(eventData);
            };
        }
        else {
            wx.no_maincanvas.ontouchmove = function (e) {
                e.preventDefault();
                callBack(e);
            };
        }
    }
    wx.onTouchMove = onTouchMove;
    function onTouchEnd(callBack) {
        var eventData = toucheEventData;
        if (!wx.no_ismobile) {
            document.onmouseup = function (e) {
                eventData.event = e;
                callBack(eventData);
            };
        }
        else {
            wx.no_maincanvas.ontouchend = function (e) {
                if (e.cancelable) {
                    e.preventDefault();
                }
                callBack(e);
            };
        }
    }
    wx.onTouchEnd = onTouchEnd;
    function onTouchCancel(callBack) {
        var eventData = toucheEventData;
        wx.no_maincanvas.ontouchcancel = function (e) {
            if (e.cancelable) {
                e.preventDefault();
            }
            callBack(e);
        };
    }
    wx.onTouchCancel = onTouchCancel;
})(wx || (wx = {}));
var wx;
(function (wx) {
    function connectSocket(options) {
        var s = wx.websocket;
        if (s) {
            closeSocket({ reason: "recreate socket" });
        }
        wx.websocket = new WebSocket(options.url);
        wx.websocket.binaryType = "arraybuffer";
        onSocketOpen(wx.socket_open);
        onSocketClose(wx.socket_close);
        onSocketError(wx.socket_error);
        onSocketMessage(wx.socket_message);
    }
    wx.connectSocket = connectSocket;
    function closeSocket(options) {
        var s = wx.websocket;
        if (s) {
            s.onopen = undefined;
            s.onmessage = undefined;
            s.onclose = undefined;
            s.onerror = undefined;
            try {
                s.close();
            }
            catch (e) {
            }
            wx.websocket = undefined;
        }
    }
    wx.closeSocket = closeSocket;
    function onSocketOpen(callback) {
        wx.socket_open = callback;
        var s = wx.websocket;
        if (s) {
            s.onopen = callback;
        }
    }
    wx.onSocketOpen = onSocketOpen;
    function onSocketClose(callback) {
        wx.socket_close = callback;
        var s = wx.websocket;
        if (s) {
            s.onclose = callback;
        }
    }
    wx.onSocketClose = onSocketClose;
    function onSocketError(callback) {
        wx.socket_error = callback;
        var s = wx.websocket;
        if (s) {
            s.onerror = callback;
        }
    }
    wx.onSocketError = onSocketError;
    function onSocketMessage(callback) {
        wx.socket_message = callback;
        var s = wx.websocket;
        if (s) {
            s.onmessage = function (e) {
                callback(e);
            };
        }
    }
    wx.onSocketMessage = onSocketMessage;
    function sendSocketMessage(option) {
        var s = wx.websocket;
        if (s) {
            if (s.readyState == 1) {
                s.send(option.data);
            }
            else {
                if (option.fail) {
                    option.fail(s.readyState);
                }
            }
        }
    }
    wx.sendSocketMessage = sendSocketMessage;
})(wx || (wx = {}));
var wx;
(function (wx) {
    wx.storageDict = {};
    function clearStorage(option) {
    }
    wx.clearStorage = clearStorage;
    function clearStorageSync() {
        wx.storageDict = {};
    }
    wx.clearStorageSync = clearStorageSync;
    function getStorage(option) {
    }
    wx.getStorage = getStorage;
    function getStorageSync(key) {
        return wx.storageDict[key];
    }
    wx.getStorageSync = getStorageSync;
    function getStorageInfo(option) {
    }
    wx.getStorageInfo = getStorageInfo;
    function getStorageInfoSync() {
        var o = {};
        var keys = [];
        var current = 0;
        for (var key in wx.storageDict) {
            var v = wx.storageDict[key];
            current += v.size;
            keys.push(key);
        }
        o.keys = keys;
        o.currentSize = current;
        o.limitSize = Number.MAX_VALUE;
        return o;
    }
    wx.getStorageInfoSync = getStorageInfoSync;
    function setStorage(option) {
    }
    wx.setStorage = setStorage;
    function setStorageSync(key, data) {
        wx.storageDict[key] = data;
    }
    wx.setStorageSync = setStorageSync;
    function removeStorage(option) {
    }
    wx.removeStorage = removeStorage;
    function removeStorageSync(key) {
        delete wx.storageDict[key];
    }
    wx.removeStorageSync = removeStorageSync;
})(wx || (wx = {}));
