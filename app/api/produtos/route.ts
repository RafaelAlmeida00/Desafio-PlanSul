import { NextResponse } from 'next/server';
import * as service from '@/services/produtos.service';
import { serializeBigInt } from '@/lib/serialize';

export async function GET() {
  try {
    const produtos = await service.getAllProdutos();
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
