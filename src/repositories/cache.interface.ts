export interface CachePutOptions {
  expirationTtl?: number;
  metadata?: any;
}

export interface ICacheRepository {
  get<T>(key: string): Promise<T | null>;
  getWithMetadata<T, M>(key: string): Promise<{ value: T | null; metadata: M | null }>;
  put(key: string, value: string, options?: CachePutOptions): Promise<void>;
  delete(key: string): Promise<void>;
}
