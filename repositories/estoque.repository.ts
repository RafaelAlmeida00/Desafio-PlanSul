import prisma from '@/lib/db';
import { estoque } from '@/generated/prisma/client';

export interface EstoqueFilters {
  produto_id?: bigint;
  busca?: string;
  abaixo_minimo?: boolean;
  page?: number;
  limit?: number;
}

export const findAll = async (filters?: EstoqueFilters): Promise<estoque[]> => {
  const { produto_id, busca, abaixo_minimo, page = 1, limit = 50 } = filters || {};

  return prisma.estoque.findMany({
    where: {
      ...(produto_id && { produto_id }),
      ...(busca && {
        produto: {
          OR: [
            { nome: { contains: busca, mode: 'insensitive' } },
            { sku: { contains: busca, mode: 'insensitive' } },
          ],
        },
      }),
      ...(abaixo_minimo && {
        produto: {
          estoque_minimo: { not: null },
        },
      }),
    },
    include: { produto: true },
    skip: (page - 1) * limit,
    take: limit,
  });
};

export const findById = async (id: bigint): Promise<estoque | null> => {
  return prisma.estoque.findUnique({
    where: { id },
    include: { produto: true },
  });
};

export const findByProdutoId = async (produto_id: bigint): Promise<estoque | null> => {
  return prisma.estoque.findUnique({
    where: { produto_id },
    include: { produto: true },
  });
};

export const create = async (produto_id: bigint, quantidade: number = 0): Promise<estoque> => {
  return prisma.estoque.create({
    data: {
      produto_id,
      quantidade,
    },
    include: { produto: true },
  });
};

export const updateQuantidade = async (produto_id: bigint, delta: number): Promise<estoque> => {
  return prisma.estoque.update({
    where: { produto_id },
    data: {
      quantidade: { increment: delta },
      atualizado_em: new Date(),
    },
  });
};
