"use client"

import { AppShell } from "@/components/layout/app-shell"
import { ThemeSettings } from "@/components/settings/theme-settings"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { staggerContainer, staggerItem } from "@/lib/animations"

export default function SettingsPage() {
  return (
    <AppShell
      title="Settings"
      description="Manage your InterMate preferences and personalize your experience."
    >
      <motion.div
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div variants={staggerItem}>
          <ThemeSettings />
        </motion.div>

        <motion.div variants={staggerItem}>
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
        </motion.div>
      </motion.div>
    </AppShell>
  )
}