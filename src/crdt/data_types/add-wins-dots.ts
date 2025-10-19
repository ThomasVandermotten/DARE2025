import { SerializableDot } from "../../serialize/serializable-dot.js";
import { SerializableMap } from "../../serialize/serializable-map.js";
import { SerializablePair2 } from "../../serialize/serializable-pair.js";
import { ValueSet } from "../../util/value-set.js";
import { Causal } from "../causal-state.js";
import { DotMap } from "../dots/dot-map.js";
import { DotSet } from "../dots/dot-set.js";
import { Dot } from "../dots/dot.js";

export class AddWinsSet<T> extends Causal<DotMap<T, DotSet>> {
  keyEquals: (keyL: T, keyR: T) => boolean;
  lastDot: Dot;

  constructor(keyEquals: (keyL: T, keyR: T) => boolean, replicaId: number) {
    super(new DotMap(keyEquals, DotSet));
    this.keyEquals = keyEquals;
    this.lastDot = new Dot(replicaId, 0);
  }

  add(element: T): void {
    let currentValue: DotSet;
    let d: DotSet = new DotSet();
    let dot: Dot = this.next();
    let store: DotMap<T, DotSet> = new DotMap(this.keyEquals, DotSet);

    d.add(dot);

    if (this.store.contains(element)) {
      currentValue = this.store.get(element)!.clone();
    } else {
      currentValue = new DotSet();
    }

    store.set(element, d);
    this.store = store;
    this.causalContext = d.union(currentValue);
  }

  remove(element: T): void {
    if (this.store.contains(element)) {
      this.causalContext = this.store.get(element)!;
      this.store = new DotMap(this.keyEquals, DotSet);
    }
  }

  clear(): void {
    const dots = this.store.dots();
    this.store = new DotMap(this.keyEquals, DotSet);
    this.causalContext = DotSet.fromSet(dots);
  }

  elements(): Set<T> {
    return new Set(this.store.internal.keys());
  }

  next(): Dot {
    const dot = new Dot(this.lastDot.replica, this.lastDot.sequence_number + 1);
    this.lastDot = dot;
    return dot;
  }

  // Design limitation: pairs only take numbers. So will only work for numbers atm.
  decompose(): ValueSet<SerializablePair2> {
    let output = new ValueSet(
      (pairL: SerializablePair2, pairR: SerializablePair2) =>
        pairL.left == pairR.left && pairL.right == pairR.right
    );
    let range: DotSet = new DotSet();

    for (const [key, val] of this.store.internal) {
      for (const d of val.internal) {
        let map: SerializableMap<number, SerializableDot> = new SerializableMap();
        let serializable: SerializableDot = new SerializableDot(d.replica, d.sequence_number);

        map.set(key as number, serializable);
        output.add(new SerializablePair2(map, serializable));
        range.add(d);
      }
    }

    for (const dot of this.causalContext.internal) {
      if (!range.has(dot)) {
        output.add(
          new SerializablePair2(
            new SerializableMap(),
            new SerializableDot(dot.replica, dot.sequence_number)
          )
        );
      }
    }

    return output;
  }

  compose(set: ValueSet<SerializablePair2>): AddWinsSet<T> {
    let causalContext: DotSet = new DotSet();
    let output: AddWinsSet<T> = new AddWinsSet(this.keyEquals, this.lastDot.replica);

    let store: DotMap<number, DotSet> = new DotMap((left, right) => left == right, DotSet);

    for (const element of set) {
      let map = element.left;
      for (const [key, val] of map) {
        let current = store.get(key);
        current.add(val);
        store.set(key, current);
      }
      causalContext.add(element.right);
    }

    // HACK! Will only work for numbers... but ok for n demonstrative purposes
    output.store = store as unknown as DotMap<T, DotSet>;
    output.causalContext = causalContext;

    return output;
  }
}
