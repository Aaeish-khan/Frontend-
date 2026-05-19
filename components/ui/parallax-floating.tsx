"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react"
import type { MutableRefObject } from "react"
import {
  motion,
  useAnimationFrame,
  useMotionValue,
} from "framer-motion"
import type { HTMLMotionProps } from "framer-motion"

import { useMousePositionRef } from "@/hooks/use-mouse-position-ref"
import { cn } from "@/lib/utils"

type MousePosition = {
  x: number
  y: number
}

type FloatingContextValue = {
  mousePosition: MutableRefObject<MousePosition>
  sensitivity: number
}

const FloatingContext = createContext<FloatingContextValue | null>(null)

interface FloatingProps extends React.HTMLAttributes<HTMLDivElement> {
  sensitivity?: number
}

interface FloatingElementProps extends HTMLMotionProps<"div"> {
  depth?: number
}

export default function Floating({
  children,
  className,
  sensitivity = 0.025,
  ...props
}: FloatingProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mousePosition = useMousePositionRef(containerRef)

  const contextValue = useMemo(
    () => ({
      mousePosition,
      sensitivity,
    }),
    [mousePosition, sensitivity]
  )

  return (
    <FloatingContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className={cn("pointer-events-none absolute inset-0", className)}
        {...props}
      >
        {children}
      </div>
    </FloatingContext.Provider>
  )
}

export function FloatingElement({
  children,
  className,
  depth = 1,
  style,
  ...props
}: FloatingElementProps) {
  const context = useContext(FloatingContext)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  useEffect(() => {
    x.set(0)
    y.set(0)
  }, [context, depth, x, y])

  useAnimationFrame(() => {
    if (!context) return

    const targetX = context.mousePosition.current.x * context.sensitivity * depth
    const targetY = context.mousePosition.current.y * context.sensitivity * depth

    x.set(x.get() + (targetX - x.get()) * 0.08)
    y.set(y.get() + (targetY - y.get()) * 0.08)
  })

  return (
    <motion.div
      className={cn("pointer-events-none absolute", className)}
      style={{ ...style, x, y }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
