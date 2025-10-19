import { GSet } from "./crdt/data_types/g-set.js";
import { SerializableRegistry } from "./serialize/serializable.js";
import { SerializableMap } from "./serialize/serializable-map.js";
import { SerializableSet } from "./serialize/serializable-set.js";
import { SerializableString } from "./serialize/serializable-string.js";
import { InvertibleBloomLookupTable } from "./set_reconciliation/iblt.js";
import {
  IncomingIBLTReconciliation,
  OutgoingIBLTReconciliation,
} from "./set_reconciliation/reconcile.js";
import { ValueSet } from "./util/value-set.js";
import { AddWinsSet } from "./crdt/data_types/add-wins-dots.js";
import { DotMap } from "./crdt/dots/dot-map.js";
import { DotSet } from "./crdt/dots/dot-set.js";
import { SerializablePair2 } from "./serialize/serializable-pair.js";
import { SerializableDot } from "./serialize/serializable-dot.js";

function setsEqual<T>(a: SerializableSet<T>, b: SerializableSet<T>): boolean {
  if (a.size !== b.size) return false;
  for (const v of a) {
    if (!b.has(v)) return false;
  }
  return true;
}

/*let lookuptable = new InvertibleBloomLookupTable<SerializableString, SerializableString>(
  10000,
  5,
  SerializableString,
  SerializableString
);

lookuptable.insert(new SerializableString("Hello"), new SerializableString("World"));
lookuptable.insert(new SerializableString("Hello"), new SerializableString("World"));
lookuptable.insert(new SerializableString("Hello 2"), new SerializableString("World 2"));
lookuptable.insert(new SerializableString("Hello 3"), new SerializableString("World 3"));
//console.log(lookuptable.internal);
//console.log(lookuptable.get(new SerializableString("Hello 4")));
//console.log(lookuptable.listAllEntries());

let crdtA: GSet<number> = new GSet(setsEqual);
let crdtB: GSet<number> = new GSet(setsEqual);

crdtA.add(2);
crdtA.add(3);
crdtA.add(4);

crdtB.add(5);
crdtB.add(6);
crdtB.add(7);

// Issue lies where if we delete something, and then list. We get an issue.
let setA: ValueSet<SerializableSet<number>> = crdtA.decompose();
let setB: ValueSet<SerializableSet<number>> = crdtB.decompose();

let outgoing = new OutgoingIBLTReconciliation<SerializableSet<number>>(setA, SerializableSet);
let incoming: IncomingIBLTReconciliation<SerializableSet<number>> = new IncomingIBLTReconciliation(
  setB,
  outgoing.lookupTable
);

incoming.reconcileLocalSet();

console.log(setB);
const response = ValueSet.fromSet(incoming.computeTransmission(), setsEqual);
outgoing.reconcileWithResponse(response);
console.log(setA);
*/
////////

console.log("-------");
let AW0 = new AddWinsSet((one: number, two: number) => one == two, 0);
let AW1 = new AddWinsSet((one: number, two: number) => one == two, 1);
let AW2 = new AddWinsSet((one: number, two: number) => one == two, 2);

AW0.add(1);
AW1.remove(1);
AW1.add(1);
AW0.add(2);
// Joining AW1 with AW0
//const joinResult = AW1.store.join(AW1.causalContext, AW0.store, AW0.causalContext);
//AW1.store = joinResult.store as DotMap<number, DotSet>;
//AW1.causalContext = joinResult.causalContext;

let setAa: ValueSet<SerializablePair2> = AW0.decompose();
let setBb: ValueSet<SerializablePair2> = AW1.decompose();

let outgoing2 = new OutgoingIBLTReconciliation<SerializablePair2>(setAa, SerializablePair2);
let incoming2: IncomingIBLTReconciliation<SerializablePair2> = new IncomingIBLTReconciliation(
  setBb,
  outgoing2.lookupTable
);

incoming2.reconcileLocalSet();

//console.log(setBb);
const response2 = ValueSet.fromSet(
  incoming2.computeTransmission(),
  (pairL, pairR) => pairL.left == pairR.left && pairL.right == pairR.right
);
outgoing2.reconcileWithResponse(response2);
console.log(setAa);
console.log(setBb);

setAa.forEach((pair) => {
  console.log(pair.left);
  console.log(pair.right);
});

setBb.forEach((pair) => {
  console.log(pair.left);
  console.log(pair.right);
});

let LEFT = AW0.compose(setAa);
let RIGHT = AW1.compose(setBb);

console.log(LEFT.elements());
console.log(RIGHT.elements());
//let pr = new SerializablePair2(new SerializableMap(), new SerializableDot(1, 1));
//let str = JSON.stringify(pr);
//console.log(str);
//console.log(SerializablePair2.deserialize(pr.serialize(256)));
