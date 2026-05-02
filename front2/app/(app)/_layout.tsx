import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";

import { useAuthStore } from "@/stores/auth";

export default function AppLayout() {
  const { token, hidratado } = useAuthStore();

  if (!hidratado) return null;
  if (!token) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0b0c0e",
          borderTopColor: "#1f2023",
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: "#5e6ad2",
        tabBarInactiveTintColor: "#8a8f98",
        tabBarLabelStyle: { fontSize: 10, fontWeight: "500" },
        sceneStyle: { backgroundColor: "#08090a" },
      }}
    >
      <Tabs.Screen
        name="captura"
        options={{
          title: "Captura",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flash" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tarefas"
        options={{
          title: "Tarefas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="concluidas"
        options={{
          title: "Concluídas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-circle" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="configuracoes"
        options={{
          title: "Ajustes",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size - 2} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
