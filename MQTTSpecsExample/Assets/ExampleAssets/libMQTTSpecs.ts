// mqtt.ts

// TODO: figure out how to import libraries that aren't script components
// For now these are a part of this file'
// import { Buffer } from './MQTTBuffer';
// import { Assertion } from './MQTTBuffer';
// import { Wolfy87EventEmitter } from './MQTTEventEmitter';
import { SeededRandomNumberGenerator } from "../SpectaclesInteractionKit/Utils/SeededRandomNumberGenerator"
import {Interactable} from "../SpectaclesInteractionKit/Components/Interaction/Interactable/Interactable"
import {validate} from "../SpectaclesInteractionKit/Utils/validate"

// eventEmitter.ts

// Type for event listeners
type Listener<T extends any[] = any[]> = (...args: T) => void;

// Interface for event map (users can extend this for typed events)
interface EventMap {
  [event: string]: any[];
}

// EventEmitter class
export class EventEmitter<TEventMap extends EventMap = Record<string, any[]>> {
  private _events: Map<keyof TEventMap, Set<Listener<TEventMap[keyof TEventMap]>>> = new Map();

  constructor() {
    this._events = new Map();
  }

  // Add a listener for an event
  public on<K extends keyof TEventMap>(event: K, listener: Listener<TEventMap[K]>): this {
    let listeners = this._events.get(event);
    if (!listeners) {
      listeners = new Set();
      this._events.set(event, listeners);
    }
    listeners.add(listener);
    return this;
  }

  // Add a one-time listener for an event
  public once<K extends keyof TEventMap>(event: K, listener: Listener<TEventMap[K]>): this {
    const onceListener: Listener<TEventMap[K]> = (...args: TEventMap[K]) => {
      this.off(event, onceListener);
      listener(...args);
    };
    return this.on(event, onceListener);
  }

  // Remove a specific listener or all listeners for an event
  public off<K extends keyof TEventMap>(event: K, listener?: Listener<TEventMap[K]>): this {
    if (!listener) {
      this._events.delete(event);
    } else {
      const listeners = this._events.get(event);
      if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
          this._events.delete(event);
        }
      }
    }
    return this;
  }

  // Remove all listeners for all events
  public removeAllListeners(): this {
    this._events.clear();
    return this;
  }

  // Emit an event with arguments
  public emit<K extends keyof TEventMap>(event: K, ...args: TEventMap[K]): boolean {
    const listeners = this._events.get(event);
    if (!listeners || listeners.size === 0) {
      return false;
    }
    for (const listener of listeners) {
      try {
        listener(...args);
      } catch (err) {
        print(`Error in listener for event "${String(event)}":` + err);
      }
    }
    return true;
        
  }

    
  // Get all listeners for an event
  public listeners<K extends keyof TEventMap>(event: K): Listener<TEventMap[K]>[] {
    const listeners = this._events.get(event);
    return listeners ? Array.from(listeners) : [];
  }

  // Get the number of listeners for an event
  public listenerCount<K extends keyof TEventMap>(event: K): number {
    const listeners = this._events.get(event);
    return listeners ? listeners.size : 0;
  }

  // Get all event names
  public eventNames(): (keyof TEventMap)[] {
    return Array.from(this._events.keys());
  }

  // Add a listener (alias for on)
  public addListener<K extends keyof TEventMap>(event: K, listener: Listener<TEventMap[K]>): this {
    return this.on(event, listener);
  }

  // Remove a listener (alias for off)
  public removeListener<K extends keyof TEventMap>(event: K, listener: Listener<TEventMap[K]>): this {
    return this.off(event, listener);
  }
}



// import * as net from 'net';
// import * as tls from 'tls';
// import * as crypto from 'crypto';
// declare class EventEmitter extends Wolfy87EventEmitter.EventEmitter {}

namespace Assertion {
// Interface for the assert object (based on the assert.ok usage in the original code)
    export interface Assert {
      ok: (condition: boolean, message: string) => void;
    }
}

// Declare the assert object (assumed to be provided externally or implemented separately)
declare const assert: Assertion.Assert;

// eventEmitter.ts



//
// ^^^^^
// end of event emitter
declare namespace FooMit {


    /**
     * Class for managing events.
     * Can be extended to provide event functionality in other classes.
     *
     * @class EventEmitter Manages event registering and emitting.
     */
    class BarMit {
        doHello(): void;
    }
}

// Buffer class to manage a dynamic byte buffer
class Buffer {
  private _buffer: number[] = [];
  private _offset: number = 0;

  // Constructor: Initializes the buffer with optional data
  constructor(data?: number[] | number) {
    if (data === undefined) {
      this._buffer = [];
      this._offset = 0;
    } else if (typeof data === "number") {
      assert.ok(data >= 0, "Length must be positive");
      this._buffer = new Array(data).fill(0);
      this._offset = 0;
    } else if (Array.isArray(data)) {
      this._buffer = data.slice(); // Create a copy of the input array
      this._offset = 0;
    } else {
      throw new Error("Invalid data type for Buffer constructor");
    }
  }

  // Appends data to the buffer
  public append(data: number | number[] | Buffer): void {
    if (typeof data === "number") {
      this._buffer.push(data);
    } else if (Array.isArray(data)) {
      this._buffer.push(...data);
    } else if (data instanceof Buffer) {
      this._buffer.push(...data._buffer);
    } else {
      throw new Error("Invalid data type for append");
    }
  }

  // Returns the available bytes to read
  public available(): number {
    return this._buffer.length - this._offset;
  }

  // Returns the total buffer length
  public length(): number {
    return this._buffer.length;
  }

  // Clears the buffer
  public clear(): void {
    this._buffer = [];
    this._offset = 0;
  }

  // Reads a single byte
  public readByte(): number {
    assert.ok(this.available() >= 1, "Not enough bytes available to read");
    return this._buffer[this._offset++];
  }

  // Reads an unsigned 16-bit integer (big-endian)
  public readUInt16(): number {
    assert.ok(this.available() >= 2, "Not enough bytes available to read");
    const value = (this._buffer[this._offset++] << 8) + this._buffer[this._offset++];
    return value >>> 0; // Ensure unsigned
  }

  // Reads an unsigned 32-bit integer (big-endian)
  public readUInt32(): number {
    assert.ok(this.available() >= 4, "Not enough bytes available to read");
    const value =
      (this._buffer[this._offset++] << 24) +
      (this._buffer[this._offset++] << 16) +
      (this._buffer[this._offset++] << 8) +
      this._buffer[this._offset++];
    return value >>> 0; // Ensure unsigned
  }

  // Reads a string of specified length
  public readString(length: number): string {
    assert.ok(this.available() >= length, "Not enough bytes available to read");
    const chars: string[] = [];
    for (let i = 0; i < length; i++) {
      chars.push(String.fromCharCode(this._buffer[this._offset++]));
    }
    return chars.join("");
  }

  // Writes a single byte
  public writeByte(value: number): void {
    assert.ok(value >= 0 && value <= 255, "Byte value out of range");
    this._buffer.push(value);
  }

  // Writes an unsigned 16-bit integer (big-endian)
  public writeUInt16(value: number): void {
    assert.ok(value >= 0 && value <= 65535, "UInt16 value out of range");
    this._buffer.push((value >> 8) & 0xff, value & 0xff);
  }

  // Writes an unsigned 32-bit integer (big-endian)
  public writeUInt32(value: number): void {
    assert.ok(value >= 0 && value <= 4294967295, "UInt32 value out of range");
    this._buffer.push(
      (value >> 24) & 0xff,
      (value >> 16) & 0xff,
      (value >> 8) & 0xff,
      value & 0xff
    );
  }

  // Writes a string
  public writeString(value: string): void {
    for (let i = 0; i < value.length; i++) {
      this._buffer.push(value.charCodeAt(i));
    }
  }
    

  // Returns the internal buffer
  public getBuffer(): number[] {
    return this._buffer.slice();
  }

  // Sets the read offset
  public setReadOffset(offset: number): void {
    assert.ok(offset >= 0 && offset <= this._buffer.length, "Invalid read offset");
    this._offset = offset;
  }

  // Gets the current read offset
  public getReadOffset(): number {
    return this._offset;
  }
}

//
// Buffer
//
// declare const assert: Assertion.Assert;


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

class MqttConn extends EventEmitter {
  _socket: Number;
  _buffer: Buffer;
  _options: ConnectOptions;// private _options: ConnectOptions;
  _connected: boolean;
  _packetId: number;
  // private _keepAliveTimer?: NodeJS.Timeout;
  _keepAliveTimer?: DelayedCallbackEvent | null = null;
  _subscriptions: Map<string, number>;
  _wss_socket: WebSocket;
    
  constructor(options: ConnectOptions, private parent: MqttClient) {
    super();
            
    
    this._options = {
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
    this._buffer = new Buffer();
    this._connected = false;
    this._packetId = 1;
    this._subscriptions = new Map<string, number>();
    
  }
        
  public connect(): void {
    if (this._connected) {
      this.emit('error', new Error('Already connected'));
      return;
    }

    const socketOptions = {
      host: this._options.host,
      port: this._options.port,
    };
        
    
    // XXX TODO: setup connection
    // this._socket = this._options.ssl
    //  ? tls.connect(socketOptions, this._onConnect.bind(this))
    //  : net.connect(socketOptions, this._onConnect.bind(this));

    // this._socket.on('data', this._onData.bind(this));
    // this._socket.on('error', this._onError.bind(this));
    // this._socket.on('close', this._onClose.bind(this));
    // Listen for the open event
    this.parent._wss_socket.onopen = (event: WebSocketEvent) => {
      // Socket has opened, send a message back to the server
      this.parent._wss_socket.send('Hello Spectacles');
      /*   
      

      // Try sending a binary message
      // (the bytes below spell 'Message 2')
      const message: number[] = [77, 101, 115, 115, 97, 103, 101, 32, 50];
      const bytes = new Uint8Array(message);
      socket.send(bytes);
      */
       print("Socket opened");
    };
  }

  public disconnect(): void {
    if (!this._connected) {
      this.emit('error', new Error('Not connected'));
      return;
    }

    const packet: Buffer = new Buffer();
    packet.writeByte((PacketType.DISCONNECT << 4) | 0); // Type: DISCONNECT, no flags
    this._writePacket(packet);
    // XXX WS / SOCKET Disconnect
    // this._socket.end();
        
    // Our websocket has no "close" method
  }

  public publish(options: PublishOptions): void {
    if (!this._connected) {
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
    if (!this._connected) {
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
      this._subscriptions.set(sub.topic, sub.qos || 0);
    }

    this._writePacket(packet);
  }

  public unsubscribe(topics: string | string[]): void {
    if (!this._connected) {
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
      this._subscriptions.delete(topic);
    }

    this._writePacket(packet);
  }

  private _onConnect(): void {
    this._connected = true;
        
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
    if (this._options.cleanSession) flags |= 0x02;
    if (this._options.username) flags |= 0x80;
    if (this._options.password) flags |= 0x40;
    if (this._options.will) {
      flags |= 0x04;
      flags |= (this._options.will.qos || 0) << 3;
      if (this._options.will.retain) flags |= 0x20;
    }
    packet.writeByte(flags);

    // Keep alive
    packet.writeUInt16(this._options.keepAlive || 60);

    // Client ID
    const clientIdBuffer = new Buffer();
    clientIdBuffer.writeString(this._options.clientId || '');
    packet.writeUInt16(clientIdBuffer.length());
    packet.append(clientIdBuffer);

    // Will topic and message
    if (this._options.will) {
      const willTopicBuffer = new Buffer();
      willTopicBuffer.writeString(this._options.will.topic);
      packet.writeUInt16(willTopicBuffer.length());
      packet.append(willTopicBuffer);

      const willPayloadBuffer = new Buffer();
      willPayloadBuffer.writeString(this._options.will.payload);
      packet.writeUInt16(willPayloadBuffer.length());
      packet.append(willPayloadBuffer);
    }

    // Username
    if (this._options.username) {
      const usernameBuffer = new Buffer();
      usernameBuffer.writeString(this._options.username);
      packet.writeUInt16(usernameBuffer.length());
      packet.append(usernameBuffer);
    }

    // Password
    if (this._options.password) {
      const passwordBuffer = new Buffer();
      passwordBuffer.writeString(this._options.password);
      packet.writeUInt16(passwordBuffer.length());
      packet.append(passwordBuffer);
    }

    this._writePacket(packet);

    // Start keep-alive timer
    function runKeepAliveInterval() {
      this._keepAliveTimer = this._keepAliveTimer.bind(() => {
        const pingPacket = new Buffer();
        pingPacket.writeByte((PacketType.PINGREQ << 4) | 0); // Type: PINGREQ
        this._writePacket(pingPacket);
        
        if (this._connected) {
            runKeepAliveInterval();            
        } else {
            this._keepAliveTimer.cancel();         
        }
      });
      this.runKeepAliveInterval.reset(this._options.keepAlive * 1000); 
    }
        
    if (this._options.keepAlive && this._options.keepAlive > 0) {
        runKeepAliveInterval();
    }

    this.emit('connect');
  }

  private _onData(data: Buffer): void {
    this._buffer.append(data);

    while (this._buffer.available() > 0) {
      const packet = this._readPacket();
      if (!packet) break;

      switch (packet.type) {
        case PacketType.CONNACK:
          const returnCode = this._buffer.readByte();
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
          const topicLength = this._buffer.readUInt16();
          const topic = this._buffer.readString(topicLength);
          let packetId: number | undefined;
          if (qos > 0) {
            packetId = this._buffer.readUInt16();
          }
          const payload = this._buffer.getBuffer().slice(this._buffer.getReadOffset());
          this._buffer.setReadOffset(this._buffer.length());

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
          const ackPacketId = this._buffer.readUInt16();
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
          const subackPacketId = this._buffer.readUInt16();
          const returnCodes: number[] = [];
          while (this._buffer.available() > 0) {
            returnCodes.push(this._buffer.readByte());
          }
          this.emit('suback', subackPacketId, returnCodes);
          break;

        case PacketType.UNSUBACK:
          const unsubackPacketId = this._buffer.readUInt16();
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
    this._connected = false;
    if (this._keepAliveTimer) {
      // clearInterval(this._keepAliveTimer);
      this._keepAliveTimer.cancel();
      // XXX ?? DO I NEED THIS?
      // this._keepAliveTimer = undefined;
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
    if (this._buffer.available() < 2) {
      return null;
    }

    const firstByte = this._buffer.readByte();
    const type = (firstByte >> 4) & 0x0f;
    const flags = firstByte & 0x0f;

    let length = 0;
    let multiplier = 1;
    let byte: number;

    do {
      if (this._buffer.available() < 1) {
        this._buffer.setReadOffset(this._buffer.getReadOffset() - 1);
        return null;
      }
      byte = this._buffer.readByte();
      length += (byte & 0x7f) * multiplier;
      multiplier *= 128;
    } while ((byte & 0x80) !== 0);

    if (this._buffer.available() < length) {
      this._buffer.setReadOffset(this._buffer.getReadOffset() - (multiplier / 128));
      return null;
    }

    return { type, flags, length };
  }

  private _nextPacketId(): number {
    const packetId = this._packetId++;
    if (this._packetId > 65535) {
      this._packetId = 1;
    }
    return packetId;
  }
}
// type Constructor<T> = Function & { prototype: T }
type Constructor<T> = new (...args: any[]) => T;
function ScriptMixin<T extends Constructor<{}>>(Base: T) {
  return class extends Base {
    _tag: string;
    constructor(...args: any[]) {
      super(...args);
      // this._tag = "";
    }
  };
}

const MQTTMixin = ScriptMixin(EventEmitter);

// MQTT Client class
@component
export class MqttClient extends BaseScriptComponent implements FooMit.BarMit {
  @input
  remoteServiceModule: RemoteServiceModule;
// export class MqttClient extends Wolfy87EventEmitter.EventEmitter {
// export class MqttClient extends events.EventEmitter {
  // private _socket: net.Socket | tls.TLSSocket;
  _socket: Number;
  _buffer: Buffer;
  _options: ConnectOptions;// private _options: ConnectOptions;
  _connected: boolean;
  _packetId: number;
  // private _keepAliveTimer?: NodeJS.Timeout;
  _keepAliveTimer?: DelayedCallbackEvent | null = null;
  _subscriptions: Map<string, number>;
  _wss_socket: WebSocket;
  _mqtteventhandler? : MqttConn; // Wolfy87EventEmitter.EventEmitter;
  _globaleventemitter : this;
    
    
  onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
        this.onStart()
    })
  }
   
  onStart() {
     // XXX Hardcoded
     // TODO: set these up in the class component
     // 
     // See different test server options
     // http://www.steves-internet-guide.com/mqtt-hosting-brokers-and-servers/#list
     var options : ConnectOptions = {
      host: "test.mosquitto.org",// options.host,
      port:  1881, // options.port,
      username: null, // options.username,
      password: null, // options.password,
      clientId: this._generateClientID(),
      keepAlive: 60, // sec?
      cleanSession: true, // what is this?
      will: {
        topic: "libMQTTSpecs",
        payload: "test"
        // qos: number;
        // retain?: boolean;
      },
      ssl: true,
    };
    this.initConnection(options);
  }
    
  initConnection(options: ConnectOptions) {
    this._keepAliveTimer = this.createEvent("DelayedCallbackEvent");
    // this._options = options;
    this._wss_socket = this.remoteServiceModule.createWebSocket('wss://rtc.ngrok.io/');
    this._wss_socket.binaryType = 'blob';
        
    print("initializing mqtt clientId" + options.clientId);
    
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
    
    // this._mqtteventhandler = new this.MQTTEventHandler(options, this);
    this._mqtteventhandler = new MqttConn(options, this);
    
    // for now, go ahead and connect, we may want to make this
    // configurable, an autoconnect vs manual
    this._mqtteventhandler.connect();
    
  }
    
  //
  // Implement interface
  //
  doHello(): void {
    print("hello");      
  }

  //
  // Class Utility Functions
  //
  _toHex = function(n) {
	if (n < 16) return '0' + n.toString(16);
	return n.toString(16);
  }

  private _generateClientID(): string {
    // `mqttjs_${crypto.randomBytes(8).toString('hex')}`,
    const id = new SeededRandomNumberGenerator(
        // SEED
    ).getRandomNumberArrayInRangeNoDuplicates(0, 255 - 1, 4);
    var hexid = "";
    for (var i = 0; i < id.length; i++) {
        hexid = hexid + this._toHex(id[i]);
    }
    return hexid;   
   }
}