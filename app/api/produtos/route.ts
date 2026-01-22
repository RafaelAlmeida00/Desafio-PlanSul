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
      estoque_minimo,
      marca,
    });
    return NextResponse.json(serializeBigInt(newProduto), { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Falha ao criar produto' }, { status: 500 });
  }
}
