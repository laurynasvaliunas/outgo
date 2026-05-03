import { ScrollView, StyleSheet, Text, View } from "react-native";
import { EVENT_CATEGORIES, type EventCategory, type EventFilters as Filters, type PriceType } from "@/types/domain";
import { CategoryPill } from "./CategoryPill";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { colors, spacing, typography } from "@/lib/theme";

type EventFiltersProps = {
  filters: Filters;
  onChange: (filters: Filters) => void;
  compact?: boolean;
};

const dateOptions: { label: string; value: Filters["date"] }[] = [
  { label: "Any date", value: "all" },
  { label: "Today", value: "today" },
  { label: "Tomorrow", value: "tomorrow" },
  { label: "This week", value: "week" }
];

const priceOptions: { label: string; value: PriceType | "all" }[] = [
  { label: "Any price", value: "all" },
  { label: "Free", value: "free" },
  { label: "Paid", value: "paid" },
  { label: "Donation", value: "donation" }
];

export function EventFilters({ filters, onChange, compact }: EventFiltersProps) {
  const setCategory = (category: EventCategory | "all") => {
    onChange({ ...filters, category });
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        <Button
          title="All"
          variant={!filters.category || filters.category === "all" ? "primary" : "secondary"}
          onPress={() => setCategory("all")}
          style={styles.chipButton}
        />
        {EVENT_CATEGORIES.map((category) => (
          <CategoryPill
            key={category}
            category={category}
            selected={filters.category === category}
            onPress={() => setCategory(category)}
          />
        ))}
      </ScrollView>

      {!compact ? (
        <>
          <View style={styles.group}>
            <Text style={styles.label}>Date</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.row}
            >
              {dateOptions.map((option) => (
                <Button
                  key={option.value}
                  title={option.label}
                  variant={(filters.date ?? "all") === option.value ? "primary" : "secondary"}
                  onPress={() => onChange({ ...filters, date: option.value })}
                  style={styles.chipButton}
                />
              ))}
            </ScrollView>
          </View>
          <View style={styles.group}>
            <Text style={styles.label}>Price</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.row}
            >
              {priceOptions.map((option) => (
                <Button
                  key={option.value}
                  title={option.label}
                  variant={(filters.priceType ?? "all") === option.value ? "primary" : "secondary"}
                  onPress={() => onChange({ ...filters, priceType: option.value })}
                  style={styles.chipButton}
                />
              ))}
            </ScrollView>
          </View>
          <View style={styles.inline}>
            <Input
              label="City"
              placeholder="Paris, Vilnius, Tokyo..."
              value={filters.city ?? ""}
              onChangeText={(city) => onChange({ ...filters, city })}
              containerStyle={styles.cityInput}
            />
            <Input
              label="Vibe"
              placeholder="Quiet, phone-light..."
              value={filters.vibe ?? ""}
              onChangeText={(vibe) => onChange({ ...filters, vibe })}
              containerStyle={styles.input}
            />
            <Input
              label="Km"
              placeholder="5"
              keyboardType="numeric"
              value={filters.distanceKm ? String(filters.distanceKm) : ""}
              onChangeText={(value) =>
                onChange({
                  ...filters,
                  distanceKm: value ? Number(value) : undefined
                })
              }
              containerStyle={styles.distanceInput}
            />
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md
  },
  row: {
    gap: spacing.sm,
    alignItems: "center",
    paddingRight: spacing.lg
  },
  chipButton: {
    minHeight: 34,
    paddingHorizontal: spacing.md
  },
  group: {
    gap: spacing.sm
  },
  label: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "800"
  },
  inline: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    alignItems: "flex-start"
  },
  input: {
    flex: 1,
    minWidth: 160
  },
  cityInput: {
    flex: 1,
    minWidth: 160
  },
  distanceInput: {
    width: 78
  }
});
