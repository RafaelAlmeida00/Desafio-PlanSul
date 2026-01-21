import { NextResponse } from 'next/server';
import * as service from '@/services/categorias.service';
import { serializeBigInt } from '@/lib/serialize';

export async function GET() {
  try {
    const categorias = await service.getAllCategorias();
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
