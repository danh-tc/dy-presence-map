import { GroupForm } from "@/components/admin/GroupForm";

export default function NewGroupPage() {
  return (
    <>
      <div className="rethink-admin__page-header">
        <h1 className="rethink-admin__page-title">Tạo nhóm mới</h1>
      </div>
      <GroupForm mode="create" />
    </>
  );
}
