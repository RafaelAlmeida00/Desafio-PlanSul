import { createHash } from 'crypto';

export interface IdempotencyRecord {
  key: string;
  response: IdempotencyResponse;
  createdAt: number;
  expiresAt: number;
}

export interface IdempotencyResponse {
  status: number;
  body: unknown;
}

const DEFAULT_TTL_MS = 30 * 1000;

class IdempotencyStore {
  private store: Map<string, IdempotencyRecord> = new Map();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 10 * 1000);
    }
  }

  get(key: string): IdempotencyRecord | null {
    const record = this.store.get(key);

    if (!record) {
      return null;
    }

    if (Date.now() > record.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return record;
  }

  set(key: string, response: IdempotencyResponse, ttlMs: number = DEFAULT_TTL_MS): void {
    const now = Date.now();
    this.store.set(key, {
      key,
      response,
      createdAt: now,
      expiresAt: now + ttlMs,
    });
  }

  setProcessing(key: string): boolean {
    const existing = this.store.get(key);

    if (existing) {
      return false;
    }

    this.store.set(key, {
      key,
      response: { status: 0, body: null },
      createdAt: Date.now(),
      expiresAt: Date.now() + DEFAULT_TTL_MS,
    });

    return true;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  clear(): void {
    this.store.clear();
  }
}

export const idempotencyStore = new IdempotencyStore();

export const IDEMPOTENCY_REPLAY_HEADER = 'idempotency-replayed';

export function generateIdempotencyKeyFromData(data: unknown): string {
  const json = JSON.stringify(data);
  return createHash('sha256').update(json).digest('hex');
}
