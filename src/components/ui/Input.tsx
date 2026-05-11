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
import { fontFamilies, radii, spacing, textStyles } from "@/lib/theme";
import { useThemeColors } from "@/hooks/useAppTheme";

type InputProps = TextInputProps & {
  label: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  hideLabel?: boolean;
};

export function Input({
  label,
  error,
  style,
  multiline,
  leftIcon,
  rightIcon,
  containerStyle,
  hideLabel = false,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const colors = useThemeColors();
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {hideLabel ? null : (
        <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      )}
      <View
        style={[
          styles.inputFrame,
          {
            borderColor: error
              ? colors.danger
              : focused
                ? colors.primary500
                : colors.border,
            backgroundColor: focused ? colors.backgroundElevated : colors.surface
          },
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
            { color: colors.text },
            Boolean(leftIcon) && styles.inputWithIcon,
            multiline && styles.multiline,
            style
          ]}
          {...props}
        />
        {rightIcon ? <View style={styles.rightIcon}>{rightIcon}</View> : null}
      </View>
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm
  },
  label: {
    ...textStyles.small,
    fontFamily: fontFamilies.bold
  },
  inputFrame: {
    minHeight: 50,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center"
  },
  input: {
    flex: 1,
    minHeight: 50,
    paddingHorizontal: spacing.ml,
    ...textStyles.body
  },
  inputFocused: {},
  leftIcon: {
    paddingLeft: spacing.ml,
    alignItems: "center",
    justifyContent: "center"
  },
  rightIcon: {
    paddingRight: spacing.ml,
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
  inputError: {},
  error: {
    ...textStyles.small
  }
});
