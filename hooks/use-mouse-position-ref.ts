"use client"

import { useEffect, useRef } from "react"
import type { RefObject } from "react"

type MousePosition = {
  x: number
  y: number
}

export function useMousePositionRef(
  targetRef?: RefObject<HTMLElement | SVGElement | null>
) {
  const positionRef = useRef<MousePosition>({ x: 0, y: 0 })

  useEffect(() => {
    const updatePosition = (clientX: number, clientY: number) => {
      const target = targetRef?.current

      if (target) {
        const rect = target.getBoundingClientRect()
        positionRef.current = {
          x: clientX - rect.left - rect.width / 2,
          y: clientY - rect.top - rect.height / 2,
        }
        return
      }

      positionRef.current = {
        x: clientX - window.innerWidth / 2,
        y: clientY - window.innerHeight / 2,
      }
    }

    const handleMouseMove = (event: MouseEvent) => {
      updatePosition(event.clientX, event.clientY)
    }

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0]

      if (touch) {
        updatePosition(touch.clientX, touch.clientY)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("touchmove", handleTouchMove, { passive: true })

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("touchmove", handleTouchMove)
    }
  }, [targetRef])

  return positionRef
}
