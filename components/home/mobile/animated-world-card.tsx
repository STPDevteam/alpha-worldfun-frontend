"use client";

import React from "react";
import { motion } from "motion/react";
import type { WorldCard as WorldCardType } from "@/libs/types/world-card";
import WorldCard from "./world-card";
import { useAnimationSettings } from "@/libs/hooks/use-stagger-animation";

interface AnimatedWorldCardProps {
  card: WorldCardType;
  pageIndex: number;
  priority?: boolean;
  className?: string;
  staggerDelay?: number;
}

const ANIMATION_CONFIG = {
  // Main card entrance spring animation
  entrance: {
    initial: {
      opacity: 0,
      y: 10,
      scale: 0.95,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
    transition: {
      duration: 0.25,
      ease: "easeOut" as const,
    },
  },
  // Subtle hover animation
  hover: {
    scale: 1.01,
  },
  // Tap animation for mobile
  tap: {
    scale: 0.98,
  },
};

export default function AnimatedWorldCard({
  card,
  pageIndex,
  priority = false,
  className,
  staggerDelay = 0,
}: AnimatedWorldCardProps) {
  const animationSettings = useAnimationSettings();

  // If animations are disabled, render without motion wrapper
  if (!animationSettings.enabled) {
    return (
      <WorldCard
        card={card}
        priority={priority}
        pageIndex={pageIndex}
        className={className}
      />
    );
  }

  return (
    <motion.div
      initial={ANIMATION_CONFIG.entrance.initial}
      whileInView={ANIMATION_CONFIG.entrance.animate}
      whileHover={ANIMATION_CONFIG.hover}
      whileTap={ANIMATION_CONFIG.tap}
      viewport={animationSettings.viewport}
      transition={{
        ...ANIMATION_CONFIG.entrance.transition,
        delay: staggerDelay,
      }}
      style={{
        willChange: animationSettings.willChange,
        ...animationSettings.style,
      }}
      className={className}
    >
      <WorldCard card={card} priority={priority} pageIndex={pageIndex} />
    </motion.div>
  );
}
