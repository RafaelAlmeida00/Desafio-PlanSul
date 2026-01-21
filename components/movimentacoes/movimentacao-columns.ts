"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { EstoqueMovimentacao } from "@/hooks/use-estoque-movimentacoes";

export const movimentacaoColumns: ColumnDef<EstoqueMovimentacao>[] = [
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
    header: "Quantidade",
  },
  {
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ row }) => {
      const tipo = row.getValue("tipo") as string;
      return tipo === "entrada" ? "Entrada" : "Saída";
    },
  },
  {
    accessorKey: "criado_em",
    header: "Data",
    cell: ({ row }) => {
      const date = row.getValue("criado_em");
      if (!date) return "N/A";
      return format(new Date(date as string), "dd/MM/yyyy HH:mm");
    },
  },
];
