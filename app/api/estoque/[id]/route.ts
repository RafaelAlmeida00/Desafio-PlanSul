import { NextResponse } from 'next/server';
import * as service from '@/services/estoque.service';
import { serializeBigInt } from '@/lib/serialize';

interface Params {
  params: Promise<{ id: string; }>;
}

export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    const id = BigInt((await params).id);
    const estoque = await service.getEstoqueById(id);
    if (!estoque) {
      return NextResponse.json({ error: 'Estoque não encontrado' }, { status: 404 });
    }

    return NextResponse.json(serializeBigInt(estoque));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }
}

export async function PUT(
  request: Request, { params }: Params
) {
  try {
    const id = BigInt((await params).id);
    const body = await request.json();
    const { nome, descricao } = body;

    const updatedEstoque = await service.updateEstoque(id, { nome, descricao });
    return NextResponse.json(serializeBigInt(updatedEstoque));
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Estoque não encontrado para atualização' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Falha ao atualizar estoque' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request, { params }: Params
) {
  try {
    const id = BigInt((await params).id);
    await service.deleteEstoque(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Estoque não encontrado para exclusão' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Falha ao excluir estoque' }, { status: 500 });
  }
}
