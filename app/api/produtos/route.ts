import { NextRequest, NextResponse } from 'next/server';
import * as service from '@/services/produtos.service';
import { serializeBigInt } from '@/lib/serialize';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const busca = searchParams.get('busca') || undefined;
    const categoria_id = searchParams.get('categoria_id');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    const produtos = await service.getAllProdutos({
      busca,
      categoria_id: categoria_id ? BigInt(categoria_id) : undefined,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });

    return NextResponse.json(serializeBigInt(produtos));
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json({ error: 'Falha ao buscar produtos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sku, nome, categoria_id, estoque_minimo, marca } = body;

    if (!sku || !nome) {
      return NextResponse.json({ error: 'SKU e Nome são obrigatórios' }, { status: 400 });
    }

    const newProduto = await service.createProduto({
      sku,
      nome,
      categoria_id: categoria_id ? BigInt(categoria_id) : null,
      estoque_minimo: estoque_minimo != null ? Number(estoque_minimo) : null,
      marca,
    });
    return NextResponse.json(serializeBigInt(newProduto), { status: 201 });
  } catch (error: unknown) {
    console.error('Erro ao criar produto:', error);

    const prismaError = error as { code?: string; meta?: { field_name?: string; target?: string[] } };
    console.error('Codigo do erro:', prismaError?.code, 'Meta:', prismaError?.meta);

    if (prismaError?.code === 'P2002') {
      const field = prismaError?.meta?.target?.[0] || 'campo';
      return NextResponse.json({ error: `${field} já existe` }, { status: 400 });
    }
    if (prismaError?.code === 'P2003') {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Falha ao criar produto' }, { status: 500 });
  }
}
