import { authApi } from "@/libs/api";

interface RecommendWorkflowRequest {
  content: string;
}

interface RecommendedMcp {
  name: string;
  description: string;
  authRequired: boolean;
  authParams: Record<string, unknown>;
  imageUrl: string;
  githubUrl: string;
  category: string;
}

interface RecommendWorkflowData {
  canBeFulfilled: boolean;
  recommendedMCPs: RecommendedMcp[];
  mcpNames: string[];
  taskContent: string;
}

interface RecommendWorkflowMetadata {
  timestamp: string;
  service: string;
  requestId: string;
}

interface RecommendWorkflowResponse {
  success: boolean;
  message: string;
  data: RecommendWorkflowData;
  metadata: RecommendWorkflowMetadata;
}

interface CreateAgentFromMcpsRequest {
  name: string;
  mcpNames: string[];
  taskContent: string;
}

interface CreatedAgent {
  id: string;
  name: string;
  description: string;
  status: string;
  categories: string[];
  usageCount: number;
  createdAt: string;
  mcpTools: string[];
  relatedQuestions: string[];
}

interface AsyncGeneration {
  inProgress: boolean;
  estimatedCompletionTime: string;
  generatingFields: string[];
}

interface CreateAgentData {
  agent: CreatedAgent;
  asyncGeneration: AsyncGeneration;
}

interface CreateAgentFromMcpsResponse {
  success: boolean;
  message: string;
  data: CreateAgentData;
  metadata: RecommendWorkflowMetadata;
}

const recommendWorkflow = async (
  request: RecommendWorkflowRequest
): Promise<RecommendWorkflowResponse> => {
  const res = await authApi.post<RecommendWorkflowResponse>(
    "/external-api/agents/recommend-workflow",
    request
  );
  return res.data;
};

const createAgentFromMcps = async (
  request: CreateAgentFromMcpsRequest
): Promise<CreateAgentFromMcpsResponse> => {
  const res = await authApi.post<CreateAgentFromMcpsResponse>(
    "/external-api/agents/create-from-mcps",
    request
  );
  return res.data;
};

export { recommendWorkflow, createAgentFromMcps };
export type {
  RecommendWorkflowRequest,
  RecommendWorkflowResponse,
  RecommendWorkflowData,
  RecommendedMcp,
  CreateAgentFromMcpsRequest,
  CreateAgentFromMcpsResponse,
  CreateAgentData,
  CreatedAgent,
  AsyncGeneration,
};
