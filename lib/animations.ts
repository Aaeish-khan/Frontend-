/**
 * Reusable Framer Motion animation variants for a futuristic, premium SaaS feel.
 * Uses transform and opacity only for 60fps performance.
 */

import type { Variants } from "framer-motion"

/* ─── Page / Section Transitions ──────────────────────────── */

/** Fade + slide up for page-level content */
export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
  },
}

/** Stagger container — wraps a list of animated children */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

/** Individual item inside a stagger container */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
  },
}

/* ─── Card Animations ─────────────────────────────────────── */

/** Card with hover lift + subtle scale */
export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.34, 1.56, 0.64, 1] },
  },
  hover: {
    y: -5,
    scale: 1.015,
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  },
}

/* ─── Fade Variants ───────────────────────────────────────── */

/** Simple fade in */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
}

/** Fade in from left */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
  },
}

/** Fade in from right */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
  },
}

/** Scale pop in (for modals, overlays, badges) */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] },
  },
}

/* ─── Hero Text Reveal ────────────────────────────────────── */

export const heroTitle: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.4, 0, 0.2, 1] },
  },
}

export const heroSubtitle: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: 0.15, ease: [0.4, 0, 0.2, 1] },
  },
}

export const heroCta: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] },
  },
}

/* ─── Nav / Sidebar ───────────────────────────────────────── */

export const navItemVariants: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, delay: i * 0.06, ease: [0.4, 0, 0.2, 1] },
  }),
}

/* ─── Viewport trigger helper props ──────────────────────── */

/** Attach to motion elements to trigger on scroll into view */
export const viewportOnce = { once: true, margin: "-60px" }
