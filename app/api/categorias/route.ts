import { NextRequest, NextResponse } from 'next/server';
import * as service from '@/services/categorias.service';
import { serializeBigInt } from '@/lib/serialize';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const busca = searchParams.get('busca') || undefined;
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    const categorias = await service.getAllCategorias({
      busca,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });

    return NextResponse.json(serializeBigInt(categorias));
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return NextResponse.json({ error: 'Falha ao buscar categorias' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, descricao } = body;
    if (!nome) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }
    const newCategoria = await service.createCategoria({ nome, descricao });
    return NextResponse.json(serializeBigInt(newCategoria), { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Falha ao criar categoria' }, { status: 500 });
  }
}
