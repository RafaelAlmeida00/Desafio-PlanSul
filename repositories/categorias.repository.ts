import prisma from '@/lib/db';
import { categorias } from '@/generated/prisma/client';

export interface CategoriaFilters {
  busca?: string;
  page?: number;
  limit?: number;
}

export const findAll = async (filters?: CategoriaFilters): Promise<categorias[]> => {
  const { busca, page = 1, limit = 50 } = filters || {};

  return prisma.categorias.findMany({
    where: {
      ...(busca && {
        OR: [
          { nome: { contains: busca, mode: 'insensitive' } },
          { descricao: { contains: busca, mode: 'insensitive' } },
        ],
      }),
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { nome: 'asc' },
  });
};

export const findById = async (id: bigint): Promise<categorias | null> => {
  return prisma.categorias.findUnique({
    where: { id },
  });
};

export const create = async (data: Omit<categorias, 'id' | 'criado_em'>): Promise<categorias> => {
  return prisma.categorias.create({
    data,
  });
};

export const update = async (id: bigint, data: Partial<Omit<categorias, 'id' | 'criado_em'>>): Promise<categorias> => {
  return prisma.categorias.update({
    where: { id },
    data,
  });
};

export const remove = async (id: bigint): Promise<categorias> => {
  return prisma.categorias.delete({
    where: { id },
  });
};
