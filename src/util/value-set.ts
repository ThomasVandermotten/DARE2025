export class ValueSet<T> {
  private internal: T[] = [];
  equals: (value: T, value2: T) => boolean;

  constructor(equals: (value: T, value2: T) => boolean) {
    this.equals = equals;
  }

  static fromSet<T>(set: Set<T>, equals: (value: T, value2: T) => boolean) {
    const output = new ValueSet(equals);

    set.forEach((value) => output.add(value));

    return output;
  }

  add(value: T): this {
    if (!this.has(value)) {
      this.internal.push(value);
    }
    return this;
  }

  has(value: T): boolean {
    return this.internal.some((v) => this.equals(v, value));
  }

  forEach(callback: (value: T, valueAgain: T, set: ValueSet<T>) => void, thisArg?: any): void {
    for (const value of this.internal) {
      callback.call(thisArg, value, value, this);
    }
  }

  delete(value: T): boolean {
    const index = this.internal.findIndex((v) => this.equals(v, value));
    if (index !== -1) {
      this.internal.splice(index, 1);
      return true;
    }
    return false;
  }

  get size(): number {
    return this.values.length;
  }

  values(): IterableIterator<T> {
    return this.internal[Symbol.iterator]();
  }

  [Symbol.iterator]() {
    return this.values();
  }
}
