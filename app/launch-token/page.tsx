"use client";

import { Instruction } from "@/components/launch-token/1-instruction";
import { ChooseTokenType } from "@/components/launch-token/2-choose-token-type";
import { WorldAgent } from "@/components/launch-token/3-1-world-agent";
import { CreateAgentPage } from "@/components/launch-token/3-2-create-agent";
import { ChooseFundraisingType } from "@/components/launch-token/3-choose-fundraising-type";
import { SubmitWorld } from "@/components/launch-token/4-submit-world";
import { SubmitWorldBondingCurve } from "@/components/launch-token/6-submit-world-bonding-curve";
import { useLaunchTokenForm } from "@/components/launch-token/form/form-context";
import { ConnectWalletWarningDialog } from "@/components/connect-wallet-warning-dialog";
import { Text } from "@/components/ui";
import { useAuthStore } from "@/libs/stores";
import { clearAgentPersistence } from "@/libs/stores/agent-persistence.store";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Suspense, useEffect } from "react";

const VALID_TOKEN_TYPES = [
  "world-idea",
  "world-agent",
  "utility-agent",
] as const;
type ValidTokenType = (typeof VALID_TOKEN_TYPES)[number];

function LaunchTokenPageComponent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const step = searchParams.get("step")
    ? (searchParams.get("step") as string)
    : "";
  const tokenTypeParam = searchParams.get("tokenType");
  const tokenType = VALID_TOKEN_TYPES.includes(tokenTypeParam as ValidTokenType)
    ? (tokenTypeParam as ValidTokenType)
    : undefined;

  const { setFormData } = useLaunchTokenForm();

  useEffect(() => {
    if (!tokenType) {
      return;
    }

    setFormData((prev) =>
      prev.type === tokenType ? prev : { ...prev, type: tokenType }
    );
  }, [tokenType, setFormData]);

  useEffect(() => {
    if (step === "world-agent" || step === "utility-agent") {
      clearAgentPersistence();
      setFormData((prev) => ({
        ...prev,
        agentId: undefined,
        agentName: undefined,
        agentImgUrl: undefined,
        agentDescription: undefined,
        taskDescription: undefined,
        image:
          prev.agentImgUrl && prev.image.data === prev.agentImgUrl
            ? { data: "", metadata: { size: 0, name: "" } }
            : prev.image,
      }));
    }

    if (!step || step === "token-type") {
      clearAgentPersistence();
    }

    return () => {
      if (pathname !== "/launch-token") {
        clearAgentPersistence();
      }
    };
  }, [step, pathname, setFormData]);

  const jwt = useAuthStore((state) => state.jwt);

  const renderStep = () => {
    switch (step) {
      case "token-type":
        return <ChooseTokenType />;
      case "fundraising-type":
        return <ChooseFundraisingType />;
      case "world-agent":
        return <WorldAgent />;
      case "utility-agent":
        return <CreateAgentPage />;
      case "submit-world-fixed-price":
        return <SubmitWorld />;
      case "submit-world-bonding-curve":
        return <SubmitWorldBondingCurve />;
      default:
        return <Instruction />;
    }
  };

  if (!jwt && step) {
    return <ConnectWalletWarningDialog isOpen={true} />;
  }

  return <>{renderStep()}</>;
}

export default function LaunchTokenPage() {
  return (
    <Suspense fallback={<Text>Loading...</Text>}>
      <LaunchTokenPageComponent />
    </Suspense>
  );
}
