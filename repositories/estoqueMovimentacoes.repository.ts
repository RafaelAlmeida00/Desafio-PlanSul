import prisma from '@/lib/db';
import { estoque_movimentacoes } from '@/generated/prisma/client';

type TipoMovimentacao = 'entrada' | 'saida';

export const findAll = async (): Promise<estoque_movimentacoes[]> => {
  return prisma.estoque_movimentacoes.findMany({
    include: { produto: true },
    orderBy: { criado_em: 'desc' },
  });
};

export const findById = async (id: bigint): Promise<estoque_movimentacoes | null> => {
  return prisma.estoque_movimentacoes.findUnique({
    where: { id },
    include: { produto: true },
  });
};

export const findByProdutoId = async (produto_id: bigint): Promise<estoque_movimentacoes[]> => {
  return prisma.estoque_movimentacoes.findMany({
    where: { produto_id },
    include: { produto: true },
    orderBy: { criado_em: 'desc' },
  });
};

export const create = async (data: {
  produto_id: bigint;
  quantidade: number;
  tipo: TipoMovimentacao;
}): Promise<estoque_movimentacoes> => {
  const { produto_id, quantidade, tipo } = data;

  return prisma.estoque_movimentacoes.create({
    data: {
      produto_id,
      quantidade,
      tipo,
    },
  });
};
