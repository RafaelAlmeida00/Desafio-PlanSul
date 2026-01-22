"use client";

import { useState, useMemo, useCallback } from "react";
import { useEstoque } from "@/hooks/use-estoque";
import { DataTable } from "@/components/custom/data-table";
import { SearchInput } from "@/components/custom/search-input";
import { FilterPills, FilterPill } from "@/components/custom/filter-pills";
import {
  EstoqueFiltersComponent,
  EstoqueFilters,
  EstoqueStatus,
  defaultEstoqueFilters,
} from "@/components/estoque/estoque-filters";
import { estoqueColumns } from "@/components/estoque/estoque-columns";

function getEstoqueStatus(quantidade: number, minimo: number | null): EstoqueStatus {
  const min = minimo ?? 0;
  if (quantidade < min) return "critico";
  if (quantidade < min * 1.2) return "baixo";
  return "ok";
}

export function EstoqueView() {
  const { data: estoque, isLoading, isError, error } = useEstoque();

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<EstoqueFilters>(defaultEstoqueFilters);

  const filteredEstoque = useMemo(() => {
    if (!estoque) return [];

    return estoque.filter((item) => {
      if (filters.status !== "all") {
        const status = getEstoqueStatus(
          item.quantidade,
          item.produto?.estoque_minimo ?? null
        );
        if (status !== filters.status) {
          return false;
        }
      }

      return true;
    });
  }, [estoque, filters]);

  const filterPills = useMemo<FilterPill[]>(() => {
    const pills: FilterPill[] = [];

    if (filters.status !== "all") {
      const statusLabels: Record<EstoqueStatus, string> = {
        all: "Todos",
        ok: "Estoque OK",
        baixo: "Estoque Baixo",
        critico: "Estoque Critico",
      };
      pills.push({
        key: "status",
        label: "Status",
        value: statusLabels[filters.status],
      });
    }

    return pills;
  }, [filters]);

  const handleRemoveFilter = useCallback((key: string) => {
    if (key === "status") {
      setFilters((prev) => ({
        ...prev,
        status: "all",
      }));
    }
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setFilters(defaultEstoqueFilters);
  }, []);

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
      data={filteredEstoque}
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
        <EstoqueFiltersComponent
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
      emptyState={{
        title: searchQuery || filterPills.length > 0
          ? "Nenhum item de estoque encontrado"
          : "Nenhum item no estoque",
        description: searchQuery || filterPills.length > 0
          ? "Tente ajustar os filtros ou a busca"
          : "O estoque sera atualizado automaticamente com as movimentacoes",
      }}
    />
  );
}
