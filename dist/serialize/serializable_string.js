import { SerializableRegistry } from "../serialize/serializable.js";
export class SerializableString extends String {
    constructor(value) {
        super(value);
    }
    serialize(length) {
        const str = this.toString(); // Uint8Array
        const arr = [];
        for (let i = 0; i < length; i++) {
            arr.push(i < str.length ? str.charCodeAt(i) : 0);
        }
        return arr;
    }
    static deserialize(data) {
        const serialized = data
            .map((i) => String.fromCharCode(i))
            .join("")
            .replace(/\x00+$/, "");
        return new SerializableString(serialized);
    }
}
SerializableRegistry.register("SerializableString", SerializableString.deserialize);
