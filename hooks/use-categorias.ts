import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import { ApiError, handleFetchError } from "@/lib/api-error";

// Zod Schemas
export const createCategoriaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().optional(),
});

export const updateCategoriaSchema = z.object({
  id: z.string(),
  nome: z.string().min(1, "Nome é obrigatório").optional(),
  descricao: z.string().optional(),
});

// Types
export type Categoria = {
  id: string; // Prisma BigInt is serialized as string
  nome: string;
  descricao: string | null;
  criado_em: string;
};

export type CreateCategoriaPayload = z.infer<typeof createCategoriaSchema>;

export type UpdateCategoriaPayload = z.infer<typeof updateCategoriaSchema>;

// API Functions
const fetchCategories = async (): Promise<Categoria[]> => {
  const response = await fetch("/api/categorias");
  if (!response.ok) {
    return handleFetchError(response);
  }
  return response.json();
};

const fetchCategoryById = async (id: string): Promise<Categoria> => {
  const response = await fetch(`/api/categorias/${id}`);
  if (!response.ok) {
    return handleFetchError(response);
  }
  return response.json();
};

const createCategory = async (
  payload: CreateCategoriaPayload
): Promise<Categoria> => {
  const response = await fetch("/api/categorias", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    return handleFetchError(response);
  }
  return response.json();
};

const updateCategory = async (
  payload: UpdateCategoriaPayload
): Promise<Categoria> => {
  const response = await fetch(`/api/categorias/${payload.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    return handleFetchError(response);
  }
  return response.json();
};

const deleteCategory = async (id: string): Promise<void> => {
  const response = await fetch(`/api/categorias/${id}`, {
    method: "DELETE",
  });

  // 204 No Content é sucesso, não tem body
  if (response.status === 204) {
    return;
  }

  if (!response.ok) {
    return handleFetchError(response);
  }
};

// React Query Hooks
export const useCategories = () => {
  return useQuery<Categoria[], ApiError>({
    queryKey: ["categorias"],
    queryFn: fetchCategories,
  });
};

export const useCategory = (id: string) => {
  return useQuery<Categoria, ApiError>({
    queryKey: ["categorias", id],
    queryFn: () => fetchCategoryById(id),
    enabled: !!id, // Only run the query if id is truthy
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<Categoria, ApiError, CreateCategoriaPayload>({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<Categoria, ApiError, UpdateCategoriaPayload>({
    mutationFn: updateCategory,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      queryClient.invalidateQueries({ queryKey: ["categorias", data.id] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
    },
  });
};
