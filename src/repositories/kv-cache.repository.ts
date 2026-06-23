import { ICacheRepository, CachePutOptions } from "./cache.interface";
import { KVNamespace } from "@cloudflare/workers-types";

export class KVCacheRepository implements ICacheRepository {
  constructor(private kv: KVNamespace) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.kv.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  async getWithMetadata<T, M>(key: string): Promise<{ value: T | null; metadata: M | null }> {
    const data = await this.kv.getWithMetadata<M>(key);
    let parsedValue: T | null = null;
    if (data.value !== null) {
      try {
        parsedValue = JSON.parse(data.value) as T;
      } catch {
        parsedValue = data.value as unknown as T;
      }
    }
    return { value: parsedValue, metadata: data.metadata };
  }

  async put(key: string, value: string, options?: CachePutOptions): Promise<void> {
    await this.kv.put(key, value, options);
  }

  async delete(key: string): Promise<void> {
    await this.kv.delete(key);
  }
}
