"use client";

import React from "react";

export type DecorativeBarsProps = {
  className?: string;
};

export function DecorativeBars({ className }: DecorativeBarsProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className ?? ""}`}>
      <div className="absolute inset-x-2 top-2 flex justify-between">
        <span className="block w-0.5 h-1 bg-gray-200/20" />
        <span className="block w-0.5 h-1 bg-gray-200/20" />
        <span className="block w-0.5 h-1 bg-gray-200/20" />
      </div>
      <div className="absolute inset-x-2 bottom-2 flex justify-between">
        <span className="block w-0.5 h-1 bg-gray-200/20" />
        <span className="block w-0.5 h-1 bg-gray-200/20" />
        <span className="block w-0.5 h-1 bg-gray-200/20" />
      </div>
    </div>
  );
}

export default DecorativeBars;
