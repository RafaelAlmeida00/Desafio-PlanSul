import { NextResponse } from 'next/server';
import * as service from '@/services/estoqueMovimentacoes.service';
import { serializeBigInt } from '@/lib/serialize';

export async function GET() {
  try {
    const estoqueMovimentacoes = await service.getAllEstoqueMovimentacoes();
    return NextResponse.json(serializeBigInt(estoqueMovimentacoes));
  } catch (error) {
    console.error('Erro ao buscar movimentacao de estoque:', error);
    return NextResponse.json({ error: 'Falha ao buscar movimentacao de estoque' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, descricao } = body;
    if (!nome) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }
    const newEstoqueMovimentacoes = await service.createEstoqueMovimentacoes({ nome, descricao });
    return NextResponse.json(serializeBigInt(newEstoqueMovimentacoes), { status: 201 });
  } catch (error) {
    console.error('Erro ao criar movimentacao de estoque:', error);
    return NextResponse.json({ error: 'Falha ao criar movimentacao de estoque' }, { status: 500 });
  }
}
