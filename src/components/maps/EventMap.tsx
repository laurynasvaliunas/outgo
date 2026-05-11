import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Mapbox from "@rnmapbox/maps";
import { categoryMeta } from "@/lib/categories";
import { GLOBAL_MAP_CENTER, type Coordinates } from "@/lib/distance";
import { isMapboxConfigured, mapboxAccessToken } from "@/lib/mapbox";
import { useAppTheme } from "@/hooks/useAppTheme";
import { fontFamilies, radii, spacing, textStyles } from "@/lib/theme";
import type { EventWithMeta } from "@/types/domain";

type EventMapProps = {
  events: EventWithMeta[];
  center: Coordinates;
  hasDeviceOrigin: boolean;
  compassTopInset?: number;
  selectedEventId?: string | null;
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
  compassTopInset = 148,
  selectedEventId,
  onEventPress
}: EventMapProps) {
  const { colors, shadows } = useAppTheme();

  useEffect(() => {
    if (isMapboxConfigured) {
      void Mapbox.setAccessToken(mapboxAccessToken);
    }
  }, []);

  if (!isMapboxConfigured) {
    return (
      <View style={[styles.unavailable, { backgroundColor: colors.surfaceMuted }]}>
        <Text style={[styles.unavailableTitle, { color: colors.text }]}>Mapbox token missing</Text>
        <Text style={[styles.unavailableText, { color: colors.textMuted }]}>
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
      compassPosition={{ top: compassTopInset, right: spacing.lg }}
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
      {events.map((event) => {
        const selected = selectedEventId === event.id;

        return (
          <Mapbox.MarkerView
            key={event.id}
            coordinate={[event.longitude, event.latitude]}
            anchor={{ x: 0.5, y: 1 }}
            allowOverlap
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Select ${event.title}`}
              accessibilityHint="Shows this plan in the map sheet."
              onPress={() => onEventPress(event)}
              style={({ pressed }) => [
                styles.markerWrapper,
                selected && styles.markerWrapperSelected,
                shadows.pin,
                pressed && styles.markerPressed
              ]}
            >
              <View
                style={[
                  styles.marker,
                  {
                    backgroundColor: categoryMeta[event.category].color,
                    borderColor: selected ? colors.white : categoryMeta[event.category].color
                  },
                  selected && styles.markerSelected
                ]}
              >
                <View style={[styles.markerInner, { backgroundColor: `${colors.white}EA` }]}>
                  <Text style={styles.markerEmoji}>{categoryMeta[event.category].emoji}</Text>
                </View>
              </View>
              {selected ? (
                <View style={[styles.markerPulse, { backgroundColor: categoryMeta[event.category].color }]} />
              ) : null}
            </Pressable>
          </Mapbox.MarkerView>
        );
      })}
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
    padding: spacing.xl
  },
  unavailableTitle: {
    ...textStyles.body,
    fontFamily: fontFamilies.extraBold,
    textAlign: "center"
  },
  unavailableText: {
    ...textStyles.small,
    textAlign: "center",
  },
  markerWrapper: {
    alignItems: "center",
    justifyContent: "flex-end"
  },
  markerWrapperSelected: {
    transform: [{ translateY: -4 }]
  },
  markerPressed: {
    opacity: 0.86
  },
  marker: {
    width: 42,
    height: 42,
    borderRadius: radii.xl,
    borderBottomLeftRadius: radii.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-45deg" }]
  },
  markerSelected: {
    borderWidth: 3,
    width: 48,
    height: 48
  },
  markerPulse: {
    width: 18,
    height: 4,
    borderRadius: radii.pill,
    marginTop: spacing.xs,
    opacity: 0.72
  },
  markerInner: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center"
  },
  markerEmoji: {
    fontSize: 15,
    lineHeight: 18,
    transform: [{ rotate: "45deg" }]
  }
});
