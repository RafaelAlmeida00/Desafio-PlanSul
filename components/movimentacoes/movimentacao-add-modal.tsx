"use client";

import * as z from "zod";
import { useCreateMovimentacao, createMovimentacaoSchema } from "@/hooks/use-estoque-movimentacoes";
import { useProdutos } from "@/hooks/use-produtos";
import { BaseModal } from "@/components/custom/base-modal";
import { DynamicForm } from "@/components/custom/dynamic-form";
import { toast } from "sonner";

export function AddMovimentacaoModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const createMovimentacaoMutation = useCreateMovimentacao();
  const { data: produtos } = useProdutos();

  const productOptions =
    produtos?.map((prod) => ({
      label: prod.nome,
      value: prod.id,
    })) || [];

  const formFields = [
    {
      name: "produto_id" as const,
      label: "Produto",
      placeholder: "Selecione um produto",
      component: "select" as const,
      options: productOptions,
    },
    {
      name: "quantidade" as const,
      label: "Quantidade",
      placeholder: "0",
      type: "number",
      component: "input" as const,
    },
    {
      name: "tipo" as const,
      label: "Tipo",
      placeholder: "Selecione o tipo",
      component: "select" as const,
      options: [
        { label: "Entrada", value: "entrada" },
        { label: "Saída", value: "saida" },
      ],
    },
  ];

  const handleSubmit = (data: z.infer<typeof createMovimentacaoSchema>) => {
    createMovimentacaoMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Movimentação registrada com sucesso!");
        onClose();
      },
      onError: (error) => {
        toast.error(`Erro ao registrar movimentação: ${error.message}`);
      },
    });
  };

  return (
    <BaseModal
      title="Nova Movimentação"
      description="Registre uma entrada ou saída de estoque."
      isOpen={isOpen}
      onClose={onClose}
    >
      <DynamicForm
        schema={createMovimentacaoSchema}
        onSubmit={handleSubmit}
        fields={formFields}
        defaultValues={{
          produto_id: "",
          quantidade: 1,
          tipo: undefined,
        }}
        submitButtonText="Registrar Movimentação"
        isSubmitting={createMovimentacaoMutation.isPending}
      />
    </BaseModal>
  );
}
