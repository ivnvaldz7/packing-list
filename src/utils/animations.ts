import type { Variants, Transition } from 'framer-motion';

/* ══════════════════════════════════════════════════
   Custom easings — Emil Kovalsky / impecable_design
   ══════════════════════════════════════════════════ */

export const ease = {
  /** Smooth deceleration — for enter animations */
  out: [0.16, 1, 0.3, 1] as const,
  /** Gentle acceleration — for exit animations */
  in: [0.4, 0, 1, 1] as const,
  /** Symmetric — for hovers, micro-interactions */
  inOut: [0.65, 0, 0.35, 1] as const,
  /** Spring-like without overshoot — for elements entering */
  spring: { type: 'spring' as const, stiffness: 300, damping: 30 },
  /** Soft bounce — for badges, counters */
  bounce: { type: 'spring' as const, stiffness: 400, damping: 15 },
};

/* ══════════════════════════════════════════════════
   Shared transitions
   ══════════════════════════════════════════════════ */

export const fastTransition: Transition = {
  duration: 0.15,
  ease: ease.inOut,
};

export const normalTransition: Transition = {
  duration: 0.25,
  ease: ease.out,
};

export const slowTransition: Transition = {
  duration: 0.35,
  ease: ease.out,
};

/* ══════════════════════════════════════════════════
   Variants
   ══════════════════════════════════════════════════ */

/** Page / section enter: fade + slide up */
export const fadeSlideUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: ease.out },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.15, ease: ease.in },
  },
};

/** For views that slide horizontally (stage transitions) */
export const slideHorizontal: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 30 : -30,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: ease.out },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -30 : 30,
    opacity: 0,
    transition: { duration: 0.15, ease: ease.in },
  }),
};

/** Staggered list for pallet cards */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

/** Individual item in a staggered list */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: ease.out },
  },
};

/** Table row / grid item enter */
export const listItem: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, ease: ease.out },
  },
  exit: {
    opacity: 0,
    x: 8,
    transition: { duration: 0.12, ease: ease.in },
  },
};

/** Modal backdrop */
export const backdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

/** Modal panel */
export const modalPanel: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: ease.out },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 5,
    transition: { duration: 0.15, ease: ease.in },
  },
};

/** Accordion content expand/collapse */
export const accordionContent: Variants = {
  collapsed: { height: 0, opacity: 0, overflow: 'hidden' },
  expanded: {
    height: 'auto',
    opacity: 1,
    overflow: 'visible',
    transition: { duration: 0.3, ease: ease.out },
  },
};

/** Badge / counter spring number change */
export const badgePulse: Variants = {
  idle: { scale: 1 },
  pulse: {
    scale: [1, 1.12, 1],
    transition: { duration: 0.35, ease: ease.inOut },
  },
};

/** Empty state entrance */
export const emptyState: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: ease.out, delay: 0.1 },
  },
};
