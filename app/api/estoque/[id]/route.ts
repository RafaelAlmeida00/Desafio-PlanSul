import { NextResponse } from 'next/server';
import * as service from '@/services/estoque.service';
import { serializeBigInt } from '@/lib/serialize';

interface Params {
  params: Promise<{ id: string; }>;
}

export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    const id = BigInt((await params).id);
    const estoque = await service.getEstoqueById(id);
    if (!estoque) {
      return NextResponse.json({ error: 'Estoque não encontrado' }, { status: 404 });
    }

    return NextResponse.json(serializeBigInt(estoque));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }
}
