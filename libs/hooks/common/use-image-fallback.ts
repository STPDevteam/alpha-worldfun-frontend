import { useCallback, useEffect, useState } from "react";

import { DEFAULT_WORLD_IMAGE_SRC } from "@/libs/constants";

export const useImageFallback = (
  source?: string | null,
  fallbackSrc: string = DEFAULT_WORLD_IMAGE_SRC,
  label: string = "image"
) => {
  const [currentSrc, setCurrentSrc] = useState<string>(source || "");
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    setCurrentSrc(source || "");
    setIsFallback(false);
  }, [source]);

  const handleError = useCallback(() => {
    if (!isFallback && source) {
      console.warn(
        `Failed to load ${label} from: ${source}. Using fallback image.`
      );
      setCurrentSrc(fallbackSrc);
      setIsFallback(true);
    }
  }, [fallbackSrc, isFallback, label, source]);

  return {
    imageSrc: currentSrc,
    handleError,
    isFallback,
  };
};
