import {
  FormWithLabel,
  InputController,
  TextAreaController,
} from "@/components/common";
import { Text } from "@/components/ui";
import { useChangeAgentImage } from "@/libs/hooks";
import { cn, ensureHttpsProtocol } from "@/libs/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDownIcon } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { formCreateAgentSchema } from "../form";
import { FormLayout } from "../form-layout";
import { useLaunchTokenForm } from "../form/form-context";
import { itemVariants, chevronVariants, containerVariants } from "./constant";
import { DateTime } from "luxon";
import { ImageUploadCard } from "./image-upload-card";
import { z } from "zod";
import { useSearchParams } from "next/navigation";

export type UtilityAgentFormValues = z.infer<typeof formCreateAgentSchema>;

export type FundraisingType = "bonding-curve" | "fixed-price" | undefined;

export interface CreateAgentFormProps {
  isLoading: boolean;
  onBack: () => void;
  continueText?: string;
  onSubmitted: (taskDescription: string) => void;
  onValidationChange?: (params: {
    isValid: boolean;
    hasUnsavedChanges: boolean;
  }) => void;
}

export const CreateAgentForm = ({
  onBack,
  onSubmitted,
  onValidationChange,
  continueText = "Continue",
  isLoading: isGeneratingMcpWorkflow,
}: CreateAgentFormProps) => {
  const { formData, setFormData } = useLaunchTokenForm();
  const searchParams = useSearchParams();
  const defaultEndDate = useMemo(() => {
    return formData.fundraisingType === "fixed-price"
      ? DateTime.now().plus({ days: 7 }).endOf("day")
      : null;
  }, [formData.fundraisingType]);
  const [openOptional, setOpenOptional] = useState(false);
  const form = useForm<UtilityAgentFormValues>({
    resolver: zodResolver(formCreateAgentSchema),
    defaultValues: {
      agentName: formData.agentName || "",
      agentDescription: formData.agentDescription || "",
      taskDescription: formData.taskDescription || "",
      //
      symbol: formData.symbol,
      image: formData.image.data,
      bannerUrl: formData.bannerUrl || "",
      xUrl: formData.xUrl || "",
      websiteUrl: formData.websiteUrl || "",
      telegramUrl: formData.telegramUrl || "",
      discordUrl: formData.discordUrl || "",
      gitHubUrl: formData.gitHubUrl || "",
    },
    reValidateMode: "onChange",
    mode: "all",
  });
  const {
    control,
    setValue,
    setError,
    handleSubmit,
    formState: { isValid, isSubmitting, isDirty, submitCount },
  } = form;
  const agentName = form.watch("agentName");
  const agentDescription = form.watch("agentDescription");
  const taskDescription = form.watch("taskDescription");
  const symbol = form.watch("symbol");
  const {
    imageMetadata,
    extension: imageExtension,
    baseName: imageBaseName,
    setImageMetadata,
    setIsLoadingImage,
    isLoadingImage,
    handleImageChange,
  } = useChangeAgentImage({
    size: formData.image.metadata.size,
    name: formData.image.metadata.name,
    onImageChangedError: (error) => {
      resetFormImage();
      setError("image", { message: error.message });
    },
    onImageChangedSuccess: (data) => {
      setValue("image", data.fileUrl, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
  });
  const {
    imageMetadata: bannerMetadata,
    setImageMetadata: setBannerMetadata,
    setIsLoadingImage: setIsLoadingBanner,
    isLoadingImage: isLoadingBanner,
    handleImageChange: handleBannerChange,
    extension: bannerExtension,
    baseName: bannerBaseName,
  } = useChangeAgentImage({
    onImageChangedError: (error) => {
      resetFormBanner();
      setError("bannerUrl", { message: error.message });
    },
    onImageChangedSuccess: (data) => {
      setValue("bannerUrl", data.fileUrl, { shouldValidate: true });
    },
  });
  const resetFormImage = (shouldValidate = false) => {
    setImageMetadata(null);
    setValue("image", "", { shouldValidate, shouldDirty: true });
  };
  const resetFormBanner = (shouldValidate = false) => {
    setBannerMetadata(null);
    setValue("bannerUrl", "", { shouldValidate, shouldDirty: true });
  };
  const onSubmit = (data: UtilityAgentFormValues) => {
    const submitData = {
      ...formData,
      agentName: data.agentName.trim(),
      agentDescription: data.agentDescription.trim(),
      taskDescription: data.taskDescription.trim(),
      //
      fundraisingType: formData.fundraisingType,
      name: data.agentName.trim(),
      symbol: data.symbol?.trim(),
      description: data.agentDescription.trim(),
      bannerUrl:
        data.bannerUrl && data.bannerUrl.trim().length > 0
          ? data.bannerUrl
          : null,
      xUrl: data.xUrl?.trim(),
      discordUrl: data.discordUrl?.trim(),
      telegramUrl: data.telegramUrl?.trim(),
      gitHubUrl: data.gitHubUrl?.trim(),
      websiteUrl: ensureHttpsProtocol(data.websiteUrl),
      image: {
        data: data.image,
        metadata: imageMetadata || { size: 0, name: "" },
      },
    };
    setFormData(submitData);
    form.reset(data);
    onSubmitted(data.taskDescription.trim());
  };
  const handleBack = () => {
    const formValues = form.getValues();
    const normalizedWebsiteUrl = ensureHttpsProtocol(formValues.websiteUrl);
    setFormData({
      ...formData,
      ...formValues,
      websiteUrl: normalizedWebsiteUrl,
      image: {
        data: formValues.image,
        metadata: imageMetadata || { size: 0, name: "" },
      },
      bannerUrl:
        formValues.bannerUrl && formValues.bannerUrl.trim().length > 0
          ? formValues.bannerUrl
          : null,
    });
    onBack();
  };
  const handleFundRaisingTypeIfNeeded = useCallback(() => {
    const query = searchParams.get("fundraisingType");
    const fallback = ["bonding-curve", "fixed-price"].includes(query || "")
      ? (query as FundraisingType)
      : undefined;
    const fundraisingType = formData.fundraisingType || fallback;
    if (!!fundraisingType) {
      setFormData({ ...formData, fundraisingType });
    } else {
      onBack();
    }
  }, [searchParams]);
  const characterCounts = useMemo(() => {
    return {
      agentName: agentName?.length || 0,
      agentDescription: agentDescription?.length || 0,
      taskDescription: taskDescription?.length || 0,
      symbol: symbol?.length || 0,
    };
  }, [agentName, agentDescription, taskDescription, symbol]);
  const isDisabled = useMemo(() => {
    return !isValid || isSubmitting || isGeneratingMcpWorkflow;
  }, [isValid, isSubmitting, isGeneratingMcpWorkflow]);
  useEffect(() => {
    onValidationChange?.({
      isValid,
      hasUnsavedChanges: submitCount > 0 && isDirty,
    });
  }, [isValid, isDirty, submitCount]);
  useEffect(() => {
    handleFundRaisingTypeIfNeeded();
  }, []);
  return (
    <FormLayout
      title="Create Agent"
      onContinue={handleSubmit(onSubmit)}
      continueText={continueText}
      onBack={handleBack}
      isDisabledContinue={isDisabled}
      className={cn("mx-auto max-w-[723px]")}
    >
      <motion.div
        className="flex flex-col gap-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <ImageUploadCard
          label="Token Image"
          extension={imageExtension}
          baseName={imageBaseName}
          image={form.watch("image")}
          isLoading={isLoadingImage}
          metadata={imageMetadata}
          onImageChange={handleImageChange}
          onDelete={() => resetFormImage(true)}
          error={form.formState.errors.image?.message}
          setIsLoading={setIsLoadingImage}
        />

        <ImageUploadCard
          label="Token Banner"
          required={false}
          baseName={bannerBaseName}
          extension={bannerExtension}
          image={form.watch("bannerUrl")}
          isLoading={isLoadingBanner}
          metadata={bannerMetadata}
          onImageChange={handleBannerChange}
          onDelete={() => resetFormBanner(true)}
          error={form.formState.errors.bannerUrl?.message}
          setIsLoading={setIsLoadingBanner}
        />

        <div className="flex flex-col sm:flex-row justify-between gap-5">
          <motion.div variants={itemVariants} className="flex-1">
            <FormWithLabel label="Agent/Token Name" required>
              <InputController
                control={control}
                name="agentName"
                placeholder="Enter name"
                maxLength={30}
                append={
                  <motion.div
                    key={agentName?.length || 0}
                    initial={{ scale: 1.1, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Text className="text-grey-300">
                      {characterCounts.agentName}/30
                    </Text>
                  </motion.div>
                }
              />
            </FormWithLabel>
          </motion.div>

          <motion.div variants={itemVariants} className="flex-1">
            <FormWithLabel label="Token Symbol" required>
              <InputController
                control={control}
                name="symbol"
                placeholder="Enter token symbol"
                maxLength={10}
                removeWhitespace={true}
                forceUppercase={true}
                append={
                  <motion.div
                    key={symbol?.length || 0}
                    initial={{ scale: 1.1, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Text className="text-grey-300">
                      {characterCounts.symbol}/10
                    </Text>
                  </motion.div>
                }
              />
            </FormWithLabel>
          </motion.div>
        </div>

        {defaultEndDate && (
          <motion.div variants={itemVariants}>
            <FormWithLabel label="End Date">
              <Text className="text-light">
                Fundraising ends in 7 days:{" "}
                {defaultEndDate.toFormat("MM/dd/yyyy")}
              </Text>
            </FormWithLabel>
          </motion.div>
        )}

        <motion.div variants={itemVariants}>
          <FormWithLabel label="Agent Description" required>
            <TextAreaController
              control={control}
              name="agentDescription"
              placeholder="Write a short description"
              maxLength={300}
              append={
                <motion.div
                  key={agentDescription?.length || 0}
                  initial={{ scale: 1.1, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Text className="text-grey-300">
                    {characterCounts.agentDescription}/300
                  </Text>
                </motion.div>
              }
            />
          </FormWithLabel>
        </motion.div>

        <motion.div variants={itemVariants}>
          <FormWithLabel label="Task Description" required>
            <TextAreaController
              control={control}
              name="taskDescription"
              placeholder="Describe your task for AI (e.g., “summarize trading stats for BTC over the past 24 hours and post a tweet on my X”)"
              maxLength={300}
              append={
                <motion.div
                  key={taskDescription?.length || 0}
                  initial={{ scale: 1.1, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Text className="text-grey-300">
                    {characterCounts.taskDescription}/300
                  </Text>
                </motion.div>
              }
            />
          </FormWithLabel>
        </motion.div>

        <motion.div variants={itemVariants}>
          <FormWithLabel
            label="Optional"
            append={
              <motion.div
                variants={chevronVariants}
                animate={openOptional ? "open" : "closed"}
                transition={{ duration: 0.3 }}
              >
                <ChevronDownIcon
                  className={cn("w-4 h-4", "text-light", "cursor-pointer")}
                />
              </motion.div>
            }
            onClickAppend={() => {
              setOpenOptional(!openOptional);
            }}
          >
            {openOptional && (
              <>
                <FormWithLabel label="Website">
                  <InputController
                    control={control}
                    name="websiteUrl"
                    placeholder="Add URL"
                  />
                </FormWithLabel>
                <FormWithLabel label="X (Twitter)">
                  <InputController
                    control={control}
                    name="xUrl"
                    placeholder="Add URL"
                  />
                </FormWithLabel>
                <FormWithLabel label="Discord">
                  <InputController
                    control={control}
                    name="discordUrl"
                    placeholder="Add URL"
                  />
                </FormWithLabel>
              </>
            )}
          </FormWithLabel>
        </motion.div>
      </motion.div>
    </FormLayout>
  );
};
