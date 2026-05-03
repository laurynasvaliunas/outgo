import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
  View
} from "react-native";
import { colors, radii, spacing, typography } from "@/lib/theme";

type InputProps = TextInputProps & {
  label: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export function Input({
  label,
  error,
  style,
  multiline,
  containerStyle,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[
          styles.input,
          focused && styles.inputFocused,
          multiline && styles.multiline,
          error && styles.inputError,
          style
        ]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs
  },
  label: {
    fontSize: typography.small,
    fontWeight: "900",
    color: colors.text
  },
  input: {
    minHeight: 50,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundElevated,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: typography.body
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface
  },
  multiline: {
    minHeight: 112,
    paddingTop: spacing.md,
    textAlignVertical: "top"
  },
  inputError: {
    borderColor: colors.danger
  },
  error: {
    color: colors.danger,
    fontSize: typography.small
  }
});
