import { useMutation } from "@tanstack/react-query";
import {
  createAgentFromMcps,
  CreateAgentFromMcpsRequest,
  CreatedAgent,
} from "@/libs/services/external-api";
import { useAuthStore } from "@/libs/stores";
import { useToast } from "./common";

interface UseCreateAgentFromMcpsParams {
  onContinue: () => void;
  onAgentCreated?: (agent: CreatedAgent) => void;
}

export const useCreateAgentFromMcps = ({
  onContinue,
  onAgentCreated,
}: UseCreateAgentFromMcpsParams) => {
  const jwt = useAuthStore((state) => state.jwt);
  const toast = useToast();

  return useMutation({
    mutationFn: async (request: CreateAgentFromMcpsRequest) => {
      if (!jwt) {
        throw new Error("Please login to create agent");
      }

      return await createAgentFromMcps(request);
    },
    onSuccess(data) {
      const createdAgent = data.data.agent;
      onAgentCreated?.(createdAgent);
      toast.toast("success", {
        title: "Agent created successfully",
        description: `Agent "${createdAgent.name}" has been created with ID: ${createdAgent.id}`,
      });
      onContinue();
    },
    onError(error) {
      const message = error.message || "Failed to create agent from MCPs";
      toast.toast("error", {
        title: "Agent Creation Failed",
        description: message,
      });
    },
  });
};
