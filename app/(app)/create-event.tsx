import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent
} from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import { router } from "expo-router";
import { addDays, addHours, format } from "date-fns";
import { CalendarPlus, Clock, LocateFixed, MapPin, Search } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GradientSurface } from "@/components/ui/GradientSurface";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CategoryPill } from "@/components/events/CategoryPill";
import { HostPreviewCard } from "@/components/events/HostPreviewCard";
import { LocationPickerMap } from "@/components/maps/LocationPickerMap";
import { EVENT_CATEGORIES, type EventCategory, type PriceType } from "@/types/domain";
import { createEvent } from "@/services/supabase/events";
import { searchPlaces, type PlaceSuggestion } from "@/services/mapbox/geocoding";
import { eventSchema } from "@/validation/event";
import { useAuth } from "@/hooks/useAuth";
import { useThemeColors } from "@/hooks/useAppTheme";
import type { Coordinates } from "@/lib/distance";
import { fontFamilies, radii, spacing, textStyles } from "@/lib/theme";
import { track } from "@/lib/analytics";
import { haptic } from "@/lib/haptics";

type PickerState = {
  field: "start" | "end";
  mode: "date" | "time";
};

function mergeDatePart(current: Date, nextDate: Date) {
  const next = new Date(current);
  next.setFullYear(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());
  return next;
}

function mergeTimePart(current: Date, nextTime: Date) {
  const next = new Date(current);
  next.setHours(nextTime.getHours(), nextTime.getMinutes(), 0, 0);
  return next;
}

function coordinateText(coordinate: Coordinates | null) {
  if (!coordinate) {
    return "No map pin selected yet";
  }

  return `${coordinate.latitude.toFixed(5)}, ${coordinate.longitude.toFixed(5)}`;
}

function formatDateLabel(date: Date) {
  return format(date, "EEE, MMM d");
}

function formatTimeLabel(date: Date) {
  return format(date, "HH:mm");
}

export default function CreateEventScreen() {
  const colors = useThemeColors();
  const { user, profile } = useAuth();
  const defaultStart = useMemo(() => addDays(new Date(), 1), []);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<EventCategory>("coffee");
  const [vibe, setVibe] = useState("No pressure");
  const [locationName, setLocationName] = useState("");
  const [coordinate, setCoordinate] = useState<Coordinates | null>(null);
  const [city, setCity] = useState(profile?.city ?? "");
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [picker, setPicker] = useState<PickerState | null>(null);
  const [maxParticipants, setMaxParticipants] = useState("6");
  const [priceType, setPriceType] = useState<PriceType>("free");
  const [priceAmount, setPriceAmount] = useState("");
  const [safetyNote, setSafetyNote] = useState(
    "Meet in a public place. Host will share a visible meetup point."
  );
  const [loading, setLoading] = useState(false);
  const [findingLocation, setFindingLocation] = useState(false);
  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceSuggestion[]>([]);
  const [placeSuggestionsVisible, setPlaceSuggestionsVisible] = useState(false);
  const [placeSuggestionsLoading, setPlaceSuggestionsLoading] = useState(false);
  const [placeSuggestionError, setPlaceSuggestionError] = useState<string | null>(null);
  const [suppressAutocompleteFor, setSuppressAutocompleteFor] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const hostProgress = [
    { label: "Idea", complete: Boolean(title.trim() && description.trim()) },
    { label: "Place", complete: Boolean(locationName.trim() && city.trim() && coordinate) },
    { label: "Time", complete: startDate > new Date() },
    { label: "Group", complete: Number(maxParticipants) >= 2 && Number(maxParticipants) <= 20 },
    { label: "Review", complete: Boolean(safetyNote.trim()) }
  ];

  useEffect(() => {
    if (profile?.city && !city) {
      setCity(profile.city);
    }
  }, [city, profile?.city]);

  const applyCoordinate = (nextCoordinate: Coordinates) => {
    setCoordinate(nextCoordinate);
    setErrors((current) => ({
      ...current,
      latitude: undefined,
      longitude: undefined
    }));
  };

  const handleLocationNameChange = (value: string) => {
    setLocationName(value);
    setSuppressAutocompleteFor(null);
    setPlaceSuggestionsVisible(value.trim().length >= 2);
    setErrors((current) => ({
      ...current,
      location_name: undefined
    }));
  };

  const selectPlaceSuggestion = (suggestion: PlaceSuggestion) => {
    haptic("select");
    setLocationName(suggestion.name);
    setSuppressAutocompleteFor(suggestion.name.trim());
    setPlaceSuggestions([]);
    setPlaceSuggestionsVisible(false);
    setPlaceSuggestionError(null);
    if (suggestion.city) {
      setCity(suggestion.city);
    }
    applyCoordinate(suggestion.coordinates);
    setErrors((current) => ({
      ...current,
      city: undefined,
      location_name: undefined
    }));
  };

  useEffect(() => {
    const query = locationName.trim();

    if (query.length < 2 || query === suppressAutocompleteFor) {
      setPlaceSuggestions([]);
      setPlaceSuggestionsLoading(false);
      setPlaceSuggestionError(null);
      return;
    }

    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      setPlaceSuggestionsLoading(true);
      setPlaceSuggestionError(null);

      void searchPlaces(query, {
        city,
        proximity: coordinate,
        signal: controller.signal
      })
        .then((suggestions) => {
          if (!active) {
            return;
          }
          setPlaceSuggestions(suggestions);
          setPlaceSuggestionsVisible(true);
        })
        .catch((error) => {
          if (!active) {
            return;
          }
          if (error instanceof Error && error.name === "AbortError") {
            return;
          }
          setPlaceSuggestions([]);
          setPlaceSuggestionError("Could not load suggestions. You can still pin it on the map.");
          setPlaceSuggestionsVisible(true);
        })
        .finally(() => {
          if (active) {
            setPlaceSuggestionsLoading(false);
          }
        });
    }, 280);

    return () => {
      active = false;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [city, coordinate, locationName, suppressAutocompleteFor]);

  const applyReverseGeocode = async (nextCoordinate: Coordinates) => {
    try {
      const [place] = await Location.reverseGeocodeAsync(nextCoordinate);
      if (!place) {
        return;
      }

      if (!city && (place.city || place.region)) {
        setCity(place.city ?? place.region ?? "");
      }
      if (!locationName) {
        const placeParts = [place.name, place.street, place.district].filter(Boolean);
        const nextLocationName = placeParts.join(", ") || place.city || "";
        setLocationName(nextLocationName);
        setSuppressAutocompleteFor(nextLocationName.trim());
      }
    } catch {
      // Reverse geocoding is a convenience; the selected coordinates remain valid.
    }
  };

  const useCurrentLocation = async () => {
    setFindingLocation(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Location permission needed", "Allow location access or search for a public place.");
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const nextCoordinate = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude
      };
      applyCoordinate(nextCoordinate);
      await applyReverseGeocode(nextCoordinate);
    } catch (error) {
      Alert.alert(
        "Could not find location",
        error instanceof Error ? error.message : "Search for a place instead."
      );
    } finally {
      setFindingLocation(false);
    }
  };

  const searchPlace = async () => {
    const query = [locationName, city].filter(Boolean).join(", ").trim();
    if (!query) {
      setErrors((current) => ({
        ...current,
        location_name: "Add a place or city to search."
      }));
      return;
    }

    setFindingLocation(true);
    try {
      const [suggestion] = await searchPlaces(locationName, {
        city,
        limit: 1,
        proximity: coordinate
      });
      if (suggestion) {
        selectPlaceSuggestion(suggestion);
        return;
      }

      const [result] = await Location.geocodeAsync(query);
      if (!result) {
        Alert.alert("Place not found", "Try a more specific public place or street.");
        return;
      }
      applyCoordinate({ latitude: result.latitude, longitude: result.longitude });
    } catch (error) {
      Alert.alert(
        "Could not search place",
        error instanceof Error ? error.message : "Please try a different place."
      );
    } finally {
      setFindingLocation(false);
    }
  };

  const handlePickerChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setPicker(null);
    }
    if (!picker || !selectedDate) {
      return;
    }

    const currentValue = picker.field === "start" ? startDate : endDate ?? addHours(startDate, 1);
    const nextValue =
      picker.mode === "date"
        ? mergeDatePart(currentValue, selectedDate)
        : mergeTimePart(currentValue, selectedDate);

    if (picker.field === "start") {
      setStartDate(nextValue);
      if (endDate && endDate <= nextValue) {
        setEndDate(addHours(nextValue, 1));
      }
    } else {
      setEndDate(nextValue);
    }
  };

  const submit = async () => {
    if (!user?.id) {
      Alert.alert("Sign in needed", "Please log in before creating an event.");
      return;
    }

    const payload = {
      title,
      description,
      category,
      vibe,
      location_name: locationName,
      latitude: coordinate?.latitude ?? "",
      longitude: coordinate?.longitude ?? "",
      city,
      start_time: startDate.toISOString(),
      end_time: endDate ? endDate.toISOString() : undefined,
      max_participants: maxParticipants,
      price_type: priceType,
      price_amount: priceAmount || undefined,
      safety_note: safetyNote
    };

    const parsed = eventSchema.safeParse(payload);
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      setErrors(
        Object.fromEntries(
          Object.entries(fields).map(([key, value]) => [key, value?.[0]])
        )
      );
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      haptic("light");
      const event = await createEvent(parsed.data, user.id);
      track("event_create", { event_id: event.id, category: event.category });
      haptic("success");
      router.replace(`/event/${event.id}`);
    } catch (error) {
      Alert.alert(
        "Could not create event",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const pickerValue = picker?.field === "end" ? endDate ?? addHours(startDate, 1) : startDate;

  return (
    <Screen
      bottomContent={
        <Button
          title="Review and publish"
          loading={loading}
          icon={<CalendarPlus size={18} color="#FFFFFF" />}
          onPress={submit}
        />
      }
    >
      <SectionHeader
        title="Host a Plan"
        subtitle="Small groups, clear expectations, public place first."
      />
      <HostProgress steps={hostProgress} />

      <GradientSurface variant="soft" style={[styles.previewStage, { borderColor: colors.border }]}>
        <View style={styles.previewCopy}>
          <Text style={[styles.previewEyebrow, { color: colors.primary500 }]}>Live preview</Text>
          <Text style={[styles.previewTitle, { color: colors.text }]}>Shape a plan people can trust at a glance.</Text>
        </View>
        <HostPreviewCard
          title={title}
          category={category}
          locationName={locationName}
          city={city}
          startLabel={`${formatDateLabel(startDate)} · ${formatTimeLabel(startDate)}`}
          maxParticipants={maxParticipants}
        />
      </GradientSurface>

      <Card style={[styles.safetyCard, { backgroundColor: colors.infoSoft, borderColor: `${colors.primary500}33` }]}>
        <MapPin size={22} color={colors.blue} />
        <Text style={[styles.safetyText, { color: colors.text }]}>
          Pick a recognizable public meetup point. People should know exactly
          where to arrive before chat opens.
        </Text>
      </Card>

      <Card style={styles.section}>
        <StepTitle number="1" title="Idea" />
        <Input label="Title" value={title} onChangeText={setTitle} error={errors.title} placeholder="Coffee after work" />
        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          error={errors.description}
          multiline
          placeholder="What will people do, where should they meet, and what is the mood?"
        />

        <View style={styles.group}>
          <Text style={[styles.label, { color: colors.text }]}>Category</Text>
          <View style={styles.pills}>
            {EVENT_CATEGORIES.map((item) => (
              <CategoryPill
                key={item}
                category={item}
                selected={category === item}
                onPress={() => {
                  haptic("select");
                  setCategory(item);
                }}
              />
            ))}
          </View>
          {errors.category ? <Text style={[styles.error, { color: colors.danger }]}>{errors.category}</Text> : null}
        </View>
        <Input label="Vibe" value={vibe} onChangeText={setVibe} error={errors.vibe} placeholder="Quiet, beginner-friendly..." />
      </Card>

      <Card style={styles.section}>
        <StepTitle number="2" title="Place" />
        <Input
          label="Location name"
          value={locationName}
          onChangeText={handleLocationNameChange}
          onFocus={() => setPlaceSuggestionsVisible(locationName.trim().length >= 2)}
          error={errors.location_name}
          placeholder="Cafe, library, park entrance..."
        />
        {placeSuggestionsVisible ? (
          <PlaceSuggestions
            suggestions={placeSuggestions}
            loading={placeSuggestionsLoading}
            error={placeSuggestionError}
            onSelect={selectPlaceSuggestion}
          />
        ) : null}
        <Input label="City" value={city} onChangeText={setCity} error={errors.city} placeholder="Paris, Vilnius, Tokyo..." />
        <View style={styles.locationActions}>
          <Button
            title="Use current"
            variant="secondary"
            loading={findingLocation}
            icon={<LocateFixed size={18} color={colors.primaryDark} />}
            onPress={useCurrentLocation}
            style={styles.locationButton}
          />
          <Button
            title="Find place"
            variant="secondary"
            loading={findingLocation}
            icon={<Search size={18} color={colors.primaryDark} />}
            onPress={searchPlace}
            style={styles.locationButton}
          />
        </View>
        <LocationPickerMap coordinate={coordinate} onCoordinateChange={applyCoordinate} />
        {coordinate ? (
          <View style={[styles.selectedPlace, { backgroundColor: colors.successSoft, borderColor: `${colors.success}55` }]}>
            <MapPin size={18} color={colors.success} />
            <View style={styles.selectedPlaceCopy}>
              <Text style={[styles.selectedPlaceTitle, { color: colors.text }]}>
                {locationName || "Selected meetup point"}
              </Text>
              <Text style={[styles.selectedPlaceText, { color: colors.textMuted }]}>
                {city || "City will be shown"} · map pin confirmed
              </Text>
            </View>
          </View>
        ) : null}
        <Text style={[styles.helper, { color: colors.textMuted }]}>
          Choose a real place from suggestions, use current location, or tap the map to move the pin. Selected pin: {coordinateText(coordinate)}
        </Text>
        {errors.latitude || errors.longitude ? (
          <Text style={[styles.error, { color: colors.danger }]}>Choose a map pin before publishing.</Text>
        ) : null}
      </Card>

      <Card style={styles.section}>
        <StepTitle number="3" title="Time" />
        <Text style={[styles.helper, { color: colors.textMuted }]}>
          Tap a date or time to open the native picker. End time is optional.
        </Text>
        <View style={styles.timeGrid}>
          <TimeButton
            label="Start date"
            value={formatDateLabel(startDate)}
            onPress={() => setPicker({ field: "start", mode: "date" })}
          />
          <TimeButton
            label="Start time"
            value={formatTimeLabel(startDate)}
            onPress={() => setPicker({ field: "start", mode: "time" })}
          />
        </View>
        {endDate ? (
          <>
            <View style={styles.timeGrid}>
              <TimeButton
                label="End date"
                value={formatDateLabel(endDate)}
                onPress={() => setPicker({ field: "end", mode: "date" })}
              />
              <TimeButton
                label="End time"
                value={formatTimeLabel(endDate)}
                onPress={() => setPicker({ field: "end", mode: "time" })}
              />
            </View>
            <Button title="Remove end time" variant="ghost" onPress={() => setEndDate(null)} />
          </>
        ) : (
          <Button
            title="Add optional end time"
            variant="secondary"
            icon={<Clock size={18} color={colors.primaryDark} />}
            onPress={() => setEndDate(addHours(startDate, 1))}
          />
        )}
        {errors.start_time ? <Text style={[styles.error, { color: colors.danger }]}>{errors.start_time}</Text> : null}
        {errors.end_time ? <Text style={[styles.error, { color: colors.danger }]}>{errors.end_time}</Text> : null}
        {picker ? (
          <View style={[styles.pickerFrame, { borderColor: colors.border, backgroundColor: colors.surfaceMuted }]}>
            <DateTimePicker
              value={pickerValue}
              mode={picker.mode}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handlePickerChange}
              minimumDate={picker.field === "start" ? new Date() : startDate}
            />
            {Platform.OS === "ios" ? (
              <Button
                title="Done"
                variant="secondary"
                onPress={() => setPicker(null)}
              />
            ) : null}
          </View>
        ) : null}
      </Card>

      <Card style={styles.section}>
        <StepTitle number="4" title="Group and price" />
        <Input label="Max participants" value={maxParticipants} onChangeText={setMaxParticipants} error={errors.max_participants} keyboardType="number-pad" />
        <Text style={[styles.helper, { color: colors.textMuted }]}>Keep it between 2 and 20 so people can actually talk.</Text>

        <View style={styles.group}>
          <Text style={[styles.label, { color: colors.text }]}>Price</Text>
          <View style={styles.priceRow}>
            {(["free", "paid", "donation"] as PriceType[]).map((item) => (
              <Button
                key={item}
                title={item === "free" ? "Free" : item === "paid" ? "Paid" : "Donation"}
                variant={priceType === item ? "primary" : "secondary"}
                onPress={() => setPriceType(item)}
                style={styles.priceButton}
              />
            ))}
          </View>
        </View>
        {priceType !== "free" ? (
          <Input label="Price amount" value={priceAmount} onChangeText={setPriceAmount} error={errors.price_amount} keyboardType="decimal-pad" placeholder="5" />
        ) : null}
      </Card>

      <Card style={styles.section}>
        <StepTitle number="5" title="Safety" />
        <Input
          label="Safety note"
          value={safetyNote}
          onChangeText={setSafetyNote}
          error={errors.safety_note}
          multiline
        />
        <Text style={[styles.helper, { color: colors.textMuted }]}>
          Add rules people can act on: where to meet, phone expectations, late
          arrival, and how to find the group.
        </Text>
      </Card>

      <GradientSurface variant="soft" style={[styles.reviewCard, { borderColor: colors.border }]}>
        <Text style={[styles.reviewTitle, { color: colors.text }]}>Ready to feel inviting?</Text>
        <Text style={[styles.reviewText, { color: colors.textMuted }]}>
          A great OutGo plan has one clear idea, one recognizable public place,
          one realistic time, and one simple safety note.
        </Text>
      </GradientSurface>
    </Screen>
  );
}

function HostProgress({
  steps
}: {
  steps: { label: string; complete: boolean }[];
}) {
  const colors = useThemeColors();

  return (
    <View style={styles.progressRail}>
      {steps.map((step) => (
        <View
          key={step.label}
          style={[
            styles.progressStep,
            {
              backgroundColor: step.complete ? colors.primary500 : colors.surface,
              borderColor: step.complete ? colors.primary500 : colors.border
            }
          ]}
        >
          <Text
            numberOfLines={1}
            style={[
              styles.progressText,
              { color: step.complete ? colors.white : colors.textMuted }
            ]}
          >
            {step.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

function StepTitle({ number, title }: { number: string; title: string }) {
  const colors = useThemeColors();

  return (
    <View style={styles.stepTitleRow}>
      <View style={[styles.stepNumber, { backgroundColor: colors.primary500 }]}>
        <Text style={[styles.stepNumberText, { color: colors.white }]}>{number}</Text>
      </View>
      <Text style={[styles.sectionTitle, { color: colors.primary500 }]}>{title}</Text>
    </View>
  );
}

function PlaceSuggestions({
  suggestions,
  loading,
  error,
  onSelect
}: {
  suggestions: PlaceSuggestion[];
  loading: boolean;
  error: string | null;
  onSelect: (suggestion: PlaceSuggestion) => void;
}) {
  const colors = useThemeColors();

  if (!loading && suggestions.length === 0 && !error) {
    return null;
  }

  return (
    <View
      style={[
        styles.suggestionPanel,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border
        }
      ]}
    >
      {loading ? (
        <View style={styles.suggestionStatus}>
          <ActivityIndicator color={colors.primary500} />
          <Text style={[styles.suggestionStatusText, { color: colors.textMuted }]}>
            Searching real places and addresses...
          </Text>
        </View>
      ) : null}
      {suggestions.map((suggestion, index) => (
        <Pressable
          key={suggestion.id}
          onPress={() => onSelect(suggestion)}
          style={({ pressed }) => [
            styles.suggestionRow,
            index < suggestions.length - 1 && {
              borderBottomColor: colors.border,
              borderBottomWidth: StyleSheet.hairlineWidth
            },
            pressed && { backgroundColor: colors.surfacePressed }
          ]}
        >
          <View style={[styles.suggestionIcon, { backgroundColor: colors.primarySoft }]}>
            <MapPin size={16} color={colors.primary500} />
          </View>
          <View style={styles.suggestionCopy}>
            <Text style={[styles.suggestionTitle, { color: colors.text }]} numberOfLines={1}>
              {suggestion.name}
            </Text>
            <Text style={[styles.suggestionAddress, { color: colors.textMuted }]} numberOfLines={2}>
              {suggestion.placeName}
            </Text>
          </View>
        </Pressable>
      ))}
      {error ? (
        <Text style={[styles.suggestionError, { color: colors.textMuted }]}>{error}</Text>
      ) : null}
    </View>
  );
}

function TimeButton({
  label,
  value,
  onPress
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  const colors = useThemeColors();

  return (
    <Button
      title={`${label}: ${value}`}
      variant="secondary"
      onPress={() => {
        haptic("select");
        onPress();
      }}
      style={[styles.timeButton, { borderColor: colors.border }]}
    />
  );
}

const styles = StyleSheet.create({
  previewStage: {
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.lg
  },
  previewCopy: {
    gap: spacing.xs
  },
  previewEyebrow: {
    ...textStyles.tiny,
    fontFamily: fontFamilies.extraBold,
    textTransform: "uppercase",
    letterSpacing: 1
  },
  previewTitle: {
    ...textStyles.subheading,
    fontFamily: fontFamilies.extraBold
  },
  safetyCard: {
    flexDirection: "row",
    gap: spacing.md
  },
  safetyText: {
    ...textStyles.small,
    flex: 1
  },
  progressRail: {
    flexDirection: "row",
    gap: spacing.xs
  },
  progressStep: {
    flex: 1,
    minHeight: 34,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xs
  },
  progressText: {
    ...textStyles.tiny,
    fontFamily: fontFamilies.extraBold
  },
  section: {
    gap: spacing.md
  },
  group: {
    gap: spacing.sm
  },
  label: {
    ...textStyles.small,
    fontFamily: fontFamilies.bold
  },
  sectionTitle: {
    ...textStyles.small,
    fontFamily: fontFamilies.extraBold,
    textTransform: "uppercase"
  },
  stepTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center"
  },
  stepNumberText: {
    ...textStyles.tiny,
    fontFamily: fontFamilies.extraBold
  },
  helper: {
    ...textStyles.small
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  error: {
    ...textStyles.small
  },
  suggestionPanel: {
    borderWidth: 1,
    borderRadius: radii.xl,
    overflow: "hidden",
    marginTop: -spacing.xs
  },
  suggestionStatus: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.ml
  },
  suggestionStatusText: {
    ...textStyles.small,
    flex: 1
  },
  suggestionRow: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.ml,
    paddingVertical: spacing.sm
  },
  suggestionIcon: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center"
  },
  suggestionCopy: {
    flex: 1,
    gap: spacing.xxs
  },
  suggestionTitle: {
    ...textStyles.body,
    fontFamily: fontFamilies.bold
  },
  suggestionAddress: {
    ...textStyles.small
  },
  suggestionError: {
    ...textStyles.small,
    paddingHorizontal: spacing.ml,
    paddingBottom: spacing.md
  },
  locationActions: {
    flexDirection: "row",
    gap: spacing.sm
  },
  locationButton: {
    flex: 1,
    paddingHorizontal: spacing.sm
  },
  selectedPlace: {
    borderRadius: radii.xl,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md
  },
  selectedPlaceCopy: {
    flex: 1,
    gap: spacing.xs
  },
  selectedPlaceTitle: {
    ...textStyles.small,
    fontFamily: fontFamilies.extraBold
  },
  selectedPlaceText: {
    ...textStyles.tiny
  },
  timeGrid: {
    flexDirection: "row",
    gap: spacing.sm
  },
  timeButton: {
    flex: 1,
    minHeight: 54,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.lg
  },
  pickerFrame: {
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: "hidden",
    padding: Platform.OS === "ios" ? spacing.sm : 0,
    gap: spacing.sm
  },
  priceRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  priceButton: {
    flex: 1,
    paddingHorizontal: spacing.sm
  },
  reviewCard: {
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm
  },
  reviewTitle: {
    ...textStyles.subheading,
    fontFamily: fontFamilies.extraBold
  },
  reviewText: {
    ...textStyles.body
  }
});
