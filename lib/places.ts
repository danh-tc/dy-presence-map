import placesData from "@/data/places.json";
import type { Place, PlaceGroup } from "./types";

const places: Place[] = placesData as Place[];

export function getAllPlaces(): Place[] {
  return places.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPlaceBySlug(slug: string): Place | undefined {
  return places.find((p) => p.slug === slug);
}

export function getPlacesBySlug(slug: string): Place[] {
  return places.filter((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return [...new Set(places.map((p) => p.slug))];
}

export function getGroups(): PlaceGroup[] {
  const grouped = new Map<string, Place[]>();

  for (const place of places) {
    if (place.groupId) {
      const existing = grouped.get(place.groupId) ?? [];
      grouped.set(place.groupId, [...existing, place]);
    }
  }

  return Array.from(grouped.entries()).map(([groupId, groupPlaces]) => ({
    groupId,
    groupLabel: groupPlaces[0].groupLabel ?? groupId,
    slug: groupPlaces[0].slug,
    places: groupPlaces,
  }));
}

export function getCountries(): string[] {
  return [...new Set(places.map((p) => p.country))].sort();
}

export function getProvincesByCountry(country: string): string[] {
  return [
    ...new Set(
      places.filter((p) => p.country === country).map((p) => p.province)
    ),
  ].sort();
}

export function filterPlaces(
  country: string,
  province: string,
  search: string
): Place[] {
  let filtered = getAllPlaces();

  if (country) {
    filtered = filtered.filter((p) => p.country === country);
  }
  if (province) {
    filtered = filtered.filter((p) => p.province === province);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.province.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q)
    );
  }

  return filtered;
}

export function getStats() {
  const allPlaces = getAllPlaces();
  const countries = new Set(allPlaces.map((p) => p.country)).size;
  const provinces = new Set(allPlaces.map((p) => `${p.country}::${p.province}`))
    .size;
  const total = new Set(allPlaces.map((p) => p.slug)).size;

  return { countries, provinces, total };
}

export function groupByYear(items: Place[]): Record<string, Place[]> {
  return items.reduce<Record<string, Place[]>>((acc, place) => {
    const year = place.date.slice(0, 4);
    acc[year] = acc[year] ? [...acc[year], place] : [place];
    return acc;
  }, {});
}
