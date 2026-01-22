import * as repository from '@/repositories/categorias.repository';
import { CategoriaFilters } from '@/repositories/categorias.repository';
import { categorias } from '@/generated/prisma/client';

export const getAllCategorias = async (filters?: CategoriaFilters): Promise<categorias[]> => {
  return repository.findAll(filters);
};

export const getCategoriaById = async (id: bigint): Promise<categorias | null> => {
  return repository.findById(id);
};

export const createCategoria = async (data: Omit<categorias, 'id' | 'criado_em'>): Promise<categorias> => {
  return repository.create(data);
};

export const updateCategoria = async (id: bigint, data: Partial<Omit<categorias, 'id' | 'criado_em'>>): Promise<categorias> => {
  return repository.update(id, data);
};

export const deleteCategoria = async (id: bigint): Promise<categorias> => {
  return repository.remove(id);
};
