import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/**
 * Wrapper do expo-secure-store com fallback web.
 * SecureStore só funciona em iOS/Android. Na web cai pra localStorage.
 */
export const secureStore = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return typeof window !== "undefined"
        ? window.localStorage.getItem(key)
        : null;
    }
    return SecureStore.getItemAsync(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") window.localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") window.localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};
