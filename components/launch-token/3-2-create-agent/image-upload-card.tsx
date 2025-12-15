import { AnimatePresence, motion } from "motion/react";
import {
  imageUploadVariants,
  itemVariants,
  trashButtonVariants,
} from "./constant";
import { cn } from "@/libs/utils";
import { ImageUpload } from "@/components/common";
import { StaticImageData } from "next/image";
import Image from "next/image";
import { Skeleton, Text } from "@/components/ui";
import first from "lodash/first";
import last from "lodash/last";
import { TrashIcon } from "@/components/icons";

export interface ImageMetadata {
  size: number;
  name: string;
}

export type ImageUploadCardProps = {
  baseName?: string;
  extension?: string;
  label?: string;
  image?: string | StaticImageData | null;
  isLoading: boolean;
  metadata?: ImageMetadata | null;
  setIsLoading: (v: boolean) => void;
  onImageChange: (file: File | null) => void;
  onDelete: () => void;
  error?: string | null;
  required?: boolean;
};

export const ImageUploadCard = ({
  label,
  image,
  baseName,
  extension,
  required = true,
  isLoading: isLoadingImage,
  setIsLoading: setIsLoadingImage,
  metadata: imageMetadata,
  onImageChange,
  onDelete,
  error,
}: ImageUploadCardProps) => {
  return (
    <>
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
        {!required && (
          <div className="relative z-20 flex flex-col gap-1 md:basis-full">
            <Text variant="small" className="text-[#ededed] tracking-wide">
              Optional
            </Text>
          </div>
        )}

        <div className="absolute top-0 left-0 w-full h-full z-10">
          <ImageUpload
            initialImage={image || ""}
            onImageChange={(file) => onImageChange(file)}
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
                    src={image}
                    alt="label"
                    width={80}
                    height={80}
                    className="aspect-square rounded-lg object-cover"
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
              initialImage={image || ""}
              onImageChange={(file) => onImageChange(file)}
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
                : label}
            </Text>
            {/* <Text variant="md" weight="medium">
              {image && !isLoadingImage && baseName ? `.${baseName}` : ""}
            </Text> */}
            <Text variant="md" weight="medium">
              {image && !isLoadingImage && extension ? `.${extension}` : ""}
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
              onClick={() => onDelete()}
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

      {error && <Text className="text-orange mt-1">{error}</Text>}
    </>
  );
};
