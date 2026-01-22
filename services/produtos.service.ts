import prisma from '@/lib/db';
import * as repository from '@/repositories/produtos.repository';
import { ProdutoFilters } from '@/repositories/produtos.repository';
import { produtos } from '@/generated/prisma/client';

export const getAllProdutos = async (filters?: ProdutoFilters): Promise<produtos[]> => {
  return repository.findAll(filters);
};

export const getProdutoById = async (id: bigint): Promise<produtos | null> => {
  return repository.findById(id);
};

export const createProduto = async (data: {
  sku: string;
  nome: string;
  categoria_id?: bigint | null;
  estoque_minimo?: number | null;
  marca?: string | null;
}): Promise<produtos> => {
  const { sku, nome, categoria_id, estoque_minimo, marca } = data;

  return prisma.$transaction(async (tx) => {
    const newProduto = await tx.produtos.create({
      data: {
        sku,
        nome,
        categoria_id,
        estoque_minimo,
        marca,
      },
    });

    await tx.estoque.create({
      data: {
        produto_id: newProduto.id,
        quantidade: 0,
      },
    });

    return newProduto;
  });
};

export const updateProduto = async (id: bigint, data: Partial<Omit<produtos, 'id' | 'criado_em'>>): Promise<produtos> => {
  return repository.update(id, data);
};

export const deleteProduto = async (id: bigint): Promise<produtos> => {
  return repository.remove(id);
};
