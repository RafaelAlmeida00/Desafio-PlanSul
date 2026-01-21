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
