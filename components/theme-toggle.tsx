"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) {
    return (
      <div className={cn(
        "relative h-9 w-9 rounded-xl border border-white/10 bg-white/5",
        className
      )} />
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <motion.button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-300",
        isDark
          ? "border-white/10 bg-white/5 text-yellow-300 hover:border-yellow-400/40 hover:bg-yellow-400/10 hover:shadow-[0_0_16px_rgba(250,204,21,0.2)]"
          : "border-slate-200 bg-white text-indigo-600 shadow-sm hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-[0_0_16px_rgba(99,102,241,0.2)]",
        className
      )}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="absolute"
          >
            <Sun className="h-[18px] w-[18px]" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="absolute"
          >
            <Moon className="h-[18px] w-[18px]" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
