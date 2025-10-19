import { Dot } from "../crdt/dots/dot.js";
import { Serializable, SerializableRegistry } from "./serializable.js";

export class SerializableDot extends Dot implements Serializable {
  serialize(length: number): number[] {
    const str = JSON.stringify(this); //this.toJSON(); // Uint8Array
    //console.log("DOT");
    //console.log(str);
    const arr = [];
    for (let i = 0; i < length; i++) {
      arr.push(i < str.length ? str.charCodeAt(i) : 0);
    }
    return arr;
  }

  static deserialize(data: number[]): SerializableDot {
    const serialized = data
      .map((i) => String.fromCharCode(i))
      .join("")
      .replace(/\x00+$/, "");

    return SerializableDot.parse(serialized);
  }

  /** When JSON.stringify() is called, this method is used automatically. */
  toJSON(): any {
    return this;
  }

  /** Ensure String(set) returns the same JSON array representation. */
  //toString(): string {
  //  return JSON.stringify(this);
  //}

  /** Parse a JSON array back into a SerializableSet. */
  static parse(json: string): SerializableDot {
    const dot: SerializableDot = JSON.parse(json); // parses as string

    // Ensure types are correct
    return dot;
  }
}

SerializableRegistry.register("SerializableDot", SerializableDot.deserialize);
