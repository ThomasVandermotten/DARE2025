export class CausalJoinResult {
    store;
    causalContext;
    constructor(store, causalContext) {
        this.store = store;
        this.causalContext = causalContext;
    }
}
