/**
 * External links and URLs used throughout the application
 */

export const LINKS = {
  // Social Media
  X_TWITTER: "https://x.com/awenetwork_ai",

  // Documentation
  AI_SHARK_TANK_PRIMER: "https://docs.awenetwork.ai/",

  // Terms of Service
  TERMS_OF_SERVICE: "https://www.awenetwork.ai/terms-of-service",

  // Discover Worlds
  DISCOVER_WORLDS: "https://world.fun/discover",
} as const;

export type LinkKey = keyof typeof LINKS;
