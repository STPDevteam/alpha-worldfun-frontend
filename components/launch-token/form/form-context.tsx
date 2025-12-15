"use client";

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from "react";
import { FormDataType } from "./form-data-type";
import { getAgentPersistence, saveAgentPersistence } from "@/libs/stores/agent-persistence.store";

type LaunchTokenFormContextType = {
  formData: FormDataType;
  setFormData: Dispatch<SetStateAction<FormDataType>>;
};

const LaunchTokenFormContext = createContext<LaunchTokenFormContextType | undefined>(undefined);

export const LaunchTokenFormProvider = ({ children }: { children: ReactNode }) => {
  // Get persisted agent data on initialization
  const persistedAgent = getAgentPersistence();

  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    symbol: "",
    description: "",
    image: {
      data: persistedAgent.agentImgUrl || "", // Use agent image if available
      metadata: {
        size: 0,
        name: persistedAgent.agentImgUrl ? "Agent Avatar" : "",
      },
    },
    bannerUrl: null,
    // Merge persisted agent data
    ...persistedAgent,
  });

  // Save agent data when it changes
  useEffect(() => {
    // Only save if we have agent data AND we're in the form filling steps
    // Don't save if we're at agent selection step
    const isInFormStep = formData.type === "world-agent" || formData.type === "utility-agent";
    const hasAgentData = formData.agentId || formData.agentName || formData.agentImgUrl;

    if (hasAgentData && isInFormStep) {
      saveAgentPersistence({
        agentId: formData.agentId,
        agentName: formData.agentName,
        agentImgUrl: formData.agentImgUrl,
        agentDescription: formData.agentDescription,
        taskDescription: formData.taskDescription,
        type: formData.type as "world-agent" | "utility-agent" | undefined,
      });
    }
  }, [formData.agentId, formData.agentName, formData.agentImgUrl,
      formData.agentDescription, formData.taskDescription, formData.type]);

  return (
    <LaunchTokenFormContext.Provider value={{ formData, setFormData }}>
      {children}
    </LaunchTokenFormContext.Provider>
  );
};

export const useLaunchTokenForm = () => {
  const context = useContext(LaunchTokenFormContext);
  if (context === undefined) {
    throw new Error("useLaunchTokenForm must be used within a LaunchTokenFormProvider");
  }
  return context;
};
