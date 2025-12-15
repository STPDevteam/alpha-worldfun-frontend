"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

interface TabContentAnimatorProps {
  children: React.ReactNode;
  tabKey: string;
  className?: string;
}

export const TabContentAnimator: React.FC<TabContentAnimatorProps> = ({
  children,
  tabKey,
  className = "",
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Reduced animations for accessibility
  const reducedMotionTransition = {
    duration: 0.01, // Nearly instant
    ease: "linear" as const,
  };

  const normalTransition = {
    duration: 0.25,
    ease: [0.32, 0.72, 0, 1] as const,
    opacity: { duration: 0.25 },
    y: { duration: 0.35 },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tabKey}
        initial={
          prefersReducedMotion
            ? { opacity: 1 }
            : {
                opacity: 0,
                y: 10,
              }
        }
        animate={{
          opacity: 1,
          y: 0,
        }}
        exit={
          prefersReducedMotion
            ? { opacity: 1 }
            : {
                opacity: 0,
                y: -5,
              }
        }
        transition={
          prefersReducedMotion ? reducedMotionTransition : normalTransition
        }
        className={className}
        style={{
          willChange: prefersReducedMotion ? "auto" : "opacity, transform",
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
