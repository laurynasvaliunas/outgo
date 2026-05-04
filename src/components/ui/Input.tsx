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
import type { ReactNode } from "react";
import { colors, fontFamilies, radii, spacing, textStyles } from "@/lib/theme";

type InputProps = TextInputProps & {
  label: string;
  error?: string;
  leftIcon?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
};

export function Input({
  label,
  error,
  style,
  multiline,
  leftIcon,
  containerStyle,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputFrame,
          focused && styles.inputFocused,
          error && styles.inputError,
          multiline && styles.multilineFrame
        ]}
      >
        {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
        <TextInput
          placeholderTextColor={colors.textSubtle}
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
            Boolean(leftIcon) && styles.inputWithIcon,
            multiline && styles.multiline,
            style
          ]}
          {...props}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm
  },
  label: {
    ...textStyles.small,
    fontFamily: fontFamilies.bold,
    color: colors.textMuted
  },
  inputFrame: {
    minHeight: 50,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center"
  },
  input: {
    flex: 1,
    minHeight: 50,
    paddingHorizontal: spacing.ml,
    color: colors.text,
    ...textStyles.body
  },
  inputFocused: {
    borderColor: colors.primary500,
    backgroundColor: colors.white
  },
  leftIcon: {
    paddingLeft: spacing.ml,
    alignItems: "center",
    justifyContent: "center"
  },
  inputWithIcon: {
    paddingLeft: spacing.sm
  },
  multilineFrame: {
    alignItems: "flex-start"
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
    ...textStyles.small
  }
});
