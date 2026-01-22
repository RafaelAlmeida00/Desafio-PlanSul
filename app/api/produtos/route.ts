import { NextRequest } from 'next/server';
import * as service from '@/services/produtos.service';
import { successResponse, handleApiError, errorResponse } from '@/lib/api-response';
import { ValidationError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const busca = searchParams.get('busca') || undefined;
    const categoria_id = searchParams.get('categoria_id');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    const produtos = await service.getAllProdutos({
      busca,
      categoria_id: categoria_id ? BigInt(categoria_id) : undefined,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });

    return successResponse(produtos);
  } catch (error) {
    return handleApiError(error, { entity: 'produto', operation: 'create' });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sku, nome, categoria_id, estoque_minimo, marca } = body;

    if (!sku || !nome) {
      return errorResponse(new ValidationError('SKU e Nome são obrigatórios'));
    }

    const newProduto = await service.createProduto({
      sku,
      nome,
      categoria_id: categoria_id ? BigInt(categoria_id) : null,
      estoque_minimo: estoque_minimo != null ? Number(estoque_minimo) : null,
      marca,
    });

    return successResponse(newProduto, 201);
  } catch (error) {
    return handleApiError(error, { entity: 'produto', operation: 'create' });
  }
}
