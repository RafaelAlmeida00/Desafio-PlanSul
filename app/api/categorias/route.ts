import { NextRequest } from 'next/server';
import * as service from '@/services/categorias.service';
import { successResponse, handleApiError, errorResponse } from '@/lib/api-response';
import { ValidationError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const busca = searchParams.get('busca') || undefined;
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    const categorias = await service.getAllCategorias({
      busca,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });

    return successResponse(categorias);
  } catch (error) {
    return handleApiError(error, { entity: 'categoria', operation: 'create' });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, descricao } = body;

    if (!nome) {
      return errorResponse(new ValidationError('Nome é obrigatório'));
    }

    const newCategoria = await service.createCategoria({ nome, descricao });
    return successResponse(newCategoria, 201);
  } catch (error) {
    return handleApiError(error, { entity: 'categoria', operation: 'create' });
  }
}
