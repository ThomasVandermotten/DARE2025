import { SerializableNumber } from "../serialize/serializable-number.js";
import { InvertibleBloomLookupTable } from "../set_reconciliation/iblt.js";

let result = new Map();

for (let i = 0; i < 100; i++) {
  let lookuptable = new InvertibleBloomLookupTable<SerializableNumber, SerializableNumber>(
    15000,
    25,
    SerializableNumber,
    SerializableNumber,
    32,
    32,
    32
  );
  let errors = 0;
  for (let j = 0; j < 10 + i * 10; j++) {
    lookuptable.insert(new SerializableNumber(j), new SerializableNumber(j));
  }
  for (let j = 0; j < 10 + i * 10; j++) {
    if (lookuptable.get(new SerializableNumber(j)) === undefined) {
      errors++;
    }
  }
  result.set(10 + i * 10, [lookuptable.collisionCount, errors]);
}

console.log(result);
