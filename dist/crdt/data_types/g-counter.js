import { SerializableMap } from "../../serialize/serializable-map.js";
import { ValueSet } from "../../util/value-set.js";
export class GCounter {
    counter;
    equals;
    constructor(equals) {
        this.equals = equals;
        this.counter = new Map();
    }
    increment(id) {
        if (!this.counter.has(id)) {
            this.counter.set(id, 0);
        }
        this.counter.set(id, this.counter.get(id) + 1);
    }
    get() {
        let sum = 0;
        for (const value of this.counter.values()) {
            sum += value;
        }
        return sum;
    }
    merge(other) {
        for (const entry of other.counter.entries()) {
            if (this.counter.has(entry[0])) {
                this.counter.set(entry[0], Math.max(entry[1], this.counter.get(entry[0])));
            }
            else {
                this.counter.set(entry[0], entry[1]);
            }
        }
    }
    decompose() {
        let decomposition = new ValueSet(this.equals);
        for (const entry of this.counter.entries()) {
            let serializableMap = new SerializableMap();
            serializableMap.set(entry[0], entry[1]);
            decomposition.add(serializableMap);
        }
        return decomposition;
    }
    compose(decomposition) {
        const composition = new GCounter(this.equals);
        decomposition.forEach((map) => {
            for (const entry of map) {
                composition.counter.set(entry[0], entry[1]);
            }
        });
        return composition;
    }
}
