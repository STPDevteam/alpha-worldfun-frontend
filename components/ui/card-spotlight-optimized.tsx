"use client";

import { useMotionValue, motion, useMotionTemplate } from "motion/react";
import React, { MouseEvent as ReactMouseEvent, useState } from "react";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";
import { cn } from "@/libs/utils/index";
import { useSingleHoverManager } from "@/libs/hooks/use-single-hover-manager";

export interface CardSpotlightOptimizedProps
  extends React.HTMLAttributes<HTMLDivElement> {
  cardId: string;
  radius?: number;
  color?: string;
  canvasColors?: number[][];
  animationSpeed?: number;
  dotSize?: number;
  children: React.ReactNode;
}

export const CardSpotlightOptimized = ({
  cardId,
  children,
  radius = 350,
  color = "#262626",
  canvasColors = [
    [59, 130, 246],
    [139, 92, 246],
  ],
  animationSpeed = 5,
  dotSize = 3,
  className,
  ...props
}: CardSpotlightOptimizedProps) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const { activeCardId, setActiveCard } = useSingleHoverManager();
  const isActiveCard = activeCardId === cardId;
  const [isHovering, setIsHovering] = useState(false);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: ReactMouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const handleMouseEnter = () => {
    setIsHovering(true);
    setActiveCard(cardId);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setActiveCard(null);
  };

  return (
    <div
      className={cn("group/spotlight relative", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* Effect Layer - Isolated stacking context at z-[5] */}
      <div
        className="pointer-events-none absolute z-[5] inset-0"
        style={{ isolation: "isolate" }}
      >
        <motion.div
          className="absolute -inset-px rounded-[4px] opacity-0 transition duration-300 group-hover/spotlight:opacity-100"
          style={{
            backgroundColor: color,
            maskImage: useMotionTemplate`
              radial-gradient(
                ${radius}px circle at ${mouseX}px ${mouseY}px,
                white,
                transparent 80%
              )
            `,
          }}
        >
          {/* LAZY LOAD: Only render WebGL for the active card */}
          {isHovering && isActiveCard && (
            <CanvasRevealEffect
              animationSpeed={animationSpeed}
              containerClassName="bg-transparent absolute inset-0 pointer-events-none"
              colors={canvasColors}
              dotSize={dotSize}
              showGradient={false}
            />
          )}
        </motion.div>
      </div>

      {/* Card content - no wrapper, natural layering */}
      {children}
    </div>
  );
};
