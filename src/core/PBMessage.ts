module rf {
    /**
     * 我其实不想实现它,奋笔疾书的感觉真好
     */
    const enum PBType {
        DOUBLE = 1,
        FLOAT = 2,
        INT64 = 3,
        UINT64 = 4,
        INT32 = 5,
        FIXED64 = 6,
        FIXED32 = 7,
        BOOL = 8,
        STRING = 9,
        GROUP = 10,
        MESSAGE = 11,
        BYTES = 12,
        UINT32 = 13,
        ENUM = 14,
        SFIXED32 = 15,
        SFIXED64 = 16,
        SINT32 = 17,
        SINT64 = 18,
    }


    export type MessageStruct =
        [/**0 */string, /**1 */number,/**2 */number] |
        [/**属性名字 */string, /**选项 */number,/**数据类型 */number,/**如果是子消息，消息名称 */string] |
        [/**属性名字 */string, /**选项 */number,/**数据类型 */number,/**如果是子消息，消息名称 */string, /**默认值 */any];

    export class PBMessage {
        static Enabled = false;
        static ThrowErrorEnabled = true;

        static StructByName: { /**消息名称*/[index: string]:
            {
                c?: MessageStruct,
                s?: MessageStruct,
                dto?: MessageStruct
            }
        } = {};


        //#region writeType;
        static writeMessage(msg: object, type: number | string, side: string = "s"): AMF3Encode {
            var dic = PBMessage.StructByName[type];
            if (!dic) {
                return null;
            }
            var decodes = dic[side];
            if (!decodes) {
                return null;
            }
            var amf: AMF3Encode;
            var b: boolean = false;
            for (let index in decodes) {
                let id = +index;
                let body = decodes[id];
                let name = body[0]
                let label = body[1];

                //optional
                if (label == 1 && !(name in msg)) {
                    continue;
                }
                let value: any = msg[name];
                //4位为默认值
                if (value == undefined || value === body[4]) {
                    if (label == 2) {//required
                        let tips = `${type}.${name} is required!!`
                        if (this.ThrowErrorEnabled) {
                            throw new Error(tips);
                        } else {
                            var e=new Error(tips);
                            console.error(e.stack);
                        }
                    }
                    continue;
                }
                //只是为了不想写入一个空的object;
                if (amf == null) {
                    amf = new AMF3Encode();
                }

                let wireType = this.type2WireType(body[2]);
                let subMsgType = body[3];
                let isList=label==3?1:0;

                let tag = (id << 4) | (isList << 3) | wireType;
                amf.write29(tag, true);
                //console.log(tag, id, isList, wireType);

                //repeate
                if (label == 3) {
                    amf.write29(value.length, true);
                    for (let item of value) {
                        this.writeElement(item, wireType, side, amf, subMsgType);
                    }
                }
                else {
                    this.writeElement(value, wireType, side, amf, subMsgType);
                }
            }
            return amf;
        }

        private static writeElement(value: any, wireType: number, side: string = "s", amf: AMF3Encode, subMsgType?: string): void {
            switch (wireType) {
                case 0: //Varint	int32, int64, uint32, uint64, sint32, sint64, bool, enum
                    amf.writeInt(value);
                    break;
                case 1: //64-bit	fixed64, sfixed64, double
                    amf.writeDouble(value);
                    break;
                case 2: //Length-delimi	string, bytes, embedded messages, packed repeated fields
                    amf.writeString(value);
                    break;
                case 3://Start group	Groups (deprecated) Message;
                    var message = this.writeMessage(value, subMsgType, "dto");
                    if (message) {
                        var bytes = message.toUint8Array();
                        amf.write29(bytes.length, true);
                        amf.writeByteArray(bytes);
                    } else {
                        amf.write29(0, true);
                    }
                    break;
                case 4://End group	Groups (deprecated)
                    amf.writeObject(value);
                    break;
                case 5: //32-bit	fixed32, sfixed32, float
                    value = amf.writeFloat(value);
                    break;
                //break;
                default:
                    amf.writeObject(value);
                    //rf.ThrowError("protobuf的wireType未知");
                    break;
            }
        }
        //#endregion

        static readMessage(amf: AMF3Decode, type: number | string, side: string = "c", len: number): any {
            let dic = PBMessage.StructByName[type];
            if (!dic) {
                rf.ThrowError(`read:<<<<<${type} is empty`);
                return null;
            }
            let encodes = dic[side];
            if (!encodes) {
                rf.ThrowError(`read:<<<<<${type} is empty`);
                return null;
            }
            var msg = {};
            //检查处理默认值
            for (let id in encodes) {
                let body = encodes[id];
                if (4 in body) {//有默认值
                    let key = body[0];
                    msg[key] = body[4];
                }
            }

            let messageEndPos = amf.position + len;
            while (amf.position < messageEndPos) {
                let tag = amf.read29(true);
                let id = tag >>> 4;//type在前3位
                let isList: number = tag & 8;
                let wireType=tag&7;

                let body = encodes[id];
                let name: string;
                let subMsgType: string;

                //至少读得出来
                if (!body) {
                    name = id + "";
                    console.error(`读取消息类型为:${type}，找不到索引:${id}`);
                } else {
                    name = body[0];
                    subMsgType = body[3];
                }

                var listLen = 1;
                if (isList) {
                    listLen = amf.read29(true);
                    let arr = msg[name];
                    if (!arr) msg[name] = arr = [];
                }

                for (var i = 0; i < listLen; i++) {
                    let value: any;
                    switch (wireType) {
                        case 0: //Varint	int32, int64, uint32, uint64, sint32, sint64, bool, enum
                            value = amf.readInt();
                            break;
                        case 1: //64-bit	fixed64, sfixed64, double
                            value = amf.readDouble();
                            break;
                        case 2: //Length-delimi	string, bytes, embedded messages, packed repeated fields
                            value = amf.readString();
                            break;
                        case 3://Start group	Groups (deprecated) Message;
                            let len: number = amf.read29(true);
                            if (len > 0) {
                                value = this.readMessage(amf, subMsgType, "dto", len);
                            }
                            break;
                        case 4://End group	Groups (deprecated) amf;
                            value = amf.readObject();
                            break;
                        case 5: //32-bit	fixed32, sfixed32, float
                            value = amf.readFloat();
                            break;
                        //break;
                        default:
                            value = amf.readObject();
                            //rf.ThrowError("protobuf的wireType未知");
                            break;
                    }

                    if (isList) {//repeated
                        msg[name].push(value);
                    }
                    else {
                        msg[name] = value;
                    }
                }
            }
            return msg;
        }

        private static type2WireType(type: number): number {
            switch (type) {
                case PBType.INT32:
                case PBType.SINT32:
                case PBType.ENUM:
                case PBType.UINT32:
                case PBType.INT64:
                case PBType.SINT64:
                case PBType.UINT64:
                case PBType.BOOL:
                    return 0;
                case PBType.DOUBLE:
                case PBType.FIXED64:
                case PBType.SFIXED64:
                    return 1;
                case PBType.STRING:
                    return 2;
                case PBType.MESSAGE:
                    return 3;
                case PBType.GROUP:
                case PBType.BYTES:
                    return 4;
                case PBType.FIXED32:
                case PBType.SFIXED32:
                case PBType.FLOAT:
                    return 5;
            }
            return -1;
        }
    }

}