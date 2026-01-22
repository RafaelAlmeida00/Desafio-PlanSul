import * as service from '@/services/categorias.service';
import {
  successResponse,
  errorResponse,
  handleApiError,
  noContentResponse,
} from '@/lib/api-response';
import { NotFoundError, ValidationError } from '@/lib/errors';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Params) {
  try {
    const idStr = (await params).id;
    const id = BigInt(idStr);

    const categoria = await service.getCategoriaById(id);
    if (!categoria) {
      return errorResponse(new NotFoundError('Categoria', idStr));
    }

    return successResponse(categoria);
  } catch (error) {
    if (error instanceof SyntaxError || (error as Error).message?.includes('BigInt')) {
      return errorResponse(new ValidationError('ID inválido'));
    }
    return handleApiError(error, { entity: 'categoria', operation: 'create' });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const idStr = (await params).id;
    const id = BigInt(idStr);
    const body = await request.json();
    const { nome, descricao } = body;

    const updatedCategoria = await service.updateCategoria(id, { nome, descricao });
    return successResponse(updatedCategoria);
  } catch (error) {
    return handleApiError(error, { entity: 'categoria', operation: 'update' });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const idStr = (await params).id;
    const id = BigInt(idStr);

    await service.deleteCategoria(id);
    return noContentResponse();
  } catch (error) {
    return handleApiError(error, { entity: 'categoria', operation: 'delete' });
  }
}
