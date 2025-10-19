import { DotSet } from "./dots/dot-set.js";
export class Causal {
    store;
    causalContext;
    constructor(store) {
        this.store = store;
        this.causalContext = new DotSet();
    }
}
