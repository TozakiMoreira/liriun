import { Redirect } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

import { useAuthStore } from "@/stores/auth";

export default function Index() {
  const { token, hidratado, hidratar } = useAuthStore();

  useEffect(() => {
    if (!hidratado) {
      void hidratar();
    }
  }, [hidratado, hidratar]);

  if (!hidratado) {
    return (
      <View className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator color="#5e6ad2" />
      </View>
    );
  }

  return <Redirect href={token ? "/captura" : "/login"} />;
}
