import { NextResponse } from 'next/server';
import * as service from '@/services/estoqueMovimentacoes.service';
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
    const estoqueMovimentacoes = await service.getEstoqueMovimentacoesById(id);
    if (!estoqueMovimentacoes) {
      return NextResponse.json({ error: 'Movimentacao de estoque não encontrada' }, { status: 404 });
    }

    return NextResponse.json(serializeBigInt(estoqueMovimentacoes));
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

    const updatedEstoqueMovimentacoes = await service.updateEstoqueMovimentacoes(id, { nome, descricao });
    return NextResponse.json(serializeBigInt(updatedEstoqueMovimentacoes));
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Movimentacao de estoque não encontrada para atualização' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Falha ao atualizar movimentacao de estoque' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request, { params }: Params
) {
  try {
    const id = BigInt((await params).id);
    await service.deleteEstoqueMovimentacoes(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Movimentacao de estoque não encontrada para exclusão' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Falha ao excluir movimentacao de estoque' }, { status: 500 });
  }
}
