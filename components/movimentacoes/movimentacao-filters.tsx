"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProdutos, Produto } from "@/hooks/use-produtos";
import { cn } from "@/lib/utils";

export interface MovimentacaoFilters {
  tipo: "entrada" | "saida" | null;
  produto_id: string | null;
  dataInicio: string | null;
  dataFim: string | null;
}

interface MovimentacaoFiltersProps {
  filters: MovimentacaoFilters;
  onFiltersChange: (filters: MovimentacaoFilters) => void;
  className?: string;
}

export function MovimentacaoFiltersComponent({
  filters,
  onFiltersChange,
  className,
}: MovimentacaoFiltersProps) {
  const { data: produtos } = useProdutos();

  const handleTipoChange = (value: string) => {
    onFiltersChange({
      ...filters,
      tipo: value === "all" ? null : (value as "entrada" | "saida"),
    });
  };

  const handleProdutoChange = (value: string) => {
    onFiltersChange({
      ...filters,
      produto_id: value === "all" ? null : value,
    });
  };

  const handleDataInicioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      dataInicio: e.target.value || null,
    });
  };

  const handleDataFimChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      dataFim: e.target.value || null,
    });
  };

  return (
    <div className={cn("flex items-end gap-4 flex-wrap", className)}>
      <Select value={filters.tipo || "all"} onValueChange={handleTipoChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          <SelectItem value="entrada">Entrada</SelectItem>
          <SelectItem value="saida">Saida</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.produto_id || "all"}
        onValueChange={handleProdutoChange}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Produto" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os produtos</SelectItem>
          {produtos?.map((produto: Produto) => (
            <SelectItem key={produto.id} value={produto.id}>
              {produto.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex flex-col gap-1">
        <Label htmlFor="data-inicio" className="text-xs text-muted-foreground">
          Data inicial
        </Label>
        <Input
          id="data-inicio"
          type="date"
          value={filters.dataInicio || ""}
          onChange={handleDataInicioChange}
          className="w-[150px]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="data-fim" className="text-xs text-muted-foreground">
          Data final
        </Label>
        <Input
          id="data-fim"
          type="date"
          value={filters.dataFim || ""}
          onChange={handleDataFimChange}
          className="w-[150px]"
        />
      </div>
    </div>
  );
}

export const defaultMovimentacaoFilters: MovimentacaoFilters = {
  tipo: null,
  produto_id: null,
  dataInicio: null,
  dataFim: null,
};
