import { TokenType } from "../types/world-card";

export const DEFAULT_WORLD_IMAGE_SRC = "/assets/world-image-3.png";

export const DEFAULT_TOKEN_BANNER_MAP = {
  [TokenType.WORLD_IDEA_TOKEN]: "/assets/images/home/submit-world-idea.png",
  [TokenType.WORLD_AGENT]: "/assets/images/home/submit-world-agent.png",
  [TokenType.UTILITY_AGENT_TOKEN]:
    "/assets/images/home/submit-utility-agent.png",
} as const satisfies Record<TokenType, string>;

export const getDefaultTokenBanner = (
  tokenType: TokenType | undefined
): string => {
  if (!tokenType) {
    return DEFAULT_TOKEN_BANNER_MAP[TokenType.WORLD_IDEA_TOKEN];
  }

  return (
    DEFAULT_TOKEN_BANNER_MAP[tokenType] ??
    DEFAULT_TOKEN_BANNER_MAP[TokenType.WORLD_IDEA_TOKEN]
  );
};
