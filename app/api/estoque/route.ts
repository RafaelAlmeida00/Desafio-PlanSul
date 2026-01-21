import { NextResponse } from 'next/server';
import * as service from '@/services/estoque.service';
import { serializeBigInt } from '@/lib/serialize';

export async function GET() {
  try {
    const estoque = await service.getAllEstoque();
    return NextResponse.json(serializeBigInt(estoque));
  } catch (error) {
    console.error('Erro ao buscar estoque:', error);
    return NextResponse.json({ error: 'Falha ao buscar estoque' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { produto_id, quantidade } = body;

    if (!produto_id) {
      return NextResponse.json({ error: 'produto_id é obrigatório' }, { status: 400 });
    }

    const estoqueExistente = await service.getEstoqueByProdutoId(BigInt(produto_id));
    if (estoqueExistente) {
      return NextResponse.json({ error: 'Estoque já existe para este produto' }, { status: 400 });
    }

    const novoEstoque = await service.createEstoque(BigInt(produto_id), quantidade ?? 0);
    return NextResponse.json(serializeBigInt(novoEstoque), { status: 201 });
  } catch (error) {
    console.error('Erro ao criar estoque:', error);
    return NextResponse.json({ error: 'Falha ao criar estoque' }, { status: 500 });
  }
}
