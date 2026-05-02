import { forwardRef } from "react";
import {
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  hint?: string;
  errorText?: string;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, hint, errorText, ...rest },
  ref,
) {
  return (
    <View className="gap-1.5 w-full">
      {label && (
        <Text className="text-xs font-medium text-text-dim">{label}</Text>
      )}
      <TextInput
        ref={ref}
        placeholderTextColor="#62666d"
        className={`bg-bg-elev border rounded px-3 py-2.5 text-sm text-text ${
          errorText ? "border-danger" : "border-border"
        }`}
        style={{ fontSize: 14 }}
        {...rest}
      />
      {hint && !errorText && (
        <Text className="text-[11px] text-text-subtle">{hint}</Text>
      )}
      {errorText && (
        <Text className="text-[11px] text-danger">{errorText}</Text>
      )}
    </View>
  );
});
