import { DotSet } from "./dot-set.js";
import { Dot } from "./dot.js";

export interface DotStore {
  dots(): Set<Dot>;
  join(causalContext: DotSet, otherStore: DotStore, otherContext: DotSet): CausalJoinResult;
  isBot(): boolean;
  clone(): DotStore;
}

export class CausalJoinResult {
  store: DotStore;
  causalContext: DotSet;

  constructor(store: DotStore, causalContext: DotSet) {
    this.store = store;
    this.causalContext = causalContext;
  }
}
