import { Redirect, Stack } from "expo-router";

import { useAuthStore } from "@/stores/auth";

export default function AuthLayout() {
  const { token, hidratado } = useAuthStore();

  if (hidratado && token) {
    return <Redirect href="/captura" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#08090a" },
      }}
    />
  );
}
