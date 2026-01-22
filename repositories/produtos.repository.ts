import prisma from '@/lib/db';
import { produtos } from '@/generated/prisma/client';
import { DatabaseError } from '@/lib/errors';

export interface ProdutoFilters {
  busca?: string;
  categoria_id?: bigint;
  page?: number;
  limit?: number;
}

export const findAll = async (filters?: ProdutoFilters): Promise<produtos[]> => {
  try {
    const { busca, categoria_id, page = 1, limit = 50 } = filters || {};

    return await prisma.produtos.findMany({
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
  } catch (error) {
    throw new DatabaseError('Falha ao buscar produtos', { cause: error });
  }
};

export const findById = async (id: bigint): Promise<produtos | null> => {
  try {
    return await prisma.produtos.findUnique({
      where: { id },
      include: { categorias: true },
    });
  } catch (error) {
    throw new DatabaseError('Falha ao buscar produto', { cause: error });
  }
};

export const create = async (data: Omit<produtos, 'id' | 'criado_em'>): Promise<produtos> => {
  try {
    const { sku, nome, categoria_id, estoque_minimo, marca } = data;

    return await prisma.produtos.create({
      data: {
        sku,
        nome,
        categoria_id,
        estoque_minimo,
        marca,
      },
    });
  } catch (error) {
    throw new DatabaseError('Falha ao criar produto', { cause: error });
  }
};

export const update = async (id: bigint, data: Partial<Omit<produtos, 'id' | 'criado_em'>>): Promise<produtos> => {
  try {
    return await prisma.produtos.update({
      where: { id },
      data,
    });
  } catch (error) {
    throw new DatabaseError('Falha ao atualizar produto', { cause: error });
  }
};

export const remove = async (id: bigint): Promise<produtos> => {
  try {
    return await prisma.produtos.delete({
      where: { id },
    });
  } catch (error) {
    throw new DatabaseError('Falha ao remover produto', { cause: error });
  }
};
