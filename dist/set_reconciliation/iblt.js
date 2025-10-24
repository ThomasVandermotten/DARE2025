import murmurhash3 from "murmurhash3";
import { SerializableRegistry } from "../serialize/serializable.js";
function sumIntArrays(arr1, arr2) {
    const maxLength = Math.max(arr1.length, arr2.length);
    const result = [];
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
function diffIntArrays(arr1, arr2) {
    const maxLength = Math.max(arr1.length, arr2.length);
    const result = [];
    let borrow = 0;
    for (let i = 0; i < maxLength; i++) {
        let diff = (arr1[i] || 0) - (arr2[i] || 0) - borrow;
        if (diff < 0) {
            diff += 256;
            borrow = 1;
        }
        else {
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
function negateIntArray(arr) {
    // Two's complement negation
    const inverted = arr.map((v) => 255 - v);
    return sumIntArrays(inverted, [1]);
}
function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length)
        return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i])
            return false;
    }
    return true;
}
export class InvertibleBloomLookupTable {
    m;
    hashCount;
    ctorK;
    ctorV;
    keyType;
    valueType;
    internal;
    keyLen;
    valueLen;
    hashLen;
    collisionCount = 0;
    constructor(m, hashCount, ctorK, ctorV, keyLen = 128, valueLen = 128, hashLen = 128) {
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
    insert(key, value) {
        const keyArr = key.serialize(this.keyLen);
        const valueArr = value.serialize(this.keyLen);
        const hashArr = this.computeGHash(key);
        //console.log("for " + key + " " + this.computeHashes(key));
        this.computeHashes(key).forEach((index) => {
            const cell = this.internal[index];
            if (cell !== undefined) {
                if (cell.count > 0) {
                    this.collisionCount++;
                }
                cell.count++;
                cell.keySum = sumIntArrays(cell.keySum, keyArr);
                cell.valueSum = sumIntArrays(cell.valueSum, valueArr);
                cell.hashKeySum = sumIntArrays(cell.hashKeySum, hashArr);
            }
        });
    }
    delete(key, value) {
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
    get(key) {
        const keyArr = key.serialize(this.keyLen);
        const hashArr = this.computeGHash(key);
        //console.log("for " + key + " " + this.computeHashes(key));
        for (let index of this.computeHashes(key)) {
            let cell = this.internal[index];
            if (cell !== undefined) {
                if (cell.count === BigInt(0) &&
                    arraysEqual(cell.keySum, Array(this.keyLen).fill(0)) &&
                    arraysEqual(cell.hashKeySum, Array(this.hashLen).fill(0))) {
                    //console.log("not found!");
                    return undefined;
                }
                if (cell.count === BigInt(1) &&
                    arraysEqual(cell.keySum, keyArr) &&
                    arraysEqual(cell.hashKeySum, hashArr)) {
                    return SerializableRegistry.deserialize(this.valueType, cell.valueSum);
                }
                if (cell.count === BigInt(-1) &&
                    arraysEqual(cell.keySum, negateIntArray(keyArr)) &&
                    arraysEqual(cell.hashKeySum, negateIntArray(hashArr))) {
                    return SerializableRegistry.deserialize(this.valueType, negateIntArray(cell.valueSum));
                }
            }
        }
        //console.log("not found!");
        return undefined;
    }
    listEntries() {
        let output = [];
        while (true) {
            let broke = false;
            for (let i = 0; i < this.m; i++) {
                let cell = this.internal[i];
                if (cell !== undefined) {
                    if (cell.count == BigInt(1) &&
                        arraysEqual(cell.hashKeySum, this.computeGHash(SerializableRegistry.deserialize(this.keyType, cell.keySum)))) {
                        output.push(SerializableRegistry.deserialize(this.valueType, cell.valueSum));
                        this.delete(SerializableRegistry.deserialize(this.keyType, cell.keySum), SerializableRegistry.deserialize(this.valueType, cell.valueSum));
                        broke = true;
                        break;
                    }
                    else if (cell.count == BigInt(-1) &&
                        arraysEqual(negateIntArray(cell.hashKeySum), this.computeGHash(SerializableRegistry.deserialize(this.keyType, negateIntArray(cell.keySum))))) {
                        output.push(SerializableRegistry.deserialize(this.valueType, cell.valueSum));
                        this.delete(SerializableRegistry.deserialize(this.keyType, negateIntArray(cell.keySum)), SerializableRegistry.deserialize(this.valueType, negateIntArray(cell.valueSum)));
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
    listPositiveEntries() {
        let output = [];
        while (true) {
            let broke = false;
            for (let i = 0; i < this.m; i++) {
                let cell = this.internal[i];
                if (cell !== undefined) {
                    if (cell.count == BigInt(1) &&
                        arraysEqual(cell.hashKeySum, this.computeGHash(SerializableRegistry.deserialize(this.keyType, cell.keySum)))) {
                        output.push(SerializableRegistry.deserialize(this.valueType, cell.valueSum));
                        this.delete(SerializableRegistry.deserialize(this.keyType, cell.keySum), SerializableRegistry.deserialize(this.valueType, cell.valueSum));
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
    listNegativeEntries() {
        let output = [];
        while (true) {
            let broke = false;
            for (let i = 0; i < this.m; i++) {
                let cell = this.internal[i];
                if (cell !== undefined) {
                    if (cell.count == BigInt(-1) &&
                        arraysEqual(negateIntArray(cell.hashKeySum), this.computeGHash(SerializableRegistry.deserialize(this.keyType, negateIntArray(cell.keySum))))) {
                        output.push(SerializableRegistry.deserialize(this.valueType, negateIntArray(cell.valueSum)));
                        this.delete(SerializableRegistry.deserialize(this.keyType, negateIntArray(cell.keySum)), SerializableRegistry.deserialize(this.valueType, negateIntArray(cell.valueSum)));
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
    clone() {
        let output = new InvertibleBloomLookupTable(100, 5, this.ctorK, this.ctorV, this.keyLen, this.valueLen, this.hashLen);
        output.internal = structuredClone(this.internal);
        return output;
    }
    computeHashesOld(key) {
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
    computeHashes(key) {
        const JSONKey = JSON.stringify(key);
        const h1 = murmurhash3.murmur32Sync(JSONKey, 0x1234abcd);
        const h2 = murmurhash3.murmur32Sync(JSONKey, 0xdeadbeef);
        const indices = [];
        for (let i = 0; i < this.hashCount; i++) {
            // Double hashing technique
            const index = (h1 + i * h2) % this.m;
            // Ensure non-negative index (in case of JS modulo quirks)
            indices.push((index + this.m) % this.m);
        }
        return indices;
    }
    computeGHash(key) {
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
    count;
    keySum;
    valueSum;
    hashKeySum;
    constructor(keyLen = 32, valueLen = 32, hashLen = 32) {
        this.count = BigInt(0);
        this.keySum = Array(keyLen).fill(0);
        this.valueSum = Array(valueLen).fill(0);
        this.hashKeySum = Array(hashLen).fill(0);
    }
}
