"use client";

import {
  FormWithLabel,
  ImageUpload,
  InputController,
  TextAreaController,
} from "@/components/common";
import { TrashIcon } from "@/components/icons";
import { Skeleton, Text } from "@/components/ui";
import { useImageFallback, useUploadMedia } from "@/libs/hooks";
import { cn, ensureHttpsProtocol } from "@/libs/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { first, last } from "lodash";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence, Variants } from "motion/react";
import z from "zod";
import { formSubmitWorldSchema } from "./form";
import { FormLayout } from "./form-layout";
import { ConfirmTokenCreationDialog } from "../confirm-token-creation-dialog";
import { ChevronDownIcon } from "lucide-react";
import { DateTime } from "luxon";
import { useLaunchTokenForm } from "./form/form-context";
import { useRouter, useSearchParams } from "next/navigation";
import { DEFAULT_WORLD_IMAGE_SRC } from "@/libs/constants";

export const TITLE_MAP = {
  "world-idea": "Submit A World Idea",
  "world-agent": "Submit A World Agent",
  "utility-agent": "Submit A Utility Agent",
};

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
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

const chevronVariants: Variants = {
  closed: { rotate: 0 },
  open: { rotate: 180 },
};

const imageUploadVariants: Variants = {
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

const trashButtonVariants: Variants = {
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

const DEFAULT_END_DATE = DateTime.now().plus({ days: 7 });

export const SubmitWorld = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formData, setFormData } = useLaunchTokenForm();

  const [openOptional, setOpenOptional] = useState(false);

  const [imageMetadata, setImageMetadata] = useState<{
    size: number;
    name: string;
  } | null>(
    formData.image.metadata.size > 0 || formData.image.metadata.name
      ? {
          size: formData.image.metadata.size,
          name: formData.image.metadata.name,
        }
      : formData.agentImgUrl
      ? {
          size: 0,
          name: "Agent Avatar",
        }
      : null
  );
  const [bannerMetadata, setBannerMetadata] = useState<{
    size: number;
    name: string;
  } | null>(null);
  const { mutateAsync: _uploadFile } = useUploadMedia();

  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isLoadingBanner, setIsLoadingBanner] = useState(false);
  const [isOpenConfirmTokenCreation, setIsOpenConfirmTokenCreation] =
    useState(false);

  const form = useForm<z.infer<typeof formSubmitWorldSchema>>({
    resolver: zodResolver(formSubmitWorldSchema),
    defaultValues: {
      name: formData.name,
      symbol: formData.symbol,
      description: formData.description,
      image: formData.image.data || formData.agentImgUrl || "",
      bannerUrl: formData.bannerUrl || "",
      worldXHandler: formData.worldXHandler,
      onchainProfileLink: formData.onchainProfileLink,
      xUrl: formData.xUrl || "",
      discordUrl: formData.discordUrl || "",
      telegramUrl: formData.telegramUrl || "",
      gitHubUrl: formData.gitHubUrl || "",
      websiteUrl: formData.websiteUrl || "",
    },
    reValidateMode: "onChange",
    mode: "all",
  });

  const {
    control,
    setValue,
    formState: { isSubmitting, isValid },
    setError,
    watch,
    handleSubmit,
    trigger,
  } = form;

  useEffect(() => {
    if (formData.name) {
      trigger("name");
    }
    if (formData.symbol) {
      trigger("symbol");
    }
    if (formData.description) {
      trigger("description");
    }
    if (formData.xUrl) {
      trigger("xUrl");
    }
    if (formData.discordUrl) {
      trigger("discordUrl");
    }
    if (formData.telegramUrl) {
      trigger("telegramUrl");
    }
    if (formData.gitHubUrl) {
      trigger("gitHubUrl");
    }
    if (formData.websiteUrl) {
      trigger("websiteUrl");
    }
  }, [
    trigger,
    formData.name,
    formData.symbol,
    formData.description,
    formData.xUrl,
    formData.discordUrl,
    formData.telegramUrl,
    formData.gitHubUrl,
    formData.websiteUrl,
  ]);

  useEffect(() => {
    if (formData.agentImgUrl) {
      setValue("image", formData.agentImgUrl, {
        shouldValidate: true,
        shouldDirty: false,
      });
      setImageMetadata({
        size: 0,
        name: "Agent Avatar",
      });
    } else if (!formData.image.data) {
      setValue("image", "", {
        shouldValidate: false,
        shouldDirty: false,
      });
      setImageMetadata(null);
    }
  }, [formData.agentImgUrl]);

  const name = watch("name");
  const symbol = watch("symbol");
  const description = watch("description");
  const resetFormImage = (shouldValidate = false) => {
    setImageMetadata(null);
    setValue("image", "", { shouldValidate, shouldDirty: true });
  };

  const handleImageChange = async (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (typeof reader.result === "string") {
          const fileType = file?.name.toLowerCase();
          const validFileTypes = [".svg", ".gif", ".png", ".jpg", ".jpeg"];
          const isValidFileType = validFileTypes.some((type) =>
            fileType?.endsWith(type)
          );
          const isValidFileSize = file?.size && file?.size <= 10 * 1024 * 1024;
          if (!isValidFileType && !isValidFileSize) {
            setError("image", {
              message:
                "Supported formats: JPG, PNG, SVG, GIF. Size limit: 10mb",
            });
            resetFormImage();
            setIsLoadingImage(false);
            return;
          }
          if (!isValidFileType) {
            setError("image", {
              message: "Supported formats: JPG, PNG, SVG, GIF",
            });
            resetFormImage();
            setIsLoadingImage(false);
            return;
          }
          if (!isValidFileSize) {
            setError("image", {
              message: "Size limit: 10mb",
            });
            resetFormImage();
            setIsLoadingImage(false);
            return;
          }
          try {
            const res = await _uploadFile(file);
            setValue("image", res.fileUrl, {
              shouldValidate: true,
              shouldDirty: true,
            });
            setImageMetadata({
              size: file.size / 1024 / 1024,
              name: file.name,
            });
          } catch (error) {
            console.error(error);
            resetFormImage();
          } finally {
            setIsLoadingImage(false);
          }
        }
      };
      reader.readAsDataURL(file);
    } else {
      setIsLoadingImage(false);
    }
  };

  const resetFormBanner = (shouldValidate = false) => {
    setBannerMetadata(null);
    setValue("bannerUrl", "", { shouldValidate, shouldDirty: true });
  };

  const handleBannerChange = async (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (typeof reader.result === "string") {
          const fileType = file?.name.toLowerCase();
          const validFileTypes = [".svg", ".gif", ".png", ".jpg", ".jpeg"];
          const isValidFileType = validFileTypes.some((type) =>
            fileType?.endsWith(type)
          );
          const isValidFileSize = file?.size && file?.size <= 10 * 1024 * 1024;
          if (!isValidFileType && !isValidFileSize) {
            setError("bannerUrl", {
              message:
                "Supported formats: JPG, PNG, SVG, GIF. Size limit: 10mb",
            });
            resetFormBanner();
            setIsLoadingBanner(false);
            return;
          }
          if (!isValidFileType) {
            setError("bannerUrl", {
              message: "Supported formats: JPG, PNG, SVG, GIF",
            });
            resetFormBanner();
            setIsLoadingBanner(false);
            return;
          }
          if (!isValidFileSize) {
            setError("bannerUrl", {
              message: "Size limit: 10mb",
            });
            resetFormBanner();
            setIsLoadingBanner(false);
            return;
          }
          try {
            const res = await _uploadFile(file);
            setValue("bannerUrl", res.fileUrl, {
              shouldValidate: true,
              shouldDirty: true,
            });
            setBannerMetadata({
              size: file.size / 1024 / 1024,
              name: file.name,
            });
          } catch (error) {
            console.error(error);
            resetFormBanner();
          } finally {
            setIsLoadingBanner(false);
          }
        }
      };
      reader.readAsDataURL(file);
    } else {
      setIsLoadingBanner(false);
    }
  };

  const image = watch("image");
  const banner = watch("bannerUrl");
  const {
    imageSrc: tokenPreviewSrc,
    handleError: handleTokenPreviewError,
    isFallback: isTokenPreviewFallback,
  } = useImageFallback(image, DEFAULT_WORLD_IMAGE_SRC, "token image preview");

  const bannerFileName = bannerMetadata?.name ?? "";
  const bannerNameParts = bannerFileName ? bannerFileName.split(".") : [];
  const bannerExtension =
    bannerNameParts.length > 1
      ? bannerNameParts[bannerNameParts.length - 1]
      : undefined;
  const bannerBaseName =
    bannerNameParts.length > 1
      ? bannerNameParts.slice(0, -1).join(".")
      : bannerNameParts[0];
  const onSubmit = (data: z.infer<typeof formSubmitWorldSchema>) => {
    const derivedAgentId =
      formData.type === "world-agent"
        ? formData.agentName?.trim() || undefined
        : formData.type === "utility-agent"
        ? formData.agentId
        : undefined;

    const submitData = {
      ...formData,
      name: data.name.trim(),
      symbol: data.symbol.trim(),
      description: data.description.trim(),
      worldXHandler: data.worldXHandler?.trim(),
      onchainProfileLink: data.onchainProfileLink?.trim(),
      xUrl: data.xUrl?.trim(),
      discordUrl: data.discordUrl?.trim(),
      telegramUrl: data.telegramUrl?.trim(),
      gitHubUrl: data.gitHubUrl?.trim(),
      websiteUrl: ensureHttpsProtocol(data.websiteUrl),
      fundraisingType: "fixed-price" as const,
      image: {
        data: data.image,
        metadata: imageMetadata || { size: 0, name: "" },
      },
      bannerUrl:
        data.bannerUrl && data.bannerUrl.trim().length > 0
          ? data.bannerUrl
          : null,
      agentId: derivedAgentId,
    };
    setFormData(submitData);
    setIsOpenConfirmTokenCreation(true);
  };
  const onBack = () => {
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
    const tokenType = searchParams.get("tokenType");
    router.push(`/launch-token?step=fundraising-type&tokenType=${tokenType}`);
  };

  return (
    <FormLayout
      title={TITLE_MAP[formData.type || "world-idea"]}
      onContinue={handleSubmit(onSubmit)}
      //onContinue={setIsClickedContinue}
      onBack={onBack}
      isDisabledContinue={!isValid || isSubmitting}
    >
      <motion.div
        className="flex flex-col gap-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={itemVariants}
          className={cn(
            "flex flex-col md:flex-row md:items-center gap-3.5",
            "bg-dark-900",
            "border-dark-700 border rounded-xl",
            "p-4",
            "w-full",
            "relative",
            "mt-6"
          )}
        >
          <div className="absolute top-0 left-0 w-full h-full z-10">
            <ImageUpload
              initialImage={image}
              onImageChange={(file) => handleImageChange(file)}
              hasPreview={false}
              hiddenArea
              setIsLoading={setIsLoadingImage}
            />
          </div>

          <motion.div
            className="z-70 w-20 h-20 relative"
            variants={imageUploadVariants}
            initial="idle"
            animate={isLoadingImage ? "loading" : "idle"}
            whileHover="hover"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={image ? "image" : "placeholder"}
                className={cn(
                  "z-50 absolute top-0.5 left-0.5",
                  "flex items-center justify-center",
                  "w-20 h-20"
                )}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                {image && !isLoadingImage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    transition={{
                      duration: 0.4,
                      type: "spring",
                      stiffness: 300,
                    }}
                  >
                    <Image
                      src={tokenPreviewSrc}
                      alt="token image"
                      width={80}
                      height={80}
                      className="aspect-square rounded-lg object-cover"
                      onError={handleTokenPreviewError}
                      unoptimized={isTokenPreviewFallback}
                    />
                  </motion.div>
                )}
                {isLoadingImage && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Skeleton className="w-20 h-20" />
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            <div
              className={cn(
                "z-50 absolute top-0.5 left-0.5",
                "flex items-center justify-center",
                "w-20 h-20",
                image ? "opacity-0" : ""
              )}
            >
              <ImageUpload
                initialImage={image}
                onImageChange={(file) => handleImageChange(file)}
                hasPreview={false}
                setIsLoading={setIsLoadingImage}
              />
            </div>
          </motion.div>

          <div className="flex-1 flex flex-col gap-1.5">
            <motion.div
              className="flex items-center"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <Text
                variant="md"
                weight="medium"
                className="text-light max-w-[200px] truncate"
              >
                {image && !isLoadingImage
                  ? first(imageMetadata?.name?.split("."))
                  : "Token Image"}
              </Text>
              <Text variant="md" weight="medium">
                {image && !isLoadingImage
                  ? `.${last(imageMetadata?.name?.split("."))}`
                  : ""}
              </Text>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <Text variant="small" className="text-grey-300">
                <AnimatePresence mode="wait">
                  {image && !isLoadingImage ? (
                    <motion.span
                      key="size"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {`${(imageMetadata?.size || 0).toFixed(2)}mb`}
                    </motion.span>
                  ) : isLoadingImage ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      Loading...
                    </motion.span>
                  ) : (
                    <motion.span
                      key="placeholder"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      Click to upload or drag and drop file here.
                      <br />
                      File Supported .jpg, .png, .svg, .gif, up to 10Mb
                    </motion.span>
                  )}
                </AnimatePresence>
              </Text>
            </motion.div>
          </div>

          <AnimatePresence>
            {image && (
              <motion.button
                className="cursor-pointer z-20"
                onClick={() => resetFormImage(true)}
                variants={trashButtonVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                whileHover="hover"
                whileTap="tap"
              >
                <TrashIcon className="w-4 h-4.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {form.formState.errors.image && (
          <Text className="text-orange mt-1">
            {form.formState.errors.image.message}
          </Text>
        )}

        {/* Banner Upload Section */}
        <motion.div
          variants={itemVariants}
          className={cn(
            "flex flex-col md:flex-row md:flex-wrap md:items-center gap-3.5",
            "bg-dark-900",
            "border-dark-700 border rounded-xl",
            "p-4",
            "w-full",
            "relative"
          )}
        >
          <div className="relative z-20 flex flex-col gap-1 md:basis-full">
            <Text
              variant="small"
              className="text-[#ededed] tracking-wide"
            >
              Optional
            </Text>
          </div>

          <div className="absolute top-0 left-0 w-full h-full z-10">
            <ImageUpload
              initialImage={banner || ""}
              onImageChange={(file) => handleBannerChange(file)}
              hasPreview={false}
              hiddenArea
              setIsLoading={setIsLoadingBanner}
            />
          </div>

          <motion.div
            className="z-70 w-20 h-20 relative"
            variants={imageUploadVariants}
            initial="idle"
            animate={isLoadingBanner ? "loading" : "idle"}
            whileHover="hover"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={banner ? "banner" : "placeholder"}
                className={cn(
                  "z-50 absolute top-0.5 left-0.5",
                  "flex items-center justify-center",
                  "w-20 h-20"
                )}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                {banner && !isLoadingBanner && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    transition={{
                      duration: 0.4,
                      type: "spring",
                      stiffness: 300,
                    }}
                  >
                    <Image
                      src={banner}
                      alt="token banner"
                      width={80}
                      height={80}
                      className="aspect-square rounded-lg object-cover"
                    />
                  </motion.div>
                )}
                {isLoadingBanner && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Skeleton className="w-20 h-20" />
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            <div
              className={cn(
                "z-50 absolute top-0.5 left-0.5",
                "flex items-center justify-center",
                "w-20 h-20",
                banner ? "opacity-0" : ""
              )}
            >
              <ImageUpload
                initialImage={banner || ""}
                onImageChange={(file) => handleBannerChange(file)}
                hasPreview={false}
                setIsLoading={setIsLoadingBanner}
              />
            </div>
          </motion.div>

          <div className="flex-1 flex flex-col gap-1.5">
            <motion.div
              className="flex items-center"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <Text
                variant="md"
                weight="medium"
                className="text-light max-w-[200px] truncate"
              >
                {banner && !isLoadingBanner
                  ? bannerBaseName || "Token Banner"
                  : "Token Banner"}
              </Text>
              <Text variant="md" weight="medium">
                {banner && !isLoadingBanner && bannerExtension
                  ? `.${bannerExtension}`
                  : ""}
              </Text>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <Text variant="small" className="text-grey-300">
                <AnimatePresence mode="wait">
                  {banner && !isLoadingBanner ? (
                    <motion.span
                      key="size"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {bannerMetadata?.size
                        ? `${bannerMetadata.size.toFixed(2)}mb`
                        : "Ready to display"}
                    </motion.span>
                  ) : isLoadingBanner ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      Loading...
                    </motion.span>
                  ) : (
                    <motion.span
                      key="placeholder"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      Click to upload or drag and drop file here.
                      <br />
                      File Supported .jpg, .png, .svg, .gif, up to 10Mb
                    </motion.span>
                  )}
                </AnimatePresence>
              </Text>
            </motion.div>
          </div>

          <AnimatePresence>
            {banner && (
              <motion.button
                className="cursor-pointer z-20"
                onClick={() => resetFormBanner(true)}
                variants={trashButtonVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                whileHover="hover"
                whileTap="tap"
              >
                <TrashIcon className="w-4 h-4.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {form.formState.errors.bannerUrl && (
          <Text className="text-orange mt-1">
            {form.formState.errors.bannerUrl.message}
          </Text>
        )}

        <motion.div variants={itemVariants}>
          <FormWithLabel label="Token Name" required>
            <InputController
              control={control}
              name="name"
              placeholder="Enter token name"
              maxLength={30}
              append={
                <motion.div
                  key={name?.length || 0}
                  initial={{ scale: 1.1, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Text className="text-grey-300">
                    {(name || "").length}/30
                  </Text>
                </motion.div>
              }
            />
          </FormWithLabel>
        </motion.div>

        <motion.div variants={itemVariants}>
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
                    {(symbol || "").length}/10
                  </Text>
                </motion.div>
              }
            />
          </FormWithLabel>
        </motion.div>

        <motion.div variants={itemVariants}>
          <FormWithLabel label="World Idea Description" required>
            <TextAreaController
              control={control}
              name="description"
              placeholder="Write a short desdription"
              maxLength={300}
              append={
                <motion.div
                  key={description?.length || 0}
                  initial={{ scale: 1.1, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Text className="text-grey-300">
                    {(description || "").length}/300
                  </Text>
                </motion.div>
              }
            />
          </FormWithLabel>
        </motion.div>

        <motion.div variants={itemVariants}>
          <FormWithLabel label="End Date">
            <Text className="text-light">
              Fundraising ends in 7 days:{" "}
              {DEFAULT_END_DATE.toFormat("MM/dd/yyyy")}
            </Text>
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
      <ConfirmTokenCreationDialog
        isOpen={isOpenConfirmTokenCreation}
        onClose={() => setIsOpenConfirmTokenCreation(false)}
        submitData={formData}
      />
    </FormLayout>
  );
};
