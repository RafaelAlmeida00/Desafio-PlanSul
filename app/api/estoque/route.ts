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
