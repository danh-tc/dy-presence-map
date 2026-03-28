"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Place } from "@/lib/types";

interface Group {
  groupId: string;
  groupLabel: string;
  slug: string;
  places: Place[];
}

interface Props {
  initialData?: Group;
  mode: "create" | "edit";
}

export function GroupForm({ initialData, mode }: Props) {
  const router = useRouter();
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [groupLabel, setGroupLabel] = useState(initialData?.groupLabel ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initialData?.places.map((p) => p.id) ?? [])
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [slugEdited, setSlugEdited] = useState(mode === "edit");

  useEffect(() => {
    fetch("/api/admin/places")
      .then((r) => r.json())
      .then((data: Place[]) => setAllPlaces(data))
      .catch(() => {});
  }, []);

  // Places available: unassigned + already in this group
  const availablePlaces = allPlaces.filter(
    (p) => !p.groupId || p.groupId === initialData?.groupId
  );

  function handleLabelChange(label: string) {
    setGroupLabel(label);
    if (!slugEdited) {
      setSlug(
        label
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-")
      );
    }
  }

  function togglePlace(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!groupLabel.trim() || !slug.trim()) {
      setError("Vui lòng nhập tên nhóm và slug.");
      return;
    }
    if (selectedIds.size < 2) {
      setError("Nhóm cần ít nhất 2 địa điểm.");
      return;
    }

    setSaving(true);
    try {
      if (mode === "create") {
        const res = await fetch("/api/admin/groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            groupLabel,
            slug,
            placeIds: Array.from(selectedIds),
          }),
        });
        if (!res.ok) throw new Error((await res.json()).error);
      } else {
        const currentIds = new Set(initialData!.places.map((p) => p.id));
        const addPlaceIds = Array.from(selectedIds).filter((id) => !currentIds.has(id));
        const removePlaceIds = Array.from(currentIds).filter((id) => !selectedIds.has(id));
        const res = await fetch(`/api/admin/groups/${initialData!.groupId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ groupLabel, addPlaceIds, removePlaceIds }),
        });
        if (!res.ok) throw new Error((await res.json()).error);
      }
      router.push("/admin/groups");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="rethink-admin-form" onSubmit={handleSubmit}>
      <div className="rethink-admin-form__section">
        <h2 className="rethink-admin-form__section-title">Thông tin nhóm</h2>

        <div className="rethink-admin-form__row rethink-admin-form__row--2col">
          <div className="rethink-admin-form__field">
            <label className="rethink-admin-form__label">
              Tên nhóm <span style={{ color: "var(--color-accent)" }}>*</span>
            </label>
            <input
              className="rethink-admin-form__input"
              value={groupLabel}
              onChange={(e) => handleLabelChange(e.target.value)}
              placeholder="vd: Đám cưới 2024"
            />
          </div>
          <div className="rethink-admin-form__field">
            <label className="rethink-admin-form__label">
              Slug <span style={{ color: "var(--color-accent)" }}>*</span>
              <span className="rethink-admin-form__label-hint">(URL chung của nhóm)</span>
            </label>
            <input
              className="rethink-admin-form__input"
              value={slug}
              onChange={(e) => { setSlugEdited(true); setSlug(e.target.value.toLowerCase().replace(/\s/g, "-")); }}
              placeholder="vd: dam-cuoi-2024"
              readOnly={mode === "edit"}
              style={mode === "edit" ? { opacity: 0.6, cursor: "not-allowed" } : {}}
            />
          </div>
        </div>
      </div>

      <div className="rethink-admin-form__section">
        <h2 className="rethink-admin-form__section-title">
          Địa điểm trong nhóm
          <span className="rethink-admin-form__label-hint" style={{ marginLeft: "8px" }}>
            ({selectedIds.size} đã chọn, cần ít nhất 2)
          </span>
        </h2>

        {availablePlaces.length === 0 ? (
          <p className="rethink-admin-form__hint">Không có địa điểm nào khả dụng.</p>
        ) : (
          <div className="rethink-place-picker">
            {availablePlaces.map((p) => (
              <label
                key={p.id}
                className={`rethink-place-picker__item${selectedIds.has(p.id) ? " rethink-place-picker__item--selected" : ""}`}
              >
                <input
                  type="checkbox"
                  className="rethink-place-picker__checkbox"
                  checked={selectedIds.has(p.id)}
                  onChange={() => togglePlace(p.id)}
                />
                <span className="rethink-place-picker__name">{p.name}</span>
                <span className="rethink-place-picker__meta">
                  {p.province} · {p.date}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p style={{ color: "rgb(220, 38, 38)", fontSize: "0.875rem", marginBottom: "12px" }}>
          {error}
        </p>
      )}

      <div className="rethink-admin-form__actions">
        <a href="/admin/groups" className="rethink-btn rethink-btn--secondary">
          Huỷ
        </a>
        <button type="submit" className="rethink-btn rethink-btn--primary" disabled={saving}>
          {saving ? "Đang lưu..." : mode === "create" ? "Tạo nhóm" : "Lưu thay đổi"}
        </button>
      </div>
    </form>
  );
}
