"use client";

import * as z from "zod";
import { useUpdateProduto, updateProdutoSchema, Produto } from "@/hooks/use-produtos";
import { useCategories } from "@/hooks/use-categorias";
import { BaseModal } from "@/components/custom/base-modal";
import { DynamicForm } from "@/components/custom/dynamic-form";
import { toast } from "sonner";

export function EditProductModal({
  isOpen,
  onClose,
  product,
}: {
  isOpen: boolean;
  onClose: () => void;
  product: Produto | null;
}) {
  const updateProdutoMutation = useUpdateProduto();
  const { data: categories } = useCategories();

  const categoryOptions =
    categories?.map((cat) => ({
      label: cat.nome,
      value: cat.id,
    })) || [];

  const formFields = [
    {
      name: "nome" as const,
      label: "Nome",
      placeholder: "Nome do Produto",
      component: "input" as const,
    },
    {
      name: "sku" as const,
      label: "SKU",
      placeholder: "SKU do Produto",
      component: "input" as const,
    },
    {
      name: "categoria_id" as const,
      label: "Categoria",
      placeholder: "Selecione uma categoria",
      component: "select" as const,
      options: categoryOptions,
    },
    {
      name: "estoque_minimo" as const,
      label: "Estoque Mínimo",
      placeholder: "0",
      type: "number",
      component: "input" as const,
    },
    {
      name: "marca" as const,
      label: "Marca",
      placeholder: "Marca do Produto (opcional)",
      component: "input" as const,
    },
  ];

  const handleSubmit = (data: z.infer<typeof updateProdutoSchema>) => {
    if (!product?.id) return;
    updateProdutoMutation.mutate(
      { ...data, id: product.id },
      {
        onSuccess: () => {
          toast.success("Produto atualizado com sucesso!");
          onClose();
        },
        onError: (error) => {
          toast.error(`Erro ao atualizar produto: ${error.message}`);
        },
      },
    );
  };

  return (
    <BaseModal
      title="Editar Produto"
      description="Edite os detalhes do produto."
      isOpen={isOpen}
      onClose={onClose}
    >
      {product && (
        <DynamicForm
          schema={updateProdutoSchema}
          onSubmit={handleSubmit}
          defaultValues={{
            id: product.id,
            nome: product.nome,
            sku: product.sku,
            categoria_id: product.categoria_id || undefined,
            estoque_minimo: product.estoque_minimo || 0,
            marca: product.marca || undefined,
          }}
          fields={formFields}
          submitButtonText="Salvar Alterações"
          isSubmitting={updateProdutoMutation.isPending}
        />
      )}
    </BaseModal>
  );
}
