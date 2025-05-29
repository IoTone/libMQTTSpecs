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
type Listener<T extends any[] = any[]> = (...args: T) => void;

interface EventMap {
  [event: string]: any[];
}

export class EventEmitter<TEventMap extends EventMap = Record<string, any[]>> {
  private _events: Map<keyof TEventMap, Set<Listener<TEventMap[keyof TEventMap]>>> = new Map();

  constructor() {
    this._events = new Map();
  }

  public on<K extends keyof TEventMap>(event: K, listener: Listener<TEventMap[K]>): this {
    let listeners = this._events.get(event);
    if (!listeners) {
      listeners = new Set();
      this._events.set(event, listeners);
    }
    listeners.add(listener);
    return this;
  }

  public once<K extends keyof TEventMap>(event: K, listener: Listener<TEventMap[K]>): this {
    const onceListener: Listener<TEventMap[K]> = (...args: TEventMap[K]) => {
      this.off(event, onceListener);
      listener(...args);
    };
    return this.on(event, onceListener);
  }

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

  public removeAllListeners(): this {
    this._events.clear();
    return this;
  }

  public emit<K extends keyof TEventMap>(event: K, ...args: TEventMap[K]): boolean {
    const listeners = this._events.get(event);
    if (!listeners || listeners.size === 0) {
      return false;
    }
    for (const listener of listeners) {
      try {
        listener(...args);
      } catch (err) {
        print(`Error in listener for event "${String(event)}": ${err}`);
      }
    }
    return true;
  }

  public listeners<K extends keyof TEventMap>(event: K): Listener<TEventMap[K]>[] {
    const listeners = this._events.get(event);
    return listeners ? Array.from(listeners) : [];
  }

  public listenerCount<K extends keyof TEventMap>(event: K): number {
    const listeners = this._events.get(event);
    return listeners ? listeners.size : 0;
  }

  public eventNames(): (keyof TEventMap)[] {
    return Array.from(this._events.keys());
  }

  public addListener<K extends keyof TEventMap>(event: K, listener: Listener<TEventMap[K]>): this {
    return this.on(event, listener);
  }

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


//
// Rev 2 of mqttclient
//

// Event map for MQTT client
interface MqttEvents extends Record<string, any[]> {
  connect: [];
  message: [string, Uint8Array];
  error: [Error];
  close: [];
}

// Interfaces for options
interface ConnectOptions {
  url: string; // WebSocket URL (e.g., ws://broker:9001/mqtt)
  clientId?: string;
  keepAlive?: number;
  protocolVersion?: number;
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
  DISCONNECT = 14
}

// Simple MQTT Client
export class MqttClientLib2 extends EventEmitter<MqttEvents> {
  private _ws?: WebSocket;
  private _buffer: Uint8Array;
  private _offset: number;
  private _options: ConnectOptions;
  private _connected: boolean;
  private _packetId: number;
  private _keepAliveTimer?: number;
  private internetModule: InternetModule = require("LensStudio:InternetModule");
  constructor(options: ConnectOptions, private parent: MqttClient2) {
    super();
    this._options = {
      url: options.url,
      clientId: options.clientId,
      keepAlive: options.keepAlive,
      protocolVersion: options.protocolVersion ?? 4 // MQTT 3.1.1
    };
    this._buffer = new Uint8Array(0);
    this._offset = 0;
    this._connected = false;
    this._packetId = 1;
  }

  public connect(): void {
    
    if (this._connected) {
      this.emit('error', new Error('Already connected'));
      return;
    }

    try {
      print("connect()");
      // this._ws = new ls.WebSocket(this._options.url);
      this.parent._ws.onopen = this._onConnect.bind(this);
      this.parent._ws.onmessage = this._onMessage.bind(this);
      this.parent._ws.onerror = this._onError.bind(this);
      this.parent._ws.onclose = this._onClose.bind(this);
    } catch (err) {
      this.emit('error', new Error(`WebSocket creation failed: ${err}`));
    }
  }

  public disconnect(): void {
    print("disconnect()");
    if (!this._connected) {
      this.emit('error', new Error('Not connected'));
      return;
    }

    const packet = this._createPacket();
    packet.writeByte((PacketType.DISCONNECT << 4) | 0);
    this._writePacket(packet);
    this._ws?.close();
  }

  public publish(topic: string, payload: string | Uint8Array, qos: 0 | 1 = 0): void {
    print("publish()");
    if (!this._connected) {
      this.emit('error', new Error('Not connected'));
      return;
    }

    const packet = this._createPacket();
    packet.writeByte((PacketType.PUBLISH << 4) | (qos << 1));

    const topicBytes = this._stringToBytes(topic);
    packet.writeUInt16(topicBytes.length);
    packet.append(topicBytes);

    if (qos > 0) {
      packet.writeUInt16(this._nextPacketId());
    }

    const payloadBytes = typeof payload === 'string' ? this._stringToBytes(payload) : payload;
    packet.append(payloadBytes);

    this._writePacket(packet);
  }

  public subscribe(topic: string, qos: 0 | 1 = 0): void {
    print("subscribe()");
    if (!this._connected) {
      this.emit('error', new Error('Not connected'));
      return;
    }

    const packet = this._createPacket();
    packet.writeByte((PacketType.SUBSCRIBE << 4) | 2);

    const packetId = this._nextPacketId();
    packet.writeUInt16(packetId);

    const topicBytes = this._stringToBytes(topic);
    packet.writeUInt16(topicBytes.length);
    packet.append(topicBytes);
    packet.writeByte(qos);

    this._writePacket(packet);
  }

  /**
   * Perform MQTT connection set up once the transport is active
   *
   */
  private _onConnect(): void {
    print("_onConnect()");
    this._connected = true;  
        
    
    const packet = new PacketBuilder();
    packet.writeByte(PacketType.CONNECT << 4);

    // Protocol name and version
    const protocol = this._stringToBytes('MQTT');
    packet.writeUInt16(protocol.length);
    packet.append(protocol);
    packet.writeByte(this._options.protocolVersion!); // 4 for MQTT 3.1.1
    packet.writeByte(0x02); // Clean session
    packet.writeUInt16(this._options.keepAlive!);

    // Client ID
    const clientId = this._stringToBytes(this._options.clientId!);
    packet.writeUInt16(clientId.length);
    packet.append(clientId);

    this._sendPacket(PacketType.CONNECT, packet.build());
    // this._writePacket(packet.build());
        
    // Start keep-alive
    if (this._options.keepAlive! > 0) {
      const interval = this._options.keepAlive! * 1000;
      // this._sendPing();
      /*
      this._keepAliveTimer = ls.global.scene.createTimer(() => {
        this.sendPacket(PacketType.PINGREQ, new Uint8Array(0));
      }, interval / 1000); */
    }

    this._connected = true;
    
    this.emit('connect');
  }
    
  private _onConnectOrig(): void {
    print("_onConnect()");
    this._connected = true;

    const packet = this._createPacket();
    packet.writeByte((PacketType.CONNECT << 4) | 0);

    const protocolBytes = this._stringToBytes('MQTT');
        
    // const protocolBytes = this._altStringToBytes('MQTT');
    print("Protocol bytes (remaining Length): " + protocolBytes.length);
        
    packet.writeUInt16(protocolBytes.length);
    packet.append(protocolBytes);
    packet.writeByte(4); // MQTT 3.1.1
    packet.writeByte(0x02); // Clean session
    packet.writeUInt16(this._options.keepAlive || 60);

        
    // const clientIdBytes = this._stringToBytes(this._options.clientId || '');
    const clientIdBytes = this._altStringToBytes(this._options.clientId || '');
    packet.writeUInt16(clientIdBytes.length);
    packet.append(clientIdBytes);
    print("CONNECT packet length: " + packet.bytes.length);
    this._writePacket(packet);

    if (this._options.keepAlive && this._options.keepAlive > 0) {
      const interval = this._options.keepAlive * 1000;
      this._sendPing();
      /*
      this._keepAliveTimer = ls.global.scene.createTimer(() => {
        this._sendPing();
      }, interval / 1000);
      */
      print("ahhhhhhhhhhhh TODO: implement the timer");
    }

    this.emit('connect');
  }

  private _onMessage(event: WebSocketMessageEvent): void {
    print("----------------> _onMessage()");
    let data: Uint8Array;
    if (typeof event.data === 'string') {
      data = this._stringToBytes(event.data);
    } else if (event.data instanceof ArrayBuffer) {
      data = new Uint8Array(event.data);
    } else {
      this.emit('error', new Error('Unsupported WebSocket message type'));
      return;
    }

    this._buffer = this._appendBytes(this._buffer, data);
    this._offset = 0;

    while (this._buffer.length - this._offset > 0) {
      const packet = this._readPacket();
      if (!packet) break;

      switch (packet.type) {
        case PacketType.CONNACK:
          const returnCode = this._readByte();
          if (returnCode === 0) {
            this.emit('connect');
          } else {
            this.emit('error', new Error(`Connection refused: ${returnCode}`));
            this._ws?.close();
          }
          break;

        case PacketType.PUBLISH:
          const qos = (packet.flags >> 1) & 0x03;
          const topicLength = this._readUInt16();
          const topic = this._readString(topicLength);
          let packetId: number | undefined;
          if (qos > 0) {
            packetId = this._readUInt16();
          }
          const payload = this._buffer.subarray(this._offset);
          this._offset = this._buffer.length;

          this.emit('message', topic, payload);

          if (qos === 1) {
            const puback = this._createPacket();
            puback.writeByte((PacketType.PUBACK << 4) | 0);
            puback.writeUInt16(packetId!);
            this._writePacket(puback);
          }
          break;

        case PacketType.SUBACK:
          this._readUInt16(); // Packet ID
          this._readByte(); // QoS
          break;

        case PacketType.PINGRESP:
          break;

        default:
          this.emit('error', new Error(`Unsupported packet type: ${packet.type}`));
      }
    }
  }

  private _onError(event: WebSocketErrorEvent): void {
    print("_onError()");
    this.emit('error', new Error(`WebSocket error: unknown WS error`));
    this._ws?.close();
  }

  private _onClose(): void {
    this._connected = false;
    if (this._keepAliveTimer) {
      /*
      ls.global.scene.removeTimer(this._keepAliveTimer);
      this._keepAliveTimer = undefined;
      */
      // XXX TODO: fix the timer
    }
    this.emit('close');
  }

  private _writePacket(packet: { bytes: Uint8Array }): void {
    
    const length = packet.bytes.length;
    const lengthBuffer = this._createPacket();
    let remainingLength = length;
    print("_writePacket(): " + remainingLength);
    do {
      let encodedByte = remainingLength % 128;
      remainingLength = Math.floor(remainingLength / 128);
      if (remainingLength > 0) {
        encodedByte |= 0x80;
      }
      lengthBuffer.writeByte(encodedByte);
    } while (remainingLength > 0);

    const finalPacket = this._appendBytes(packet.bytes, lengthBuffer.bytes);
    this._ws?.send(finalPacket);
    print("_writePacket sent: " + finalPacket);
  }
    
  private _sendPacket(type: PacketType, payload: Uint8Array): void {
    const header = new PacketBuilder();
    header.writeByte(type << 4);

    let length = payload.length;
    const lengthBytes = new PacketBuilder();
    do {
      let encodedByte = length % 128;
      length = Math.floor(length / 128);
      if (length > 0) encodedByte |= 0x80;
      lengthBytes.writeByte(encodedByte);
    } while (length > 0);

    // const packet = this._appendBytes(header.build().bytes, payload);
    // const finalPacket = this._appendBytes(packet, lengthBytes.build().bytes);
    // this._ws?.send(finalPacket);
    const packet = this._appendBytes(header.build(), payload);
    const finalPacket = this._appendBytes(packet, lengthBytes.build());
    this._ws?.send(finalPacket);
    print("_sentPacket sent: " + finalPacket);
    print("_sentPacket sent: " + finalPacket.reduce((a, b) => a + b.toString(16).padStart(2, '0'), ''));
  }

  private _readPacket(): { type: number; flags: number; length: number } | null {
    print("_readPacket()");
    if (this._buffer.length - this._offset < 2) {
      return null;
    }

        
    const firstByte = this._readByte();
    const type = (firstByte >> 4) & 0x0f;
    const flags = firstByte & 0x0f;

    let length = 0;
    let multiplier = 1;
    let byte: number;

    do {
      if (this._buffer.length - this._offset < 1) {
        this._offset--;
        return null;
      }
      byte = this._readByte();
      length += (byte & 0x7f) * multiplier;
      multiplier *= 128;
    } while ((byte & 0x80) !== 0);

    if (this._buffer.length - this._offset < length) {
      this._offset -= multiplier / 128;
      return null;
    }

    return { type, flags, length };
  }

  private _sendPing(): void {
    print("_sendPing()");
    const packet = this._createPacket();
    packet.writeByte((PacketType.PINGREQ << 4) | 0);
    this._writePacket(packet);
  }

  private _nextPacketId(): number {
    const packetId = this._packetId++;
    if (this._packetId > 65535) {
      this._packetId = 1;
    }
    return packetId;
  }

  // Uint8Array helpers
  private _createPacket(): { bytes: Uint8Array; writeByte: (value: number) => void; writeUInt16: (value: number) => void; append: (data: Uint8Array) => void } {
    let bytes = new Uint8Array(0);
    let capacity = 16; // This is the min number of bits, smallest packet is 2 bytes
    let length = 0;

    
    const ensureCapacity = (needed: number) => {
      // if (length + needed > capacity) {
      print("ensureCapacity needs: " + needed);
      if ((length + needed > capacity) || (((length + needed)*8) > bytes.length) ) {
        capacity = Math.max(capacity * 2, length + needed);
        const newBytes = new Uint8Array(capacity);
        newBytes.set(bytes);
        bytes = newBytes;
        print("ensureCapacity() -> now " + bytes.length);
      } else {
        print("ensureCapacity() -> keeping it at " + bytes.length);          
      }
    };

    return {
      bytes,
      writeByte: (value: number) => {
        if (value < 0 || value > 255) throw new Error('Byte value out of range');
        ensureCapacity(1);
        bytes[length++] = value;
        bytes = bytes.subarray(0, length);
      },
      writeUInt16: (value: number) => {
        if (value < 0 || value > 65535) throw new Error('UInt16 value out of range');
        ensureCapacity(2);
        const view = new Uint16Array([value]);
        const bytesView = new Uint8Array(view.buffer);
        bytes[length++] = bytesView[1]; // Big-endian
        bytes[length++] = bytesView[0];
        bytes = bytes.subarray(0, length);
      },
      append: (data: Uint8Array) => {
        ensureCapacity(data.length);
        print("data length: " + data.length + " " + length + " " + bytes.length);
        bytes.set(data, length);
        length += data.length;
        bytes = bytes.subarray(0, length);
      },
    };
  }

  private _readByte(): number {
    if (this._buffer.length - this._offset < 1) throw new Error('Not enough bytes to read');
    return this._buffer[this._offset++];
  }

  private _readUInt16(): number {
    if (this._buffer.length - this._offset < 2) throw new Error('Not enough bytes to read');
    const view = new Uint16Array(this._buffer.buffer, this._buffer.byteOffset + this._offset, 1);
    this._offset += 2;
    return (view[0] >> 8) | ((view[0] & 0xff) << 8); // Big-endian
  }

  private _readString(length: number): string {
    if (this._buffer.length - this._offset < length) throw new Error('Not enough bytes to read');
    const slice = this._buffer.subarray(this._offset, this._offset + length);
    this._offset += length;
    return String.fromCharCode(...slice);
  }

  private _altStringToBytes(str: string): Uint8Array {
    const textEncoder = new TextEncoder();
    const uint8Array = textEncoder.encode(str);
    return uint8Array;
  }
  private _stringToBytes(str: string): Uint8Array {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i);
    }
    return bytes;
  }

  private _appendBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
    const result = new Uint8Array(a.length + b.length);
    result.set(a);
    result.set(b, a.length);
    return result;
  }
}

// Helper class for building packets
class PacketBuilder {
  private bytes: Uint8Array;
  private length: number = 0;
  private capacity: number = 16;

  constructor() {
    this.bytes = new Uint8Array(this.capacity);
  }

  writeByte(value: number): void {
    if (value < 0 || value > 255) throw new Error('Byte out of range');
    this.ensureCapacity(1);
    this.bytes[this.length++] = value;
  }

  writeUInt16(value: number): void {
    if (value < 0 || value > 65535) throw new Error('UInt16 out of range');
    this.ensureCapacity(2);
    this.bytes[this.length++] = (value >> 8) & 0xff;
    this.bytes[this.length++] = value & 0xff;
  }

  append(data: Uint8Array): void {
    this.ensureCapacity(data.length);
    this.bytes.set(data, this.length);
    this.length += data.length;
  }

  build(): Uint8Array {
    return this.bytes.subarray(0, this.length);
  }

  private ensureCapacity(needed: number): void {
    if (this.length + needed > this.capacity) {
      this.capacity = Math.max(this.capacity * 2, this.length + needed);
      const newBytes = new Uint8Array(this.capacity);
      newBytes.set(this.bytes);
      this.bytes = newBytes;
    }
  }
}






// MQTT Client class
@component
export class MqttClient2 extends BaseScriptComponent implements FooMit.BarMit {
  @input
  remoteServiceModule: RemoteServiceModule;
// export class MqttClient extends Wolfy87EventEmitter.EventEmitter {
// export class MqttClient extends events.EventEmitter {
  // private _socket: net.Socket | tls.TLSSocket;
  
  _options: ConnectOptions;// private _options: ConnectOptions;
  _connected: boolean;
  _packetId: number;
  // private _keepAliveTimer?: NodeJS.Timeout;
  _keepAliveTimer?: DelayedCallbackEvent | null = null;
  _subscriptions: Map<string, number>;
  _ws: WebSocket;
  _mqtteventhandler? : MqttClientLib2; // Wolfy87EventEmitter.EventEmitter;
  _globaleventemitter : this;
  private internetModule: InternetModule = require("LensStudio:InternetModule");
    
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
      url: "test.mosquitto.org:1881/mqtt",// options.host,
      // : 1881, // options.port,
      // username: null, // options.username,
      // password: null, // options.password,
      clientId: this._generateClientID(),
      keepAlive: 60, // sec?
      /*
      cleanSession: true, // what is this?
      will: {
        topic: "presence", // "libMQTTSpecs",
        payload: "test"
        // qos: number;
        // retain?: boolean;
      },
      ssl: true, */
    };
    this.initConnection(options);
  }
    
  initConnection(options: ConnectOptions) {
    this._keepAliveTimer = this.createEvent("DelayedCallbackEvent");
    // this._options = options;
    // XXX hardcoded value
    // this._ws = this.internetModule.createWebSocket("wss://rtops.net");
    this._ws = this.internetModule.createWebSocket("wss://realityair.quokka-hippocampus.ts.net/mqtt");
    this._ws.binaryType = 'blob';
        
    print("initializing mqtt clientId " + options.clientId);
    
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
    // this._buffer = new Buffer();
    // this._connected = false;
    // this._packetId = 1;
    // this._subscriptions = new Map<string, number>();
    
    // this._mqtteventhandler = new this.MQTTEventHandler(options, this);
      
    this._mqtteventhandler = new MqttClientLib2(options, this);
    
        
    // for now, go ahead and connect, we may want to make this
    // configurable, an autoconnect vs manual
    this._mqtteventhandler.connect();
    this._mqtteventhandler.on('connect', () => {
      print('-----> MQTT.Event.Connected');
      // this._mqtteventhandler.subscribe('test/topic', 0);
      // public publish(topic: string, payload: string | Uint8Array, qos: 0 | 1 = 0): void {
      // this._mqtteventhandler.publish('test/topic', 'Hello', 0);
    });
        
    this._mqtteventhandler.on('error', (err) => {
      print('MQTT.Event.Error:' + err.message);
    });
    /*
    if (this._mqtteventhandler._connected) {
       print("Connected to mqtt broker ... maybe?");
       this._mqtteventhandler.publish({
                              topic: "presence",
                              payload: "foobar"
                              // qos?: number;
                              // retain?: boolean;
                            });
    } else {
        print("not connected");
    }
    */
        
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