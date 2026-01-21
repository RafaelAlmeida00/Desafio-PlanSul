import { useQuery } from "@tanstack/react-query";

export type Estoque = {
  id: string;
  produto_id: string;
  quantidade: number;
  atualizado_em: string;
  criado_em: string;
  produto: {
    id: string;
    nome: string;
    sku: string;
    estoque_minimo: number | null;
  };
};

const fetchEstoque = async (): Promise<Estoque[]> => {
  const response = await fetch("/api/estoque");
  if (!response.ok) {
    throw new Error("Failed to fetch stock");
  }
  return response.json();
};

export const useEstoque = () => {
  return useQuery<Estoque[], Error>({
    queryKey: ["estoque"],
    queryFn: fetchEstoque,
  });
};
