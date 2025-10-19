import { Causal } from "../causal-state.js";
import { DotSet } from "../dots/dot-set.js";
import { Dot } from "../dots/dot.js";
export class EnableWinsFlag extends Causal {
    lastDot;
    constructor(replicaId) {
        super(new DotSet());
        this.lastDot = new Dot(replicaId, 0);
    }
    enable() {
        let d = new DotSet();
        d.add(this.next());
        this.causalContext = d.union(this.store);
        this.store = d;
    }
    disable() {
        this.causalContext = this.store;
        this.store = new DotSet();
    }
    read() {
        return !this.store.isBot;
    }
    next() {
        const dot = new Dot(this.lastDot.replica, this.lastDot.sequence_number + 1);
        this.lastDot = dot;
        return dot;
    }
}
