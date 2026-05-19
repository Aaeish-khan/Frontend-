"use client"

import {
  AnimatePresence,
  LayoutGroup,
  motion,
} from "framer-motion"
import type {
  AnimatePresenceProps,
  MotionProps,
  Transition,
} from "framer-motion"
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react"

import { cn } from "@/lib/utils"

type IntlSegmenter = {
  segment(input: string): Iterable<{ segment: string }>
}

type IntlSegmenterConstructor = new (
  locales?: string | string[],
  options?: { granularity?: "grapheme" | "word" | "sentence" }
) => IntlSegmenter

type StaggerFrom = "first" | "last" | "center" | "random" | number
type SplitBy = "characters" | "words" | "lines" | string

export type TextRotateRef = {
  next: () => void
  previous: () => void
  jumpTo: (index: number) => void
  reset: () => void
}

interface TextRotateProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  texts: string[]
  rotationInterval?: number
  initial?: MotionProps["initial"]
  animate?: MotionProps["animate"]
  exit?: MotionProps["exit"]
  animatePresenceMode?: AnimatePresenceProps["mode"]
  animatePresenceInitial?: boolean
  staggerDuration?: number
  staggerFrom?: StaggerFrom
  transition?: Transition
  loop?: boolean
  auto?: boolean
  splitBy?: SplitBy
  onNext?: (index: number) => void
  mainClassName?: string
  splitLevelClassName?: string
  elementLevelClassName?: string
}

const defaultInitial: MotionProps["initial"] = { y: "100%", opacity: 0 }
const defaultAnimate: MotionProps["animate"] = { y: 0, opacity: 1 }
const defaultExit: MotionProps["exit"] = { y: "-100%", opacity: 0 }
const defaultTransition: Transition = {
  type: "spring",
  damping: 24,
  stiffness: 320,
}

function getTextSegments(text: string, splitBy: SplitBy) {
  if (splitBy === "lines") {
    return text.split("\n")
  }

  if (splitBy === "words") {
    return text.split(/(\s+)/).filter(Boolean)
  }

  if (splitBy === "characters") {
    const Segmenter = (Intl as unknown as {
      Segmenter?: IntlSegmenterConstructor
    }).Segmenter

    if (Segmenter) {
      return Array.from(
        new Segmenter(undefined, { granularity: "grapheme" }).segment(text),
        ({ segment }) => segment
      )
    }

    return Array.from(text)
  }

  return text.split(splitBy).filter(Boolean)
}

function getStaggerDelay(
  index: number,
  total: number,
  staggerFrom: StaggerFrom,
  staggerDuration: number
) {
  if (total <= 1) return 0

  if (typeof staggerFrom === "number") {
    return Math.abs(index - staggerFrom) * staggerDuration
  }

  if (staggerFrom === "last") {
    return (total - index - 1) * staggerDuration
  }

  if (staggerFrom === "center") {
    return Math.abs(index - Math.floor(total / 2)) * staggerDuration
  }

  if (staggerFrom === "random") {
    return ((index * 7) % total) * staggerDuration
  }

  return index * staggerDuration
}

export const TextRotate = forwardRef<TextRotateRef, TextRotateProps>(
  (
    {
      texts,
      rotationInterval = 2000,
      initial = defaultInitial,
      animate = defaultAnimate,
      exit = defaultExit,
      animatePresenceMode = "wait",
      animatePresenceInitial = false,
      staggerDuration = 0.025,
      staggerFrom = "first",
      transition = defaultTransition,
      loop = true,
      auto = true,
      splitBy = "characters",
      onNext,
      mainClassName,
      splitLevelClassName,
      elementLevelClassName,
      className,
      ...props
    },
    ref
  ) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const safeTexts = texts.length > 0 ? texts : [""]

    const jumpTo = useCallback(
      (index: number) => {
        const nextIndex = Math.max(0, Math.min(index, safeTexts.length - 1))
        setCurrentIndex(nextIndex)
        onNext?.(nextIndex)
      },
      [onNext, safeTexts.length]
    )

    const next = useCallback(() => {
      setCurrentIndex((previousIndex) => {
        const isLast = previousIndex >= safeTexts.length - 1
        const nextIndex = isLast ? (loop ? 0 : previousIndex) : previousIndex + 1

        if (nextIndex !== previousIndex) {
          onNext?.(nextIndex)
        }

        return nextIndex
      })
    }, [loop, onNext, safeTexts.length])

    const previous = useCallback(() => {
      setCurrentIndex((previousIndex) => {
        const isFirst = previousIndex <= 0
        const nextIndex = isFirst ? (loop ? safeTexts.length - 1 : 0) : previousIndex - 1

        if (nextIndex !== previousIndex) {
          onNext?.(nextIndex)
        }

        return nextIndex
      })
    }, [loop, onNext, safeTexts.length])

    useImperativeHandle(ref, () => ({
      next,
      previous,
      jumpTo,
      reset: () => jumpTo(0),
    }))

    useEffect(() => {
      setCurrentIndex((index) => Math.min(index, safeTexts.length - 1))
    }, [safeTexts.length])

    useEffect(() => {
      if (!auto || safeTexts.length <= 1) return

      const interval = window.setInterval(next, rotationInterval)

      return () => window.clearInterval(interval)
    }, [auto, next, rotationInterval, safeTexts.length])

    const currentText = safeTexts[currentIndex] ?? ""
    const segments = useMemo(
      () => getTextSegments(currentText, splitBy),
      [currentText, splitBy]
    )

    return (
      <span
        className={cn(
          "inline-flex items-center justify-center whitespace-pre-wrap",
          mainClassName,
          className
        )}
        aria-live="polite"
        aria-label={currentText}
        {...props}
      >
        <LayoutGroup>
          <AnimatePresence
            mode={animatePresenceMode}
            initial={animatePresenceInitial}
          >
            <motion.span
              key={currentIndex}
              layout
              aria-hidden="true"
              className="inline-flex flex-wrap items-center justify-center"
            >
              {segments.map((segment, index) => (
                <span
                  key={`${currentIndex}-${index}-${segment}`}
                  className={cn(
                    "inline-block overflow-hidden align-bottom",
                    splitLevelClassName
                  )}
                >
                  <motion.span
                    className={cn("inline-block", elementLevelClassName)}
                    initial={initial}
                    animate={animate}
                    exit={exit}
                    transition={{
                      ...transition,
                      delay: getStaggerDelay(
                        index,
                        segments.length,
                        staggerFrom,
                        staggerDuration
                      ),
                    }}
                  >
                    {segment}
                  </motion.span>
                </span>
              ))}
            </motion.span>
          </AnimatePresence>
        </LayoutGroup>
      </span>
    )
  }
)

TextRotate.displayName = "TextRotate"
