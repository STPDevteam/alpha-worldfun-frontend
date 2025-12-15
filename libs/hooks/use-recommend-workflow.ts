import { useMutation } from "@tanstack/react-query";
import {
  recommendWorkflow,
  RecommendWorkflowData,
  RecommendWorkflowRequest,
  RecommendWorkflowResponse,
} from "@/libs/services/external-api";
import { useAuthStore } from "@/libs/stores";
import { useToast } from "./common";

export const useRecommendWorkflow = ({
  onSuccess,
}: {
  onSuccess: (data: RecommendWorkflowData) => void;
}) => {
  const jwt = useAuthStore((state) => state.jwt);
  const toast = useToast();

  return useMutation({
    mutationFn: async (
      request: RecommendWorkflowRequest
    ): Promise<RecommendWorkflowResponse> => {
      if (!jwt) {
        throw new Error("Please login to recommend workflow");
      }

      const result = await recommendWorkflow(request);
      return result;
    },
    onSuccess(data) {
      onSuccess(data.data);
      toast.toast("success", {
        title: "Workflow recommendation generated successfully",
        description: data.message,
      });
    },
    onError(error) {
      const message = error.message || "Failed to recommend workflow";
      toast.toast("error", {
        title: "Workflow Recommendation Failed",
        description: message,
      });
    },
  });
};
