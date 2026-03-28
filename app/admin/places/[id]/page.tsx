import { notFound } from "next/navigation";
import { getAllPlaces } from "@/lib/places";
import { PlaceForm } from "@/components/admin/PlaceForm";

export async function generateStaticParams() {
  return [];
}

export const dynamic = "force-dynamic";

export default async function EditPlacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const places = getAllPlaces();
  const place = places.find((p) => p.id === id);

  if (!place) notFound();

  return (
    <>
      <div className="rethink-admin__page-header">
        <h1 className="rethink-admin__page-title">Chỉnh sửa: {place.name}</h1>
      </div>
      <PlaceForm mode="edit" initialData={place} />
    </>
  );
}
