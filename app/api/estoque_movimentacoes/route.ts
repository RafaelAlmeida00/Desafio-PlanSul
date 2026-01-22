import { NextRequest, NextResponse } from 'next/server';
import * as service from '@/services/estoqueMovimentacoes.service';
import { serializeBigInt } from '@/lib/serialize';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const produto_id = searchParams.get('produto_id');
    const tipo = searchParams.get('tipo') as 'entrada' | 'saida' | null;
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    const estoqueMovimentacoes = await service.getAllEstoqueMovimentacoes({
      produto_id: produto_id ? BigInt(produto_id) : undefined,
      tipo: tipo && ['entrada', 'saida'].includes(tipo) ? tipo : undefined,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });

    return NextResponse.json(serializeBigInt(estoqueMovimentacoes));
  } catch (error) {
    console.error('Erro ao buscar movimentacao de estoque:', error);
    return NextResponse.json({ error: 'Falha ao buscar movimentacao de estoque' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { produto_id, quantidade, tipo } = body;

    if (!produto_id) {
      return NextResponse.json({ error: 'produto_id é obrigatório' }, { status: 400 });
    }
    if (quantidade === undefined || quantidade === null || quantidade <= 0) {
      return NextResponse.json({ error: 'quantidade deve ser maior que zero' }, { status: 400 });
    }
    if (!tipo || !['entrada', 'saida'].includes(tipo)) {
      return NextResponse.json({ error: 'tipo deve ser "entrada" ou "saida"' }, { status: 400 });
    }

    const newMovimentacao = await service.createEstoqueMovimentacoes({
      produto_id: BigInt(produto_id),
      quantidade: Number(quantidade),
      tipo,
    });

    return NextResponse.json(serializeBigInt(newMovimentacao), { status: 201 });
  } catch (error) {
    console.error('Erro ao criar movimentacao de estoque:', error);

    if (error instanceof service.EstoqueInsuficienteError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof service.EstoqueNaoEncontradoError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: 'Falha ao criar movimentacao de estoque' }, { status: 500 });
  }
}
