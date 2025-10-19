import { CausalJoinResult } from "./dot-store.js";
export class DotMap {
    internal = new Map();
    keyEquals;
    createVStore;
    constructor(keyEquals, createVStore) {
        this.keyEquals = keyEquals;
        this.createVStore = createVStore;
    }
    set(keyToSet, value) {
        // Remove any existing entry with same replica and sequence_number
        for (const [key] of this.internal) {
            if (this.keyEquals(keyToSet, key)) {
                this.internal.delete(key);
                break;
            }
        }
        this.internal.set(keyToSet, value);
    }
    get(keyToGet) {
        for (const [key, val] of this.internal) {
            if (this.keyEquals(keyToGet, key)) {
                return val;
            }
        }
        return new this.createVStore();
    }
    contains(keyToContain) {
        for (const key of this.internal.keys()) {
            if (this.keyEquals(keyToContain, key)) {
                return true;
            }
        }
        return false;
    }
    join(thisContext, otherStore, otherContext) {
        let outputStore = new DotMap(this.keyEquals, this.createVStore);
        let outputContext = thisContext.union(otherContext);
        // TODO: dom m, but also dom m'
        for (const [key, val] of this.internal) {
            //if (otherStore.contains(key)) {
            const vk = val.join(thisContext, otherStore.get(key), otherContext).store;
            console.log("yes");
            if (!vk.isBot()) {
                console.log("real yes");
                outputStore.set(key, vk);
            }
            //}
        }
        for (const [key, val] of otherStore.internal) {
            //if (this.contains(key)) {
            const vk = val.join(otherContext, this.get(key), thisContext).store;
            console.log("yes");
            console.log(vk);
            if (!vk.isBot()) {
                console.log("real yes");
                outputStore.set(key, vk);
                //}
            }
        }
        return new CausalJoinResult(outputStore, outputContext);
    }
    isBot() {
        return this.internal.size == 0;
    }
    dots() {
        const result = new Set();
        const seen = new Set(); // store unique dot identifiers
        for (const value of this.internal.values()) {
            for (const dot of value.dots()) {
                // For value-based equality
                const key = `${dot.replica}:${dot.sequence_number}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    result.add(dot);
                }
            }
        }
        return result;
    }
    clone() {
        const clone = new DotMap(this.keyEquals, this.createVStore);
        for (const [k, v] of this.internal.entries()) {
            clone.internal.set(structuredClone(k), v.clone());
        }
        return clone;
    }
}
