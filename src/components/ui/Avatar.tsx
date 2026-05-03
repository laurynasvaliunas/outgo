import { Image, StyleSheet, Text, View } from "react-native";
import { colors } from "@/lib/theme";

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
      .toUpperCase() || "OC";

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
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary
  },
  initials: {
    color: colors.primaryDark,
    fontWeight: "800",
    letterSpacing: 0
  }
});
