"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

const EASE_PREMIUM: [number, number, number, number] = [0.22, 1, 0.36, 1];

const CONTENT_IN_S = 0.36;
const CONTENT_EXIT_S = 0.26;

type RouteTransitionShellProps = {
  children: React.ReactNode;
  /** Sinkron dengan GlobalLoader / CMS performance flags. */
  disabled?: boolean;
  className?: string;
};

/**
 * Fade halaman pada pergantian route (App Router). Overlay gelap + intercept navigasi
 * ditangani {@link NavigationTransitionProvider}.
 */
export function RouteTransitionShell({
  children,
  disabled = false,
  className,
}: RouteTransitionShellProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion() === true;
  const skip = disabled || reduceMotion;

  const rootClass = ["relative flex min-h-0 flex-1 flex-col", className].filter(Boolean).join(" ");

  const pageVariants = {
    initial: { opacity: 0.85 },
    animate: {
      opacity: 1,
      transition: { duration: CONTENT_IN_S, ease: EASE_PREMIUM },
    },
    exit: {
      opacity: 0.9,
      transition: { duration: CONTENT_EXIT_S, ease: EASE_PREMIUM },
    },
  } as const;

  return (
    <div className={rootClass}>
      {skip ? (
        <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
      ) : (
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={pathname}
            className="relative flex min-h-0 flex-1 flex-col"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ willChange: "opacity" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
