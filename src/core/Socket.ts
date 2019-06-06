import { EventX, MiniDispatcher } from "./MiniDispatcher";
import { AMF3Decode, AMF3Encode } from "./AMF3";


    export const enum SocketEventX{
        OPEN = 65536,
        CLOSE,
        ERROR
    }


    export class Stream extends EventX{
        data:any;
        len:number;

        toObject(v:any[],pros:string[],to?:object){
            let n = v.length;
            if(!to){
                to = {};
            }
            for(let i = 0;i<n;i++){
                to[pros[i]] = v[i];
            }
            return to;
        }
    }



   /**
     * Socket 连接
     */
    export class Socket extends MiniDispatcher {
        connected:boolean;
        input: AMF3Decode;
        output: AMF3Encode;
        sendoption : wx.SendSocketMessageOption;
        sendTemp:any[];
        stream:Stream;

        constructor(){
            super();
            this.input = new AMF3Decode();
            this.output = new AMF3Encode(new ArrayBuffer(10240)) //10KB的缓冲区;
            this.sendoption = {} as wx.SendSocketMessageOption;
            this.sendTemp = [];
            this.stream = new Stream();
        }


        connect(url: string) {
            wx.onSocketOpen(this.onOpen.bind(this));
            wx.onSocketClose(this.onClose.bind(this));
            wx.onSocketError(this.onError.bind(this));
            wx.onSocketMessage(this.onMessage.bind(this));
            wx.connectSocket({url:url} as wx.ConnectSocketOption);
        }


        close(reason:string) {
            this.connected = false;
            wx.closeSocket( {reason:reason} as wx.CloseSocketOption)
        }

        onOpen(e: any) {
            this.connected = true;
            this.simpleDispatch(SocketEventX.OPEN, e);
        }

        onMessage(e:{data:ArrayBuffer}) {

            let{input,stream} = this;

            let data = e.data;

            input.clear();
            input.setArrayBuffer(data);
            let code = input.readUint16(true);
            let flag = input.readByte();
            let len = data.byteLength;
            stream.type = code;
            stream.len = len;
            if(flag == 0){
                stream.data = input.readObject();
            }else{
                //todo;
                input.clear();
                data = new Zlib.Inflate(new Uint8Array(data.slice(3))).decompress().buffer;
                input.setArrayBuffer(data);
                stream.data = input.readObject();
                console.log(`Inflate data code:${code} length:${stream.len} => ${input.position}`);
            }

            if(stream.type != 0){
                console.log("receive: " + stream.type + ", ",stream.data)
            }
            this.dispatchEvent(stream);


            // let cmd:any[] = input.readObject();
            // stream.type = cmd[0];
            // if(stream.type == 700){
            //     input.clear();
            //     input.setArrayBuffer(data);
            //     cmd = input.readObject();
            // }

            // stream.data = cmd[1];
            // stream.len = data.byteLength;
            
            // this.dispatchEvent(stream);
            // }
        }

        onClose(e: any) {
            console.log("socket onclose:",e);
            
            this.simpleDispatch(SocketEventX.CLOSE, e);
        }

        onError(e: any) {
            console.log("socket onError:",e);
            this.simpleDispatch(SocketEventX.ERROR, e);
        }

        /**
         * 发送数据到服务器
         * @param data 需要发送的数据 可以是String或者ArrayBuffer
         */
        send(code:number,value?:any): void {
            if(code != 0){
                console.log("send: ", code, value)
            }

            let{sendoption,output,sendTemp} = this;

            output.clear();
            output.position = 2;
            output.writeUint16(code);

            if(value != undefined){
                // if((value instanceof Array) == false){
                //     sendTemp[0] =value;
                //     value = sendTemp;
                // }
                output.writeObject(value);
            }
            let pos = output.position;
            output.position = 0;
            output.writeUint16(pos);

            sendoption.data = output.toArrayBuffer(pos);
            wx.sendSocketMessage(sendoption);
        }
    }


    export class SocketDecoder{
        socket:Socket;
        constructor(socket:Socket,types:number[]){
            if(!socket){
                return;
            }
            this.socket = socket;
            let n = types.length;
            for(let i = 0;i<n;i++){
                let type = types[i];
                let f = this["f_"+type];
                if(f){
                    socket.on(type,f,this);
                }else{
                    console.log("缺少function:f_"+type);
                }
            }
        }

        /**
		 * 必须是固定的格式;
		 * @param args [0:状态码,1:code,..args]形式的数据
		 * 
		 */		
		showError(args:any[],type:number = 0){
			// if(!args){
			// 	return "";
			// }
			
			// args.shift();
			// if(args.length == 0)
			// {
			// 	return null;
			// }
			// if(args.length > 2 && args[1] == "res")
			// {
			// 	let arr:string[] = [];
			// 	arr.push(args[0]);
			// 	let vo:IZiyuanbiao = condition_ziyuan_get(args[1],args[2]);
			// 	if(vo)
			// 	{
			// 		arr.push(vo.name);
			// 	}
			// 	else
			// 	{
			// 		arr.push("资源");
			// 	}
			// 	args = arr;
			// }
			// let str:string = getMessage.apply(this,args);
			// switch(type){
			// 	case 0:
			// 		facade.simpleDispatch(CONST_EVENT.NOTICE_WARING, str + "");
			// 		break;
			// 	case 1:
			// 		// Alert.getInstance().popUp(str);
			// 		break;
			// }
			// return str;
		}
    }