import { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { addDays } from "date-fns";
import { CalendarPlus, MapPin } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CategoryPill } from "@/components/events/CategoryPill";
import { EVENT_CATEGORIES, type EventCategory, type PriceType } from "@/types/domain";
import { createEvent } from "@/services/supabase/events";
import { eventSchema } from "@/validation/event";
import { useAuth } from "@/hooks/useAuth";
import { toInputDateTime } from "@/lib/date";
import { colors, spacing, typography } from "@/lib/theme";
import { track } from "@/lib/analytics";

export default function CreateEventScreen() {
  const { user, profile } = useAuth();
  const defaultStart = useMemo(() => toInputDateTime(addDays(new Date(), 1)), []);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<EventCategory>("coffee");
  const [vibe, setVibe] = useState("No pressure");
  const [locationName, setLocationName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [city, setCity] = useState(profile?.city ?? "");
  const [startTime, setStartTime] = useState(defaultStart);
  const [endTime, setEndTime] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("6");
  const [priceType, setPriceType] = useState<PriceType>("free");
  const [priceAmount, setPriceAmount] = useState("");
  const [safetyNote, setSafetyNote] = useState(
    "Meet in a public place. Host will share a visible meetup point."
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

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
      latitude,
      longitude,
      city,
      start_time: startTime,
      end_time: endTime || undefined,
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
      const event = await createEvent(parsed.data, user.id);
      track("event_create", { event_id: event.id, category: event.category });
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

  return (
    <Screen>
      <SectionHeader
        title="Host a Plan"
        subtitle="Small groups, clear expectations, public place first."
      />
      <Card style={styles.safetyCard}>
        <MapPin size={22} color={colors.blue} />
        <Text style={styles.safetyText}>
          Choose a clear public meeting place. Coordinates keep the map pin
          honest for people arriving on foot or by transit.
        </Text>
      </Card>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Basics</Text>
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
          <Text style={styles.label}>Category</Text>
          <View style={styles.pills}>
            {EVENT_CATEGORIES.map((item) => (
              <CategoryPill
                key={item}
                category={item}
                selected={category === item}
                onPress={() => setCategory(item)}
              />
            ))}
          </View>
          {errors.category ? <Text style={styles.error}>{errors.category}</Text> : null}
        </View>

        <Input label="Vibe" value={vibe} onChangeText={setVibe} error={errors.vibe} placeholder="Quiet, beginner-friendly..." />
        <Text style={styles.sectionTitle}>Place and time</Text>
        <Input label="Location name" value={locationName} onChangeText={setLocationName} error={errors.location_name} placeholder="Cafe, library, park entrance..." />
        <View style={styles.inline}>
          <Input label="Latitude" value={latitude} onChangeText={setLatitude} error={errors.latitude} keyboardType="decimal-pad" containerStyle={styles.halfInput} />
          <Input label="Longitude" value={longitude} onChangeText={setLongitude} error={errors.longitude} keyboardType="decimal-pad" containerStyle={styles.halfInput} />
        </View>
        <Input label="City" value={city} onChangeText={setCity} error={errors.city} placeholder="Paris, Vilnius, Tokyo..." />
        <Input label="Start time" value={startTime} onChangeText={setStartTime} error={errors.start_time} placeholder="2026-05-01T18:30" />
        <Input label="End time" value={endTime} onChangeText={setEndTime} error={errors.end_time} placeholder="Optional, e.g. 2026-05-01T20:00" />
        <Text style={styles.sectionTitle}>Group and price</Text>
        <Input label="Max participants" value={maxParticipants} onChangeText={setMaxParticipants} error={errors.max_participants} keyboardType="number-pad" />
        <Text style={styles.helper}>Keep it between 2 and 20 so people can actually talk.</Text>

        <View style={styles.group}>
          <Text style={styles.label}>Price</Text>
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
        <Input
          label="Safety note"
          value={safetyNote}
          onChangeText={setSafetyNote}
          error={errors.safety_note}
          multiline
        />
        <Text style={styles.helper}>
          Add rules people can act on: where to meet, phone expectations, late arrival, and how to find the group.
        </Text>

        <Button
          title="Publish event"
          loading={loading}
          icon={<CalendarPlus size={18} color="#FFFFFF" />}
          onPress={submit}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safetyCard: {
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: colors.blueSoft
  },
  safetyText: {
    flex: 1,
    color: colors.text,
    fontSize: typography.small,
    lineHeight: 19,
    fontWeight: "700"
  },
  form: {
    gap: spacing.md
  },
  group: {
    gap: spacing.sm
  },
  label: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "800"
  },
  sectionTitle: {
    color: colors.primaryDark,
    fontSize: typography.small,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  helper: {
    color: colors.textMuted,
    fontSize: typography.small,
    lineHeight: 19,
    fontWeight: "700",
    marginTop: -spacing.sm
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  error: {
    color: colors.danger,
    fontSize: typography.small
  },
  inline: {
    flexDirection: "row",
    gap: spacing.md
  },
  halfInput: {
    flex: 1
  },
  priceRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  priceButton: {
    flex: 1,
    paddingHorizontal: spacing.sm
  }
});
