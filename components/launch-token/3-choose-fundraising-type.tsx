import { Text } from "@/components/ui";
import { cn } from "@/libs/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, Variants } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import z from "zod";
import { formFundraisingTypeSchema } from "./form";
import { useLaunchTokenForm } from "./form/form-context";
import { FormLayout } from "./form-layout";
import { GlowingEffect } from "@/components/ui/glowing-effect";

export const FundraisingType = ({
  title,
  description,
  onClick,
  isSelected,
}: {
  title: string;
  description: string;
  onClick?: () => void;
  isSelected?: boolean;
}) => {
  const itemHover = { scale: 1.02 };

  return (
    <motion.div
      layout
      whileHover={itemHover}
      whileTap={{ scale: 0.995 }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "flex md:flex-row flex-col gap-4",
        "p-3",
        "bg-dark-900",
        "border border-dark-800 rounded-xl",
        "cursor-pointer",
        "relative",
        "hover:bg-dark-600",
        isSelected && "bg-dark-800"
      )}
      onClick={onClick}
    >
      <GlowingEffect
        disabled={false}
        proximity={120}
        spread={50}
        blur={0}
        movementDuration={0.3}
        borderWidth={2}
      />

      <div className="flex-7 flex flex-col gap-3">
        <Text variant="lg" weight="medium" className="text-light">
          {title}
        </Text>
        <Text className="text-grey-300">{description}</Text>
      </div>
    </motion.div>
  );
};

export const ChooseFundraisingType = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formData, setFormData } = useLaunchTokenForm();

  const form = useForm<z.infer<typeof formFundraisingTypeSchema>>({
    resolver: zodResolver(formFundraisingTypeSchema),
    defaultValues: {
      fundraisingType: formData.fundraisingType,
    },
  });
  const { handleSubmit, watch } = form;
  const type = watch("fundraisingType");

  const listVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const childVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.28, ease: "easeOut" },
    },
  };

  const onSubmit = (data: z.infer<typeof formFundraisingTypeSchema>) => {
    setFormData({ ...formData, ...data });
    const tokenType = searchParams.get("tokenType");
    let nextStep = "submit-world-fixed-price";
    if (tokenType === "utility-agent") {
      nextStep = "utility-agent";
    } else {
      switch (data.fundraisingType) {
        case "fixed-price":
          nextStep = "submit-world-fixed-price";
          break;
        case "bonding-curve":
          nextStep = "submit-world-bonding-curve";
          break;
      }
    }
    router.push(
      `/launch-token?step=${nextStep}&tokenType=${tokenType}&fundraisingType=${data.fundraisingType}`
    );
  };
  const onBack = () => {
    const tokenType = searchParams.get("tokenType");
    const noHead = searchParams.get("noHead") === "true";
    if (noHead) {
      router.back();
    } else {
      let backStep = "token-type";
      switch (tokenType) {
        case "world-idea":
          backStep = "token-type";
          break;
        case "world-agent":
          backStep = "world-agent";
          break;
        case "utility-agent":
          backStep = "token-type";
          break;
      }
      router.push(`/launch-token?step=${backStep}&tokenType=${tokenType}`);
    }
  };

  return (
    <FormLayout
      title="Choose Funding Type"
      onContinue={handleSubmit(onSubmit)}
      onBack={onBack}
      isDisabledContinue={!type}
    >
      <motion.div
        className="flex flex-col gap-4.5 mt-6"
        initial="hidden"
        animate="visible"
        variants={listVariants}
      >
        <motion.div variants={childVariants}>
          <FundraisingType
            title="Fixed Price"
            description="Participants can contribute freely at a fixed rate, keeping fundraising simple and transparent."
            onClick={() => {
              form.setValue("fundraisingType", "fixed-price");
            }}
            isSelected={type === "fixed-price"}
          />
        </motion.div>
        <motion.div variants={childVariants}>
          <FundraisingType
            title="Bonding Curve"
            description="Funds are contributed through a dynamic curve where prices rise as more people join."
            onClick={() => {
              form.setValue("fundraisingType", "bonding-curve");
            }}
            isSelected={type === "bonding-curve"}
          />
        </motion.div>
      </motion.div>
    </FormLayout>
  );
};
