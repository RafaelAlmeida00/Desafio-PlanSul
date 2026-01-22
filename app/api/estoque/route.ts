import { NextRequest, NextResponse } from 'next/server';
import * as service from '@/services/estoque.service';
import { serializeBigInt } from '@/lib/serialize';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const produto_id = searchParams.get('produto_id');
    const busca = searchParams.get('busca') || undefined;
    const abaixo_minimo = searchParams.get('abaixo_minimo');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    const estoque = await service.getAllEstoque({
      produto_id: produto_id ? BigInt(produto_id) : undefined,
      busca,
      abaixo_minimo: abaixo_minimo === 'true',
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });

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
