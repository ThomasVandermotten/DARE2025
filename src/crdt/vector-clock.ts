class VectorClock {
  clock: number[];

  constructor(size: number) {
    this.clock = Array(size).fill(0);
  }

  increment(id: number) {
    this.clock[id]++;
  }

  merge(other: VectorClock) {
    for (let i = 0; i < this.clock.length; i++) {
      this.clock[i] = Math.max(this.clock[i], other.clock[i]);
    }
  }

  clone(): VectorClock {
    let output: VectorClock = new VectorClock(this.clock.length);
    this.clock.forEach((value, index) => {
      output.clock[index] = value;
    });

    return output;
  }

  isLarger(other: VectorClock) {
    for (let i = 0; i < this.clock.length; i++) {
      if (this.clock[i] < other.clock[i]) {
        return false;
      }
    }

    return true;
  }

  isSmaller(other: VectorClock) {
    for (let i = 0; i < this.clock.length; i++) {
      if (this.clock[i] > other.clock[i]) {
        return false;
      }
    }

    return true;
  }

  isEqual(other: VectorClock) {
    for (let i = 0; i < this.clock.length; i++) {
      if (this.clock[i] != other.clock[i]) {
        return false;
      }
    }

    return true;
  }

  isConcurrent(other: VectorClock) {
    return !this.isLarger(other) && !this.isSmaller(other) && !this.isEqual(other);
  }
}
