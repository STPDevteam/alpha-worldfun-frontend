// Simple agent data persistence using sessionStorage
// This ensures agent info survives page reloads but clears when browser closes

export type AgentPersistence = {
  agentId?: string;
  agentName?: string;
  agentImgUrl?: string;
  agentDescription?: string;
  taskDescription?: string;
  type?: "world-agent" | "utility-agent";
  timestamp?: number; // For auto-expiry
};

const STORAGE_KEY = "launch-token-agent";
const EXPIRY_HOURS = 24; // Auto-clear after 24 hours

// Get agent data from sessionStorage
export const getAgentPersistence = (): AgentPersistence => {
  if (typeof window === "undefined") return {};

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return {};

    const data = JSON.parse(stored) as AgentPersistence;

    // Check if data is expired (older than 24 hours)
    if (data.timestamp) {
      const now = Date.now();
      const expiryTime = EXPIRY_HOURS * 60 * 60 * 1000;
      if (now - data.timestamp > expiryTime) {
        sessionStorage.removeItem(STORAGE_KEY);
        return {};
      }
    }

    return data;
  } catch (error) {
    console.error("Error reading agent persistence:", error);
    return {};
  }
};

// Save agent data to sessionStorage
export const saveAgentPersistence = (data: AgentPersistence): void => {
  if (typeof window === "undefined") return;

  try {
    const dataWithTimestamp = {
      ...data,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithTimestamp));
  } catch (error) {
    console.error("Error saving agent persistence:", error);
  }
};

// Clear agent data from sessionStorage
export const clearAgentPersistence = (): void => {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing agent persistence:", error);
  }
};