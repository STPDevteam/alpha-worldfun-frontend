import { api } from "@/libs/api";
import { AgentsByWorldResponseEntity } from "@/libs/types";

export const getWorlds = async (): Promise<AgentsByWorldResponseEntity> => {
  const response = await api.get("/external-api/agents");
  return response.data;
};
