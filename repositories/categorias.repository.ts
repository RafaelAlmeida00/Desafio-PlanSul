import prisma from '@/lib/db';
import { categorias } from '@/generated/prisma/client';
import { DatabaseError } from '@/lib/errors';

export interface CategoriaFilters {
  busca?: string;
  page?: number;
  limit?: number;
}

export const findAll = async (filters?: CategoriaFilters): Promise<categorias[]> => {
  try {
    const { busca, page = 1, limit = 50 } = filters || {};

    return await prisma.categorias.findMany({
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
  } catch (error) {
    throw new DatabaseError('Falha ao buscar categorias', { cause: error });
  }
};

export const findById = async (id: bigint): Promise<categorias | null> => {
  try {
    return await prisma.categorias.findUnique({
      where: { id },
    });
  } catch (error) {
    throw new DatabaseError('Falha ao buscar categoria', { cause: error });
  }
};

export const create = async (data: Omit<categorias, 'id' | 'criado_em'>): Promise<categorias> => {
  try {
    return await prisma.categorias.create({
      data,
    });
  } catch (error) {
    throw new DatabaseError('Falha ao criar categoria', { cause: error });
  }
};

export const update = async (id: bigint, data: Partial<Omit<categorias, 'id' | 'criado_em'>>): Promise<categorias> => {
  try {
    return await prisma.categorias.update({
      where: { id },
      data,
    });
  } catch (error) {
    throw new DatabaseError('Falha ao atualizar categoria', { cause: error });
  }
};

export const remove = async (id: bigint): Promise<categorias> => {
  try {
    return await prisma.categorias.delete({
      where: { id },
    });
  } catch (error) {
    throw new DatabaseError('Falha ao remover categoria', { cause: error });
  }
};
