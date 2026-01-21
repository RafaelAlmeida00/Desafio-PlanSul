import prisma from '@/lib/db';
import { estoque } from '@/generated/prisma/client';

export const findAll = async (): Promise<estoque[]> => {
  return prisma.estoque.findMany({
    include: { produto: true },
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
