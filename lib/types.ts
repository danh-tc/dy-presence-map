export interface Place {
  id: string;
  slug: string;
  name: string;
  country: string;
  province: string;
  city: string | null;
  coordinates: [number, number]; // [lat, lng]
  date: string; // ISO date string YYYY-MM-DD
  summary: string;
  coverImage: string;
  featuredImages: string[];
  groupId?: string;
  groupLabel?: string;
}

export interface PlaceGroup {
  groupId: string;
  groupLabel: string;
  slug: string;
  places: Place[];
}

export interface FilterState {
  country: string;
  province: string;
  search: string;
}
