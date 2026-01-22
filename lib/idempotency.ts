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

// TTL padrão: 24 horas
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

// Store em memória (para produção, considerar Redis)
class IdempotencyStore {
  private store: Map<string, IdempotencyRecord> = new Map();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Limpar registros expirados a cada 5 minutos
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  get(key: string): IdempotencyRecord | null {
    const record = this.store.get(key);

    if (!record) {
      return null;
    }

    // Verificar expiração
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

  // Retorna true se conseguiu adquirir o lock (key não existia)
  setProcessing(key: string): boolean {
    const existing = this.store.get(key);

    if (existing) {
      return false; // Já existe (ou está processando)
    }

    // Marcar como processando com TTL curto (30s) para evitar deadlock
    this.store.set(key, {
      key,
      response: { status: 0, body: null }, // Placeholder
      createdAt: Date.now(),
      expiresAt: Date.now() + 30000, // 30 segundos
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

  // Para testes
  clear(): void {
    this.store.clear();
  }
}

// Singleton
export const idempotencyStore = new IdempotencyStore();

// Constantes
export const IDEMPOTENCY_KEY_HEADER = 'idempotency-key';
export const IDEMPOTENCY_REPLAY_HEADER = 'idempotency-replayed';

// Validar formato do Idempotency-Key (UUID v4)
export function isValidIdempotencyKey(key: string): boolean {
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(key);
}

// Gerar Idempotency-Key no cliente
export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}
