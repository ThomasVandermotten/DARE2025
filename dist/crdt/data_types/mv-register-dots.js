import { Causal } from "../causal-state.js";
import { DotFun } from "../dots/dot-fun.js";
import { DotSet } from "../dots/dot-set.js";
import { Dot } from "../dots/dot.js";
export class MVRegister extends Causal {
    lastDot;
    constructor(replicaId) {
        super(new DotFun());
        this.lastDot = new Dot(replicaId, 0);
    }
    write(element) {
        let dot = this.next();
        let store = new DotFun();
        let context = new DotSet();
        store.set(dot, element);
        context.add(dot);
        for (const [key, val] of this.store.internal) {
            context.add(key);
        }
        this.store = store;
        this.causalContext = context;
    }
    clear() {
        let context = new DotSet();
        for (const [key, val] of this.store.internal) {
            context.add(key);
        }
        this.store = new DotFun();
        this.causalContext = context;
    }
    elements() {
        return new Set(this.store.internal.values());
    }
    next() {
        const dot = new Dot(this.lastDot.replica, this.lastDot.sequence_number + 1);
        this.lastDot = dot;
        return dot;
    }
}
