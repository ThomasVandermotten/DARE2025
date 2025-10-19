import { ValueSet } from "../util/value-set.js";

interface Decomposable<T> extends CRDT<T> {
  decompose(): ValueSet<Set<T>>;
  compose(decomposition: ValueSet<Set<T>>): CRDT<T>;
}
