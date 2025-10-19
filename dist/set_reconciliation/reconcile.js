import { InvertibleBloomLookupTable } from "./iblt.js";
export class OutgoingIBLTReconciliation {
    localSet;
    lookupTable;
    constructor(currentSet, ctor) {
        this.localSet = currentSet;
        this.lookupTable = new InvertibleBloomLookupTable(100, 5, ctor, ctor);
        currentSet.forEach((value) => {
            this.lookupTable.insert(value, value);
        });
    }
    reconcileWithResponse(set) {
        set.forEach((value) => this.localSet.add(value));
    }
}
export class IncomingIBLTReconciliation {
    incomingTable;
    localSet;
    constructor(set, incomingTable) {
        this.incomingTable = incomingTable;
        this.localSet = set;
        // Ensure symmetric difference in incomingTable
        set.forEach((value) => {
            incomingTable.delete(value, value);
        });
    }
    reconcileLocalSet() {
        let cloned = this.incomingTable.clone();
        //console.log(this.incomingTable.clone().listPositiveEntries());
        //console.log(this.incomingTable.clone().listEntries());
        cloned.listPositiveEntries().forEach((entry) => this.localSet.add(entry));
    }
    computeTransmission() {
        let output = new Set();
        //console.log(this.incomingTable.clone().listNegativeEntries());
        let missingValues = this.incomingTable.clone().listNegativeEntries();
        missingValues.forEach((value) => {
            output.add(value);
        });
        return output;
    }
}
