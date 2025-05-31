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