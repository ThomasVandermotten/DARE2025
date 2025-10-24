import { Serializable, SerializableRegistry } from "./serializable.js";

export class SerializableSet<T> extends Set<T> implements Serializable {
  constructor(value: T[]) {
    super(value);
  }

  serialize(length: number): number[] {
    const str = JSON.stringify(this); // Uint8Array
    const arr = [];
    for (let i = 0; i < length; i++) {
      arr.push(i < str.length ? str.charCodeAt(i) : 0);
    }
    return arr;
  }

  static deserialize<T>(data: number[]): SerializableSet<T> {
    const serialized = data
      .map((i) => String.fromCharCode(i))
      .join("")
      .replace(/\x00+$/, "");
    return SerializableSet.parse(serialized);
  }

  /** When JSON.stringify() is called, this method is used automatically. */
  toJSON(): any {
    return [...this];
  }

  /** Ensure String(set) returns the same JSON array representation. */
  toString(): string {
    return JSON.stringify(this);
  }

  /** Parse a JSON array back into a SerializableSet. */
  static parse<T>(json: string): SerializableSet<T> {
    const arr: T[] = JSON.parse(json); // parses as string

    // Ensure types are correct
    return new SerializableSet<T>(arr);
  }
}

SerializableRegistry.register("SerializableSet", SerializableSet.deserialize);
