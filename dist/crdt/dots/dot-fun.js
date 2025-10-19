import { CausalJoinResult } from "./dot-store.js";
// Where V is a lattice... maybe encode this in a type
export class DotFun {
    internal = new Map();
    set(dot, value) {
        // Remove any existing entry with same replica and sequence_number
        for (const [key] of this.internal) {
            if (key.replica === dot.replica && key.sequence_number === dot.sequence_number) {
                this.internal.delete(key);
                break;
            }
        }
        this.internal.set(dot, value);
    }
    get(dot) {
        for (const [key, val] of this.internal) {
            if (key.replica === dot.replica && key.sequence_number === dot.sequence_number) {
                return val;
            }
        }
        return undefined;
    }
    contains(dot) {
        for (const key of this.internal.keys()) {
            if (key.replica === dot.replica && key.sequence_number === dot.sequence_number) {
                return true;
            }
        }
        return false;
    }
    join(thisContext, otherStore, otherContext) {
        let outputStore = new DotFun();
        let outputContext = thisContext.union(otherContext);
        // Intersection
        for (const [key, val] of this.internal) {
            if (otherStore.contains(key)) {
                outputStore.set(key, val.join(otherStore.get(key)));
            }
        }
        for (const [key, val] of otherStore.internal) {
            if (this.contains(key)) {
                outputStore.set(key, val.join(this.get(key)));
            }
        }
        // Part 2
        for (const [key, val] of this.internal) {
            if (!otherContext.has(key)) {
                outputStore.set(key, val);
            }
        }
        // Part 3
        for (const [key, val] of otherStore.internal) {
            if (!thisContext.has(key)) {
                outputStore.set(key, val);
            }
        }
        return new CausalJoinResult(outputStore, outputContext);
    }
    isBot() {
        return this.internal.size == 0;
    }
    dots() {
        return new Set(this.internal.keys());
    }
    clone() {
        const clone = new DotFun();
        for (const [dot, value] of this.internal.entries()) {
            const dotClone = structuredClone(dot);
            const valueClone = value.clone();
            clone.internal.set(dotClone, valueClone);
        }
        return clone;
    }
}
