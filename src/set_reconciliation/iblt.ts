import murmurhash3 from "murmurhash3";
import { Serializable, SerializableRegistry } from "../serialize/serializable.js";

function sumIntArrays(arr1: number[], arr2: number[]): number[] {
  const maxLength = Math.max(arr1.length, arr2.length);
  const result: number[] = [];
  let carry = 0;

  for (let i = 0; i < maxLength; i++) {
    const sum = (arr1[i] || 0) + (arr2[i] || 0) + carry;
    result[i] = sum % 256;
    carry = Math.floor(sum / 256);
  }

  if (carry > 0) {
    result.push(carry);
  }

  return result;
}

function diffIntArrays(arr1: number[], arr2: number[]): number[] {
  const maxLength = Math.max(arr1.length, arr2.length);
  const result: number[] = [];
  let borrow = 0;

  for (let i = 0; i < maxLength; i++) {
    let diff = (arr1[i] || 0) - (arr2[i] || 0) - borrow;
    if (diff < 0) {
      diff += 256;
      borrow = 1;
    } else {
      borrow = 0;
    }
    result[i] = diff;
  }

  // Remove trailing zeros
  while (result.length > 1 && result[result.length - 1] === 0) {
    result.pop();
  }

  return result;
}

function negateIntArray(arr: number[]): number[] {
  // Two's complement negation
  const inverted = arr.map((v) => 255 - v);
  return sumIntArrays(inverted, [1]);
}

function arraysEqual(arr1: number[], arr2: number[]): boolean {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

export class InvertibleBloomLookupTable<K extends Serializable, V extends Serializable> {
  m: number;
  hashCount: number;
  ctorK: new (...args: any[]) => K;
  ctorV: new (...args: any[]) => V;
  keyType: string;
  valueType: string;
  internal: Array<Cell>;
  keyLen: number;
  valueLen: number;
  hashLen: number;

  constructor(
    m: number,
    hashCount: number,
    ctorK: new (...args: any[]) => K,
    ctorV: new (...args: any[]) => V,
    keyLen = 128,
    valueLen = 128,
    hashLen = 128
  ) {
    this.m = m;
    this.hashCount = hashCount;
    this.internal = Array(m);
    this.ctorK = ctorK;
    this.ctorV = ctorV;

    this.keyType = ctorK.name;
    this.valueType = ctorV.name;
    this.keyLen = keyLen;
    this.valueLen = valueLen;
    this.hashLen = hashLen;

    for (let i = 0; i < this.m; i++) {
      this.internal[i] = new Cell(keyLen, valueLen, hashLen);
    }
  }

  insert(key: K, value: V): void {
    const keyArr = key.serialize(this.keyLen);
    const valueArr = value.serialize(this.keyLen);
    const hashArr = this.computeGHash(key);
    this.computeHashes(key).forEach((index) => {
      const cell = this.internal[index];
      if (cell !== undefined) {
        cell.count++;
        cell.keySum = sumIntArrays(cell.keySum, keyArr);
        cell.valueSum = sumIntArrays(cell.valueSum, valueArr);
        cell.hashKeySum = sumIntArrays(cell.hashKeySum, hashArr);
      }
    });
  }

  delete(key: K, value: V): void {
    const keyArr = key.serialize(this.keyLen);
    const valueArr = value.serialize(this.keyLen);
    const hashArr = this.computeGHash(key);

    this.computeHashes(key).forEach((index) => {
      const cell = this.internal[index];
      if (cell !== undefined) {
        cell.count--;
        cell.keySum = diffIntArrays(cell.keySum, keyArr);
        cell.valueSum = diffIntArrays(cell.valueSum, valueArr);
        cell.hashKeySum = diffIntArrays(cell.hashKeySum, hashArr);
      }
    });
  }

  get(key: K): V | undefined {
    const keyArr = key.serialize(this.keyLen);
    const hashArr = this.computeGHash(key);

    for (let index of this.computeHashes(key)) {
      let cell = this.internal[index];

      if (cell !== undefined) {
        if (
          cell.count === BigInt(0) &&
          arraysEqual(cell.keySum, Array(this.keyLen).fill(0)) &&
          arraysEqual(cell.hashKeySum, Array(this.hashLen).fill(0))
        ) {
          return undefined;
        }

        if (
          cell.count === BigInt(1) &&
          arraysEqual(cell.keySum, keyArr) &&
          arraysEqual(cell.hashKeySum, hashArr)
        ) {
          return SerializableRegistry.deserialize<V>(this.valueType, cell.valueSum);
        }

        if (
          cell.count === BigInt(-1) &&
          arraysEqual(cell.keySum, negateIntArray(keyArr)) &&
          arraysEqual(cell.hashKeySum, negateIntArray(hashArr))
        ) {
          return SerializableRegistry.deserialize<V>(this.valueType, negateIntArray(cell.valueSum));
        }
      }
    }

    return undefined;
  }

  listEntries(): V[] {
    let output: V[] = [];

    while (true) {
      let broke = false;
      for (let i = 0; i < this.m; i++) {
        let cell = this.internal[i];

        if (cell !== undefined) {
          if (
            cell.count == BigInt(1) &&
            arraysEqual(
              cell.hashKeySum,
              this.computeGHash(SerializableRegistry.deserialize<K>(this.keyType, cell.keySum))
            )
          ) {
            output.push(SerializableRegistry.deserialize<V>(this.valueType, cell.valueSum));
            this.delete(
              SerializableRegistry.deserialize<K>(this.keyType, cell.keySum),
              SerializableRegistry.deserialize<V>(this.valueType, cell.valueSum)
            );
            broke = true;
            break;
          } else if (
            cell.count == BigInt(-1) &&
            arraysEqual(
              negateIntArray(cell.hashKeySum),
              this.computeGHash(
                SerializableRegistry.deserialize<K>(this.keyType, negateIntArray(cell.keySum))
              )
            )
          ) {
            output.push(SerializableRegistry.deserialize<V>(this.valueType, cell.valueSum));
            this.delete(
              SerializableRegistry.deserialize<K>(this.keyType, negateIntArray(cell.keySum)),
              SerializableRegistry.deserialize<V>(this.valueType, negateIntArray(cell.valueSum))
            );
            broke = true;
            break;
          }
        }
      }

      if (!broke) {
        break;
      }
    }

    return output;
  }

  listPositiveEntries(): V[] {
    let output: V[] = [];

    while (true) {
      let broke = false;
      for (let i = 0; i < this.m; i++) {
        let cell = this.internal[i];

        if (cell !== undefined) {
          if (
            cell.count == BigInt(1) &&
            arraysEqual(
              cell.hashKeySum,
              this.computeGHash(SerializableRegistry.deserialize<K>(this.keyType, cell.keySum))
            )
          ) {
            output.push(SerializableRegistry.deserialize<V>(this.valueType, cell.valueSum));
            this.delete(
              SerializableRegistry.deserialize<K>(this.keyType, cell.keySum),
              SerializableRegistry.deserialize<V>(this.valueType, cell.valueSum)
            );
            broke = true;
            break;
          }
        }
      }

      if (!broke) {
        break;
      }
    }

    return output;
  }

  listNegativeEntries(): V[] {
    let output: V[] = [];

    while (true) {
      let broke = false;
      for (let i = 0; i < this.m; i++) {
        let cell = this.internal[i];

        if (cell !== undefined) {
          if (
            cell.count == BigInt(-1) &&
            arraysEqual(
              negateIntArray(cell.hashKeySum),
              this.computeGHash(
                SerializableRegistry.deserialize<K>(this.keyType, negateIntArray(cell.keySum))
              )
            )
          ) {
            output.push(
              SerializableRegistry.deserialize<V>(this.valueType, negateIntArray(cell.valueSum))
            );
            this.delete(
              SerializableRegistry.deserialize<K>(this.keyType, negateIntArray(cell.keySum)),
              SerializableRegistry.deserialize<V>(this.valueType, negateIntArray(cell.valueSum))
            );
            broke = true;
            break;
          }
        }
      }

      if (!broke) {
        break;
      }
    }

    return output;
  }

  clone(): InvertibleBloomLookupTable<K, V> {
    let output: InvertibleBloomLookupTable<K, V> = new InvertibleBloomLookupTable(
      100,
      5,
      this.ctorK,
      this.ctorV,
      this.keyLen,
      this.valueLen,
      this.hashLen
    );
    output.internal = structuredClone(this.internal);

    return output;
  }

  computeHashes(key: K): number[] {
    const JSONKey = JSON.stringify(key);
    const h1 = murmurhash3.murmur32Sync(JSONKey, 0x1234abcd);
    const h2 = murmurhash3.murmur32Sync(JSONKey, 0xdeadbeef);

    const indices = [];
    const subTableSize = Math.floor(this.m / this.hashCount);

    for (let i = 0; i < this.hashCount; i++) {
      const subTableIndex = i % this.hashCount; // pick subtable
      const offset = subTableIndex * subTableSize;

      // compute index inside the subtable
      const localIndex = (h1 + i * h2) % subTableSize;

      indices.push(offset + localIndex);
    }

    return indices;
  }

  computeGHash(key: K): number[] {
    const JSONKey = JSON.stringify(key);
    const str = BigInt(murmurhash3.murmur32Sync(JSONKey, 0x5678edff)).toString();
    const arr = [];
    for (let i = 0; i < this.keyLen; i++) {
      arr.push(i < str.length ? str.charCodeAt(i) : 0);
    }

    return arr;
  }
}

export class Cell {
  count: bigint;
  keySum: number[];
  valueSum: number[];
  hashKeySum: number[];

  constructor(keyLen = 32, valueLen = 32, hashLen = 32) {
    this.count = BigInt(0);
    this.keySum = Array(keyLen).fill(0);
    this.valueSum = Array(valueLen).fill(0);
    this.hashKeySum = Array(hashLen).fill(0);
  }
}
