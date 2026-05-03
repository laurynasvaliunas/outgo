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
  ...props
}: InputProps) {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline, error && styles.inputError, style]}
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
    fontWeight: "700",
    color: colors.text
  },
  input: {
    minHeight: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: typography.body
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
