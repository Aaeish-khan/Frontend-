"use client"

import { AppShell } from "@/components/layout/app-shell"
import { ThemeSettings } from "@/components/settings/theme-settings"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <AppShell
      title="Settings"
      description="Manage your InterMate preferences and personalize your experience."
    >
      <div className="space-y-6">
        <ThemeSettings />

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl">Account</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              More settings like profile editing, notifications, and privacy can go here later.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}