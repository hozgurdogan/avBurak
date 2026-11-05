import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Custom CSS font sizes must not be mistaken for text colors and discarded.
const twMerge = extendTailwindMerge({
  extend: { theme: { text: ['2xs', 'md', 'display', 'display-sm', 'numeral'] } },
});

/**
 * Merges conditional class names and resolves Tailwind conflicts, so a variant
 * prop can override a base class without the two both landing in the DOM.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
