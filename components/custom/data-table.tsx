"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  RowSelectionState,
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown, Search, FileX } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface DataTableProps<TData extends { id: string }, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
  filterComponent?: React.ReactNode;
  searchComponent?: React.ReactNode;
  actionButtons?: React.ReactNode[];
  enableSorting?: boolean;
  enableSelection?: boolean;
  onSelectionChange?: (selectedRows: TData[]) => void;
  bulkActions?: React.ReactNode;
  globalFilter?: string;
  emptyState?: {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
  };
  filterPills?: React.ReactNode;
}

export function DataTable<TData extends { id: string }, TValue>({
  columns,
  data,
  onEdit,
  onDelete,
  isLoading = false,
  filterComponent,
  searchComponent,
  actionButtons,
  enableSorting = true,
  enableSelection = false,
  onSelectionChange,
  bulkActions,
  globalFilter = "",
  emptyState,
  filterPills,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const selectionColumn: ColumnDef<TData, unknown> = {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Selecionar todos"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Selecionar linha"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };

  const tableColumns = React.useMemo(() => {
    if (enableSelection) {
      return [selectionColumn, ...columns];
    }
    return columns;
  }, [columns, enableSelection]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      globalFilter,
    },
    globalFilterFn: "includesString",
  });

  React.useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original);
      onSelectionChange(selectedRows);
    }
  }, [rowSelection, onSelectionChange, table]);

  const selectedCount = Object.keys(rowSelection).length;

  const generateSkeletonRow = (columnCount: number, key: number) => (
    <TableRow key={key}>
      {Array.from({ length: columnCount }).map((_, colIndex) => (
        <TableCell key={colIndex}>
          <Skeleton className="h-6 w-full" />
        </TableCell>
      ))}
    </TableRow>
  );

  const getSortIcon = (isSorted: false | "asc" | "desc") => {
    if (isSorted === "asc") {
      return <ArrowUp className="ml-1 h-4 w-4" />;
    }
    if (isSorted === "desc") {
      return <ArrowDown className="ml-1 h-4 w-4" />;
    }
    return <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />;
  };

  const renderEmptyState = () => {
    const defaultEmptyState = {
      title: "Nenhum resultado encontrado",
      description: globalFilter
        ? `Nenhum item corresponde a "${globalFilter}". Tente ajustar sua busca.`
        : "Nao ha dados para exibir no momento.",
      icon: globalFilter ? (
        <Search className="h-12 w-12 text-muted-foreground/50" />
      ) : (
        <FileX className="h-12 w-12 text-muted-foreground/50" />
      ),
    };

    const state = { ...defaultEmptyState, ...emptyState };

    return (
      <TableRow>
        <TableCell
          colSpan={tableColumns.length + (onEdit || onDelete ? 1 : 0)}
          className="h-48"
        >
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            {state.icon}
            <div className="space-y-1">
              <p className="font-medium text-muted-foreground">{state.title}</p>
              <p className="text-sm text-muted-foreground/70">
                {state.description}
              </p>
            </div>
            {state.action}
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div>
      <div className="flex items-center py-4 gap-2 flex-wrap">
        {searchComponent}
        {filterComponent}
        <div className="ml-auto flex gap-2">
          {actionButtons?.map((button, index) => (
            <React.Fragment key={index}>{button}</React.Fragment>
          ))}
        </div>
      </div>

      {filterPills && <div className="pb-4">{filterPills}</div>}

      {enableSelection && selectedCount > 0 && (
        <div className="flex items-center gap-4 rounded-lg border bg-muted/50 p-3 mb-4">
          <span className="text-sm font-medium">
            {selectedCount} {selectedCount === 1 ? "item selecionado" : "itens selecionados"}
          </span>
          {bulkActions}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRowSelection({})}
            className="ml-auto"
          >
            Limpar selecao
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort() && enableSorting;
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(canSort && "cursor-pointer select-none")}
                      onClick={
                        canSort
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {canSort && getSortIcon(header.column.getIsSorted())}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
                {(onEdit || onDelete) && <TableHead className="w-[100px]" />}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) =>
                generateSkeletonRow(
                  tableColumns.length + (onEdit || onDelete ? 1 : 0),
                  index
                )
              )
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(row.getIsSelected() && "bg-muted/50")}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableCell className="text-right">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          onClick={() => onEdit(row.original.id)}
                          className="mr-2"
                        >
                          Editar
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          onClick={() => onDelete(row.original.id)}
                        >
                          Excluir
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              renderEmptyState()
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} de {data.length} itens
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Pagina {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Proximo
          </Button>
        </div>
      </div>
    </div>
  );
}
