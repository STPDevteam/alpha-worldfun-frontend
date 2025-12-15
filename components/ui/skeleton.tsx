import { cn } from "@/libs/utils/cn"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-[#373C3E66] animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
