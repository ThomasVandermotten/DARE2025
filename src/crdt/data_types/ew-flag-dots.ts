import { Causal } from "../causal-state.js";
import { DotMap } from "../dots/dot-map.js";
import { DotSet } from "../dots/dot-set.js";
import { Dot } from "../dots/dot.js";

export class EnableWinsFlag extends Causal<DotSet> {
  lastDot: Dot;

  constructor(replicaId: number) {
    super(new DotSet());
    this.lastDot = new Dot(replicaId, 0);
  }

  enable(): void {
    let d: DotSet = new DotSet();
    d.add(this.next());

    this.causalContext = d.union(this.store);
    this.store = d;
  }

  disable(): void {
    this.causalContext = this.store;
    this.store = new DotSet();
  }

  read(): boolean {
    return !this.store.isBot;
  }

  next(): Dot {
    const dot = new Dot(this.lastDot.replica, this.lastDot.sequence_number + 1);
    this.lastDot = dot;
    return dot;
  }
}
