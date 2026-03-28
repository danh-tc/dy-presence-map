"use client";
import { useRouter } from "next/navigation";

export default function DeleteGroupButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Giải tán nhóm này? Các địa điểm sẽ trở thành độc lập.")) return;
    await fetch(`/api/admin/groups/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button
      className="rethink-btn rethink-btn--danger rethink-btn--sm"
      onClick={handleDelete}
      title="Giải tán nhóm"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
      </svg>
    </button>
  );
}
