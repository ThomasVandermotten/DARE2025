import { SerializableRegistry } from "../serialize/serializable.js";
export class SerializableSet extends Set {
    constructor(value) {
        super(value);
    }
    serialize(length) {
        const str = this.toJSON(); // Uint8Array
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
        return SerializableSet.parse(serialized);
    }
    /** When JSON.stringify() is called, this method is used automatically. */
    toJSON() {
        return JSON.stringify([...this]);
    }
    /** Ensure String(set) returns the same JSON array representation. */
    toString() {
        return JSON.stringify(this);
    }
    /** Parse a JSON array back into a SerializableSet. */
    static parse(json) {
        const arr = JSON.parse(json); // parses as string
        // Ensure types are correct
        return new SerializableSet(arr);
    }
}
SerializableRegistry.register("SerializableSet", SerializableSet.deserialize);
