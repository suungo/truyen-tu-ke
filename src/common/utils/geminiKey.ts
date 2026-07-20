const ENCODED_KEY = "QVEuQWI4Uk42TEpaanBvaWVoem1xZnJrbHd5R3FfV1ZIU3lPVXVJeVc3Z0tYbkFsTlhXVkE=";

export function getDefaultGeminiKey(): string {
  try {
    const envKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    if (envKey) return envKey;
    const localKey = localStorage.getItem("gemini_api_key");
    if (localKey) return localKey;
    return atob(ENCODED_KEY);
  } catch {
    return "";
  }
}
