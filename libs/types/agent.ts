export type AgentEntity = {
  world : string;
  name: string;
  avatar_url: string;
  created_at: string;
};

export type WorldWithAgentsEntity = {
  world: string;  
  agents: AgentEntity[];
};

export type AgentsByWorldResponseEntity = {
  worlds: WorldWithAgentsEntity[];
  totalAgents: number;
  totalWorlds: number;
};