import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import { ApiError, handleFetchError } from "@/lib/api-error";

// Zod Schemas
export const createProdutoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  sku: z.string().min(1, "SKU é obrigatório"),
  categoria_id: z.string().optional(),
  estoque_minimo: z.coerce.number().int().min(0, "Estoque mínimo não pode ser negativo").optional(),
  marca: z.string().optional(),
});

export const updateProdutoSchema = z.object({
  id: z.string(),
  nome: z.string().min(1, "Nome é obrigatório").optional(),
  sku: z.string().min(1, "SKU é obrigatório").optional(),
  categoria_id: z.string().optional(),
  estoque_minimo: z.coerce.number().int().min(0, "Estoque mínimo não pode ser negativo").optional(),
  marca: z.string().optional(),
});

// Types
export type Produto = {
  id: string; // Prisma BigInt is serialized as string
  categoria_id: string | null;
  sku: string;
  nome: string;
  estoque_minimo: number | null;
  marca: string | null;
  criado_em: string;
  categorias?: {
    id: string;
    nome: string;
  } | null;
  estoque?: {
    quantidade: number;
  } | null;
};

export type CreateProdutoPayload = z.infer<typeof createProdutoSchema>;
export type UpdateProdutoPayload = z.infer<typeof updateProdutoSchema>;

// API Functions
const fetchProdutos = async (): Promise<Produto[]> => {
  const response = await fetch("/api/produtos");
  if (!response.ok) {
    return handleFetchError(response);
  }
  return response.json();
};

const fetchProdutoById = async (id: string): Promise<Produto> => {
  const response = await fetch(`/api/produtos/${id}`);
  if (!response.ok) {
    return handleFetchError(response);
  }
  return response.json();
};

const createProduto = async (
  payload: CreateProdutoPayload
): Promise<Produto> => {
  const response = await fetch("/api/produtos", {
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

const updateProduto = async (
  payload: UpdateProdutoPayload
): Promise<Produto> => {
  const response = await fetch(`/api/produtos/${payload.id}`, {
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

const deleteProduto = async (id: string): Promise<void> => {
  const response = await fetch(`/api/produtos/${id}`, {
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
export const useProdutos = () => {
  return useQuery<Produto[], ApiError>({
    queryKey: ["produtos"],
    queryFn: fetchProdutos,
  });
};

export const useProduto = (id: string) => {
  return useQuery<Produto, ApiError>({
    queryKey: ["produtos", id],
    queryFn: () => fetchProdutoById(id),
    enabled: !!id,
  });
};

export const useCreateProduto = () => {
  const queryClient = useQueryClient();
  return useMutation<Produto, ApiError, CreateProdutoPayload>({
    mutationFn: createProduto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
    },
  });
};

export const useUpdateProduto = () => {
  const queryClient = useQueryClient();
  return useMutation<Produto, ApiError, UpdateProdutoPayload>({
    mutationFn: updateProduto,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
      queryClient.invalidateQueries({ queryKey: ["produtos", data.id] });
    },
  });
};

export const useDeleteProduto = () => {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: deleteProduto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
    },
  });
};
