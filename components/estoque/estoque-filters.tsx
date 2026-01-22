"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type EstoqueStatus = "all" | "ok" | "baixo" | "critico";

export interface EstoqueFilters {
  status: EstoqueStatus;
}

interface EstoqueFiltersProps {
  filters: EstoqueFilters;
  onFiltersChange: (filters: EstoqueFilters) => void;
  className?: string;
}

export function EstoqueFiltersComponent({
  filters,
  onFiltersChange,
  className,
}: EstoqueFiltersProps) {
  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value as EstoqueStatus,
    });
  };

  return (
    <div className={cn("flex items-center gap-4 flex-wrap", className)}>
      <Select value={filters.status} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Status do estoque" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="ok">Estoque OK</SelectItem>
          <SelectItem value="baixo">Estoque Baixo</SelectItem>
          <SelectItem value="critico">Estoque Critico</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export const defaultEstoqueFilters: EstoqueFilters = {
  status: "all",
};
