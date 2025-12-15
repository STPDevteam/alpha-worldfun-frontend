"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormWithLabel } from "@/components/common/form/form-with-label";
import { InputController } from "@/components/common/form/input-controller";
import { TextAreaController } from "@/components/common/form/text-area-controller";
import { Text } from "@/components/ui";
import { cn } from "@/libs/utils/cn";
import { worldCardService } from "@/libs/services/api/world-card.service";
import { WorldCard } from "@/libs/types/world-card";
import {
  TokenEntity,
  UpdateTokenRequest,
} from "@/libs/schemas/world-card.schema";
import { useToast } from "@/libs/hooks";

// Form validation schema
const updateTokenInfoSchema = z.object({
  description: z
    .string()
    .min(1, { message: "Description is required" })
    .max(300, "Description must be 300 characters or less"),
  xUrl: z
    .string()
    .refine(
      (value) =>
        !value || /^(https?:\/\/)?(x\.com)\/[A-Za-z0-9_-]+\/?$/i.test(value),
      {
        message: "X URL must be a validX URL",
      }
    )
    .optional(),
  discordUrl: z
    .string()
    .refine(
      (value) =>
        !value ||
        /^(https?:\/\/)?(discord\.gg|discord\.com|discordapp\.com)\/[A-Za-z0-9_-]+\/?$/i.test(
          value
        ),
      {
        message: "Discord URL must be a valid Discord URL",
      }
    )
    .optional(),
  websiteUrl: z
    .string()
    .refine(
      (value) =>
        !value ||
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})(\/[\w.-]*)*\/?$/.test(
          value
        ),
      {
        message: "Website URL must be a valid URL",
      }
    )
    .optional(),
});

type UpdateTokenInfoFormData = z.infer<typeof updateTokenInfoSchema>;

interface UpdateTokenInfoFormProps {
  tokenData: WorldCard;
  onSuccess?: (updatedToken: TokenEntity) => void;
  onError?: (error: string) => void;
}

export const UpdateTokenInfoForm = ({
  tokenData,
  onSuccess,
  onError,
}: UpdateTokenInfoFormProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting, isValid },
  } = useForm<UpdateTokenInfoFormData>({
    resolver: zodResolver(updateTokenInfoSchema),
    defaultValues: {
      description: tokenData.description || "",
      xUrl: tokenData.xUrl || "",
      discordUrl: tokenData.discordUrl || "",
      websiteUrl: tokenData.websiteUrl || "",
    },
    mode: "all",
    reValidateMode: "onChange",
  });

  const description = watch("description");
  const characterCount = description?.length || 0;
  const { success: toastSuccess, error: toastError } = useToast();

  const onSubmit = async (data: UpdateTokenInfoFormData) => {
    try {
      setIsUpdating(true);
      setUpdateMessage(null);

      // Only include fields that have values
      const updateData: UpdateTokenRequest = {};
      if (
        data.description !== undefined &&
        data.description !== tokenData.description
      ) {
        updateData.description = data.description;
      }
      if (data.xUrl && data.xUrl !== tokenData.xUrl) {
        updateData.xUrl = data.xUrl;
      }
      if (data.discordUrl && data.discordUrl !== tokenData.discordUrl) {
        updateData.discordUrl = data.discordUrl;
      }
      if (data.websiteUrl && data.websiteUrl !== tokenData.websiteUrl) {
        updateData.websiteUrl = data.websiteUrl;
      }

      // Only proceed if there are changes
      if (Object.keys(updateData).length === 0) {
        setUpdateMessage({
          type: "error",
          text: "No changes detected to save.",
        });
        return;
      }

      const updatedToken = await worldCardService.updateToken(
        tokenData.id,
        updateData
      );

      setUpdateMessage({
        type: "success",
        text: "Token information updated successfully!",
      });

      onSuccess?.(updatedToken);
      toastSuccess({
        title: "Success",
        description: "Token information updated successfully!",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update token information";
      onError?.(errorMessage);
      toastError({
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Description Field */}
      <FormWithLabel label="Description">
        <div className="relative">
          <TextAreaController
            control={control}
            name="description"
            placeholder="Enter project description"
            maxLength={300}
            backgroundColor="bg-[#1A1A1A]"
            height="h-[130px]"
            enableScrollbarStyling={true}
            append={
              <Text
                className="text-[#6E6E6E] text-xs"
                style={{ fontFamily: "DM Mono" }}
              >
                {characterCount}/300
              </Text>
            }
          />
        </div>
      </FormWithLabel>

      {/* Input Fields Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormWithLabel label="Website">
          <InputController
            control={control}
            name="websiteUrl"
            placeholder="Add URL"
            backgroundColor="bg-[#1A1A1A]"
          />
        </FormWithLabel>
        <FormWithLabel label="X (Twitter)">
          <InputController
            control={control}
            name="xUrl"
            placeholder="Add URL"
            backgroundColor="bg-[#1A1A1A]"
          />
        </FormWithLabel>

        <FormWithLabel label="Discord">
          <InputController
            control={control}
            name="discordUrl"
            placeholder="Add URL"
            backgroundColor="bg-[#1A1A1A]"
          />
        </FormWithLabel>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSubmitting || isUpdating || !isValid}
          className={cn(
            "px-4 py-2 rounded-[10px]",
            "bg-[#E0E0E0] text-[#010101]",
            "text-base font-light",
            "hover:bg-[#E0E0E0]/90 transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
            "flex items-center gap-2"
          )}
          style={{ fontFamily: "DM Mono" }}
        >
          {isSubmitting || isUpdating ? "Saving..." : "SAVE CHANGES"}
        </button>
      </div>
    </form>
  );
};
