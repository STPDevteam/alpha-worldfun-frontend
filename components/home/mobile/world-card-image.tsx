"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/libs/utils/cn";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface WorldCardImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  pageIndex?: number;
}

export default function WorldCardImage({
  src,
  alt,
  className,
  priority = false,
}: WorldCardImageProps) {
  return (
    <div
      className={cn(
        "w-[138px] rounded-lg overflow-hidden flex-shrink-0",
        className
      )}
    >
      <AspectRatio ratio={1}>
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          className="object-cover"
        />
      </AspectRatio>
    </div>
  );
}
