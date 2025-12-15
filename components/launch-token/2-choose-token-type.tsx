import { Text } from "@/components/ui";
import { cn } from "@/libs/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import z from "zod";
import { ArrowTopRight } from "../icons";
import { formTypeSchema } from "./form";
import { useLaunchTokenForm } from "./form/form-context";
import { FormLayout } from "./form-layout";
import { env } from "@/libs/configs/env";
import { GlowingEffect } from "@/components/ui/glowing-effect";

const TokenType = ({
  title,
  description,
  onClick,
  isSelected,
  index,
  isDisabled,
}: {
  title: string;
  description: string;
  onClick?: () => void;
  isSelected?: boolean;
  index: number;
  isDisabled?: boolean;
}) => {
  return (
    <motion.div
      className={cn(
        "flex gap-4",
        "p-3",
        "bg-dark-900",
        "border border-dark-800 rounded-xl",
        "cursor-pointer",
        "relative",
        "hover:bg-dark-600",
        isSelected && "bg-dark-800",
        isDisabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={!isDisabled ? onClick : undefined}
      initial={!isDisabled && { y: 20, opacity: 0 }}
      animate={!isDisabled && { y: 0, opacity: 1 }}
      transition={
        !isDisabled
          ? { delay: index * 0.1, duration: 0.3, ease: "easeOut" }
          : {}
      }
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
    >
      {!isDisabled && (
        <GlowingEffect
          disabled={false}
          proximity={120}
          spread={50}
          blur={0}
          movementDuration={0.3}
          borderWidth={2}
        />
      )}

      <motion.div
        className={cn(
          "absolute top-3.5 right-2.5 hidden",
          isSelected && "block"
        )}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: isSelected ? 1 : 0,
          opacity: isSelected ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <ArrowTopRight />
      </motion.div>

      <div className="flex flex-col gap-3">
        <Text variant="lg" weight="medium" className="text-white">
          {title}
        </Text>
        <Text className="text-grey-300">{description}</Text>
      </div>
    </motion.div>
  );
};
export const ChooseTokenType = () => {
  const router = useRouter();
  const { formData, setFormData } = useLaunchTokenForm();
  const agentTokensEnabled = env.enableAgentTokens;
  // TODO: Remove feature flag gating agent token launch.
  const disabledTokenTypes = agentTokensEnabled
    ? []
    : ["world-agent", "utility-agent"];

  const form = useForm<z.infer<typeof formTypeSchema>>({
    resolver: zodResolver(formTypeSchema),
    defaultValues: {
      type: formData.type,
    },
    reValidateMode: "onChange",
    mode: "onChange",
  });
  const { handleSubmit, watch } = form;
  const onSubmit = (data: z.infer<typeof formTypeSchema>) => {
    if (disabledTokenTypes.includes(data.type)) {
      return;
    }
    setFormData({ ...formData, ...data });
    let nextStep = "fundraising-type";
    switch (data.type) {
      case "world-idea":
        nextStep = "fundraising-type";
        break;
      case "world-agent":
        nextStep = "world-agent";
        break;
      case "utility-agent":
        // nextStep = "utility-agent";
        nextStep = "fundraising-type";
        break;
    }
    router.push(`/launch-token?step=${nextStep}&tokenType=${data.type}`);
  };
  const type = watch("type");
  const isDisabledContinue = !type || disabledTokenTypes.includes(type);

  return (
    <FormLayout
      title="Choose Token Type"
      onContinue={handleSubmit(onSubmit)}
      isDisabledContinue={isDisabledContinue}
      onBack={() => router.push("/launch-token")}
    >
      <div className="flex flex-col gap-4.5 mt-6">
        <TokenType
          title="World Idea"
          description="Tokenize bold concepts for new autonomous worlds. Each token represents a simulation idea waiting to be backed, developed, and launched."
          onClick={() => {
            form.setValue("type", "world-idea");
          }}
          isSelected={type === "world-idea"}
          index={0}
        />
        <TokenType
          title="World Agent"
          description={
            agentTokensEnabled
              ? "Tokenize agents from select active worlds as memes. Collect, trade, and rally around your favorite characters."
              : "Coming soon"
          }
          onClick={() => {
            form.setValue("type", "world-agent");
          }}
          isSelected={
            !disabledTokenTypes.includes("world-agent") &&
            type === "world-agent"
          }
          isDisabled={disabledTokenTypes.includes("world-agent")}
          index={1}
        />
        <TokenType
          title="Utility Agent"
          description={
            agentTokensEnabled
              ? "Tokenize AI utilities built with the AWESOME MCP platform. These are practical agents that provide real services, tools, and functions."
              : "Coming soon"
          }
          onClick={() => {
            form.setValue("type", "utility-agent");
          }}
          isSelected={
            !disabledTokenTypes.includes("utility-agent") &&
            type === "utility-agent"
          }
          isDisabled={disabledTokenTypes.includes("utility-agent")}
          index={2}
        />
      </div>
    </FormLayout>
  );
};
