import * as repository from '@/repositories/estoque.repository';
import { EstoqueFilters } from '@/repositories/estoque.repository';
import { estoque } from '@/generated/prisma/client';

export const getAllEstoque = async (filters?: EstoqueFilters): Promise<estoque[]> => {
  return repository.findAll(filters);
};

export const getEstoqueById = async (id: bigint): Promise<estoque | null> => {
  return repository.findById(id);
};

export const getEstoqueByProdutoId = async (produto_id: bigint): Promise<estoque | null> => {
  return repository.findByProdutoId(produto_id);
};

export const createEstoque = async (produto_id: bigint, quantidade: number = 0): Promise<estoque> => {
  return repository.create(produto_id, quantidade);
};
