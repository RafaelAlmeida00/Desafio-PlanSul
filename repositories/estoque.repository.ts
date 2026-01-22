import prisma from '@/lib/db';
import { estoque } from '@/generated/prisma/client';
import { DatabaseError } from '@/lib/errors';

export interface EstoqueFilters {
  produto_id?: bigint;
  busca?: string;
  abaixo_minimo?: boolean;
  page?: number;
  limit?: number;
}

export const findAll = async (filters?: EstoqueFilters): Promise<estoque[]> => {
  try {
    const { produto_id, busca, abaixo_minimo, page = 1, limit = 50 } = filters || {};

    return await prisma.estoque.findMany({
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
  } catch (error) {
    throw new DatabaseError('Falha ao buscar estoque', { cause: error });
  }
};

export const findById = async (id: bigint): Promise<estoque | null> => {
  try {
    return await prisma.estoque.findUnique({
      where: { id },
      include: { produto: true },
    });
  } catch (error) {
    throw new DatabaseError('Falha ao buscar estoque', { cause: error });
  }
};

export const findByProdutoId = async (produto_id: bigint): Promise<estoque | null> => {
  try {
    return await prisma.estoque.findUnique({
      where: { produto_id },
      include: { produto: true },
    });
  } catch (error) {
    throw new DatabaseError('Falha ao buscar estoque por produto', { cause: error });
  }
};

export const create = async (produto_id: bigint, quantidade: number = 0): Promise<estoque> => {
  try {
    return await prisma.estoque.create({
      data: {
        produto_id,
        quantidade,
      },
      include: { produto: true },
    });
  } catch (error) {
    throw new DatabaseError('Falha ao criar estoque', { cause: error });
  }
};

export const updateQuantidade = async (produto_id: bigint, delta: number): Promise<estoque> => {
  try {
    return await prisma.estoque.update({
      where: { produto_id },
      data: {
        quantidade: { increment: delta },
        atualizado_em: new Date(),
      },
    });
  } catch (error) {
    throw new DatabaseError('Falha ao atualizar quantidade do estoque', { cause: error });
  }
};
