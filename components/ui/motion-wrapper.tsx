'use client'

import { motion, HTMLMotionProps, Variants } from 'framer-motion'
import { ReactNode } from 'react'

/**
 * Motion presets for consistent animations across the app
 * All animations are < 200ms with ease-out curves for premium feel
 */
const motionPresets = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  },
  fadeInUp: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  },
  slideInRight: {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
  staggerChildren: {
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  },
}

export type MotionPreset = keyof typeof motionPresets

interface MotionWrapperProps {
  children: ReactNode
  preset?: MotionPreset
  delay?: number
  className?: string
  as?: keyof typeof motion
}

/**
 * MotionWrapper - Reusable animation wrapper with performance-optimized presets
 *
 * @example
 * <MotionWrapper preset="fadeInUp">
 *   <Card>Content</Card>
 * </MotionWrapper>
 *
 * @example with delay
 * <MotionWrapper preset="scaleIn" delay={0.1}>
 *   <Badge>New</Badge>
 * </MotionWrapper>
 */
export function MotionWrapper({
  children,
  preset = 'fadeIn',
  delay = 0,
  className,
  as = 'div',
}: MotionWrapperProps) {
  const Component = motion[as] as any
  const presetConfig = motionPresets[preset]

  return (
    <Component
      {...presetConfig}
      transition={{ ...presetConfig.transition, delay }}
      className={className}
    >
      {children}
    </Component>
  )
}

/**
 * Stagger container for list items with sequential animations
 */
export function MotionStagger({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={motionPresets.staggerChildren}
      initial="initial"
      animate="animate"
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Hover scale effect for interactive cards
 */
export function MotionCard({
  children,
  className,
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.01, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.99 }}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}
