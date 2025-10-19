import { Causal } from "../causal-state.js";
import { DotFun } from "../dots/dot-fun.js";
import { DotMap } from "../dots/dot-map.js";
import { DotSet } from "../dots/dot-set.js";
import { Dot } from "../dots/dot.js";

export class MVRegister<V extends Lattice> extends Causal<DotFun<V>> {
  lastDot: Dot;

  constructor(replicaId: number) {
    super(new DotFun());
    this.lastDot = new Dot(replicaId, 0);
  }

  write(element: V): void {
    let dot: Dot = this.next();
    let store: DotFun<V> = new DotFun();
    let context: DotSet = new DotSet();

    store.set(dot, element);
    context.add(dot);

    for (const [key, val] of this.store.internal) {
      context.add(key);
    }

    this.store = store;
    this.causalContext = context;
  }

  clear(): void {
    let context: DotSet = new DotSet();

    for (const [key, val] of this.store.internal) {
      context.add(key);
    }

    this.store = new DotFun();
    this.causalContext = context;
  }

  elements(): Set<V> {
    return new Set(this.store.internal.values());
  }

  next(): Dot {
    const dot = new Dot(this.lastDot.replica, this.lastDot.sequence_number + 1);
    this.lastDot = dot;
    return dot;
  }
}
