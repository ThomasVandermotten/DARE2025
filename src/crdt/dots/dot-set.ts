import { Dot } from "./dot.js";
import { CausalJoinResult, DotStore } from "./dot-store.js";

export class DotSet implements DotStore {
  internal: Set<Dot> = new Set();

  add(dot: Dot): void {
    if (!this.has(dot)) {
      this.internal.add(dot);
    }
  }

  remove(dot: Dot): void {
    let result: Set<Dot> = new Set();
    this.internal.forEach((value) => {
      if (!(value.replica == dot.replica && value.sequence_number == dot.sequence_number)) {
        result.add(value);
      }
    });

    this.internal = result;
  }

  has(dot: Dot): boolean {
    let output = false;
    this.internal.forEach((value) => {
      if (value.replica == dot.replica && value.sequence_number == dot.sequence_number) {
        output = true;
      }
    });

    return output;
  }

  difference(other: DotSet): DotSet {
    const output = new DotSet();

    this.internal.forEach((dot) => {
      if (!other.has(dot)) {
        output.add(dot);
      }
    });

    return output;
  }

  union(other: DotSet): DotSet {
    const output = new DotSet();

    this.internal.forEach((dot) => {
      output.add(dot);
    });

    other.internal.forEach((dot) => {
      output.add(dot);
    });

    return output;
  }

  intersection(other: DotSet): DotSet {
    const output = new DotSet();

    this.internal.forEach((dot) => {
      if (other.has(dot)) {
        output.add(dot);
      }
    });

    other.internal.forEach((dot) => {
      if (this.has(dot)) {
        output.add(dot);
      }
    });

    return output;
  }

  join(thisContext: DotSet, otherStore: DotSet, otherContext: DotSet): CausalJoinResult {
    const intersectedStore = this.intersection(otherContext);
    const differenceLeft = this.difference(otherContext);
    const differenceRight = otherStore.difference(thisContext);
    const differenceUnion = differenceLeft.union(differenceRight);
    const contextUnion = thisContext.union(otherContext);

    return new CausalJoinResult(intersectedStore.union(differenceUnion), contextUnion);
  }

  isBot(): boolean {
    return this.internal.size == 0;
  }

  dots(): Set<Dot> {
    return structuredClone(this.internal);
  }

  clone() {
    let output = new DotSet();
    output.internal = structuredClone(this.internal);

    return output;
  }

  static fromSet(set: Set<Dot>): DotSet {
    let output = new DotSet();

    set.forEach((value) => {
      output.add(value);
    });

    return output;
  }
}
