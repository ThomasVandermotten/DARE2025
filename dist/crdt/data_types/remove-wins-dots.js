import { Causal } from "../causal-state.js";
import { DotMap } from "../dots/dot-map.js";
import { DotSet } from "../dots/dot-set.js";
import { Dot } from "../dots/dot.js";
export class RemoveWinsSet extends Causal {
    keyEquals;
    vCtor;
    lastDot;
    constructor(keyEquals, vCtor, replicaId) {
        super(new DotMap(keyEquals, vCtor));
        this.vCtor = vCtor;
        this.keyEquals = keyEquals;
        this.lastDot = new Dot(replicaId, 0);
    }
    add(element) {
        let currentValue;
        let d = new DotSet();
        let dot = this.next();
        let store = new DotMap(this.keyEquals, this.vCtor);
        let valueMap = new DotMap(this.booleanEquals, DotSet);
        d.add(dot);
        if (this.store.contains(element)) {
            currentValue = this.store.get(element).clone();
        }
        else {
            currentValue = new DotMap(this.booleanEquals, DotSet);
        }
        valueMap.set(true, d);
        store.set(element, valueMap);
        this.store = store;
        this.causalContext = d.union(DotSet.fromSet(currentValue.dots()));
    }
    remove(element) {
        let currentValue;
        let d = new DotSet();
        let dot = this.next();
        let store = new DotMap(this.keyEquals, this.vCtor);
        let valueMap = new DotMap(this.booleanEquals, DotSet);
        d.add(dot);
        if (this.store.contains(element)) {
            currentValue = this.store.get(element).clone();
        }
        else {
            currentValue = new DotMap(this.booleanEquals, DotSet);
        }
        valueMap.set(false, d);
        store.set(element, valueMap);
        this.store = store;
        this.causalContext = d.union(DotSet.fromSet(currentValue.dots()));
    }
    clear() {
        const dots = this.store.dots();
        this.store = new DotMap(this.keyEquals, this.vCtor);
        this.causalContext = DotSet.fromSet(dots);
    }
    elements() {
        let output = new Set();
        for (const [key, val] of this.store.internal) {
            let hasFalse = false;
            for (const [keyInner, valInner] of val.internal) {
                if (!keyInner) {
                    hasFalse = true;
                }
            }
            if (!hasFalse) {
                output.add(key);
            }
        }
        return output;
    }
    booleanEquals(boolL, boolR) {
        return boolL === boolR;
    }
    next() {
        const dot = new Dot(this.lastDot.replica, this.lastDot.sequence_number + 1);
        this.lastDot = dot;
        return dot;
    }
}
