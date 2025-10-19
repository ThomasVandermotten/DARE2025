import { SerializableMap } from "../../serialize/serializable-map.js";
import { SerializablePair } from "../../serialize/serializable-pair.js";
import { ValueSet } from "../../util/value-set.js";
import { GCounter } from "./g-counter.js";

export class PNCounter implements CRDT<number> {
  pCounter: GCounter;
  nCounter: GCounter;
  equals: (
    value: SerializableMap<number, number>,
    value2: SerializableMap<number, number>
  ) => boolean;
  equals2: (value: SerializablePair, value2: SerializablePair) => boolean;

  constructor(
    equals: (
      value: SerializableMap<number, number>,
      value2: SerializableMap<number, number>
    ) => boolean,
    equals2: (value: SerializablePair, value2: SerializablePair) => boolean
  ) {
    this.equals = equals;
    this.equals2 = equals2;
    this.pCounter = new GCounter(this.equals);
    this.nCounter = new GCounter(this.equals);
  }

  increment(id: number): void {
    this.pCounter.increment(id);
  }

  decrement(id: number): void {
    this.nCounter.increment(id);
  }

  get(): number {
    return this.pCounter.get() - this.nCounter.get();
  }

  merge(other: PNCounter): void {
    this.pCounter.merge(other.pCounter);
    this.nCounter.merge(other.nCounter);
  }

  decompose(): ValueSet<SerializablePair> {
    let decomposition: ValueSet<SerializablePair> = new ValueSet(this.equals2);

    for (const entry of this.pCounter.counter.entries()) {
      const map: SerializableMap<number, number> = new SerializableMap();
      map.set(entry[0], entry[1]);

      decomposition.add(new SerializablePair(map, new SerializableMap()));
    }

    for (const entry of this.nCounter.counter.entries()) {
      const map: SerializableMap<number, number> = new SerializableMap();
      map.set(entry[0], entry[1]);

      decomposition.add(new SerializablePair(new SerializableMap(), map));
    }

    return decomposition;
  }

  compose(decomposition: ValueSet<SerializablePair>): PNCounter {
    const compositionL: GCounter = new GCounter(this.equals);
    const compositionR: GCounter = new GCounter(this.equals);
    const composition: PNCounter = new PNCounter(this.equals, this.equals2);

    composition.pCounter = compositionL;
    composition.nCounter = compositionR;

    decomposition.forEach((pair) => {
      const leftMap = pair.left;
      const rightMap = pair.right;

      if (rightMap.size == 0) {
        for (const entry of leftMap.entries()) {
          compositionL.counter.set(entry[0], entry[1]);
        }
      } else {
        for (const entry of rightMap.entries()) {
          compositionR.counter.set(entry[0], entry[1]);
        }
      }
    });

    return composition;
  }
}
