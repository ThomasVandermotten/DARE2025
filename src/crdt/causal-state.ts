import { DotSet } from "./dots/dot-set.js";
import { DotStore } from "./dots/dot-store.js";

export class Causal<T extends DotStore> {
  store: T;
  causalContext: DotSet;

  constructor(store: T) {
    this.store = store;
    this.causalContext = new DotSet();
  }
}
