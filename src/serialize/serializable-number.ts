import { Serializable, SerializableRegistry } from "./serializable.js";

export class SerializableNumber extends Number implements Serializable {
  serialize(length: number): number[] {
    const str = this.toString(); // Uint8Array
    const arr = [];
    for (let i = 0; i < length; i++) {
      arr.push(i < str.length ? str.charCodeAt(i) : 0);
    }
    return arr;
  }

  static deserialize(data: number[]): SerializableNumber {
    const serialized = data
      .map((i) => String.fromCharCode(i))
      .join("")
      .replace(/\x00+$/, "");

    return new SerializableNumber(serialized);
  }
}

SerializableRegistry.register("SerializableNumber", SerializableNumber.deserialize);
