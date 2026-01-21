import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as z from "zod";

export const createMovimentacaoSchema = z.object({
  produto_id: z.string().min(1, "Produto é obrigatório"),
  quantidade: z.coerce.number().int().min(1, "Quantidade deve ser maior que zero"),
  tipo: z.enum(["entrada", "saida"], { message: "Tipo é obrigatório" }),
});

export type EstoqueMovimentacao = {
  id: string;
  produto_id: string;
  quantidade: number;
  tipo: "entrada" | "saida";
  criado_em: string;
  produto: {
    id: string;
    nome: string;
    sku: string;
  };
};

export type CreateMovimentacaoPayload = z.infer<typeof createMovimentacaoSchema>;

const fetchMovimentacoes = async (): Promise<EstoqueMovimentacao[]> => {
  const response = await fetch("/api/estoque_movimentacoes");
  if (!response.ok) {
    throw new Error("Failed to fetch movements");
  }
  return response.json();
};

const createMovimentacao = async (
  payload: CreateMovimentacaoPayload
): Promise<EstoqueMovimentacao> => {
  const response = await fetch("/api/estoque_movimentacoes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      produto_id: Number(payload.produto_id),
      quantidade: payload.quantidade,
      tipo: payload.tipo,
    }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create movement");
  }
  return response.json();
};

export const useEstoqueMovimentacoes = () => {
  return useQuery<EstoqueMovimentacao[], Error>({
    queryKey: ["estoque_movimentacoes"],
    queryFn: fetchMovimentacoes,
  });
};

export const useCreateMovimentacao = () => {
  const queryClient = useQueryClient();
  return useMutation<EstoqueMovimentacao, Error, CreateMovimentacaoPayload>({
    mutationFn: createMovimentacao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estoque_movimentacoes"] });
      queryClient.invalidateQueries({ queryKey: ["estoque"] });
    },
  });
};
