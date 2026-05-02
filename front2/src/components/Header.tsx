import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Text, View } from "react-native";

interface HeaderProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  badge?: string;
  right?: ReactNode;
}

export function Header({ icon, title, badge, right }: HeaderProps) {
  return (
    <View className="flex-row items-center px-4 py-3.5 border-b border-border bg-bg gap-3">
      <Ionicons name={icon} size={14} color="#5e6ad2" />
      <Text className="text-text font-medium text-[13px]">{title}</Text>
      {badge && (
        <View className="px-2 py-0.5 rounded-full bg-bg-elev border border-border">
          <Text className="text-text-dim text-[11px]">{badge}</Text>
        </View>
      )}
      {right && <View className="ml-auto">{right}</View>}
    </View>
  );
}
