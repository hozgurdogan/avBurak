'use client';

// Client component: Framer Motion needs the IntersectionObserver and the
// reduced-motion media query, neither of which exists on the server.

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Index within a group; children stagger by 60ms, capped at 4 steps. */
  index?: number;
  as?: 'div' | 'li' | 'section' | 'article';
};

/**
 * The site's only scroll animation: opacity plus a 10px rise, 440ms, ease-out,
 * no overshoot. It runs once and never repeats.
 *
 * When the visitor has asked for reduced motion the component renders the
 * element with no animation at all - not a faster animation, none. The CSS in
 * globals.css catches plain transitions; this catches Framer Motion, which
 * drives transforms in JavaScript and would otherwise ignore the preference.
 */
export function Reveal({ children, className, index = 0, as = 'div' }: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const MotionTag = motion[as];

  if (prefersReducedMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-64px' }}
      transition={{
        duration: 0.44,
        ease: [0.22, 0.61, 0.36, 1],
        delay: Math.min(index, 4) * 0.06,
      }}
    >
      {children}
    </MotionTag>
  );
}
