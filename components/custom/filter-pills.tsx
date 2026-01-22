"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface FilterPill {
  key: string
  label: string
  value: string
}

interface FilterPillsProps {
  filters: FilterPill[]
  onRemove: (key: string) => void
  onClearAll: () => void
  className?: string
}

export function FilterPills({
  filters,
  onRemove,
  onClearAll,
  className,
}: FilterPillsProps) {
  if (filters.length === 0) return null

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {filters.map((filter) => (
        <Badge
          key={filter.key}
          variant="secondary"
          className="flex items-center gap-1 pr-1"
        >
          <span className="text-muted-foreground">{filter.label}:</span>
          <span>{filter.value}</span>
          <button
            type="button"
            onClick={() => onRemove(filter.key)}
            className="ml-1 rounded-full p-0.5 hover:bg-muted"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remover filtro {filter.label}</span>
          </button>
        </Badge>
      ))}
      {filters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          Limpar todos
        </Button>
      )}
    </div>
  )
}
