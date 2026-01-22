"use client";

import * as z from "zod";
import { useUpdateCategory, updateCategoriaSchema, Categoria } from "@/hooks/use-categorias";
import { BaseModal } from "@/components/custom/base-modal";
import { DynamicForm } from "@/components/custom/dynamic-form";
import { toast } from "sonner";

export function EditCategoryModal({
  isOpen,
  onClose,
  category,
}: {
  isOpen: boolean;
  onClose: () => void;
  category: Categoria | null;
}) {
  const updateCategoryMutation = useUpdateCategory();

  const formFields = [
    {
      name: "nome" as const,
      label: "Nome",
      placeholder: "Nome da Categoria",
      component: "input" as const,
    },
    {
      name: "descricao" as const,
      label: "Descrição",
      placeholder: "Descrição da Categoria (opcional)",
      component: "input" as const,
    },
  ];

  const handleSubmit = (data: z.infer<typeof updateCategoriaSchema>) => {
    if (!category?.id) return;
    updateCategoryMutation.mutate(
      { ...data, id: category.id },
      {
        onSuccess: () => {
          toast.success("Categoria atualizada com sucesso!");
          onClose();
        },
        onError: (error) => {
          toast.error(`Erro ao atualizar categoria: ${error.message}`);
        },
      },
    );
  };

  return (
    <BaseModal
      title="Editar Categoria"
      description="Edite os detalhes da categoria."
      isOpen={isOpen}
      onClose={onClose}
    >
      {category && (
        <DynamicForm
          schema={updateCategoriaSchema}
          onSubmit={handleSubmit}
          defaultValues={{
            id: category.id,
            nome: category.nome,
            descricao: category.descricao || "",
          }}
          fields={formFields}
          submitButtonText="Salvar Alterações"
          isSubmitting={updateCategoryMutation.isPending}
        />
      )}
    </BaseModal>
  );
}
