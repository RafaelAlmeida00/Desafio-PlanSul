import * as service from '@/services/produtos.service';
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

    const produto = await service.getProdutoById(id);
    if (!produto) {
      return errorResponse(new NotFoundError('Produto', idStr));
    }

    return successResponse(produto);
  } catch (error) {
    if (error instanceof SyntaxError || (error as Error).message?.includes('BigInt')) {
      return errorResponse(new ValidationError('ID inválido'));
    }
    return handleApiError(error, { entity: 'produto', operation: 'create' });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const idStr = (await params).id;
    const id = BigInt(idStr);
    const body = await request.json();
    const { sku, nome, categoria_id, estoque_minimo, marca } = body;

    const updatedProduto = await service.updateProduto(id, {
      sku,
      nome,
      categoria_id: categoria_id ? BigInt(categoria_id) : undefined,
      estoque_minimo: estoque_minimo != null ? Number(estoque_minimo) : undefined,
      marca,
    });

    return successResponse(updatedProduto);
  } catch (error) {
    return handleApiError(error, { entity: 'produto', operation: 'update' });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const idStr = (await params).id;
    const id = BigInt(idStr);

    await service.deleteProduto(id);
    return noContentResponse();
  } catch (error) {
    return handleApiError(error, { entity: 'produto', operation: 'delete' });
  }
}
