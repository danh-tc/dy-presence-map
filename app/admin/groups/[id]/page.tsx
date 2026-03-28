import { notFound } from "next/navigation";
import { getAllPlaces } from "@/lib/places";
import { GroupForm } from "@/components/admin/GroupForm";
import type { Place } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditGroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const places = getAllPlaces();

  const groupPlaces = places.filter((p) => p.groupId === id);
  if (!groupPlaces.length) notFound();

  const group = {
    groupId: id,
    groupLabel: groupPlaces[0].groupLabel ?? id,
    slug: groupPlaces[0].slug,
    places: groupPlaces as Place[],
  };

  return (
    <>
      <div className="rethink-admin__page-header">
        <h1 className="rethink-admin__page-title">Chỉnh sửa nhóm: {group.groupLabel}</h1>
      </div>
      <GroupForm mode="edit" initialData={group} />
    </>
  );
}
