import type { Coordinates } from "@/lib/distance";
import { isMapboxConfigured, mapboxAccessToken } from "@/lib/mapbox";

export type PlaceSuggestion = {
  id: string;
  name: string;
  placeName: string;
  city?: string;
  category?: string;
  coordinates: Coordinates;
};

type MapboxContext = {
  id?: string;
  text?: string;
};

type MapboxFeature = {
  id: string;
  text?: string;
  place_name?: string;
  center?: [number, number];
  place_type?: string[];
  properties?: {
    category?: string;
  };
  context?: MapboxContext[];
};

type MapboxGeocodingResponse = {
  features?: MapboxFeature[];
};

type SearchPlacesOptions = {
  city?: string;
  limit?: number;
  proximity?: Coordinates | null;
  signal?: AbortSignal;
};

function extractCity(feature: MapboxFeature) {
  const cityContext = feature.context?.find((item) => {
    const id = item.id ?? "";
    return id.startsWith("place.") || id.startsWith("locality.");
  });

  if (cityContext?.text) {
    return cityContext.text;
  }

  if (feature.place_type?.includes("place") || feature.place_type?.includes("locality")) {
    return feature.text;
  }

  return undefined;
}

function cleanPlaceName(name: string, placeName: string) {
  if (!placeName.startsWith(name)) {
    return placeName;
  }

  return placeName.replace(name, "").replace(/^,\s*/, "").trim() || placeName;
}

export async function searchPlaces(
  query: string,
  { city, limit = 6, proximity, signal }: SearchPlacesOptions = {}
) {
  const trimmedQuery = query.trim();

  if (!isMapboxConfigured || trimmedQuery.length < 2) {
    return [];
  }

  const searchQuery =
    city && !trimmedQuery.toLowerCase().includes(city.toLowerCase())
      ? `${trimmedQuery}, ${city}`
      : trimmedQuery;
  const params = new URLSearchParams({
    access_token: mapboxAccessToken,
    autocomplete: "true",
    language: "en",
    limit: String(limit),
    types: "poi,address,place,locality,neighborhood"
  });

  if (proximity) {
    params.set("proximity", `${proximity.longitude},${proximity.latitude}`);
  } else {
    params.set("proximity", "ip");
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    searchQuery
  )}.json?${params.toString()}`;
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error("Could not load place suggestions.");
  }

  const data = (await response.json()) as MapboxGeocodingResponse;

  return (data.features ?? [])
    .filter((feature): feature is MapboxFeature & { center: [number, number] } =>
      Array.isArray(feature.center)
    )
    .map<PlaceSuggestion>((feature) => {
      const name = feature.text ?? feature.place_name ?? "Selected place";
      const placeName = feature.place_name ?? name;

      return {
        id: feature.id,
        name,
        placeName: cleanPlaceName(name, placeName),
        city: extractCity(feature),
        category: feature.properties?.category,
        coordinates: {
          latitude: feature.center[1],
          longitude: feature.center[0]
        }
      };
    });
}
