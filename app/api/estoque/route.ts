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
    const { nome, descricao } = body;
    if (!nome) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }
    const newEstoque = await service.createEstoque({ nome, descricao });
    return NextResponse.json(serializeBigInt(newEstoque), { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Falha ao criar estoque' }, { status: 500 });
  }
}
