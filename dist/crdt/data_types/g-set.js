import { SerializableSet } from "../../serialize/serializable-set.js";
import { ValueSet } from "../../util/value-set.js";
export class GSet {
    items;
    equals;
    constructor(equals) {
        this.equals = equals;
        this.items = new Set();
    }
    add(item) {
        this.items.add(item);
    }
    get() {
        return new Set(this.items);
    }
    contains(item) {
        return this.items.has(item);
    }
    merge(other) {
        other.items.forEach((item) => this.items.add(item));
    }
    decompose() {
        let decomposition = new ValueSet(this.equals);
        this.items.forEach((value) => decomposition.add(new SerializableSet([value])));
        return decomposition;
    }
    compose(decomposition) {
        const composition = new GSet(this.equals);
        decomposition.forEach((innerSet) => {
            const iterator = innerSet.values();
            const first = iterator.next().value; // get the first element
            if (first !== undefined) {
                composition.add(first);
            }
        });
        return composition;
    }
}
