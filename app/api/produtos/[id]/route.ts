import { NextResponse } from 'next/server';
import * as service from '@/services/produtos.service';
import { serializeBigInt } from '@/lib/serialize';

interface Params {
  params: Promise<{ id: string; }>;
}
export async function GET(request: Request, { params }: Params) {
  try {
    const id = BigInt((await params).id);
    const produto = await service.getProdutoById(id);
    if (!produto) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }
    return NextResponse.json(serializeBigInt(produto));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const id = BigInt((await params).id);
    const body = await request.json();
    const { sku, nome, categoria_id, estoque_minimo, marca } = body;

    const updatedProduto = await service.updateProduto(id, {
      sku,
      nome,
      categoria_id: categoria_id ? BigInt(categoria_id) : undefined,
      estoque_minimo: estoque_minimo != null ? Number(estoque_minimo) : undefined,
      marca,
    });
    return NextResponse.json(serializeBigInt(updatedProduto));
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Produto não encontrado para atualização' }, { status: 404 });
    }

    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string };
      if (prismaError.code === 'P2002') {
        return NextResponse.json({ error: 'SKU já existe' }, { status: 400 });
      }
      if (prismaError.code === 'P2003') {
        return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 400 });
      }
    }

    return NextResponse.json({ error: 'Falha ao atualizar produto' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request, { params }: Params
) {
  try {
    const id = BigInt((await params).id);
    await service.deleteProduto(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Produto não encontrado para exclusão' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Falha ao excluir produto' }, { status: 500 });
  }
}
