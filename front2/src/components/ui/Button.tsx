import * as Haptics from "expo-haptics";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
  fullWidth?: boolean;
  haptic?: boolean;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  loading,
  disabled,
  testID,
  fullWidth = true,
  haptic = true,
}: ButtonProps) {
  const inativo = disabled || loading;

  const handle = () => {
    if (inativo) return;
    if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const base = "rounded px-4 py-3 items-center justify-center flex-row gap-2";
  const stretch = fullWidth ? "w-full" : "self-start";
  const styles: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary: "bg-accent active:bg-accent-hover",
    secondary: "bg-bg-elev border border-border active:border-border-strong",
    danger: "bg-danger active:opacity-90",
    ghost: "bg-transparent active:bg-bg-elev",
  };

  const textStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary: "text-white",
    secondary: "text-text",
    danger: "text-white",
    ghost: "text-text-dim",
  };

  return (
    <Pressable
      testID={testID}
      onPress={handle}
      disabled={inativo}
      className={`${base} ${stretch} ${styles[variant]} ${inativo ? "opacity-60" : ""}`}
    >
      {loading ? (
        <View className="flex-row items-center gap-2">
          <ActivityIndicator size="small" color="#fff" />
          <Text className={`text-sm font-medium ${textStyles[variant]}`}>
            {label}
          </Text>
        </View>
      ) : (
        <Text className={`text-sm font-medium ${textStyles[variant]}`}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
