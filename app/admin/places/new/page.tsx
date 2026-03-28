import { PlaceForm } from "@/components/admin/PlaceForm";

export default function NewPlacePage() {
  return (
    <>
      <div className="rethink-admin__page-header">
        <h1 className="rethink-admin__page-title">Thêm địa điểm mới</h1>
      </div>
      <PlaceForm mode="create" />
    </>
  );
}
