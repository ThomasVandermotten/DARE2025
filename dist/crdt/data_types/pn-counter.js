import { SerializableMap } from "../../serialize/serializable-map.js";
import { SerializablePair } from "../../serialize/serializable-pair.js";
import { ValueSet } from "../../util/value-set.js";
import { GCounter } from "./g-counter.js";
export class PNCounter {
    pCounter;
    nCounter;
    equals;
    equals2;
    constructor(equals, equals2) {
        this.equals = equals;
        this.equals2 = equals2;
        this.pCounter = new GCounter(this.equals);
        this.nCounter = new GCounter(this.equals);
    }
    increment(id) {
        this.pCounter.increment(id);
    }
    decrement(id) {
        this.nCounter.increment(id);
    }
    get() {
        return this.pCounter.get() - this.nCounter.get();
    }
    merge(other) {
        this.pCounter.merge(other.pCounter);
        this.nCounter.merge(other.nCounter);
    }
    decompose() {
        let decomposition = new ValueSet(this.equals2);
        for (const entry of this.pCounter.counter.entries()) {
            const map = new SerializableMap();
            map.set(entry[0], entry[1]);
            decomposition.add(new SerializablePair(map, new SerializableMap()));
        }
        for (const entry of this.nCounter.counter.entries()) {
            const map = new SerializableMap();
            map.set(entry[0], entry[1]);
            decomposition.add(new SerializablePair(new SerializableMap(), map));
        }
        return decomposition;
    }
    compose(decomposition) {
        const compositionL = new GCounter(this.equals);
        const compositionR = new GCounter(this.equals);
        const composition = new PNCounter(this.equals, this.equals2);
        composition.pCounter = compositionL;
        composition.nCounter = compositionR;
        decomposition.forEach((pair) => {
            const leftMap = pair.left;
            const rightMap = pair.right;
            if (rightMap.size == 0) {
                for (const entry of leftMap.entries()) {
                    compositionL.counter.set(entry[0], entry[1]);
                }
            }
            else {
                for (const entry of rightMap.entries()) {
                    compositionR.counter.set(entry[0], entry[1]);
                }
            }
        });
        return composition;
    }
}
