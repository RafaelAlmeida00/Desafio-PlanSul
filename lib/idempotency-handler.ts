import { NextRequest, NextResponse } from 'next/server';
import {
  idempotencyStore,
  IDEMPOTENCY_KEY_HEADER,
  IDEMPOTENCY_REPLAY_HEADER,
  isValidIdempotencyKey,
  IdempotencyResponse,
} from './idempotency';

export interface IdempotencyResult {
  shouldProcess: boolean;
  cachedResponse?: NextResponse;
  idempotencyKey?: string;
}

export function checkIdempotency(request: NextRequest): IdempotencyResult {
  const idempotencyKey = request.headers.get(IDEMPOTENCY_KEY_HEADER);

  // Se não tem key, processar normalmente (sem idempotência)
  if (!idempotencyKey) {
    return { shouldProcess: true };
  }

  // Validar formato do key
  if (!isValidIdempotencyKey(idempotencyKey)) {
    return {
      shouldProcess: false,
      cachedResponse: NextResponse.json(
        { error: 'Idempotency-Key inválido. Use formato UUID v4.', code: 'INVALID_IDEMPOTENCY_KEY' },
        { status: 400 }
      ),
    };
  }

  // Verificar se já existe resposta cacheada
  const existingRecord = idempotencyStore.get(idempotencyKey);

  if (existingRecord && existingRecord.response.status !== 0) {
    // Retornar resposta cacheada
    const response = NextResponse.json(existingRecord.response.body, {
      status: existingRecord.response.status,
    });
    response.headers.set(IDEMPOTENCY_REPLAY_HEADER, 'true');

    return {
      shouldProcess: false,
      cachedResponse: response,
      idempotencyKey,
    };
  }

  // Tentar adquirir lock para processar
  const acquired = idempotencyStore.setProcessing(idempotencyKey);

  if (!acquired) {
    // Requisição duplicada em andamento
    return {
      shouldProcess: false,
      cachedResponse: NextResponse.json(
        { error: 'Requisição já está sendo processada. Aguarde.', code: 'REQUEST_IN_PROGRESS' },
        { status: 409 }
      ),
    };
  }

  return { shouldProcess: true, idempotencyKey };
}

export async function saveIdempotencyResponse(
  idempotencyKey: string,
  response: NextResponse
): Promise<void> {
  // Clonar response para ler o body
  const clonedResponse = response.clone();

  let body: unknown;
  try {
    body = await clonedResponse.json();
  } catch {
    body = null;
  }

  const idempotencyResponse: IdempotencyResponse = {
    status: response.status,
    body,
  };

  idempotencyStore.set(idempotencyKey, idempotencyResponse);
}

export function clearIdempotencyKey(idempotencyKey: string): void {
  idempotencyStore.delete(idempotencyKey);
}
