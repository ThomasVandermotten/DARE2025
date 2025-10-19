export interface Serializable {
  serialize(length: number): number[];
}

type DeserializeFn<T extends Serializable> = (data: number[]) => T;

export class SerializableRegistry {
  private static registry = new Map<string, DeserializeFn<Serializable>>();

  /** Register a class under a unique type ID */
  static register<T extends Serializable>(typeId: string, fn: DeserializeFn<T>) {
    SerializableRegistry.registry.set(typeId, fn as DeserializeFn<Serializable>);
  }

  /** Deserialize by type ID */
  static deserialize<T extends Serializable>(typeId: string, data: number[]): T {
    const fn = SerializableRegistry.registry.get(typeId);
    if (!fn) throw new Error(`No deserializer registered for type ${typeId}`);
    return fn(data) as T;
  }
}
