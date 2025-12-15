import { Variants } from "motion/react";

export const chevronVariants: Variants = {
  closed: { rotate: 0 },
  open: { rotate: 180 },
};

export const trashButtonVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    x: 10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: {
      duration: 0.3,
      type: "spring",
      stiffness: 300,
    },
  },
  hover: {
    scale: 1.1,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 },
  },
};

export const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
    },
  },
};

export const imageUploadVariants: Variants = {
  idle: {
    scale: 1,
    transition: { duration: 0.2 },
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 },
  },
  loading: {
    scale: 1.01,
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatType: "reverse",
    },
  },
};

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};
