import Link from "next/link";
import { getAllPlaces } from "@/lib/places";
import type { Place } from "@/lib/types";

export const dynamic = "force-dynamic";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function AdminPage() {
  const places = getAllPlaces();

  // Deduplicate by slug to show one row per page
  const seen = new Set<string>();
  const rows: { place: Place; isGroup: boolean; groupSize: number }[] = [];
  for (const p of places) {
    if (seen.has(p.slug)) continue;
    seen.add(p.slug);
    const groupPlaces = places.filter((x) => x.slug === p.slug);
    rows.push({ place: p, isGroup: groupPlaces.length > 1, groupSize: groupPlaces.length });
  }

  return (
    <>
      <div className="rethink-admin__page-header">
        <h1 className="rethink-admin__page-title">Địa điểm ({rows.length})</h1>
        <Link href="/admin/places/new" className="rethink-btn rethink-btn--primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Thêm địa điểm
        </Link>
      </div>

      <table className="rethink-admin-table">
        <thead>
          <tr>
            <th>Tên</th>
            <th>Slug</th>
            <th>Tỉnh</th>
            <th>Ngày</th>
            <th>Loại</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="rethink-admin-table__empty">
                Chưa có địa điểm nào.
              </td>
            </tr>
          )}
          {rows.map(({ place, isGroup, groupSize }) => (
            <tr key={place.slug}>
              <td>
                <strong>{isGroup ? (place.groupLabel ?? place.name) : place.name}</strong>
                {isGroup && (
                  <span style={{ display: "block", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    {groupSize} địa điểm
                  </span>
                )}
              </td>
              <td>
                <code style={{ fontSize: "0.75rem" }}>{place.slug}</code>
              </td>
              <td>{place.province}</td>
              <td>{formatDate(place.date)}</td>
              <td>
                <span className={`rethink-admin-badge rethink-admin-badge--${isGroup ? "group" : "single"}`}>
                  {isGroup ? "Nhóm" : "Đơn"}
                </span>
              </td>
              <td>
                <div className="rethink-admin-table__actions">
                  <Link
                    href={`/place/${place.slug}`}
                    target="_blank"
                    className="rethink-btn rethink-btn--ghost rethink-btn--sm"
                    title="Xem trang"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </Link>
                  <Link
                    href={`/admin/places/${place.id}`}
                    className="rethink-btn rethink-btn--ghost rethink-btn--sm"
                    title="Chỉnh sửa"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </Link>
                  <DeleteButton id={place.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

// Client component for delete action
import DeleteButton from "./_DeleteButton";
