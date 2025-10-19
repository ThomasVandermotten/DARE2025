interface CRDT<T> {
  merge(other: CRDT<T>): void;
}
