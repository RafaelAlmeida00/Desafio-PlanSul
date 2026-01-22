"use client";

import { useState, useMemo, useCallback } from "react";
import { useEstoqueMovimentacoes } from "@/hooks/use-estoque-movimentacoes";
import { useProdutos } from "@/hooks/use-produtos";
import { DataTable } from "@/components/custom/data-table";
import { SearchInput } from "@/components/custom/search-input";
import { FilterPills, FilterPill } from "@/components/custom/filter-pills";
import {
  MovimentacaoFiltersComponent,
  MovimentacaoFilters,
  defaultMovimentacaoFilters,
} from "@/components/movimentacoes/movimentacao-filters";
import { Button } from "@/components/ui/button";
import { movimentacaoColumns } from "@/components/movimentacoes/movimentacao-columns";
import { AddMovimentacaoModal } from "@/components/movimentacoes/movimentacao-add-modal";
import { format, parseISO, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";

export function MovimentacoesView() {
  const { data: movimentacoes, isLoading, isError, error } = useEstoqueMovimentacoes();
  const { data: produtos } = useProdutos();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<MovimentacaoFilters>(defaultMovimentacaoFilters);

  const filteredMovimentacoes = useMemo(() => {
    if (!movimentacoes) return [];

    return movimentacoes.filter((mov) => {
      if (filters.tipo && mov.tipo !== filters.tipo) {
        return false;
      }

      if (filters.produto_id && mov.produto_id !== filters.produto_id) {
        return false;
      }

      if (filters.dataInicio) {
        const movDate = parseISO(mov.criado_em);
        const startDate = startOfDay(parseISO(filters.dataInicio));
        if (isBefore(movDate, startDate)) {
          return false;
        }
      }

      if (filters.dataFim) {
        const movDate = parseISO(mov.criado_em);
        const endDate = endOfDay(parseISO(filters.dataFim));
        if (isAfter(movDate, endDate)) {
          return false;
        }
      }

      return true;
    });
  }, [movimentacoes, filters]);

  const filterPills = useMemo<FilterPill[]>(() => {
    const pills: FilterPill[] = [];

    if (filters.tipo) {
      pills.push({
        key: "tipo",
        label: "Tipo",
        value: filters.tipo === "entrada" ? "Entrada" : "Saida",
      });
    }

    if (filters.produto_id) {
      const produto = produtos?.find((p) => p.id === filters.produto_id);
      pills.push({
        key: "produto_id",
        label: "Produto",
        value: produto?.nome || filters.produto_id,
      });
    }

    if (filters.dataInicio) {
      pills.push({
        key: "dataInicio",
        label: "De",
        value: format(parseISO(filters.dataInicio), "dd/MM/yyyy"),
      });
    }

    if (filters.dataFim) {
      pills.push({
        key: "dataFim",
        label: "Ate",
        value: format(parseISO(filters.dataFim), "dd/MM/yyyy"),
      });
    }

    return pills;
  }, [filters, produtos]);

  const handleRemoveFilter = useCallback((key: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: null,
    }));
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setFilters(defaultMovimentacaoFilters);
  }, []);

  if (isError) {
    return (
      <div className="text-red-500">
        Error: {error?.message || "Falha ao carregar movimentacoes."}
      </div>
    );
  }

  return (
    <>
      <DataTable
        columns={movimentacaoColumns}
        data={filteredMovimentacoes}
        isLoading={isLoading}
        globalFilter={searchQuery}
        searchComponent={
          <SearchInput
            placeholder="Buscar por produto..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="w-full max-w-sm"
          />
        }
        filterComponent={
          <MovimentacaoFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
          />
        }
        filterPills={
          <FilterPills
            filters={filterPills}
            onRemove={handleRemoveFilter}
            onClearAll={handleClearAllFilters}
          />
        }
        actionButtons={[
          <Button key="new-movement" onClick={() => setIsAddModalOpen(true)}>
            Nova Movimentacao
          </Button>,
        ]}
        emptyState={{
          title: searchQuery || filterPills.length > 0
            ? "Nenhuma movimentacao encontrada"
            : "Nenhuma movimentacao registrada",
          description: searchQuery || filterPills.length > 0
            ? "Tente ajustar os filtros ou a busca"
            : "Registre entradas e saidas de estoque",
          action: !searchQuery && filterPills.length === 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
            >
              Registrar Movimentacao
            </Button>
          ) : undefined,
        }}
      />

      <AddMovimentacaoModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
}
