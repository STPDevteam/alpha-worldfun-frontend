import { useMutation } from "@tanstack/react-query";
import { useUploadMedia } from "../use-upload-media";
import { useState } from "react";

export type UseChangeAgentImageParams = {
  size?: number | null;
  name?: string | null;
  onImageChangedSuccess?: (
    data: { fileUrl: string; fileKey: string },
    file: File
  ) => void;
  onImageChangedError?: (error: Error) => void;
};

export const useChangeAgentImage = ({
  name,
  size,
  onImageChangedError,
  onImageChangedSuccess,
}: UseChangeAgentImageParams) => {
  const initialMetadata = name && size ? { name, size } : null;
  const [imageMetadata, setImageMetadata] = useState<{
    size: number;
    name: string;
  } | null>(initialMetadata);
  const { mutateAsync: _uploadFile } = useUploadMedia();
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const handleOnErrorInternal = (error: Error) => {
    setImageMetadata(null);
    onImageChangedError?.(error);
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
            handleOnErrorInternal(
              new Error(
                "Supported formats: JPG, PNG, SVG, GIF. Size limit: 10mb"
              )
            );
            setIsLoadingImage(false);
            return;
          }
          if (!isValidFileType) {
            handleOnErrorInternal(
              new Error("Supported formats: JPG, PNG, SVG, GIF")
            );
            setIsLoadingImage(false);
            return;
          }
          if (!isValidFileSize) {
            handleOnErrorInternal(new Error("Size limit: 10mb"));
            setIsLoadingImage(false);
            return;
          }
          try {
            const res = await _uploadFile(file);
            setImageMetadata({
              size: file.size / 1024 / 1024,
              name: file.name,
            });
            onImageChangedSuccess?.(res, file);
          } catch (error) {
            handleOnErrorInternal(new Error("Unable to change image"));
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

  const fileName = imageMetadata?.name ?? "";
  const nameParts = fileName ? fileName.split(".") : [];
  const extension =
    nameParts.length > 1 ? nameParts[nameParts.length - 1] : undefined;
  const baseName =
    nameParts.length > 1 ? nameParts.slice(0, -1).join(".") : nameParts[0];

  return {
    baseName,
    fileName,
    nameParts,
    extension,
    imageMetadata,
    setImageMetadata,
    handleImageChange,
    isLoadingImage,
    setIsLoadingImage,
  };
};
