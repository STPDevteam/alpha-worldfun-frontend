"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/libs/utils/cn";
import { SwitchOnIcon } from "./icons/switch-on-icon";
import { SwitchOffIcon } from "./icons/switch-off-icon";

function Switch({
  className,
  checked,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      checked={checked}
      className={cn(
        "peer inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-transparent border border-transparent shadow-sm transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer hover:cursor-pointer",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none flex items-center justify-center"
      >
        {/* Toggle Icons - changes based on state */}
        <div className="relative w-6 h-4 flex items-center justify-center">
          {/* Unchecked State Icon */}
          <div
            className={cn(
              "absolute transition-all duration-200",
              checked ? "opacity-0 scale-75" : "opacity-100 scale-100"
            )}
          >
            <SwitchOffIcon size={24} className="text-[#828B8D]" />
          </div>

          {/* Checked State Icon */}
          <div
            className={cn(
              "absolute transition-all duration-200",
              checked ? "opacity-100 scale-100" : "opacity-0 scale-75"
            )}
          >
            <SwitchOnIcon size={24} className="text-[#828B8D]" />
          </div>
        </div>
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
}

export { Switch };
