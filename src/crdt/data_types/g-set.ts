import { SerializableSet } from "../../serialize/serializable-set.js";
import { ValueSet } from "../../util/value-set.js";

export class GSet<T> implements CRDT<T> {
  items: Set<T>;
  equals: (value: SerializableSet<T>, value2: SerializableSet<T>) => boolean;

  constructor(equals: (value: SerializableSet<T>, value2: SerializableSet<T>) => boolean) {
    this.equals = equals;
    this.items = new Set();
  }
  add(item: T): void {
    this.items.add(item);
  }

  get(): Set<T> {
    return new Set(this.items);
  }

  contains(item: T): boolean {
    return this.items.has(item);
  }

  merge(other: GSet<T>): void {
    other.items.forEach((item) => this.items.add(item));
  }

  decompose(): ValueSet<SerializableSet<T>> {
    let decomposition: ValueSet<SerializableSet<T>> = new ValueSet(this.equals);

    this.items.forEach((value) => decomposition.add(new SerializableSet([value])));

    return decomposition;
  }

  compose(decomposition: ValueSet<SerializableSet<T>>): GSet<T> {
    const composition: GSet<T> = new GSet<T>(this.equals);

    decomposition.forEach((innerSet) => {
      const iterator = innerSet.values();
      const first = iterator.next().value; // get the first element
      if (first !== undefined) {
        composition.add(first);
      }
    });

    return composition;
  }
}
