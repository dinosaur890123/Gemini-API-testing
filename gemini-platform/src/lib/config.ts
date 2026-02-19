// src/lib/config.ts
export const appConfig = {
  rateLimit: 2, // Requests per minute
  systemMessage: "", // Global announcement
  isMaintenanceMode: false,
  activeModel: "gemini-3-flash-preview",
  systemInstruction: "You are a helpful and intelligent AI assistant.",
};

export function updateConfig(newConfig: Partial<typeof appConfig>) {
  Object.assign(appConfig, newConfig);
}

export function getConfig() {
  return appConfig;
}
