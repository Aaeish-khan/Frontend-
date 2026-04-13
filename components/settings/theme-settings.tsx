"use client"

import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Monitor, Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeSettings() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const options = [
    {
      key: "light",
      label: "Light",
      description: "Bright and clean interface",
      icon: Sun,
    },
    {
      key: "dark",
      label: "Dark",
      description: "Easy on the eyes in low light",
      icon: Moon,
    },
    {
      key: "system",
      label: "System",
      description: "Matches your device settings",
      icon: Monitor,
    },
  ] as const

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl">Appearance</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium">Theme Preference</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose how InterMate looks for you.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {options.map((option) => {
            const Icon = option.icon
            const isActive = theme === option.key

            return (
                <button
                    key={option.key}
                    type="button"
                    onClick={() => setTheme(option.key)}
                    className={`rounded-xl border p-4 text-left transition-all ${
                        isActive
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:border-primary/40 hover:bg-muted/40"
                    }`}
                    >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                    </div>

                    <h4 className="text-sm font-semibold">{option.label}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {option.description}
                    </p>

                    {isActive && (
                        <div className="mt-3">
                        <span className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground">
                            Selected
                        </span>
                        </div>
                    )}
                </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}