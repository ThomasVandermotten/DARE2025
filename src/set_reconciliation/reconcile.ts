import { InvertibleBloomLookupTable } from "./iblt.js";
import { Serializable } from "../serialize/serializable.js";
import { SerializableSet } from "../serialize/serializable-set.js";
import { ValueSet } from "../util/value-set.js";

export class OutgoingIBLTReconciliation<T extends Serializable> {
  localSet: ValueSet<T>;
  lookupTable: InvertibleBloomLookupTable<T, T>;

  constructor(currentSet: ValueSet<T>, ctor: new (...args: any[]) => T) {
    this.localSet = currentSet;
    this.lookupTable = new InvertibleBloomLookupTable<T, T>(100, 5, ctor, ctor);

    currentSet.forEach((value) => {
      this.lookupTable.insert(value, value);
    });
  }

  reconcileWithResponse(set: ValueSet<T>): void {
    set.forEach((value) => this.localSet.add(value));
  }
}

export class IncomingIBLTReconciliation<T extends Serializable> {
  incomingTable: InvertibleBloomLookupTable<T, T>;
  localSet: ValueSet<T>;

  constructor(set: ValueSet<T>, incomingTable: InvertibleBloomLookupTable<T, T>) {
    this.incomingTable = incomingTable;
    this.localSet = set;
    // Ensure symmetric difference in incomingTable
    set.forEach((value) => {
      incomingTable.delete(value, value);
    });
  }

  reconcileLocalSet(): void {
    let cloned = this.incomingTable.clone();
    //console.log(this.incomingTable.clone().listPositiveEntries());
    //console.log(this.incomingTable.clone().listEntries());
    cloned.listPositiveEntries().forEach((entry) => this.localSet.add(entry));
  }

  computeTransmission(): Set<T> {
    let output: Set<T> = new Set();
    //console.log(this.incomingTable.clone().listNegativeEntries());
    let missingValues = this.incomingTable.clone().listNegativeEntries();
    missingValues.forEach((value) => {
      output.add(value);
    });

    return output;
  }
}
