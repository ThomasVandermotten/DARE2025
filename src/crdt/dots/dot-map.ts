import { DotSet } from "./dot-set.js";
import { CausalJoinResult, DotStore } from "./dot-store.js";
import { Dot } from "./dot.js";

export class DotMap<K, V extends DotStore> implements DotStore {
  internal: Map<K, V> = new Map();
  keyEquals: (keyL: K, keyR: K) => boolean;
  createVStore: new (...args: any[]) => V;

  constructor(keyEquals: (keyL: K, keyR: K) => boolean, createVStore: new (...args: any[]) => V) {
    this.keyEquals = keyEquals;
    this.createVStore = createVStore;
  }

  set(keyToSet: K, value: V): void {
    // Remove any existing entry with same replica and sequence_number
    for (const [key] of this.internal) {
      if (this.keyEquals(keyToSet, key)) {
        this.internal.delete(key);
        break;
      }
    }
    this.internal.set(keyToSet, value);
  }

  get(keyToGet: K): V {
    for (const [key, val] of this.internal) {
      if (this.keyEquals(keyToGet, key)) {
        return val;
      }
    }
    return new this.createVStore();
  }

  contains(keyToContain: K): boolean {
    for (const key of this.internal.keys()) {
      if (this.keyEquals(keyToContain, key)) {
        return true;
      }
    }
    return false;
  }

  join(thisContext: DotSet, otherStore: DotMap<K, V>, otherContext: DotSet): CausalJoinResult {
    let outputStore = new DotMap(this.keyEquals, this.createVStore);
    let outputContext = thisContext.union(otherContext);

    // TODO: dom m, but also dom m'
    for (const [key, val] of this.internal) {
      //if (otherStore.contains(key)) {
      const vk: DotStore = val.join(thisContext, otherStore.get(key)!, otherContext).store;
      console.log("yes");
      if (!vk.isBot()) {
        console.log("real yes");
        outputStore.set(key, vk as V);
      }
      //}
    }

    for (const [key, val] of otherStore.internal) {
      //if (this.contains(key)) {
      const vk: DotStore = val.join(otherContext, this.get(key)!, thisContext).store;
      console.log("yes");
      console.log(vk);
      if (!vk.isBot()) {
        console.log("real yes");
        outputStore.set(key, vk as V);
        //}
      }
    }

    return new CausalJoinResult(outputStore, outputContext);
  }

  isBot(): boolean {
    return this.internal.size == 0;
  }

  dots(): Set<Dot> {
    const result = new Set<Dot>();
    const seen = new Set<string>(); // store unique dot identifiers

    for (const value of this.internal.values()) {
      for (const dot of value.dots()) {
        // For value-based equality
        const key = `${dot.replica}:${dot.sequence_number}`;
        if (!seen.has(key)) {
          seen.add(key);
          result.add(dot);
        }
      }
    }

    return result;
  }

  clone(): DotMap<K, V> {
    const clone = new DotMap<K, V>(this.keyEquals, this.createVStore);
    for (const [k, v] of this.internal.entries()) {
      clone.internal.set(structuredClone(k), v.clone() as V);
    }
    return clone;
  }
}
