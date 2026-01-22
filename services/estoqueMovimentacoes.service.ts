import prisma from '@/lib/db';
import * as movimentacoesRepository from '@/repositories/estoqueMovimentacoes.repository';
import { MovimentacaoFilters } from '@/repositories/estoqueMovimentacoes.repository';
import { estoque_movimentacoes } from '@/generated/prisma/client';

type TipoMovimentacao = 'entrada' | 'saida';

export const getAllEstoqueMovimentacoes = async (filters?: MovimentacaoFilters): Promise<estoque_movimentacoes[]> => {
  return movimentacoesRepository.findAll(filters);
};

export const getEstoqueMovimentacoesById = async (id: bigint): Promise<estoque_movimentacoes | null> => {
  return movimentacoesRepository.findById(id);
};

export const getMovimentacoesByProdutoId = async (produto_id: bigint): Promise<estoque_movimentacoes[]> => {
  return movimentacoesRepository.findByProdutoId(produto_id);
};

export class EstoqueInsuficienteError extends Error {
  constructor(disponivel: number, solicitado: number) {
    super(`Estoque insuficiente. Disponível: ${disponivel}, Solicitado: ${solicitado}`);
    this.name = 'EstoqueInsuficienteError';
  }
}

export class EstoqueNaoEncontradoError extends Error {
  constructor(produto_id: bigint) {
    super(`Estoque não encontrado para o produto ${produto_id}`);
    this.name = 'EstoqueNaoEncontradoError';
  }
}

export const createEstoqueMovimentacoes = async (data: {
  produto_id: bigint;
  quantidade: number;
  tipo: TipoMovimentacao;
}): Promise<estoque_movimentacoes> => {
  const { produto_id, quantidade, tipo } = data;

  return prisma.$transaction(async (tx) => {
    const estoqueAtual = await tx.estoque.findUnique({
      where: { produto_id },
    });

    if (!estoqueAtual) {
      throw new EstoqueNaoEncontradoError(produto_id);
    }

    if (tipo === 'saida') {
      if (estoqueAtual.quantidade < quantidade) {
        throw new EstoqueInsuficienteError(estoqueAtual.quantidade, quantidade);
      }
    }

    const delta = tipo === 'entrada' ? quantidade : -quantidade;

    await tx.estoque.update({
      where: { produto_id },
      data: {
        quantidade: { increment: delta },
        atualizado_em: new Date(),
      },
    });

    const movimentacao = await tx.estoque_movimentacoes.create({
      data: {
        produto_id,
        quantidade,
        tipo,
      },
    });

    return movimentacao;
  });
};
