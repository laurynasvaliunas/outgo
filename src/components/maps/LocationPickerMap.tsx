import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Mapbox from "@rnmapbox/maps";
import { MapPin } from "lucide-react-native";
import { GLOBAL_MAP_CENTER, type Coordinates } from "@/lib/distance";
import { isMapboxConfigured, mapboxAccessToken } from "@/lib/mapbox";
import { useAppTheme } from "@/hooks/useAppTheme";
import { fontFamilies, radii, spacing, textStyles } from "@/lib/theme";

type LocationPickerMapProps = {
  coordinate: Coordinates | null;
  onCoordinateChange: (coordinate: Coordinates) => void;
};

if (isMapboxConfigured) {
  void Mapbox.setAccessToken(mapboxAccessToken);
}

export function LocationPickerMap({
  coordinate,
  onCoordinateChange
}: LocationPickerMapProps) {
  const { colors } = useAppTheme();
  const center = coordinate ?? GLOBAL_MAP_CENTER;

  useEffect(() => {
    if (isMapboxConfigured) {
      void Mapbox.setAccessToken(mapboxAccessToken);
    }
  }, []);

  if (!isMapboxConfigured) {
    return (
      <View style={[styles.unavailable, { backgroundColor: colors.surfaceMuted }]}>
        <Text style={[styles.unavailableTitle, { color: colors.text }]}>Map picker unavailable</Text>
        <Text style={[styles.unavailableText, { color: colors.textMuted }]}>
          Add a Mapbox token to choose a pin directly on the map.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.frame, { borderColor: colors.border }]}>
      <Mapbox.MapView
        style={styles.map}
        styleURL={Mapbox.StyleURL.Outdoors}
        compassEnabled={false}
        logoEnabled={false}
        attributionEnabled={false}
        scaleBarEnabled={false}
        onPress={(feature: { geometry?: { coordinates?: unknown } }) => {
          const coordinates = feature.geometry?.coordinates;
          if (!Array.isArray(coordinates)) {
            return;
          }
          const [longitude, latitude] = coordinates;
          if (typeof latitude !== "number" || typeof longitude !== "number") {
            return;
          }
          onCoordinateChange({ latitude, longitude });
        }}
      >
        <Mapbox.Camera
          animationDuration={250}
          centerCoordinate={[center.longitude, center.latitude]}
          zoomLevel={coordinate ? 13.2 : 1.4}
        />
        {coordinate ? (
          <Mapbox.MarkerView
            coordinate={[coordinate.longitude, coordinate.latitude]}
            anchor={{ x: 0.5, y: 1 }}
          >
            <View style={[styles.pin, { backgroundColor: colors.primary500 }]}>
              <MapPin size={18} color={colors.white} />
            </View>
          </Mapbox.MarkerView>
        ) : null}
      </Mapbox.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    height: 220,
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: "hidden"
  },
  map: {
    flex: 1
  },
  unavailable: {
    minHeight: 150,
    borderRadius: radii.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    padding: spacing.lg
  },
  unavailableTitle: {
    ...textStyles.body,
    fontFamily: fontFamilies.extraBold,
    textAlign: "center"
  },
  unavailableText: {
    ...textStyles.small,
    textAlign: "center"
  },
  pin: {
    width: 38,
    height: 38,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center"
  }
});
