import { cn } from "@/libs/utils";
import { Button, Text } from "@/components/ui";
import Image from "next/image";
import {
  RecommendedMcp,
  RecommendWorkflowData,
} from "@/libs/services/external-api";
import Link from "next/link";
import { containerVariants } from "./constant";
import { motion } from "motion/react";

export const WorkflowStep = ({
  step,
  isActive,
}: {
  step: number;
  isActive: boolean;
}) => {
  return (
    <div
      className={cn(
        "w-9 h-9 flex-shrink-0",
        "rounded-full",
        "flex items-center justify-center",
        "group",
        "border border-dark-600",
        "bg-dark-800",
        "mt-4.5",
        isActive && "bg-light"
      )}
    >
      <Text
        variant="md"
        weight="medium"
        className={cn("text-light", isActive && "text-darkest-bg")}
      >
        {step}
      </Text>
    </div>
  );
};

export const WorkflowItem = ({ mcp }: { mcp: RecommendedMcp }) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        "bg-dark-900",
        "border border-dark-600 rounded-xl",
        "p-5",
        "w-full"
      )}
    >
      <div className="flex justify-between items-center w-full">
        <div className="flex gap-2">
          <Image
            src={mcp.imageUrl}
            alt="image"
            width={24}
            height={24}
            className="rounded-full"
          />
          <Text variant="md" weight="medium" className="text-light">
            {mcp.name}
          </Text>
        </div>
        <Link href={mcp.githubUrl} target="_blank">
          <Image
            src="/assets/images/github-icon.png"
            alt="github-icon"
            width={24}
            height={24}
          />
        </Link>
      </div>
      <Text variant="small" className="text-grey-300 md:max-w[344px]">
        {mcp.description}
      </Text>
      <div className="flex gap-4">
        <div
          className={cn(
            "bg-[#3B3117]",
            "px-3 py-2",
            "rounded-full border border-dark-600"
          )}
        >
          <Text variant="small" className="text-[#D7AF36] text-center">
            {mcp.category}
          </Text>
        </div>
        <div
          className={cn(
            "bg-dark-600",
            "px-3 py-2",
            "rounded-full border border-dark-600"
          )}
        >
          <Text variant="small" className="text-grey-300">
            {mcp.authRequired ? "Auth Required" : "No Auth Required"}
          </Text>
        </div>
      </div>
    </div>
  );
};

export type SuggestedMcpWorkflowProps = {
  onContinue: () => void;
  isPending: boolean;
  isDisabled: boolean;
  mcps: RecommendedMcp[];
};

export const SuggestedMcpWorkflow = ({
  onContinue,
  isPending,
  isDisabled,
  mcps,
}: SuggestedMcpWorkflowProps) => {
  const mcpList = mcps;
  const isMcpEmpty = mcpList.length === 0;
  return (
    <motion.div
      key="mcp-workflow"
      className={cn(
        "w-full",
        "rounded-3xl",
        "p-4 md:p-6",

        "bg-[#0101014D]",
        "border border-light/15"
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <div
        className={cn(
          "py-4.5 px-4",
          "flex items-center justify-between gap-4.5"
        )}
      >
        <Text variant="xl" weight="medium" className="text-light">
          Suggested MCP Workflow
        </Text>
      </div>
      <div className="flex gap-5">
        <div className="flex flex-col w-full gap-4">
          {isMcpEmpty ? (
            <div className="flex items-center justify-center py-8">
              <Text className="text-grey-300 text-center">
                Based on the task description, no suitable MCP tools were found
                to complete this task.
              </Text>
            </div>
          ) : (
            mcpList.map((mcp, index) => (
              <div className="flex gap-5" key={mcp.name}>
                <WorkflowStep step={index + 1} isActive={true} />
                <WorkflowItem mcp={mcp} />
              </div>
            ))
          )}
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <Button
          variant="light"
          onClick={onContinue}
          className="uppercase"
          disabled={isPending || isMcpEmpty || isDisabled}
        >
          {isPending ? "Confirming..." : "Confirm Workflow"}
        </Button>
      </div>
    </motion.div>
  );
};
