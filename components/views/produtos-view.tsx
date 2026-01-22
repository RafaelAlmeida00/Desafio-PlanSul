"use client";

import { useState, useMemo, useCallback } from "react";
import { useProdutos, Produto } from "@/hooks/use-produtos";
import { useEstoque } from "@/hooks/use-estoque";
import { DataTable } from "@/components/custom/data-table";
import { SearchInput } from "@/components/custom/search-input";
import { FilterPills, FilterPill } from "@/components/custom/filter-pills";
import {
  ProdutoFiltersComponent,
  ProdutoFilters,
  defaultProdutoFilters,
} from "@/components/produtos/produto-filters";
import { Button } from "@/components/ui/button";
import { produtoColumns } from "@/components/produtos/produto-columns";
import { AddProductModal } from "@/components/produtos/produto-add-modal";
import { EditProductModal } from "@/components/produtos/produto-edit-modal";
import { DeleteProductDialog } from "@/components/produtos/produto-delete-dialog";
import { useCategories } from "@/hooks/use-categorias";

export function ProdutosView() {
  const { data: produtos, isLoading, isError, error } = useProdutos();
  const { data: estoque } = useEstoque();
  const { data: categorias } = useCategories();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
  const [productIdToDelete, setProductIdToDelete] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<ProdutoFilters>(defaultProdutoFilters);

  const marcas = useMemo(() => {
    if (!produtos) return [];
    const uniqueMarcas = new Set(
      produtos.map((p) => p.marca).filter((m): m is string => !!m)
    );
    return Array.from(uniqueMarcas).sort();
  }, [produtos]);

  const filteredProdutos = useMemo(() => {
    if (!produtos) return [];

    return produtos.filter((produto) => {
      if (filters.categoria_id && produto.categoria_id !== filters.categoria_id) {
        return false;
      }

      if (filters.marca && produto.marca !== filters.marca) {
        return false;
      }

      if (filters.estoqueBaixo) {
        const estoqueItem = estoque?.find((e) => e.produto_id === produto.id);
        const quantidade = estoqueItem?.quantidade ?? 0;
        const minimo = produto.estoque_minimo ?? 0;
        if (quantidade >= minimo) {
          return false;
        }
      }

      return true;
    });
  }, [produtos, filters, estoque]);

  const filterPills = useMemo<FilterPill[]>(() => {
    const pills: FilterPill[] = [];

    if (filters.categoria_id) {
      const categoria = categorias?.find((c) => c.id === filters.categoria_id);
      pills.push({
        key: "categoria_id",
        label: "Categoria",
        value: categoria?.nome || filters.categoria_id,
      });
    }

    if (filters.marca) {
      pills.push({
        key: "marca",
        label: "Marca",
        value: filters.marca,
      });
    }

    if (filters.estoqueBaixo) {
      pills.push({
        key: "estoqueBaixo",
        label: "Filtro",
        value: "Estoque Baixo",
      });
    }

    return pills;
  }, [filters, categorias]);

  const handleRemoveFilter = useCallback((key: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: key === "estoqueBaixo" ? false : null,
    }));
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setFilters(defaultProdutoFilters);
  }, []);

  const handleEdit = (id: string) => {
    const productToEdit = produtos?.find((prod) => prod.id === id);
    if (productToEdit) {
      setSelectedProduct(productToEdit);
      setIsEditModalOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    setProductIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  if (isError) {
    return (
      <div className="text-red-500">
        Error: {error?.message || "Failed to load products."}
      </div>
    );
  }

  return (
    <>
      <DataTable
        columns={produtoColumns}
        data={filteredProdutos}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        globalFilter={searchQuery}
        searchComponent={
          <SearchInput
            placeholder="Buscar por nome, SKU ou marca..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="w-full max-w-sm"
          />
        }
        filterComponent={
          <ProdutoFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            marcas={marcas}
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
          <Button key="new-product" onClick={() => setIsAddModalOpen(true)}>
            Novo Produto
          </Button>,
        ]}
        emptyState={{
          title: searchQuery || filterPills.length > 0
            ? "Nenhum produto encontrado"
            : "Nenhum produto cadastrado",
          description: searchQuery || filterPills.length > 0
            ? "Tente ajustar os filtros ou a busca"
            : "Comece adicionando seu primeiro produto",
          action: !searchQuery && filterPills.length === 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
            >
              Adicionar Produto
            </Button>
          ) : undefined,
        }}
      />

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        product={selectedProduct}
      />
      <DeleteProductDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        productId={productIdToDelete}
      />
    </>
  );
}
