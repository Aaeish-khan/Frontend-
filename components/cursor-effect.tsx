"use client"

import { useEffect } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

/**
 * Professional ambient spotlight that follows the cursor.
 * Does NOT hide or replace the system cursor arrow.
 * Only activates on fine-pointer (mouse/trackpad) devices.
 */
export function CursorEffect() {
  const mx = useMotionValue(-600)
  const my = useMotionValue(-600)

  // Spotlight follows with a gentle lag
  const spotX = useSpring(mx, { damping: 28, stiffness: 90, mass: 0.8 })
  const spotY = useSpring(my, { damping: 28, stiffness: 90, mass: 0.8 })

  // Opacity: fades in on enter, fades out on leave
  const rawOpacity = useMotionValue(0)
  const spotOpacity = useSpring(rawOpacity, { damping: 22, stiffness: 180 })

  // Scale: tightens slightly over interactive elements
  const rawScale = useMotionValue(1)
  const spotScale = useSpring(rawScale, { damping: 22, stiffness: 180 })

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!window.matchMedia("(pointer: fine)").matches) return

    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX)
      my.set(e.clientY)
    }

    const onEnter = () => rawOpacity.set(0.07)
    const onLeave = () => rawOpacity.set(0)

    const onOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest(
        "a, button, [role='button'], input, textarea, select, label, [tabindex='0']"
      )
      if (el) {
        rawOpacity.set(0.13)
        rawScale.set(0.72)
      } else {
        rawOpacity.set(0.07)
        rawScale.set(1)
      }
    }

    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseenter", onEnter)
    document.addEventListener("mouseleave", onLeave)
    document.addEventListener("mouseover", onOver)

    return () => {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseenter", onEnter)
      document.removeEventListener("mouseleave", onLeave)
      document.removeEventListener("mouseover", onOver)
    }
  }, [mx, my, rawOpacity, rawScale])

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[9990] rounded-full"
      style={{
        x: spotX,
        y: spotY,
        translateX: "-50%",
        translateY: "-50%",
        opacity: spotOpacity,
        scale: spotScale,
        width: 480,
        height: 480,
        background:
          "radial-gradient(circle, rgba(99,102,241,0.55) 0%, rgba(139,92,246,0.28) 35%, rgba(34,211,238,0.10) 65%, transparent 100%)",
        filter: "blur(48px)",
        willChange: "transform, opacity",
      }}
    />
  )
}
