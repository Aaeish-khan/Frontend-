"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: "up" | "down" | "stable"
  trendValue?: string
  className?: string
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue,
  className 
}: StatsCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {(subtitle || trendValue) && (
              <div className="flex items-center gap-2">
                {trend && (
                  <span className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    trend === "up" && "text-green-500",
                    trend === "down" && "text-red-500",
                    trend === "stable" && "text-muted-foreground"
                  )}>
                    {trend === "up" && <TrendingUp className="h-3 w-3" />}
                    {trend === "down" && <TrendingDown className="h-3 w-3" />}
                    {trend === "stable" && <Minus className="h-3 w-3" />}
                    {trendValue}
                  </span>
                )}
                {subtitle && (
                  <span className="text-xs text-muted-foreground">{subtitle}</span>
                )}
              </div>
            )}
          </div>
          <div className="icon-box flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/10 border border-primary/15">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
