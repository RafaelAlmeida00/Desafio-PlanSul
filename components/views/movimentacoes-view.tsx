"use client";

import { useState } from "react";
import { useEstoqueMovimentacoes } from "@/hooks/use-estoque-movimentacoes";
import { DataTable } from "@/components/custom/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { movimentacaoColumns } from "@/components/movimentacoes/movimentacao-columns";
import { AddMovimentacaoModal } from "@/components/movimentacoes/movimentacao-add-modal";

export function MovimentacoesView() {
  const { data: movimentacoes, isLoading, isError, error } = useEstoqueMovimentacoes();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  if (isError) {
    return (
      <div className="text-red-500">
        Error: {error?.message || "Falha ao carregar movimentações."}
      </div>
    );
  }

  return (
    <>
      <DataTable
        columns={movimentacaoColumns}
        data={movimentacoes || []}
        isLoading={isLoading}
        searchComponent={
          <Input placeholder="Buscar movimentações..." className="max-w-sm" />
        }
        actionButtons={[
          <Button key="new-movement" onClick={() => setIsAddModalOpen(true)}>
            Nova Movimentação
          </Button>,
        ]}
      />

      <AddMovimentacaoModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
}
