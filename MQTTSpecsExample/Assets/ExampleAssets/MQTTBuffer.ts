// buffer.ts
//
// Attribution: https://github.com/i8beef/MQTTClient.js/blob/master/src/buffer.js
//

export namespace Assertion {
// Interface for the assert object (based on the assert.ok usage in the original code)
    export interface Assert {
      ok: (condition: boolean, message: string) => void;
    }
}

// Declare the assert object (assumed to be provided externally or implemented separately)
declare const assert: Assertion.Assert;

// Buffer class to manage a dynamic byte buffer
export class Buffer {
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
