import prisma from '@/lib/db';
import { produtos } from '@/generated/prisma/client';

export interface ProdutoFilters {
  busca?: string;
  categoria_id?: bigint;
  page?: number;
  limit?: number;
}

export const findAll = async (filters?: ProdutoFilters): Promise<produtos[]> => {
  const { busca, categoria_id, page = 1, limit = 50 } = filters || {};

  return prisma.produtos.findMany({
    where: {
      ...(busca && {
        OR: [
          { nome: { contains: busca, mode: 'insensitive' } },
          { sku: { contains: busca, mode: 'insensitive' } },
          { marca: { contains: busca, mode: 'insensitive' } },
        ],
      }),
      ...(categoria_id && { categoria_id }),
    },
    include: { categorias: true },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { criado_em: 'desc' },
  });
};

export const findById = async (id: bigint): Promise<produtos | null> => {
  return prisma.produtos.findUnique({
    where: { id },
    include: { categorias: true },
  });
};

export const create = async (data: Omit<produtos, 'id' | 'criado_em'>): Promise<produtos> => {
  const { sku, nome, categoria_id, estoque_minimo, marca } = data;

  return prisma.produtos.create({
    data: {
      sku,
      nome,
      categoria_id,
      estoque_minimo,
      marca,
    },
  });
};

export const update = async (id: bigint, data: Partial<Omit<produtos, 'id' | 'criado_em'>>): Promise<produtos> => {
  return prisma.produtos.update({
    where: { id },
    data,
  });
};

export const remove = async (id: bigint): Promise<produtos> => {
  return prisma.produtos.delete({
    where: { id },
  });
};
