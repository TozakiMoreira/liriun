import { Text, View } from "react-native";

export function Brand({ size = 28 }: { size?: number }) {
  return (
    <View className="flex-row items-center gap-2">
      <View
        className="rounded-md"
        style={{
          width: size,
          height: size,
          backgroundColor: "#5e6ad2",
        }}
      />
      <Text
        className="font-semibold tracking-tight text-text"
        style={{ fontSize: size * 0.7 }}
      >
        Jarvis
      </Text>
    </View>
  );
}
