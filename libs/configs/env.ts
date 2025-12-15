export const env = {
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID ?? '',
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? '',
  enableAgentTokens: process.env.NEXT_PUBLIC_ENABLE_AGENT_TOKENS === 'true',
};
