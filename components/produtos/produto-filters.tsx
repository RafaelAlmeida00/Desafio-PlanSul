"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useCategories, Categoria } from "@/hooks/use-categorias";
import { cn } from "@/lib/utils";

export interface ProdutoFilters {
  categoria_id: string | null;
  marca: string | null;
  estoqueBaixo: boolean;
}

interface ProdutoFiltersProps {
  filters: ProdutoFilters;
  onFiltersChange: (filters: ProdutoFilters) => void;
  marcas?: string[];
  className?: string;
}

export function ProdutoFiltersComponent({
  filters,
  onFiltersChange,
  marcas = [],
  className,
}: ProdutoFiltersProps) {
  const { data: categorias } = useCategories();

  const handleCategoriaChange = (value: string) => {
    onFiltersChange({
      ...filters,
      categoria_id: value === "all" ? null : value,
    });
  };

  const handleMarcaChange = (value: string) => {
    onFiltersChange({
      ...filters,
      marca: value === "all" ? null : value,
    });
  };

  const handleEstoqueBaixoChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      estoqueBaixo: checked,
    });
  };

  return (
    <div className={cn("flex items-center gap-4 flex-wrap", className)}>
      <Select
        value={filters.categoria_id || "all"}
        onValueChange={handleCategoriaChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as categorias</SelectItem>
          {categorias?.map((categoria: Categoria) => (
            <SelectItem key={categoria.id} value={categoria.id}>
              {categoria.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {marcas.length > 0 && (
        <Select
          value={filters.marca || "all"}
          onValueChange={handleMarcaChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Marca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as marcas</SelectItem>
            {marcas.map((marca) => (
              <SelectItem key={marca} value={marca}>
                {marca}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="flex items-center space-x-2">
        <Checkbox
          id="estoque-baixo"
          checked={filters.estoqueBaixo}
          onCheckedChange={handleEstoqueBaixoChange}
        />
        <Label
          htmlFor="estoque-baixo"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          Apenas estoque baixo
        </Label>
      </div>
    </div>
  );
}

export const defaultProdutoFilters: ProdutoFilters = {
  categoria_id: null,
  marca: null,
  estoqueBaixo: false,
};
