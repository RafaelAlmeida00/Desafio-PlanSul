import * as repository from '@/repositories/estoque.repository';
import { estoque } from '@/generated/prisma/client';

export const getAllEstoque = async (): Promise<estoque[]> => {
  return repository.findAll();
};

export const getEstoqueById = async (id: bigint): Promise<estoque | null> => {
  return repository.findById(id);
};

export const getEstoqueByProdutoId = async (produto_id: bigint): Promise<estoque | null> => {
  return repository.findByProdutoId(produto_id);
};

export const createEstoqueParaProduto = async (produto_id: bigint): Promise<estoque> => {
  return repository.create(produto_id);
};
