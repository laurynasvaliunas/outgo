import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Mapbox from "@rnmapbox/maps";
import { categoryLabels } from "@/lib/categories";
import { GLOBAL_MAP_CENTER, type Coordinates } from "@/lib/distance";
import { isMapboxConfigured, mapboxAccessToken } from "@/lib/mapbox";
import { colors, radii, spacing, typography } from "@/lib/theme";
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
              styles.marker,
              pressed && styles.markerPressed
            ]}
          >
            <Text numberOfLines={1} style={styles.markerLabel}>
              {getMarkerLabel(event)}
            </Text>
            <View style={styles.markerStem} />
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

function getMarkerLabel(event: EventWithMeta) {
  const label = categoryLabels[event.category] ?? "Plan";
  return label.length <= 12 ? label : label.split(" ")[0];
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
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900",
    textAlign: "center"
  },
  unavailableText: {
    color: colors.textMuted,
    fontSize: typography.small,
    textAlign: "center",
    lineHeight: 19
  },
  marker: {
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4
  },
  markerPressed: {
    opacity: 0.86
  },
  markerLabel: {
    maxWidth: 118,
    overflow: "hidden",
    borderRadius: radii.pill,
    backgroundColor: colors.mapPin,
    color: colors.surface,
    borderWidth: 2,
    borderColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  markerStem: {
    width: 10,
    height: 10,
    marginTop: -2,
    borderRadius: 2,
    backgroundColor: colors.mapPin,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.surface,
    transform: [{ rotate: "45deg" }]
  }
});
