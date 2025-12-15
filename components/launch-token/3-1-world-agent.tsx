import { cn } from "@/libs/utils";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
} from "@/components/ui";
import { useGetWorlds } from "@/libs/hooks/launch-token/use-get-agents";
import { useImageFallback } from "@/libs/hooks";
import { AgentEntity } from "@/libs/types";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Clock4 } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormWithLabel } from "../common";
import { NoAgentFound } from "../icons/no-agent-found";
import { FormLayout } from "./form-layout";
import { useLaunchTokenForm } from "./form/form-context";
import { formWorldAgentSchema } from "./form/form-schema";
import { DEFAULT_WORLD_IMAGE_SRC } from "@/libs/constants";

// Component to handle image loading with fallback
const WorldAgentAvatar = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) => {
  const {
    imageSrc,
    handleError,
    isFallback,
  } = useImageFallback(src, DEFAULT_WORLD_IMAGE_SRC, "avatar");

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={76}
      height={76}
      className={className}
      onError={handleError}
      unoptimized={isFallback} // Use unoptimized for fallback to avoid Next.js image optimization errors
    />
  );
};

const WorldAgentCard = ({
  worldAgent,
  isSelected,
  onSelect,
}: {
  worldAgent: AgentEntity;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  return (
    <div
      className={cn(
        "flex gap-4 items-center",
        "p-3",
        "bg-dark-900",
        "border border-dark-800 rounded-xl",
        "cursor-pointer",
        "hover:bg-dark-600",
        isSelected && "bg-dark-800"
      )}
      onClick={onSelect}
    >
      <WorldAgentAvatar
        src={worldAgent.avatar_url}
        alt={worldAgent.name}
        className="rounded-sm aspect-square flex-shrink-0 object-cover"
      />
      <div className="flex flex-col gap-2">
        <Text weight="medium" className="text-white">
          {worldAgent.name}
        </Text>
        {/* TODO: enable when we have created_at field */}
        {/* <Text variant="small" className="text-grey-200 flex items-center gap-1">
          <Clock4 className="w-4 h-4" />
          {new Date(worldAgent.created_at).toLocaleDateString()}
        </Text> */}
      </div>
    </div>
  );
};

export const WorldAgent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formData, setFormData } = useLaunchTokenForm();
  const [selectedWorld, setSelectedWorld] = useState<string | null>(null);
  const [isContainerReady, setIsContainerReady] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formWorldAgentSchema>>({
    resolver: zodResolver(formWorldAgentSchema),
    defaultValues: {
      agentName: "",
    },
    reValidateMode: "onChange",
    mode: "all",
  });
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { isValid, isSubmitting },
  } = form;
  const agentName = watch("agentName");

  const { data: worldsData } = useGetWorlds();

  const onSubmit = (data: z.infer<typeof formWorldAgentSchema>) => {
    const submitData = {
      ...formData,
      agentName: data.agentName,
      agentId: data.agentName,
      agentImgUrl: worldAgentOptions.find(
        (agent) => agent.name === data.agentName
      )?.avatar_url,
    };
    setFormData(submitData);
    const tokenType = searchParams.get("tokenType");
    router.push(`/launch-token?step=fundraising-type&tokenType=${tokenType}`);
  };
  const onBack = () => {
    setFormData({
      ...formData,
      ...form.getValues(),
      agentId: form.getValues().agentName,
    });
    const tokenType = searchParams.get("tokenType");
    router.push(`/launch-token?step=token-type&tokenType=${tokenType}`);
  };
  const worldOptions =
    worldsData?.worlds.map((w) => ({
      value: w.world,
      label: w.world,
    })) || [];
  const worldAgentOptions: AgentEntity[] = useMemo(() => {
    return (
      worldsData?.worlds.find((w) => w.world === selectedWorld)?.agents || []
    );
  }, [worldsData, selectedWorld]);

  // Virtual list configuration - only create when we have data and selectedWorld
  const virtualizer = useVirtualizer({
    count: selectedWorld ? worldAgentOptions.length : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 108, // Estimated height: 76px image + 16px padding + 12px gap + 4px extra
    gap: 12, // 12px gap between items
    overscan: 5, // Render 5 extra items outside visible area for smoother scrolling
    measureElement:
      typeof window !== "undefined" && window.ResizeObserver
        ? (element) => element?.getBoundingClientRect().height
        : undefined, // Enable dynamic measurement for better accuracy
  });

  // Ensure container is ready before initializing virtualizer
  useEffect(() => {
    if (parentRef.current && selectedWorld) {
      // Check if container has dimensions
      const checkContainer = () => {
        if (parentRef.current) {
          const rect = parentRef.current.getBoundingClientRect();
          if (rect.height > 0) {
            setIsContainerReady(true);
          } else {
            // Retry after a short delay
            setTimeout(checkContainer, 16); // Next frame
          }
        }
      };

      // Use RAF to ensure layout is complete
      requestAnimationFrame(checkContainer);
    } else {
      setIsContainerReady(false);
    }
  }, [selectedWorld]);

  // Force virtualizer to recalculate when data changes
  useEffect(() => {
    if (
      isContainerReady &&
      parentRef.current &&
      selectedWorld &&
      worldAgentOptions.length > 0
    ) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        virtualizer.measure();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isContainerReady, selectedWorld, worldAgentOptions.length, virtualizer]);

  // Handle window resize to recalculate virtualizer
  useEffect(() => {
    if (!isContainerReady) return;

    const handleResize = () => {
      if (parentRef.current) {
        virtualizer.measure();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isContainerReady, virtualizer]);

  return (
    <FormLayout
      title="Select World Agent"
      onContinue={handleSubmit(onSubmit)}
      continueText={"Continue"}
      onBack={onBack}
      isDisabledContinue={!isValid || isSubmitting}
    >
      <div className="flex flex-col gap-5">
        <Select value={selectedWorld || ""} onValueChange={setSelectedWorld}>
          <SelectTrigger className="w-full text-grey-300">
            <SelectValue placeholder={"Select World"} />
          </SelectTrigger>
          <SelectContent>
            {worldOptions.map((agent) => (
              <SelectItem key={agent.value} value={agent.value}>
                {agent.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!selectedWorld && (
          <div className="rounded-xl border border-dark-800 bg-dark-900/80 px-5 py-6 flex flex-col gap-3">
            <Text weight="medium" className="text-white">
              Choose a world to browse agents
            </Text>
            <Text className="text-grey-200">
              The worlds available to you live in the picker above. Pick one to
              see its roster of agents and continue setting up your launch.
            </Text>
          </div>
        )}
        {selectedWorld && (
          <FormWithLabel label="World Agent List">
            {worldAgentOptions.length > 0 ? (
              <div
                ref={parentRef}
                className="overflow-y-auto"
                style={{
                  height: "50vh",
                  contain: "strict",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {!isContainerReady ? (
                  <div className="flex items-center justify-center h-full">
                    <Text className="text-grey-200">Loading...</Text>
                  </div>
                ) : (
                  <div
                    style={{
                      height: `${virtualizer.getTotalSize()}px`,
                      width: "100%",
                      position: "relative",
                    }}
                  >
                    {virtualizer.getVirtualItems().map((virtualItem) => {
                      const agent = worldAgentOptions[virtualItem.index];
                      return (
                        <div
                          key={`${agent.world}-${agent.name}`}
                          data-index={virtualItem.index}
                          ref={virtualizer.measureElement}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: `${virtualItem.size}px`,
                            transform: `translateY(${virtualItem.start}px)`,
                          }}
                        >
                          <div className="pb-3">
                            <WorldAgentCard
                              worldAgent={agent}
                              isSelected={agentName === agent.name}
                              onSelect={() =>
                                setValue("agentName", agent.name, {
                                  shouldValidate: true,
                                })
                              }
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="my-8 mx-auto flex flex-col gap-2 items-center">
                <NoAgentFound />
                <Text variant="lg" weight="medium" className="text-light">
                  No Agent Found!
                </Text>
                <Text className="text-grey-200">
                  There are currently no agents in this world!
                </Text>
              </div>
            )}
          </FormWithLabel>
        )}
      </div>
    </FormLayout>
  );
};
