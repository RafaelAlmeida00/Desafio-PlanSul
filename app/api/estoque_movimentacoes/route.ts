import { NextRequest } from 'next/server';
import * as service from '@/services/estoqueMovimentacoes.service';
import { successResponse, handleApiError, errorResponse } from '@/lib/api-response';
import { ValidationError, NotFoundError, BusinessRuleError } from '@/lib/errors';
import {
  checkIdempotency,
  saveIdempotencyResponse,
  clearIdempotencyKey,
} from '@/lib/idempotency-handler';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const produto_id = searchParams.get('produto_id');
    const tipo = searchParams.get('tipo') as 'entrada' | 'saida' | null;
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    const estoqueMovimentacoes = await service.getAllEstoqueMovimentacoes({
      produto_id: produto_id ? BigInt(produto_id) : undefined,
      tipo: tipo && ['entrada', 'saida'].includes(tipo) ? tipo : undefined,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });

    return successResponse(estoqueMovimentacoes);
  } catch (error) {
    return handleApiError(error, { entity: 'movimentação', operation: 'create' });
  }
}

export async function POST(request: NextRequest) {
  // Verificar idempotência
  const idempotencyResult = checkIdempotency(request);

  if (!idempotencyResult.shouldProcess) {
    return idempotencyResult.cachedResponse!;
  }

  const { idempotencyKey } = idempotencyResult;

  try {
    const body = await request.json();
    const { produto_id, quantidade, tipo } = body;

    // Validações
    if (!produto_id) {
      const response = errorResponse(new ValidationError('produto_id é obrigatório'));
      if (idempotencyKey) clearIdempotencyKey(idempotencyKey);
      return response;
    }
    if (quantidade === undefined || quantidade === null || quantidade <= 0) {
      const response = errorResponse(new ValidationError('quantidade deve ser maior que zero'));
      if (idempotencyKey) clearIdempotencyKey(idempotencyKey);
      return response;
    }
    if (!tipo || !['entrada', 'saida'].includes(tipo)) {
      const response = errorResponse(new ValidationError('tipo deve ser "entrada" ou "saida"'));
      if (idempotencyKey) clearIdempotencyKey(idempotencyKey);
      return response;
    }

    const newMovimentacao = await service.createEstoqueMovimentacoes({
      produto_id: BigInt(produto_id),
      quantidade: Number(quantidade),
      tipo,
    });

    const response = successResponse(newMovimentacao, 201);

    // Salvar resposta para idempotência
    if (idempotencyKey) {
      await saveIdempotencyResponse(idempotencyKey, response);
    }

    return response;
  } catch (error) {
    // Em caso de erro, limpar o lock de idempotência
    if (idempotencyKey) {
      clearIdempotencyKey(idempotencyKey);
    }

    // Tratar erros específicos do service
    if (error instanceof service.EstoqueInsuficienteError) {
      return errorResponse(
        new BusinessRuleError(error.message, 'ESTOQUE_INSUFICIENTE')
      );
    }
    if (error instanceof service.EstoqueNaoEncontradoError) {
      return errorResponse(new NotFoundError('Estoque para o produto'));
    }

    return handleApiError(error, { entity: 'movimentação', operation: 'create' });
  }
}
