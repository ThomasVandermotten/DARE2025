import { SerializableRegistry } from "./serializable.js";
export class SerializableMap extends Map {
    serialize(length) {
        const str = JSON.stringify(this); // Uint8Array
        //console.log("MAP");
        //console.log(str);
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
        return SerializableMap.parse(serialized);
    }
    /** When JSON.stringify() is called, this method is used automatically. */
    toJSON() {
        return [...this];
    }
    /** Ensure String(set) returns the same JSON array representation. */
    toString() {
        return JSON.stringify(this);
    }
    /** Parse a JSON array back into a SerializableSet. */
    static parse(json) {
        //console.log("map json");
        //console.log(json);
        const arr = JSON.parse(json); // parses as string
        //console.log(arr);
        // Ensure types are correct
        return new SerializableMap(arr);
    }
}
SerializableRegistry.register("SerializableMap", SerializableMap.deserialize);
