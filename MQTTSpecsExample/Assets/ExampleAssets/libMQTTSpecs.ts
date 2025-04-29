// mqtt.ts

import { Buffer } from './MQTTBuffer';
import { Assertion } from './MQTTBuffer';
import { Wolfy87EventEmitter } from './MQTTEventEmitter';
import { SeededRandomNumberGenerator } from "../SpectaclesInteractionKit/Utils/SeededRandomNumberGenerator"
import {Interactable} from "../SpectaclesInteractionKit/Components/Interaction/Interactable/Interactable"
import {validate} from "../SpectaclesInteractionKit/Utils/validate"


// import * as net from 'net';
// import * as tls from 'tls';
// import * as crypto from 'crypto';

// declare class EventEmitter extends Wolfy87EventEmitter.EventEmitter {};
// declare const events: EventEmitter;
declare const assert: Assertion.Assert;

// Interfaces for options and packet structures
interface ConnectOptions {
  host: string;
  port: number;
  username?: string;
  password?: string;
  clientId?: string;
  keepAlive?: number;
  cleanSession?: boolean;
  will?: {
    topic: string;
    payload: string;
    qos?: number;
    retain?: boolean;
  };
  ssl?: boolean;
}

interface SubscribeOptions {
  topic: string;
  qos?: number;
}

interface PublishOptions {
  topic: string;
  payload: string | Buffer;
  qos?: number;
  retain?: boolean;
}

interface SocketOptions  {
      host: string,
      port: number,
}

interface MqttPacket {
  type: number;
  flags: number;
  length: number;
  packetId?: number;
  topic?: string;
  payload?: Buffer;
  subscriptions?: { topic: string; qos: number }[];
  qos?: number;
  retain?: boolean;
}

// Constants for MQTT packet types
const enum PacketType {
  CONNECT = 1,
  CONNACK = 2,
  PUBLISH = 3,
  PUBACK = 4,
  PUBREC = 5,
  PUBREL = 6,
  PUBCOMP = 7,
  SUBSCRIBE = 8,
  SUBACK = 9,
  UNSUBSCRIBE = 10,
  UNSUBACK = 11,
  PINGREQ = 12,
  PINGRESP = 13,
  DISCONNECT = 14,
}


// MQTT Client class

@component
export class MqttClient extends BaseScriptComponent {
// export class MqttClient extends Wolfy87EventEmitter.EventEmitter {
// export class MqttClient extends events.EventEmitter {
  // private _socket: net.Socket | tls.TLSSocket;
  _socket: Number;
  _buffer: Buffer;
  _options: ConnectOptions;// private _options: ConnectOptions;
  _connected: boolean;
  _packetId: number;
  // private _keepAliveTimer?: NodeJS.Timeout;
  _keepAliveTimer?: DelayedCallbackEvent | null = null
  _subscriptions: Map<string, number>;

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
        this.onStart()
    })
  }
   
  onStart() {
     var options : ConnectOptions = {
      host: options.host,
      port: options.port,
      username: options.username,
      password: options.password,
      clientId: options.clientId || this._generateClientID(),
      keepAlive: options.keepAlive !== undefined ? options.keepAlive : 60,
      cleanSession: options.cleanSession !== undefined ? options.cleanSession : true,
      will: options.will,
      ssl: options.ssl || false,
    };
    this.initConnection(options);
  }
    
  initConnection(options: ConnectOptions) {
    this._keepAliveTimer = this.createEvent("DelayedCallbackEvent");
    /*
    this._options = {
      host: options.host,
      port: options.port,
      username: options.username,
      password: options.password,
      clientId: options.clientId || this._generateClientID(),
      keepAlive: options.keepAlive !== undefined ? options.keepAlive : 60,
      cleanSession: options.cleanSession !== undefined ? options.cleanSession : true,
      will: options.will,
      ssl: options.ssl || false,
    };
    */
    this._buffer = new Buffer();
    this._connected = false;
    this._packetId = 1;
    this._subscriptions = new Map<string, number>();
  }
    
  MQTTEventHandler = class extends Wolfy87EventEmitter.EventEmitter {

        
        
  constructor(options: ConnectOptions, private parent: MqttClient) {
    super();
    
    this.parent._options = {
      host: options.host,
      port: options.port,
      username: options.username,
      password: options.password,
      clientId: options.clientId, // || this._generateClientID(),
      keepAlive: options.keepAlive !== undefined ? options.keepAlive : 60,
      cleanSession: options.cleanSession !== undefined ? options.cleanSession : true,
      will: options.will,
      ssl: options.ssl || false,
    };
    this.parent._buffer = new Buffer();
    this.parent._connected = false;
    this.parent._packetId = 1;
    this.parent._subscriptions = new Map<string, number>();
    
  }
        
  

  public connect(): void {
    if (this.parent._connected) {
      this.emit('error', new Error('Already connected'));
      return;
    }

    const socketOptions = {
      host: this.parent._options.host,
      port: this.parent._options.port,
    };
        

    // XXX TODO: setup connection
    // this._socket = this._options.ssl
    //  ? tls.connect(socketOptions, this._onConnect.bind(this))
    //  : net.connect(socketOptions, this._onConnect.bind(this));

    // this._socket.on('data', this._onData.bind(this));
    // this._socket.on('error', this._onError.bind(this));
    // this._socket.on('close', this._onClose.bind(this));
  }

  public disconnect(): void {
    if (!this.parent._connected) {
      this.emit('error', new Error('Not connected'));
      return;
    }

    const packet: Buffer = new Buffer();
    packet.writeByte((PacketType.DISCONNECT << 4) | 0); // Type: DISCONNECT, no flags
    this._writePacket(packet);
    // XXX WS / SOCKET Disconnect
    // this._socket.end();
  }

  public publish(options: PublishOptions): void {
    if (!this.parent._connected) {
      this.emit('error', new Error('Not connected'));
      return;
    }

    const qos = options.qos || 0;
    const retain = options.retain || false;
    const packet: Buffer = new Buffer();
    let flags = 0;

    // Set flags for QoS and retain
    if (qos > 0) flags |= qos << 1;
    if (retain) flags |= 1;

    // Write packet type and flags
    packet.writeByte((PacketType.PUBLISH << 4) | flags);

    // Write topic
    const topicBuffer = new Buffer();
    topicBuffer.writeString(options.topic);
    packet.writeUInt16(topicBuffer.length());
    packet.append(topicBuffer);

    // Write packet ID for QoS > 0
    if (qos > 0) {
      packet.writeUInt16(this._nextPacketId());
    }

    // Write payload
    const payload = typeof options.payload === 'string' ? new Buffer() : options.payload;
    if (typeof options.payload === 'string') {
      payload.writeString(options.payload);
    }
    packet.append(payload);

    this._writePacket(packet);
  }

  public subscribe(options: SubscribeOptions | SubscribeOptions[]): void {
    if (!this.parent._connected) {
      this.emit('error', new Error('Not connected'));
      return;
    }

    const subscriptions = Array.isArray(options) ? options : [options];
    const packet: Buffer = new Buffer();
    packet.writeByte((PacketType.SUBSCRIBE << 4) | 2); // Type: SUBSCRIBE, flags: 2 (QoS 1)

    const packetId = this._nextPacketId();
    packet.writeUInt16(packetId);

    for (const sub of subscriptions) {
      const topicBuffer = new Buffer();
      topicBuffer.writeString(sub.topic);
      packet.writeUInt16(topicBuffer.length());
      packet.append(topicBuffer);
      packet.writeByte(sub.qos || 0);
      this.parent._subscriptions.set(sub.topic, sub.qos || 0);
    }

    this._writePacket(packet);
  }

  public unsubscribe(topics: string | string[]): void {
    if (!this.parent._connected) {
      this.emit('error', new Error('Not connected'));
      return;
    }

    const topicList = Array.isArray(topics) ? topics : [topics];
    const packet: Buffer = new Buffer();
    packet.writeByte((PacketType.UNSUBSCRIBE << 4) | 2); // Type: UNSUBSCRIBE, flags: 2 (QoS 1)

    const packetId = this._nextPacketId();
    packet.writeUInt16(packetId);

    for (const topic of topicList) {
      const topicBuffer = new Buffer();
      topicBuffer.writeString(topic);
      packet.writeUInt16(topicBuffer.length());
      packet.append(topicBuffer);
      this.parent._subscriptions.delete(topic);
    }

    this._writePacket(packet);
  }

  private _onConnect(): void {
    this.parent._connected = true;
        
    // Send CONNECT packet
    const packet: Buffer = new Buffer();
    packet.writeByte((PacketType.CONNECT << 4) | 0); // Type: CONNECT, no flags

    // Protocol name and version
    const protocolBuffer = new Buffer();
    protocolBuffer.writeString('MQTT');
    packet.writeUInt16(protocolBuffer.length());
    packet.append(protocolBuffer);
    packet.writeByte(4); // Protocol level (MQTT 3.1.1)

    // Connect flags
    let flags = 0;
    if (this.parent._options.cleanSession) flags |= 0x02;
    if (this.parent._options.username) flags |= 0x80;
    if (this.parent._options.password) flags |= 0x40;
    if (this.parent._options.will) {
      flags |= 0x04;
      flags |= (this.parent._options.will.qos || 0) << 3;
      if (this.parent._options.will.retain) flags |= 0x20;
    }
    packet.writeByte(flags);

    // Keep alive
    packet.writeUInt16(this.parent._options.keepAlive || 60);

    // Client ID
    const clientIdBuffer = new Buffer();
    clientIdBuffer.writeString(this.parent._options.clientId || '');
    packet.writeUInt16(clientIdBuffer.length());
    packet.append(clientIdBuffer);

    // Will topic and message
    if (this.parent._options.will) {
      const willTopicBuffer = new Buffer();
      willTopicBuffer.writeString(this.parent._options.will.topic);
      packet.writeUInt16(willTopicBuffer.length());
      packet.append(willTopicBuffer);

      const willPayloadBuffer = new Buffer();
      willPayloadBuffer.writeString(this.parent._options.will.payload);
      packet.writeUInt16(willPayloadBuffer.length());
      packet.append(willPayloadBuffer);
    }

    // Username
    if (this.parent._options.username) {
      const usernameBuffer = new Buffer();
      usernameBuffer.writeString(this.parent._options.username);
      packet.writeUInt16(usernameBuffer.length());
      packet.append(usernameBuffer);
    }

    // Password
    if (this.parent._options.password) {
      const passwordBuffer = new Buffer();
      passwordBuffer.writeString(this.parent._options.password);
      packet.writeUInt16(passwordBuffer.length());
      packet.append(passwordBuffer);
    }

    this._writePacket(packet);

    // Start keep-alive timer
    function runKeepAliveInterval() {
      this.parent._keepAliveTimer = this.parent._keepAliveTimer.bind(() => {
        const pingPacket = new Buffer();
        pingPacket.writeByte((PacketType.PINGREQ << 4) | 0); // Type: PINGREQ
        this._writePacket(pingPacket);
        
        if (this._connected) {
            runKeepAliveInterval();            
        } else {
            this.parent._keepAliveTimer.cancel();         
        }
      });
      this.runKeepAliveInterval.reset(this.parent._options.keepAlive * 1000); 
    }
        
    if (this.parent._options.keepAlive && this.parent._options.keepAlive > 0) {
        runKeepAliveInterval();
    }

    this.emit('connect');
  }

  private _onData(data: Buffer): void {
    this.parent._buffer.append(data);

    while (this.parent._buffer.available() > 0) {
      const packet = this._readPacket();
      if (!packet) break;

      switch (packet.type) {
        case PacketType.CONNACK:
          const returnCode = this.parent._buffer.readByte();
          if (returnCode === 0) {
            this.emit('connack');
          } else {
            this.emit('error', new Error(`Connection refused: ${returnCode}`));
            // this._socket.end();
            // XXX TODO implement socket
          }
          break;

                    
        case PacketType.PUBLISH:
          const qos = (packet.flags >> 1) & 0x03;
          const topicLength = this.parent._buffer.readUInt16();
          const topic = this.parent._buffer.readString(topicLength);
          let packetId: number | undefined;
          if (qos > 0) {
            packetId = this.parent._buffer.readUInt16();
          }
          const payload = this.parent._buffer.getBuffer().slice(this.parent._buffer.getReadOffset());
          this.parent._buffer.setReadOffset(this.parent._buffer.length());

          this.emit('publish', { topic, payload, qos, packetId });

          if (qos === 1) {
            const puback = new Buffer();
            puback.writeByte((PacketType.PUBACK << 4) | 0);
            puback.writeUInt16(packetId!);
            this._writePacket(puback);
          } else if (qos === 2) {
            const pubrec = new Buffer();
            pubrec.writeByte((PacketType.PUBREC << 4) | 0);
            pubrec.writeUInt16(packetId!);
            this._writePacket(pubrec);
          }
          break;

        case PacketType.PUBACK:
        case PacketType.PUBREC:
        case PacketType.PUBREL:
        case PacketType.PUBCOMP:
          const ackPacketId = this.parent._buffer.readUInt16();
          this.emit(packet.type === PacketType.PUBACK ? 'puback' : packet.type === PacketType.PUBREC ? 'pubrec' : packet.type === PacketType.PUBREL ? 'pubrel' : 'pubcomp', ackPacketId);
          if (packet.type === PacketType.PUBREC) {
            const pubrel = new Buffer();
            pubrel.writeByte((PacketType.PUBREL << 4) | 2);
            pubrel.writeUInt16(ackPacketId);
            this._writePacket(pubrel);
          } else if (packet.type === PacketType.PUBREL) {
            const pubcomp = new Buffer();
            pubcomp.writeByte((PacketType.PUBCOMP << 4) | 0);
            pubcomp.writeUInt16(ackPacketId);
            this._writePacket(pubcomp);
          }
          break;

        case PacketType.SUBACK:
          const subackPacketId = this.parent._buffer.readUInt16();
          const returnCodes: number[] = [];
          while (this.parent._buffer.available() > 0) {
            returnCodes.push(this.parent._buffer.readByte());
          }
          this.emit('suback', subackPacketId, returnCodes);
          break;

        case PacketType.UNSUBACK:
          const unsubackPacketId = this.parent._buffer.readUInt16();
          this.emit('unsuback', unsubackPacketId);
          break;

        case PacketType.PINGRESP:
          this.emit('pingresp');
          break;

        default:
          this.emit('error', new Error(`Unknown packet type: ${packet.type}`));
      }
    }
  }

  private _onError(err: Error): void {
    this.emit('error', err);
    // this._socket.end();
    // XXX TODO: implement websocket
  }

  private _onClose(): void {
    this.parent._connected = false;
    if (this.parent._keepAliveTimer) {
      // clearInterval(this.parent._keepAliveTimer);
      this.parent._keepAliveTimer.cancel();
      // XXX ?? DO I NEED THIS?
      // this.parent._keepAliveTimer = undefined;
    }
    this.emit('close');
  }

  private _writePacket(packet: Buffer): void {
    const length = packet.length();
    const lengthBuffer = new Buffer();
    let remainingLength = length;

    do {
      let encodedByte = remainingLength % 128;
      remainingLength = Math.floor(remainingLength / 128);
      if (remainingLength > 0) {
        encodedByte |= 0x80;
      }
      lengthBuffer.writeByte(encodedByte);
    } while (remainingLength > 0);

    const finalPacket = new Buffer();
    finalPacket.append(packet.getBuffer());
    finalPacket.append(lengthBuffer);
    // this._socket.write(finalPacket.getBuffer());
    // TODO handle websocket
  }

  private _readPacket(): MqttPacket | null {
    if (this.parent._buffer.available() < 2) {
      return null;
    }

    const firstByte = this.parent._buffer.readByte();
    const type = (firstByte >> 4) & 0x0f;
    const flags = firstByte & 0x0f;

    let length = 0;
    let multiplier = 1;
    let byte: number;

    do {
      if (this.parent._buffer.available() < 1) {
        this.parent._buffer.setReadOffset(this.parent._buffer.getReadOffset() - 1);
        return null;
      }
      byte = this.parent._buffer.readByte();
      length += (byte & 0x7f) * multiplier;
      multiplier *= 128;
    } while ((byte & 0x80) !== 0);

    if (this.parent._buffer.available() < length) {
      this.parent._buffer.setReadOffset(this.parent._buffer.getReadOffset() - (multiplier / 128));
      return null;
    }

    return { type, flags, length };
  }

  private _nextPacketId(): number {
    const packetId = this.parent._packetId++;
    if (this.parent._packetId > 65535) {
      this.parent._packetId = 1;
    }
    return packetId;
  }
    
  
    }
    
    _toHex = function(n) {
    	if (n < 16) return '0' + n.toString(16);
    	return n.toString(16);
    }
    // private _array_ToHex()
    private _generateClientID(): string {
        // `mqttjs_${crypto.randomBytes(8).toString('hex')}`,
        const id = new SeededRandomNumberGenerator(
            // SEED
        ).getRandomNumberArrayInRangeNoDuplicates(0, 255 - 1, 8);
        var hexid = "";
        for (var i = 0; i < id.length; i++) {
            hexid = hexid + this._toHex(id[i]);
        }
        return hexid;   
        // return  id;
    }
}