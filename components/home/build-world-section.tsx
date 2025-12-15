"use client";

import type { MouseEvent, ReactNode } from "react";
import { motion } from "motion/react";
import { Text } from "@/components/ui";
import { useAnimationSettings } from "@/libs/hooks/use-stagger-animation";
import { cn } from "@/libs/utils";
import Image from "next/image";
import { SubmitWorldIdeaIcon } from "../icons/submit-world-idea-icon";
import { SubmitWorldAgentIcon } from "../icons/submit-world-agent-icon";
import { SubmitUtilityAgentIcon } from "../icons/submit-utility-agent-icon";
import Link from "next/link";
import { DEFAULT_TOKEN_BANNER_MAP } from "@/libs/constants";
import { TokenType } from "@/libs/types";
import { env } from "@/libs/configs/env";

const ANIMATION_CONFIG = {
  entrance: {
    initial: { opacity: 0, y: 10, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.25, ease: "easeOut" as const },
  },
  hover: { scale: 1, y: 3 },
  tap: { scale: 0.98 },
} as const;

const SubmitWorldCard = ({
  icon,
  title,
  description,
  image,
  isDisabled,
  routing,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  image: string;
  isDisabled?: boolean;
  routing: string;
}) => {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (isDisabled) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  return (
    <Link
      href={`/launch-token?step=${routing}`}
      className={cn(
        "flex-1 flex h-full flex-col items-center gap-4",
        "p-2 pb-4",
        "bg-[#121212]",
        "border-[1px] border-[#212121] rounded-sm",
        "cursor-pointer",
        "relative",
        isDisabled && "cursor-not-allowed opacity-50"
      )}
      aria-disabled={isDisabled}
      onClick={handleClick}
    >
      <Image
        src={image}
        width={401}
        height={180}
        alt="submit-world-card"
        className="object-cover w-fit aspect-square md:w-[401px] md:h-[180px] rounded-[4px]"
      />
      <div className="flex items-center gap-2.5 w-full sm:justify-start justify-center">
        <span className="max-sm:hidden">{icon}</span>
        <Text className="text-white sm:text-left text-center">
          <span className="max-sm:hidden">Launch</span>{" "}
          <span className="sm:hidden whitespace-pre-line">
            {title.replace(" ", "\n")}
          </span>
          <span className="max-sm:hidden">{title}</span>
        </Text>
      </div>
      <div className="w-full border-t-[0.5px] border-[#FFFFFF2E] max-lg:hidden" />
      <Text className="text-[#B8B8B8] max-lg:hidden">{description}</Text>
    </Link>
  );
};
export const BuildWorldSection = () => {
  const animationSettings = useAnimationSettings();
  const agentTokensEnabled = env.enableAgentTokens;
  // TODO: Remove feature flag and re-enable agent tokens once launch flow is ready.

  const cards = [
    {
      icon: <SubmitWorldIdeaIcon />,
      title: "World Idea",
      description:
        "Tokenize bold concepts for new autonomous words waiting to be backed, developed and launched.",
      tokenType: TokenType.WORLD_IDEA_TOKEN,
      isDisabled: false,
      routing: "fundraising-type&tokenType=world-idea",
    },
    {
      icon: <SubmitWorldAgentIcon />,
      title: "World Agent",
      description: agentTokensEnabled
        ? "Tokenize agents from select active worlds as memes. Collect, trade, and rally around your favorite characters."
        : "Coming soon",
      tokenType: TokenType.WORLD_AGENT,
      isDisabled: !agentTokensEnabled,
      routing: "world-agent&tokenType=world-agent",
    },
    {
      icon: <SubmitUtilityAgentIcon />,
      title: "Utility Agent",
      description: agentTokensEnabled
        ? "Tokenize AI utilities built with the AWESOME MCP platform. These are practical agents that provide real services, tools, and functions."
        : "Coming soon",
      tokenType: TokenType.UTILITY_AGENT_TOKEN,
      isDisabled: !agentTokensEnabled,
      routing: "fundraising-type&tokenType=utility-agent&noHead=true",
    },
  ] as const;

  return (
    <div className="relative inline-block mt-11.5">
      <div
        className="pointer-events-none absolute rounded-lg"
        style={{
          top: "-4px",
          left: "-4px",
          right: "-4px",
          bottom: "-4px",
          background:
            "linear-gradient(90deg, rgba(236, 102, 0, 0.1488) 0%, rgba(137, 145, 130, 0.1656) 51.92%, rgba(121, 208, 255, 0.1536) 100%)",
          filter: "blur(10px)",
          borderRadius: "0.5rem",
        }}
      />
      <div
        className="relative bg-[#000000] rounded-lg p-4 md:p-6 max-w-[1440px] flex justify-start"
        style={{ zIndex: 0 }}
      >
        <div className="">
          <span className="!font-bdo-grotesk text-lg sm:text-2xl/[34px] font-medium">
            Build Your Permissionless World
          </span>
          <div
            className={cn(
              "flex gap-3 items-stretch",
              "mt-4 md:mt-6 mx-auto",
              "max-w-[1440px]"
            )}
          >
            {cards.map(
              (
                { icon, title, description, tokenType, isDisabled, routing },
                index
              ) => {
                if (!animationSettings.enabled) {
                  return (
                    <div key={title} className="flex flex-1">
                      <SubmitWorldCard
                        icon={icon}
                        title={title}
                        description={description}
                        image={DEFAULT_TOKEN_BANNER_MAP[tokenType]}
                        isDisabled={isDisabled}
                        routing={routing}
                      />
                    </div>
                  );
                }

                const delay = Math.min(index * 0.08, 0.24);

                return (
                  <motion.div
                    key={title}
                    className="flex flex-1"
                    initial={ANIMATION_CONFIG.entrance.initial}
                    whileInView={ANIMATION_CONFIG.entrance.animate}
                    whileHover={
                      !isDisabled ? ANIMATION_CONFIG.hover : undefined
                    }
                    whileTap={!isDisabled ? ANIMATION_CONFIG.tap : undefined}
                    viewport={animationSettings.viewport}
                    transition={{
                      ...ANIMATION_CONFIG.entrance.transition,
                      delay,
                    }}
                    style={{
                      willChange: animationSettings.willChange,
                      ...animationSettings.style,
                    }}
                  >
                    <SubmitWorldCard
                      icon={icon}
                      title={title}
                      description={description}
                      image={DEFAULT_TOKEN_BANNER_MAP[tokenType]}
                      isDisabled={isDisabled}
                      routing={routing}
                    />
                  </motion.div>
                );
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
