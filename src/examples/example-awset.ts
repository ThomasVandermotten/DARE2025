import { AddWinsSet } from "../crdt/data_types/add-wins-dots.js";
import { DotMap } from "../crdt/dots/dot-map.js";
import { DotSet } from "../crdt/dots/dot-set.js";
import { SerializablePair2 } from "../serialize/serializable-pair.js";
import {
  IncomingIBLTReconciliation,
  OutgoingIBLTReconciliation,
} from "../set_reconciliation/reconcile.js";
import { ValueSet } from "../util/value-set.js";

// Create CRDTs
let AW0 = new AddWinsSet((one: number, two: number) => one == two, 0);
let AW1 = new AddWinsSet((one: number, two: number) => one == two, 1);

// Add concurrent add/remove
AW0.add(1);
AW1.remove(1);

// Create join decompositions
let setA: ValueSet<SerializablePair2> = AW0.decompose();
let setB: ValueSet<SerializablePair2> = AW1.decompose();

// Initialize Protocol
let outgoing = new OutgoingIBLTReconciliation<SerializablePair2>(setA, SerializablePair2);

// Setup receiver side
let incoming: IncomingIBLTReconciliation<SerializablePair2> = new IncomingIBLTReconciliation(
  setB,
  outgoing.lookupTable
);

// Using incoming IBLT to converge
incoming.reconcileLocalSet();

// Convert result
const response = ValueSet.fromSet(
  incoming.computeTransmission(),
  (pairL, pairR) => pairL.left == pairR.left && pairL.right == pairR.right
);

// Use receivers response to converge
outgoing.reconcileWithResponse(response);

// Recompose set back into CRDT state
let AW0Synchronized = AW0.compose(setA);
let AW1Synchronized = AW1.compose(setB);

console.log(AW0Synchronized.elements());
console.log(AW1Synchronized.elements());
