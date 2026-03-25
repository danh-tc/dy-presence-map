import { Suspense } from "react";
import { filterPlaces } from "@/lib/places";
import StatsBar from "@/components/StatsBar";
import SearchBar from "@/components/SearchBar";
import FilterPanel from "@/components/map/FilterPanel";
import MapViewWrapper from "@/components/map/MapViewWrapper";

type HomePageProps = Readonly<{
  searchParams: Promise<{
    country?: string;
    province?: string;
    search?: string;
  }>;
}>;

export default async function HomePage({ searchParams }: HomePageProps) {
  const { country = "", province = "", search = "" } = await searchParams;
  const places = filterPlaces(country, province, search);

  return (
    <div className="rethink-map-page">
      <div className="rethink-map-controls">
        <StatsBar />
        <Suspense>
          <FilterPanel search={<SearchBar />} />
        </Suspense>
      </div>
      <div className="rethink-map-container">
        <MapViewWrapper places={places} />
      </div>
    </div>
  );
}
