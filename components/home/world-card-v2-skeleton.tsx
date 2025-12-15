import { cn } from "@/libs/utils/index";

interface WorldCardV2SkeletonProps {
  className?: string;
}

export function WorldCardV2Skeleton({ className }: WorldCardV2SkeletonProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-end justify-end gap-[7px] self-stretch",
        "bg-[#0B0B0B] border border-[#252525] rounded-[4px] p-4",
        "lg:h-[365px]",
        "animate-pulse",
        className
      )}
    >
      {/* Header Section */}
      <div className="flex flex-row justify-between items-start self-stretch gap-[7px] pb-3">
        {/* Title and Date Skeleton */}
        <div className="flex flex-col justify-center gap-1">
          {/* Title skeleton */}
          <div className="h-[22px] w-32 bg-white/10 rounded" />
          {/* Date skeleton */}
          <div className="h-[16px] w-28 bg-white/10 rounded mt-1" />
        </div>

        {/* Thumbnail Skeleton */}
        <div className="relative overflow-hidden rounded-lg w-[80px] h-[80px] flex-shrink-0 ml-auto bg-white/10" />
      </div>

      {/* Description Skeleton */}
      <div className="self-stretch space-y-2" style={{ minHeight: "2.93em" }}>
        <div className="h-[16px] w-full bg-white/10 rounded" />
        <div className="h-[16px] w-full bg-white/10 rounded" />
        <div className="h-[16px] w-3/4 bg-white/10 rounded" />
      </div>

      {/* Divider */}
      <div className="flex flex-col justify-center self-stretch gap-[10px] py-1 h-[21px]">
        <div className="w-full h-[0.74px] bg-white/10" />
      </div>

      {/* Funding Info Skeleton */}
      <div className="flex flex-row justify-between items-center self-stretch">
        <div className="h-[16px] w-32 bg-white/10 rounded" />
        <div className="h-[16px] w-10 bg-white/10 rounded" />
      </div>

      {/* Progress Bar Skeleton */}
      <div className="self-stretch h-[8px] bg-white/10 rounded-full overflow-hidden">
        <div className="h-full w-0 bg-white/20" />
      </div>

      {/* Status Skeleton */}
      <div className="flex flex-row justify-between items-center self-stretch">
        <div className="h-[16px] w-12 bg-white/10 rounded" />
        <div className="h-[16px] w-20 bg-white/10 rounded" />
      </div>

      {/* Live In Skeleton */}
      <div className="flex flex-row justify-between items-center self-stretch pb-4">
        <div className="h-[16px] w-12 bg-white/10 rounded" />
        <div className="h-[16px] w-24 bg-white/10 rounded" />
      </div>

      {/* View World Button Skeleton */}
      <div className="flex flex-row justify-center items-center self-stretch gap-[10px] p-[10px] bg-white/5 rounded-[2px]">
        <div className="h-[16px] w-20 bg-white/10 rounded" />
      </div>
    </div>
  );
}
