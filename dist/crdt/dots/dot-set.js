import { CausalJoinResult } from "./dot-store.js";
export class DotSet {
    internal = new Set();
    add(dot) {
        if (!this.has(dot)) {
            this.internal.add(dot);
        }
    }
    remove(dot) {
        let result = new Set();
        this.internal.forEach((value) => {
            if (!(value.replica == dot.replica && value.sequence_number == dot.sequence_number)) {
                result.add(value);
            }
        });
        this.internal = result;
    }
    has(dot) {
        let output = false;
        this.internal.forEach((value) => {
            if (value.replica == dot.replica && value.sequence_number == dot.sequence_number) {
                output = true;
            }
        });
        return output;
    }
    difference(other) {
        const output = new DotSet();
        this.internal.forEach((dot) => {
            if (!other.has(dot)) {
                output.add(dot);
            }
        });
        return output;
    }
    union(other) {
        const output = new DotSet();
        this.internal.forEach((dot) => {
            output.add(dot);
        });
        other.internal.forEach((dot) => {
            output.add(dot);
        });
        return output;
    }
    intersection(other) {
        const output = new DotSet();
        this.internal.forEach((dot) => {
            if (other.has(dot)) {
                output.add(dot);
            }
        });
        other.internal.forEach((dot) => {
            if (this.has(dot)) {
                output.add(dot);
            }
        });
        return output;
    }
    join(thisContext, otherStore, otherContext) {
        const intersectedStore = this.intersection(otherContext);
        const differenceLeft = this.difference(otherContext);
        const differenceRight = otherStore.difference(thisContext);
        const differenceUnion = differenceLeft.union(differenceRight);
        const contextUnion = thisContext.union(otherContext);
        return new CausalJoinResult(intersectedStore.union(differenceUnion), contextUnion);
    }
    isBot() {
        return this.internal.size == 0;
    }
    dots() {
        return structuredClone(this.internal);
    }
    clone() {
        let output = new DotSet();
        output.internal = structuredClone(this.internal);
        return output;
    }
    static fromSet(set) {
        let output = new DotSet();
        set.forEach((value) => {
            output.add(value);
        });
        return output;
    }
}
