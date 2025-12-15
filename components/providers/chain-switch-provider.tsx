"use client";

import React from "react";
import { useChainSwitch } from "@/libs/hooks/common";

interface ChainSwitchProviderProps {
  children: React.ReactNode;
}

export const ChainSwitchProvider: React.FC<ChainSwitchProviderProps> = ({
  children,
}) => {
  useChainSwitch();

  return <>{children}</>;
};
