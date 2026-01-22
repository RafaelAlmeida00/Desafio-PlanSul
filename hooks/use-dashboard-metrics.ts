import { useMemo } from "react";
import { useProdutos } from "./use-produtos";
import { useEstoque } from "./use-estoque";
import { useEstoqueMovimentacoes } from "./use-estoque-movimentacoes";
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import type { DashboardMetrics } from "@/components/custom/metrics-cards";
import type { MovementChartData } from "@/components/custom/movements-chart";

export function useDashboardMetrics() {
  const { data: produtos, isLoading: loadingProdutos } = useProdutos();
  const { data: estoque, isLoading: loadingEstoque } = useEstoque();
  const { data: movimentacoes, isLoading: loadingMovimentacoes } =
    useEstoqueMovimentacoes();

  const isLoading = loadingProdutos || loadingEstoque || loadingMovimentacoes;

  const metrics = useMemo<DashboardMetrics>(() => {
    if (!produtos || !estoque || !movimentacoes) {
      return {
        totalProdutos: 0,
        estoqueBaixo: 0,
        entradasHoje: 0,
        saidasHoje: 0,
      };
    }

    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    const estoqueBaixo = estoque.filter((item) => {
      const minimo = item.produto?.estoque_minimo ?? 0;
      return item.quantidade < minimo;
    }).length;

    const movimentacoesHoje = movimentacoes.filter((mov) => {
      const movDate = new Date(mov.criado_em);
      return isWithinInterval(movDate, { start: todayStart, end: todayEnd });
    });

    const entradasHoje = movimentacoesHoje.filter(
      (mov) => mov.tipo === "entrada"
    ).length;
    const saidasHoje = movimentacoesHoje.filter(
      (mov) => mov.tipo === "saida"
    ).length;

    return {
      totalProdutos: produtos.length,
      estoqueBaixo,
      entradasHoje,
      saidasHoje,
    };
  }, [produtos, estoque, movimentacoes]);

  const chartData = useMemo<MovementChartData[]>(() => {
    if (!movimentacoes) return [];

    const today = new Date();
    const last7Days: MovementChartData[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStart = startOfDay(date);
      const dateEnd = endOfDay(date);

      const dayMovimentacoes = movimentacoes.filter((mov) => {
        const movDate = new Date(mov.criado_em);
        return isWithinInterval(movDate, { start: dateStart, end: dateEnd });
      });

      const entradas = dayMovimentacoes.filter(
        (mov) => mov.tipo === "entrada"
      ).length;
      const saidas = dayMovimentacoes.filter(
        (mov) => mov.tipo === "saida"
      ).length;

      last7Days.push({
        date: format(date, "dd/MM"),
        entradas,
        saidas,
      });
    }

    return last7Days;
  }, [movimentacoes]);

  return {
    metrics,
    chartData,
    isLoading,
  };
}
