import { GSet } from "../crdt/data_types/g-set.js";
import { SerializableSet } from "../serialize/serializable-set.js";
import {
  IncomingIBLTReconciliation,
  OutgoingIBLTReconciliation,
} from "../set_reconciliation/reconcile.js";
import { ValueSet } from "../util/value-set.js";

function setsEqual<T>(a: SerializableSet<T>, b: SerializableSet<T>): boolean {
  if (a.size !== b.size) return false;
  for (const v of a) {
    if (!b.has(v)) return false;
  }
  return true;
}

let crdtA: GSet<number> = new GSet(setsEqual);
let crdtB: GSet<number> = new GSet(setsEqual);

// Locally perform some operations on CRDT A
crdtA.add(2);
crdtA.add(3);
crdtA.add(4);

// Locally perform some operations on CRDT B
crdtB.add(5);
crdtB.add(6);
crdtB.add(7);

// Decompose the CRDTs into their join decompositions
let setA: ValueSet<SerializableSet<number>> = crdtA.decompose();
let setB: ValueSet<SerializableSet<number>> = crdtB.decompose();

// Start synchronization protocol
// Sender side:
let outgoing = new OutgoingIBLTReconciliation<SerializableSet<number>>(setA, SerializableSet);

// Receiver side:
let incoming: IncomingIBLTReconciliation<SerializableSet<number>> = new IncomingIBLTReconciliation(
  setB,
  outgoing.lookupTable
);

// Apply incoming IBLT
incoming.reconcileLocalSet();
// Compute difference as response
const response = ValueSet.fromSet(incoming.computeTransmission(), setsEqual);

// Receive difference from receiver and apply to sender state
outgoing.reconcileWithResponse(response);

// Compose set decomposition back into CRDT State
let crdtASynchronized: GSet<number> = crdtA.compose(setA);
let crdtBSynchronized: GSet<number> = crdtB.compose(setB);

// Show that states converged
console.log(crdtASynchronized.items);
console.log(crdtBSynchronized.items);
