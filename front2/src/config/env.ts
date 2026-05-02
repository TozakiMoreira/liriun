const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5108";

export const env = {
  apiUrl,
} as const;
