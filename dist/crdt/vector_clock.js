"use strict";
class VectorClock {
    clock;
    constructor(size) {
        this.clock = Array(size).fill(0);
    }
    increment(id) {
        this.clock[id]++;
    }
    merge(other) {
        for (let i = 0; i < this.clock.length; i++) {
            this.clock[i] = Math.max(this.clock[i], other.clock[i]);
        }
    }
    clone() {
        let output = new VectorClock(this.clock.length);
        this.clock.forEach((value, index) => {
            output.clock[index] = value;
        });
        return output;
    }
    isLarger(other) {
        for (let i = 0; i < this.clock.length; i++) {
            if (this.clock[i] < other.clock[i]) {
                return false;
            }
        }
        return true;
    }
    isSmaller(other) {
        for (let i = 0; i < this.clock.length; i++) {
            if (this.clock[i] > other.clock[i]) {
                return false;
            }
        }
        return true;
    }
    isEqual(other) {
        for (let i = 0; i < this.clock.length; i++) {
            if (this.clock[i] != other.clock[i]) {
                return false;
            }
        }
        return true;
    }
    isConcurrent(other) {
        return !this.isLarger(other) && !this.isSmaller(other) && !this.isEqual(other);
    }
}
