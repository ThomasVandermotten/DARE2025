import { Serializable, SerializableRegistry } from "./serializable.js";
import { SerializableMap } from "./serializable-map.js";
import { Dot } from "../crdt/dots/dot.js";
import { SerializableDot } from "./serializable-dot.js";

export class SerializablePair implements Serializable {
  left: SerializableMap<number, number>;
  right: SerializableMap<number, number>;

  constructor(
    leftValue: SerializableMap<number, number>,
    rightValue: SerializableMap<number, number>
  ) {
    this.left = leftValue;
    this.right = rightValue;
  }

  serialize(length: number): number[] {
    const str = JSON.stringify(this); // Uint8Array
    console.log("PAIR");
    console.log(str);
    const arr = [];
    for (let i = 0; i < length; i++) {
      arr.push(i < str.length ? str.charCodeAt(i) : 0);
    }
    return arr;
  }

  static deserialize(data: number[]): SerializablePair {
    const serialized = data
      .map((i) => String.fromCharCode(i))
      .join("")
      .replace(/\x00+$/, "");
    return SerializablePair.parse(serialized);
  }

  /** When JSON.stringify() is called, this method is used automatically. */
  toJSON(): string {
    // TODO: serialize is most likely wrong?
    return JSON.stringify([this.left, this.right]);
  }

  /** Ensure String(set) returns the same JSON array representation. */
  toString(): string {
    return JSON.stringify(this);
  }

  /** Parse a JSON array back into a SerializableSet. */
  static parse(json: string): SerializablePair {
    const arr = JSON.parse(json); // should be [leftJSON, rightJSON]
    if (!Array.isArray(arr) || arr.length !== 2) {
      throw new Error("Invalid JSON for SerializablePair");
    }

    const match = json.match(/^\[([^,]+),([^\]]+)\]$/);

    if (match) {
      const x = match[1].trim();
      const y = match[2].trim();

      const leftMap: SerializableMap<number, number> = SerializableMap.parse(x);
      const rightMap: SerializableMap<number, number> = SerializableMap.parse(y);

      return new SerializablePair(leftMap, rightMap);
    }

    return new SerializablePair(new SerializableMap(), new SerializableMap());
  }
}

export class SerializablePair2 implements Serializable {
  left: SerializableMap<number, SerializableDot>;
  right: SerializableDot;

  constructor(leftValue: SerializableMap<number, SerializableDot>, rightValue: SerializableDot) {
    this.left = leftValue;
    this.right = rightValue;
  }

  serialize(length: number): number[] {
    const str = JSON.stringify(this); // Uint8Array
    //console.log("PAIR2");
    //console.log(str);
    const arr = [];
    for (let i = 0; i < length; i++) {
      arr.push(i < str.length ? str.charCodeAt(i) : 0);
    }
    return arr;
  }

  static deserialize(data: number[]): SerializablePair2 {
    const serialized = data
      .map((i) => String.fromCharCode(i))
      .join("")
      .replace(/\x00+$/, "");
    return SerializablePair2.parse(serialized);
  }

  /** When JSON.stringify() is called, this method is used automatically. */
  toJSON(): any {
    // TODO: why serialize here?
    return [this.left, this.right];
  }

  /** Ensure String(set) returns the same JSON array representation. */
  toString(): string {
    return JSON.stringify(this);
  }

  /** Parse a JSON array back into a SerializableSet. */
  static parse(json: string): SerializablePair2 {
    const arr = JSON.parse(json); // should be [leftJSON, rightJSON]
    //console.log("eurake");
    if (!Array.isArray(arr) || arr.length !== 2) {
      throw new Error("Invalid JSON for SerializablePair");
    }

    // Parse array and restringify for correct parsing of sub types...
    let map: SerializableMap<number, SerializableDot> = SerializableMap.parse(
      JSON.stringify(arr[0])
    );
    let dt: SerializableDot = SerializableDot.parse(JSON.stringify(arr[1]));
    return new SerializablePair2(map, dt);
  }
}

SerializableRegistry.register("SerializablePair", SerializablePair.deserialize);
SerializableRegistry.register("SerializablePair2", SerializablePair2.deserialize);
