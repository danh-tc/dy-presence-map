import { getAllPlaces } from "@/lib/places";
import TimelineView from "@/components/timeline/TimelineView";

export const metadata = {
  title: "Timeline - Daen’s Footprints",
};

export default function TimelinePage() {
  const places = getAllPlaces();
  return <TimelineView places={places} />;
}
