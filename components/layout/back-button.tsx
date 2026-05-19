"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type BackButtonProps = {
  label?: string
  className?: string
}

export function BackButton({ label = "Back", className }: BackButtonProps) {
  const router = useRouter()

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(
        "h-9 w-fit rounded-2xl border-border/60 bg-card/80 px-3 text-muted-foreground shadow-sm hover:text-foreground",
        className,
      )}
      onClick={() => router.back()}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  )
}
