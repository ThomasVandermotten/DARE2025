import { Serializable, SerializableRegistry } from "./serializable.js";

export class SerializableMap<K, V> extends Map<K, V> implements Serializable {
  serialize(length: number): number[] {
    const str = JSON.stringify(this); // Uint8Array
    //console.log("MAP");
    //console.log(str);
    const arr = [];
    for (let i = 0; i < length; i++) {
      arr.push(i < str.length ? str.charCodeAt(i) : 0);
    }
    return arr;
  }

  static deserialize<K, V>(data: number[]): SerializableMap<K, V> {
    const serialized = data
      .map((i) => String.fromCharCode(i))
      .join("")
      .replace(/\x00+$/, "");
    return SerializableMap.parse(serialized);
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
  static parse<K, V>(json: string): SerializableMap<K, V> {
    //console.log("map json");
    //console.log(json);
    const arr: any[] = JSON.parse(json); // parses as string
    //console.log(arr);
    // Ensure types are correct
    return new SerializableMap<K, V>(arr);
  }
}

SerializableRegistry.register("SerializableMap", SerializableMap.deserialize);
