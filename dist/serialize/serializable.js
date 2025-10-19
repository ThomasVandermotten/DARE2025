export class SerializableRegistry {
    static registry = new Map();
    /** Register a class under a unique type ID */
    static register(typeId, fn) {
        SerializableRegistry.registry.set(typeId, fn);
    }
    /** Deserialize by type ID */
    static deserialize(typeId, data) {
        const fn = SerializableRegistry.registry.get(typeId);
        if (!fn)
            throw new Error(`No deserializer registered for type ${typeId}`);
        return fn(data);
    }
}
