import { SuggestedMcpWorkflow } from "./suggested-mcp-workflow";
import { useState } from "react";
import { useRecommendWorkflow } from "@/libs/hooks/use-recommend-workflow";
import { RecommendWorkflowData } from "@/libs/services/external-api";
import { useCreateAgentFromMcps } from "@/libs/hooks/use-create-agent-from-mcps";
import { cn } from "@/libs/utils";
import { useLaunchTokenForm } from "../form/form-context";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "motion/react";
import { ConfirmTokenCreationDialog } from "../../confirm-token-creation-dialog";
import { CreateAgentForm } from "./create-agent-form";

export const CreateAgentPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formData, setFormData } = useLaunchTokenForm();
  const [mcpData, setMcpData] = useState<RecommendWorkflowData | null>(null);
  const [formState, setFormState] = useState({
    isValid: false,
    hasUnsavedChanges: false,
  });
  const { mutate: generateMcpWorkflow, isPending: isGeneratingMcpWorkflow } =
    useRecommendWorkflow({
      onSuccess: (data) => {
        setMcpData(data);
      },
    });
  const [isOpenConfirmTokenCreation, setIsOpenConfirmTokenCreation] =
    useState(false);
  const handleContinue = () => {
    // const tokenType = searchParams.get("tokenType");
    // router.push(`/launch-token?step=fundraising-type&tokenType=${tokenType}`);
    setIsOpenConfirmTokenCreation(true);
  };

  const { mutate: createAgentFromMcps, isPending: isCreatingAgent } =
    useCreateAgentFromMcps({
      onContinue: handleContinue,
      onAgentCreated: (agent) =>
        setFormData((prev) => ({
          ...prev,
          agentId: agent.id,
          agentName: agent.name ?? prev.agentName,
          agentDescription: agent.description ?? prev.agentDescription,
        })),
    });

  const handleClickConfirm = () => {
    createAgentFromMcps({
      name: formData.agentName || "",
      mcpNames: mcpData?.recommendedMCPs.map((mcp) => mcp.name) || [],
      taskContent: formData.taskDescription || "",
    });
  };

  const handleBack = () => {
    const tokenType = searchParams.get("tokenType");
    router.push(`/launch-token?step=fundraising-type&tokenType=${tokenType}`);
  };

  return (
    <div className="w-full px-4 md:px-6">
      <div
        className={cn(
          "mx-auto flex w-full max-w-6xl flex-col gap-5 md:flex-row md:items-start my-6 md:my-0"
        )}
      >
        <CreateAgentForm
          isLoading={isGeneratingMcpWorkflow}
          continueText={isGeneratingMcpWorkflow ? "Generating..." : "Continue"}
          onBack={handleBack}
          onSubmitted={(taskDescription) => {
            generateMcpWorkflow({ content: taskDescription });
          }}
          onValidationChange={(states) => {
            setFormState((prev) => ({ ...prev, ...states }));
          }}
        />
        <AnimatePresence mode="wait">
          {!!mcpData && (
            <SuggestedMcpWorkflow
              onContinue={handleClickConfirm}
              mcps={mcpData?.recommendedMCPs ?? []}
              isPending={isCreatingAgent}
              isDisabled={
                isGeneratingMcpWorkflow ||
                formState.hasUnsavedChanges ||
                !formState.isValid
              }
            />
          )}
        </AnimatePresence>
      </div>
      <ConfirmTokenCreationDialog
        isOpen={isOpenConfirmTokenCreation}
        onClose={() => setIsOpenConfirmTokenCreation(false)}
        submitData={formData}
      />
    </div>
  );
};
