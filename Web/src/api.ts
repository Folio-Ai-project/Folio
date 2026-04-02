const trimTrailingSlash = (value?: string) => value?.replace(/\/+$/, "") ?? "";

const defaultAppBase = import.meta.env.DEV
  ? ""
  : trimTrailingSlash(import.meta.env.VITE_API_BASE || "http://localhost:5000");

const defaultAiBase = import.meta.env.DEV
  ? ""
  : trimTrailingSlash(import.meta.env.VITE_AI_BASE || "http://localhost:8000");

export const APP_API_BASE = trimTrailingSlash(
  import.meta.env.VITE_API_BASE || defaultAppBase
);
export const AI_API_BASE = trimTrailingSlash(
  import.meta.env.VITE_AI_BASE || defaultAiBase
);

export const PROFILE_STORAGE_KEY = "myPageData";
export const ANALYSIS_STORAGE_KEY = "analysisResult";

export const appApiUrl = (path: string) => `${APP_API_BASE}${path}`;
export const aiApiUrl = (path: string) => `${AI_API_BASE}${path}`;
