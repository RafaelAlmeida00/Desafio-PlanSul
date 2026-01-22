import { NextResponse } from 'next/server';
import {
  idempotencyStore,
  IDEMPOTENCY_REPLAY_HEADER,
  IdempotencyResponse,
  generateIdempotencyKeyFromData,
} from './idempotency';

export interface IdempotencyResult {
  shouldProcess: boolean;
  cachedResponse?: NextResponse;
  idempotencyKey?: string;
}

export function checkIdempotency(body: unknown): IdempotencyResult {
  const idempotencyKey = generateIdempotencyKeyFromData(body);

  const existingRecord = idempotencyStore.get(idempotencyKey);

  if (existingRecord && existingRecord.response.status !== 0) {
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

  const acquired = idempotencyStore.setProcessing(idempotencyKey);

  if (!acquired) {
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
