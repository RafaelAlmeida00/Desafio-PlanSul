import { NextResponse } from 'next/server';
import { AppError, translatePrismaError } from './errors';
import { serializeBigInt } from './serialize';

export interface ApiErrorResponse {
  error: string;
  code: string;
}

// Resposta de sucesso
export function successResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(serializeBigInt(data), { status });
}

// Resposta de erro
export function errorResponse(error: AppError): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    error: error.message,
    code: error.code,
  };

  return NextResponse.json(response, { status: error.statusCode });
}

// Handler genérico de erros para routes
export function handleApiError(
  error: unknown,
  context: { entity: string; operation: 'create' | 'update' | 'delete' }
): NextResponse<ApiErrorResponse> {
  console.error(`Erro ao ${context.operation} ${context.entity}:`, error);

  // Se já é um AppError, usar diretamente
  if (error instanceof AppError) {
    return errorResponse(error);
  }

  // Traduzir erro Prisma
  const appError = translatePrismaError(error, context);
  return errorResponse(appError);
}

// Resposta 204 No Content (para DELETE)
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}
