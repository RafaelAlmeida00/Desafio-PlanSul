"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoriasView } from "@/components/views/categorias-view";
import { ProdutosView } from "@/components/views/produtos-view";
import { EstoqueView } from "@/components/views/estoque-view";
import { MovimentacoesView } from "@/components/views/movimentacoes-view";
import { MetricsCards } from "@/components/custom/metrics-cards";
import { MovementsChart } from "@/components/custom/movements-chart";
import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics";

export default function Home() {
  const { metrics, chartData, isLoading } = useDashboardMetrics();

  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-24">
      <div className="z-10 w-full max-w-6xl">
        <h1 className="text-4xl font-bold mb-8">Gestao de Estoque</h1>

        <div className="mb-8 space-y-6">
          <MetricsCards metrics={metrics} isLoading={isLoading} />
          <MovementsChart data={chartData} isLoading={isLoading} />
        </div>

        <Tabs defaultValue="categorias" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="categorias">Categorias</TabsTrigger>
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
            <TabsTrigger value="estoque">Estado do Estoque</TabsTrigger>
            <TabsTrigger value="movimentacoes">Historico de Movimentacoes</TabsTrigger>
          </TabsList>
          <TabsContent value="categorias">
            <CategoriasView />
          </TabsContent>
          <TabsContent value="produtos">
            <ProdutosView />
          </TabsContent>
          <TabsContent value="estoque">
            <EstoqueView />
          </TabsContent>
          <TabsContent value="movimentacoes">
            <MovimentacoesView />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
