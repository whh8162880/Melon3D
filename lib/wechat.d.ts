declare module wx {
    let createInnerAudioContext: () => InnerAudioContext;
    interface IAudioContextChild {
        loop: boolean;
        autoplay: boolean;
        target: any;
        starttime?: number;
        duration?: number;
    }
    class InnerAudioContext {
        private audiocontext;
        private volNode;
        autoplay: boolean;
        loop: boolean;
        private _vol;
        private childs;
        constructor(audiocontext?: AudioContext);
        volume: number;
        src: string;
        play(): void;
        pause(): void;
        stop(): void;
        destroy(): void;
        private playSingle;
        private audioEnd;
        private endHandler;
        private createsource;
    }
}
declare module wx {
    var cookie: {
        [key: string]: string;
    };
    function cookie_init(): void;
    function cookie_flush(): void;
}
declare module wx {
    var no_systemInfo: ISystemInfo;
    var no_ismobile: boolean;
    var no_maincanvas: HTMLCanvasElement;
    var no_softKeyboard: boolean;
    var no_stageWidth: number;
    var no_stageHeight: number;
    function createCanvas(): HTMLCanvasElement | OffscreenCanvas;
    function createImage(): HTMLImageElement;
    function setPreferredFramesPerSecond(fps: number): void;
    interface ISystemInfo {
        brand: string;
        model: string;
        pixelRatio: number;
        screenWidth: number;
        screenHeight: number;
        windowWidth: number;
        windowHeight: number;
        language: string;
        version: string;
        system: string;
        platform: string;
        fontSizeSetting: number;
        SDKVersion: string;
        benchmarkLevel: number;
        battery: number;
        wifiSignal: number;
    }
    function getSystemInfoSync(): ISystemInfo;
    interface IWindowResizeData {
        windowWidth: number;
        windowHeight: number;
    }
    var isShowSoftKeyboard: boolean;
    function onWindowResize(callback: Function): void;
    function resetCssStyle(style: {
        [key: string]: {
            [key: string]: string;
        };
    }): void;
    interface IOnShowData {
        scene: string;
        query: object;
        shareTicket: string;
        referrerInfo: {
            appId: string;
            extraData: object;
        };
    }
    function onShow(callback: Function): void;
    function onHide(callback: Function): void;
    function onAudioInterruptionBegin(callback: Function): void;
    function onAudioInterruptionEnd(callback: Function): void;
    function arrayBufferToBase64(buffer: ArrayBuffer): string;
}
declare module wx {
    const enum HttpResponseType {
        TEXT = "text",
        ARRAY_BUFFER = "arraybuffer"
    }
    const enum HttpMethod {
        GET = "GET",
        POST = "POST"
    }
    interface IHttpOption extends IActiveOption {
        url?: string;
        filePath?: string;
        header?: {
            [key: string]: string;
        };
        method?: HttpMethod;
        responseType?: HttpResponseType;
        data?: string | Document | Blob | ArrayBufferView | ArrayBuffer | FormData | URLSearchParams | ReadableStream;
    }
    interface IHttpData {
        errMsg?: string;
        statusCode?: number;
        tempFilePath?: string;
        header?: object;
        data?: string | object | ArrayBuffer;
    }
    function downloadFile(option: IHttpOption): void;
    class DownloadTask {
        protected option: IHttpOption;
        constructor(option: IHttpOption);
        abort(): void;
        onProgressUpdate(callback: Function): void;
    }
    function request(option: IHttpOption): void;
}
declare module wx {
    interface ISavedFileListItemData {
        filePath: string;
        size: number;
        createTime: number;
    }
    interface ISavedFileListData {
        fileList: ISavedFileListItemData[];
    }
    interface IFileInfoData {
        size: number;
    }
    interface IFileOption extends IActiveOption {
        path: string;
        filePath: string;
        encoding: string;
        oldPath: string;
        newPath: string;
        data: string | ArrayBuffer;
    }
    interface IZipOption extends IActiveOption {
        zipFilePath: string;
        targetPath: string;
    }
    interface IDirOption extends IActiveOption {
        dirPath: string;
    }
    const enum env {
        USER_DATA_PATH = ""
    }
    function getFileSystemManager(): FileSystemManager;
    class FileSystemManager {
        appendFileSync(filePath: string, data: string | ArrayBuffer, encoding: string): void;
        accessSync(path: string): boolean;
        copyFileSync(srcPath: string, destPath: string): void;
        getSavedFileList(option: IActiveOption): void;
        getFileInfo(option: IFileOption): void;
        removeSavedFile(option: IFileOption): void;
        mkdir(option: IDirOption): void;
        mkdirSync(dirPath: string): void;
        readFile(option: IFileOption): void;
        writeFile(option: IFileOption): void;
        readdir(option: IDirOption): void;
        rmDir(option: IDirOption): void;
        rename(option: IFileOption): void;
        stat(option: IFileOption): void;
        statSync(path: string): void;
        unlink(option: IFileOption): void;
        unzip(option: IZipOption): void;
    }
    class Stats {
        model: string;
        size: number;
        lastAccessedTime: number;
        lastModifiedTime: number;
        isDirectory(): void;
        isFile(): void;
    }
}
declare module wx {
    interface IActiveOption {
        success?: Function;
        fail?: Function;
        complete?: Function;
    }
}
declare module wx {
    const enum KeyboardConfirmType {
        DONE = "done",
        NEXT = "next",
        SEARCH = "search",
        GO = "go",
        SEND = "send"
    }
    interface IKeyboardOption extends IActiveOption {
        value: string;
        defaultValue: string;
        maxLength: number;
        confirmHold: boolean;
        confirmType: KeyboardConfirmType;
        x: number;
        y: number;
        w: number;
        style: {
            [key: string]: {
                [key: string]: string;
            };
        };
    }
    interface IKeyboardData {
        value: string;
    }
    function onKeyboardInput(callback: Function): void;
    function offKeyboardInput(callback: Function): void;
    function onKeyboardConfirm(callback: Function): void;
    function offKeyboardConfirm(callback: Function): void;
    function onKeyboardComplete(callback: Function): void;
    function offKeyboardComplete(callback: Function): void;
    function showKeyboard(option?: IKeyboardOption): void;
    function hideKeyboard(option?: IActiveOption): void;
    function updateKeyboard(option?: IKeyboardOption): void;
}
declare module wx {
    var textarea: HTMLTextAreaElement;
    var logs: string[];
    function dateFtt(fmt: any, date: any): any;
    function showLog(value: boolean): void;
    function log(msg?: string, color?: string): void;
}
declare module wx {
    interface ITouchData {
        identifier: number;
        screenX: number;
        screenY: number;
        clientX: number;
        clientY: number;
    }
    interface ITouchEventData {
        touches: ITouchData[];
        changedTouches: ITouchData[];
        timeStamp: number;
        target: EventTarget;
        event: MouseEvent;
        preventDefault: Function;
        stopPropagation: Function;
        ctrlKey: boolean;
        shiftKey: boolean;
        altKey: boolean;
        type: string;
    }
    function onTouchStart(callBack: Function): void;
    function onTouchMove(callBack: Function): void;
    function onTouchEnd(callBack: Function): void;
    function onTouchCancel(callBack: Function): void;
}
declare module wx {
    type SocketHandler = (msg?: any) => void;
    var websocket: WebSocket;
    var socket_open: SocketHandler;
    var socket_close: SocketHandler;
    var socket_message: SocketHandler;
    var socket_error: SocketHandler;
    interface ConnectSocketOption extends IActiveOption {
        url: string;
        header: object;
        protocols: string[];
        method?: string;
    }
    function connectSocket(options: ConnectSocketOption): void;
    interface CloseSocketOption extends IActiveOption {
        reason: string;
        code?: number;
    }
    function closeSocket(options: CloseSocketOption): void;
    function onSocketOpen(callback: SocketHandler): void;
    function onSocketClose(callback: SocketHandler): void;
    function onSocketError(callback: SocketHandler): void;
    function onSocketMessage(callback: SocketHandler): void;
    interface SendSocketMessageOption extends IActiveOption {
        data: ArrayBuffer;
        success?: Function;
        fail?: Function;
        complete?: Function;
    }
    function sendSocketMessage(option: SendSocketMessageOption): void;
}
declare module wx {
    var storageDict: {
        [key: string]: IStorageData;
    };
    interface IStorageData {
        data: any;
        size: number;
        time: number;
    }
    interface ISetStorageOption extends IActiveOption {
        key: string;
        data: any;
    }
    interface IStorageInfo {
        keys: string[];
        currentSize: number;
        limitSize: number;
    }
    function clearStorage(option: IActiveOption): void;
    function clearStorageSync(): void;
    function getStorage(option: ISetStorageOption): void;
    function getStorageSync(key: string): IStorageData;
    function getStorageInfo(option: IActiveOption): void;
    function getStorageInfoSync(): IStorageInfo;
    function setStorage(option: ISetStorageOption): void;
    function setStorageSync(key: string, data: IStorageData): void;
    function removeStorage(option: ISetStorageOption): void;
    function removeStorageSync(key: string): void;
}
