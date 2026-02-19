// src/lib/config.ts
export const appConfig = {
  rateLimit: 2, // Requests per minute
  systemMessage: "", // Global announcement
  isMaintenanceMode: false,
};

export function updateConfig(newConfig: Partial<typeof appConfig>) {
  Object.assign(appConfig, newConfig);
}

export function getConfig() {
  return appConfig;
}
