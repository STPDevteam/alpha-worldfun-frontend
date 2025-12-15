import { StaticImageData } from "next/image";
import React from "react";
import Image from "next/image";
import { cn } from "@/libs/utils";
import { UploadIcon } from "../icons/upload-icon";

export const ImageUpload: React.FC<{
  initialImage: string | StaticImageData;
  onImageChange: (file: File | null) => void;
  hasPreview?: boolean;
  hiddenArea?: boolean;
  setIsLoading: (isLoading: boolean) => void;
}> = ({
  initialImage,
  onImageChange,
  hasPreview = true,
  hiddenArea = false,
  setIsLoading,
}) => {
  const [preview, setPreview] = React.useState<string | null>(
    typeof initialImage === "string" ? initialImage : initialImage.src
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Reset file input when initialImage is cleared
  React.useEffect(() => {
    if (!initialImage || initialImage === "") {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setPreview(null);
    }
  }, [initialImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        onImageChange(file);
        // Reset input value to allow re-uploading the same file
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };
      reader.readAsDataURL(file);
    } else {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        onImageChange(file);
        // Reset input value to allow re-uploading the same file
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };
      reader.readAsDataURL(file);
    } else {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "w-full h-34 flex items-center justify-center relative overflow-hidden",
        hiddenArea ? "h-full" : "z-80 cursor-pointer"
      )}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => {
        if (!hiddenArea) {
          fileInputRef.current?.click();
        }
      }}
    >
      {hasPreview && preview && (
        <Image
          src={preview}
          alt="preview"
          fill
          className="object-cover w-full h-full aspect-square"
        />
      )}
      {!hiddenArea && (
        <div
          className={cn(
            "absolute w-20 h-20",
            "flex items-center justify-center",
            "border border-dashed border-dark-600 rounded-lg"
          )}
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          <UploadIcon
            width={40}
            height={40}
            className="w-10 h-10"
          />
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  );
};
