export const mapboxAccessToken =
  process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim() ?? "";

export const isMapboxConfigured = mapboxAccessToken.length > 0;
