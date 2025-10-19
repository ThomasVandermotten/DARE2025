import { SerializableMap } from "../../serialize/serializable-map.js";
import { ValueSet } from "../../util/value-set.js";

export class AddWinsSet<T> implements CRDT<T> {
  internal: Set<AddWinsRecord<T>>;
  clock: VectorClock;
  id: number;
  equals: (
    value: SerializableMap<number, number>,
    value2: SerializableMap<number, number>
  ) => boolean;

  constructor(
    equals: (
      value: SerializableMap<number, number>,
      value2: SerializableMap<number, number>
    ) => boolean,
    clockSize: number,
    id: number
  ) {
    this.id = id;
    this.equals = equals;
    this.internal = new Set();
    this.clock = new VectorClock(clockSize);
  }

  lookup(element: T) {
    let output = false;
    this.internal.forEach((record) => {
      if (record.element == element) {
        output = true;
      }
    });

    return output;
  }

  add(element: T) {
    this.clock.increment(this.id);
    this.internal.add(new AddWinsRecord(element, this.clock.clock[this.id], this.id));
  }

  remove(element: T) {
    let keep: Set<AddWinsRecord<T>> = new Set();

    this.internal.forEach((value) => {
      if (value.element != element) {
        keep.add(value);
      }
    });

    this.internal = keep;
  }

  merge(other: AddWinsSet<T>): void {
    let rx: Set<AddWinsRecord<T>> = new Set();
    let ry: Set<AddWinsRecord<T>> = new Set();

    // Ignore code repetition, could be cleaned up but not a priority
    this.internal.forEach((record) => {
      let found = false;
      other.internal.forEach((record2) => {
        if (
          record.element == record2.element &&
          record.id == record2.id &&
          record.timestamp == record2.timestamp
        ) {
          found = true;
        }
      });

      if (!found && other.clock.clock[this.id] >= record.timestamp) {
        rx.add(record);
      }
    });

    other.internal.forEach((record) => {
      let found = false;
      this.internal.forEach((record2) => {
        if (
          record.element == record2.element &&
          record.id == record2.id &&
          record.timestamp == record2.timestamp
        ) {
          found = true;
        }
      });

      if (!found && this.clock.clock[this.id] >= record.timestamp) {
        ry.add(record);
      }
    });

    let keep: Set<AddWinsRecord<T>> = new Set();

    this.internal.forEach((record) => {
      let found = false;
      rx.forEach((record2) => {
        if (
          record.element == record2.element &&
          record.id == record2.id &&
          record.timestamp == record2.timestamp
        ) {
          found = true;
        }
      });

      if (!found) {
        keep.add(record);
      }
    });

    other.internal.forEach((record) => {
      let found = false;
      ry.forEach((record2) => {
        if (
          record.element == record2.element &&
          record.id == record2.id &&
          record.timestamp == record2.timestamp
        ) {
          found = true;
        }
      });

      if (!found) {
        keep.add(record);
      }
    });

    this.internal = keep;
    this.clock.merge(other.clock);
  }
}

class AddWinsRecord<T> {
  element: T;
  timestamp: number;
  id: number;

  constructor(element: T, timestamp: number, id: number) {
    this.element = element;
    this.timestamp = timestamp;
    this.id = id;
  }
}
