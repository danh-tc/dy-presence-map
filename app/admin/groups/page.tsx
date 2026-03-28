import Link from "next/link";
import { getAllPlaces } from "@/lib/places";
import DeleteGroupButton from "./_DeleteGroupButton";

export const dynamic = "force-dynamic";

function deriveGroups(places: ReturnType<typeof getAllPlaces>) {
  const map = new Map<string, { groupId: string; groupLabel: string; slug: string; count: number }>();
  for (const p of places) {
    if (!p.groupId) continue;
    if (!map.has(p.groupId)) {
      map.set(p.groupId, { groupId: p.groupId, groupLabel: p.groupLabel ?? p.groupId, slug: p.slug, count: 0 });
    }
    map.get(p.groupId)!.count++;
  }
  return Array.from(map.values());
}

export default function GroupsPage() {
  const places = getAllPlaces();
  const groups = deriveGroups(places);

  return (
    <>
      <div className="rethink-admin__page-header">
        <h1 className="rethink-admin__page-title">Nhóm sự kiện ({groups.length})</h1>
        <Link href="/admin/groups/new" className="rethink-btn rethink-btn--primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tạo nhóm mới
        </Link>
      </div>

      <table className="rethink-admin-table">
        <thead>
          <tr>
            <th>Tên nhóm</th>
            <th>Slug</th>
            <th>Số địa điểm</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {groups.length === 0 && (
            <tr>
              <td colSpan={4} className="rethink-admin-table__empty">
                Chưa có nhóm nào. Tạo nhóm để gộp các địa điểm liên quan (vd: tiệc cưới 2 ngày).
              </td>
            </tr>
          )}
          {groups.map((g) => (
            <tr key={g.groupId}>
              <td><strong>{g.groupLabel}</strong></td>
              <td><code style={{ fontSize: "0.75rem" }}>{g.slug}</code></td>
              <td>{g.count} địa điểm</td>
              <td>
                <div className="rethink-admin-table__actions">
                  <Link
                    href={`/place/${g.slug}`}
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
                    href={`/admin/groups/${g.groupId}`}
                    className="rethink-btn rethink-btn--ghost rethink-btn--sm"
                    title="Chỉnh sửa"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </Link>
                  <DeleteGroupButton id={g.groupId} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
