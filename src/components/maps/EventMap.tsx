import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Mapbox from "@rnmapbox/maps";
import { categoryMeta } from "@/lib/categories";
import { GLOBAL_MAP_CENTER, type Coordinates } from "@/lib/distance";
import { isMapboxConfigured, mapboxAccessToken } from "@/lib/mapbox";
import { colors, fontFamilies, radii, shadows, spacing, textStyles } from "@/lib/theme";
import type { EventWithMeta } from "@/types/domain";

type EventMapProps = {
  events: EventWithMeta[];
  center: Coordinates;
  hasDeviceOrigin: boolean;
  onEventPress: (event: EventWithMeta) => void;
};

const FALLBACK_WORLD_ZOOM = 1.2;
const NEARBY_ZOOM = 11.4;

if (isMapboxConfigured) {
  void Mapbox.setAccessToken(mapboxAccessToken);
}

export function EventMap({
  events,
  center,
  hasDeviceOrigin,
  onEventPress
}: EventMapProps) {
  useEffect(() => {
    if (isMapboxConfigured) {
      void Mapbox.setAccessToken(mapboxAccessToken);
    }
  }, []);

  if (!isMapboxConfigured) {
    return (
      <View style={styles.unavailable}>
        <Text style={styles.unavailableTitle}>Mapbox token missing</Text>
        <Text style={styles.unavailableText}>
          Add EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN to local and EAS environments.
        </Text>
      </View>
    );
  }

  const mapCenter = events.length > 0 && !hasDeviceOrigin ? getEventCenter(events) : center;

  return (
    <Mapbox.MapView
      style={styles.map}
      styleURL={Mapbox.StyleURL.Outdoors}
      compassEnabled
      logoEnabled
      attributionEnabled
      scaleBarEnabled={false}
    >
      <Mapbox.Camera
        animationDuration={0}
        centerCoordinate={[mapCenter.longitude, mapCenter.latitude]}
        zoomLevel={hasDeviceOrigin ? NEARBY_ZOOM : FALLBACK_WORLD_ZOOM}
      />
      {hasDeviceOrigin ? <Mapbox.LocationPuck visible pulsing={{ isEnabled: true }} /> : null}
      {events.map((event) => (
        <Mapbox.MarkerView
          key={event.id}
          coordinate={[event.longitude, event.latitude]}
          anchor={{ x: 0.5, y: 1 }}
          allowOverlap
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open ${event.title}`}
            onPress={() => onEventPress(event)}
            style={({ pressed }) => [
              styles.markerWrapper,
              pressed && styles.markerPressed
            ]}
          >
            <View
              style={[
                styles.marker,
                { borderColor: categoryMeta[event.category].color }
              ]}
            >
              <Text style={styles.markerEmoji}>{categoryMeta[event.category].emoji}</Text>
            </View>
          </Pressable>
        </Mapbox.MarkerView>
      ))}
    </Mapbox.MapView>
  );
}

function getEventCenter(events: EventWithMeta[]): Coordinates {
  if (events.length === 0) {
    return GLOBAL_MAP_CENTER;
  }

  const totals = events.reduce(
    (accumulator, event) => ({
      latitude: accumulator.latitude + event.latitude,
      longitude: accumulator.longitude + event.longitude
    }),
    { latitude: 0, longitude: 0 }
  );

  return {
    latitude: totals.latitude / events.length,
    longitude: totals.longitude / events.length
  };
}

const styles = StyleSheet.create({
  map: {
    flex: 1
  },
  unavailable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.xl,
    backgroundColor: colors.surfaceMuted
  },
  unavailableTitle: {
    ...textStyles.body,
    fontFamily: fontFamilies.extraBold,
    color: colors.text,
    textAlign: "center"
  },
  unavailableText: {
    ...textStyles.small,
    color: colors.textMuted,
    textAlign: "center",
  },
  markerWrapper: {
    alignItems: "center",
    ...shadows.pin
  },
  markerPressed: {
    opacity: 0.86
  },
  marker: {
    width: 38,
    height: 38,
    borderRadius: radii.xl,
    borderBottomLeftRadius: radii.sm,
    backgroundColor: colors.white,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-45deg" }]
  },
  markerEmoji: {
    fontSize: 15,
    lineHeight: 18,
    transform: [{ rotate: "45deg" }]
  }
});
