export class ValueSet {
    internal = [];
    equals;
    constructor(equals) {
        this.equals = equals;
    }
    static fromSet(set, equals) {
        const output = new ValueSet(equals);
        set.forEach((value) => output.add(value));
        return output;
    }
    add(value) {
        if (!this.has(value)) {
            this.internal.push(value);
        }
        return this;
    }
    has(value) {
        return this.internal.some((v) => this.equals(v, value));
    }
    forEach(callback, thisArg) {
        for (const value of this.internal) {
            callback.call(thisArg, value, value, this);
        }
    }
    delete(value) {
        const index = this.internal.findIndex((v) => this.equals(v, value));
        if (index !== -1) {
            this.internal.splice(index, 1);
            return true;
        }
        return false;
    }
    get size() {
        return this.values.length;
    }
    values() {
        return this.internal[Symbol.iterator]();
    }
    [Symbol.iterator]() {
        return this.values();
    }
}
