import { SerializableRegistry } from "../serialize/serializable.js";
import { SerializableMap } from "./serializable_map.js";
export class SerializablePair {
    left;
    right;
    constructor(leftValue, rightValue) {
        this.left = leftValue;
        this.right = rightValue;
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
        return SerializablePair.parse(serialized);
    }
    /** When JSON.stringify() is called, this method is used automatically. */
    toJSON() {
        return JSON.stringify([this.left.serialize, this.right.serialize]);
    }
    /** Ensure String(set) returns the same JSON array representation. */
    toString() {
        return JSON.stringify(this);
    }
    /** Parse a JSON array back into a SerializableSet. */
    static parse(json) {
        const arr = JSON.parse(json); // should be [leftJSON, rightJSON]
        if (!Array.isArray(arr) || arr.length !== 2) {
            throw new Error("Invalid JSON for SerializablePair");
        }
        const match = json.match(/^\[([^,]+),([^\]]+)\]$/);
        if (match) {
            const x = match[1].trim();
            const y = match[2].trim();
            const leftMap = SerializableMap.parse(x);
            const rightMap = SerializableMap.parse(y);
            return new SerializablePair(leftMap, rightMap);
        }
        return new SerializablePair(new SerializableMap(), new SerializableMap());
    }
}
SerializableRegistry.register("SerializablePair", SerializablePair.deserialize);
