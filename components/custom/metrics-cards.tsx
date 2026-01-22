"use client";

import * as React from "react";
import {
  Package,
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  variant?: "default" | "warning" | "success" | "info";
  className?: string;
}

function MetricCard({
  title,
  value,
  icon,
  variant = "default",
  className,
}: MetricCardProps) {
  const variantStyles = {
    default: "bg-card border",
    warning: "bg-destructive/10 border-destructive/20",
    success: "bg-green-500/10 border-green-500/20",
    info: "bg-blue-500/10 border-blue-500/20",
  };

  const iconStyles = {
    default: "text-muted-foreground",
    warning: "text-destructive",
    success: "text-green-500",
    info: "text-blue-500",
  };

  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-colors",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={cn("rounded-full p-2", iconStyles[variant])}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export interface DashboardMetrics {
  totalProdutos: number;
  estoqueBaixo: number;
  entradasHoje: number;
  saidasHoje: number;
}

interface MetricsCardsProps {
  metrics: DashboardMetrics;
  isLoading?: boolean;
  className?: string;
}

export function MetricsCards({
  metrics,
  isLoading = false,
  className,
}: MetricsCardsProps) {
  if (isLoading) {
    return (
      <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg border bg-muted/50"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      <MetricCard
        title="Total de Produtos"
        value={metrics.totalProdutos}
        icon={<Package className="h-6 w-6" />}
        variant="default"
      />
      <MetricCard
        title="Estoque Baixo"
        value={metrics.estoqueBaixo}
        icon={<AlertTriangle className="h-6 w-6" />}
        variant={metrics.estoqueBaixo > 0 ? "warning" : "default"}
      />
      <MetricCard
        title="Entradas Hoje"
        value={metrics.entradasHoje}
        icon={<ArrowDownCircle className="h-6 w-6" />}
        variant="success"
      />
      <MetricCard
        title="Saidas Hoje"
        value={metrics.saidasHoje}
        icon={<ArrowUpCircle className="h-6 w-6" />}
        variant="info"
      />
    </div>
  );
}
