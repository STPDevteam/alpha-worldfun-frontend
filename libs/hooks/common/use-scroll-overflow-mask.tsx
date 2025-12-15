"use client"
import { animate, MotionValue, useMotionValue, useMotionValueEvent } from "motion/react"

export function useScrollOverflowMask(scrollXProgress: MotionValue<number>) {
  const maskImage = useMotionValue(`linear-gradient(90deg, #000, #000 0%, #000 85%, #0000)`)

  useMotionValueEvent(scrollXProgress, "change", (value) => {
    if (value === 0) {
      animate(maskImage, `linear-gradient(90deg, #000, #000 0%, #000 85%, #0000)`)
    } else if (value === 1) {
      animate(maskImage, `linear-gradient(90deg, #0000, #000 15%, #000 100%, #000)`)
    } else if (scrollXProgress.getPrevious() === 0 || scrollXProgress.getPrevious() === 1) {
      animate(maskImage, `linear-gradient(90deg, #0000, #000 15%, #000 85%, #0000)`)
    }
  })

  return maskImage
}
