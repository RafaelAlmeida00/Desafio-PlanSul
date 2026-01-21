"use client";

import { useEstoque } from "@/hooks/use-estoque";
import { DataTable } from "@/components/custom/data-table";
import { Input } from "@/components/ui/input";
import { estoqueColumns } from "@/components/estoque/estoque-columns";

export function EstoqueView() {
  const { data: estoque, isLoading, isError, error } = useEstoque();

  if (isError) {
    return (
      <div className="text-red-500">
        Error: {error?.message || "Falha ao carregar estoque."}
      </div>
    );
  }

  return (
    <DataTable
      columns={estoqueColumns}
      data={estoque || []}
      isLoading={isLoading}
      searchComponent={
        <Input placeholder="Buscar estoque..." className="max-w-sm" />
      }
    />
  );
}
