import { Image, StyleSheet, Text, View } from "react-native";
import { colors, fontFamilies } from "@/lib/theme";

type AvatarProps = {
  url?: string | null;
  name?: string | null;
  size?: number;
};

export function Avatar({ url, name, size = 44 }: AvatarProps) {
  const initials =
    name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "OG";

  if (url) {
    return (
      <Image
        source={{ uri: url }}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatar,
        styles.fallback,
        { width: size, height: size, borderRadius: size / 2 }
      ]}
    >
      <Text style={[styles.initials, { fontSize: Math.max(12, size * 0.34) }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    overflow: "hidden"
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary500,
    borderWidth: 1,
    borderColor: colors.primary200
  },
  initials: {
    color: colors.white,
    fontFamily: fontFamilies.extraBold,
    letterSpacing: 0
  }
});
