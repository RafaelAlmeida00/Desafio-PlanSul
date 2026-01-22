import prisma from '@/lib/db';
import { estoque_movimentacoes } from '@/generated/prisma/client';
import { DatabaseError } from '@/lib/errors';

type TipoMovimentacao = 'entrada' | 'saida';

export interface MovimentacaoFilters {
  produto_id?: bigint;
  tipo?: TipoMovimentacao;
  page?: number;
  limit?: number;
}

export const findAll = async (filters?: MovimentacaoFilters): Promise<estoque_movimentacoes[]> => {
  try {
    const { produto_id, tipo, page = 1, limit = 50 } = filters || {};

    return await prisma.estoque_movimentacoes.findMany({
      where: {
        ...(produto_id && { produto_id }),
        ...(tipo && { tipo }),
      },
      include: { produto: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { criado_em: 'desc' },
    });
  } catch (error) {
    throw new DatabaseError('Falha ao buscar movimentações', { cause: error });
  }
};

export const findById = async (id: bigint): Promise<estoque_movimentacoes | null> => {
  try {
    return await prisma.estoque_movimentacoes.findUnique({
      where: { id },
      include: { produto: true },
    });
  } catch (error) {
    throw new DatabaseError('Falha ao buscar movimentação', { cause: error });
  }
};

export const findByProdutoId = async (produto_id: bigint): Promise<estoque_movimentacoes[]> => {
  try {
    return await prisma.estoque_movimentacoes.findMany({
      where: { produto_id },
      include: { produto: true },
      orderBy: { criado_em: 'desc' },
    });
  } catch (error) {
    throw new DatabaseError('Falha ao buscar movimentações por produto', { cause: error });
  }
};

export const create = async (data: {
  produto_id: bigint;
  quantidade: number;
  tipo: TipoMovimentacao;
}): Promise<estoque_movimentacoes> => {
  try {
    const { produto_id, quantidade, tipo } = data;

    return await prisma.estoque_movimentacoes.create({
      data: {
        produto_id,
        quantidade,
        tipo,
      },
    });
  } catch (error) {
    throw new DatabaseError('Falha ao criar movimentação', { cause: error });
  }
};
