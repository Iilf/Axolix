/**
 * src/lib/utils/cn.ts
 *
 * Class name merge utility — combines clsx (conditional classes) with
 * tailwind-merge (deduplication of conflicting Tailwind classes).
 *
 * Even though Axolix uses CSS variables rather than Tailwind utilities
 * for theming, Tailwind utility classes are still used for layout
 * (flex, grid, gap, padding) where inlining CSS would be verbose.
 *
 * Usage:
 *   cn("base-class", condition && "conditional-class", "another-class")
 *   cn("px-4 py-2", className)  // safe to merge with external className prop
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
