"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Estoque } from "@/hooks/use-estoque";

export const estoqueColumns: ColumnDef<Estoque>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "produto.nome",
    header: "Produto",
    cell: ({ row }) => {
      const produto = row.original.produto;
      return produto ? produto.nome : "N/A";
    },
  },
  {
    accessorKey: "produto.sku",
    header: "SKU",
    cell: ({ row }) => {
      const produto = row.original.produto;
      return produto ? produto.sku : "N/A";
    },
  },
  {
    accessorKey: "quantidade",
    header: "Quantidade Atual",
    cell: ({ row }) => {
      const quantidade = row.original.quantidade;
      const estoqueMinimo = row.original.produto?.estoque_minimo;
      const isBaixo = estoqueMinimo !== null && quantidade < estoqueMinimo;

      return (
        <div className="flex items-center gap-2">
          <span>{quantidade}</span>
          {isBaixo && (
            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
              Estoque Baixo
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "produto.estoque_minimo",
    header: "Estoque Mínimo",
    cell: ({ row }) => {
      const produto = row.original.produto;
      return produto?.estoque_minimo ?? "N/A";
    },
  },
  {
    accessorKey: "atualizado_em",
    header: "Última Atualização",
    cell: ({ row }) => {
      const date = row.getValue("atualizado_em");
      if (!date) return "N/A";
      return format(new Date(date as string), "dd/MM/yyyy HH:mm");
    },
  },
];
