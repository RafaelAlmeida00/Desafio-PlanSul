"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

export interface MovementChartData {
  date: string;
  entradas: number;
  saidas: number;
}

interface MovementsChartProps {
  data: MovementChartData[];
  isLoading?: boolean;
  className?: string;
}

export function MovementsChart({
  data,
  isLoading = false,
  className,
}: MovementsChartProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "h-[300px] animate-pulse rounded-lg border bg-muted/50",
          className
        )}
      />
    );
  }

  if (data.length === 0) {
    return (
      <div
        className={cn(
          "flex h-[300px] items-center justify-center rounded-lg border",
          className
        )}
      >
        <p className="text-sm text-muted-foreground">
          Nenhuma movimentacao nos ultimos 7 dias
        </p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border p-4", className)}>
      <h3 className="mb-4 text-sm font-medium">Movimentacoes (ultimos 7 dias)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Bar
            dataKey="entradas"
            name="Entradas"
            fill="hsl(142, 76%, 36%)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="saidas"
            name="Saidas"
            fill="hsl(217, 91%, 60%)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
