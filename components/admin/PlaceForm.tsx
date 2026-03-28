"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CoordinatePicker } from "./CoordinatePicker";
import { CoverUploader, FeaturedUploader } from "./ImageUploader";
import { Combobox } from "./Combobox";
import type { Place } from "@/lib/types";

interface Props {
  initialData?: Partial<Place>;
  mode: "create" | "edit";
}

function generateSlug(name: string, date: string): string {
  const year = date.slice(0, 4) || new Date().getFullYear().toString();
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-") + "-" + year;
}

const defaultForm: Partial<Place> = {
  id: "",
  slug: "",
  name: "",
  country: "Vietnam",
  province: "",
  city: "",
  coordinates: [0, 0],
  date: "",
  summary: "",
  coverImage: "",
  featuredImages: [],
  groupId: "",
  groupLabel: "",
};

export function PlaceForm({ initialData, mode }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<Partial<Place>>({ ...defaultForm, ...initialData });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [slugEdited, setSlugEdited] = useState(mode === "edit");
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);

  useEffect(() => {
    fetch("/api/admin/places")
      .then((r) => r.json())
      .then((data: Place[]) => setAllPlaces(data))
      .catch(() => {});
  }, []);

  const countryOptions = [...new Set(allPlaces.map((p) => p.country).filter(Boolean))].sort();
  const provinceOptions = [
    ...new Set(
      allPlaces
        .filter((p) => !form.country || p.country === form.country)
        .map((p) => p.province)
        .filter(Boolean)
    ),
  ].sort();
  const cityOptions = [
    ...new Set(
      allPlaces
        .filter((p) => !form.province || p.province === form.province)
        .map((p) => p.city)
        .filter((c): c is string => !!c)
    ),
  ].sort();

  function set<K extends keyof Place>(key: K, value: Place[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleNameChange(name: string) {
    set("name", name);
    if (!slugEdited && form.date) {
      set("slug", generateSlug(name, form.date));
    }
  }

  function handleDateChange(date: string) {
    set("date", date);
    if (!slugEdited && form.name) {
      set("slug", generateSlug(form.name!, date));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.id || !form.slug || !form.name || !form.date || !form.country || !form.province) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc (ID, Slug, Tên, Ngày, Quốc gia, Tỉnh/Thành).");
      return;
    }

    const payload: Place = {
      id: form.id!,
      slug: form.slug!,
      name: form.name!,
      country: form.country!,
      province: form.province!,
      city: form.city || null,
      coordinates: form.coordinates as [number, number],
      date: form.date!,
      summary: form.summary || "",
      coverImage: form.coverImage || "",
      featuredImages: form.featuredImages || [],
      ...(form.groupId ? { groupId: form.groupId, groupLabel: form.groupLabel } : {}),
    };

    setSaving(true);
    try {
      const url = mode === "create" ? "/api/admin/places" : `/api/admin/places/${form.id}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Lưu thất bại");
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="rethink-admin-form" onSubmit={handleSubmit}>

      {/* ── Section 1: Thông tin cơ bản ── */}
      <div className="rethink-admin-form__section">
        <h2 className="rethink-admin-form__section-title">Thông tin cơ bản</h2>

        <div className="rethink-admin-form__row">
          <div className="rethink-admin-form__field">
            <label className="rethink-admin-form__label">
              Tên địa điểm <span style={{ color: "var(--color-accent)" }}>*</span>
            </label>
            <input
              className="rethink-admin-form__input"
              value={form.name ?? ""}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="vd: Đà Lạt, Hội An…"
            />
          </div>
        </div>

        <div className="rethink-admin-form__row rethink-admin-form__row--2col">
          <div className="rethink-admin-form__field">
            <label className="rethink-admin-form__label">
              ID <span style={{ color: "var(--color-accent)" }}>*</span>
              <span className="rethink-admin-form__label-hint">(duy nhất, không đổi được)</span>
            </label>
            <input
              className="rethink-admin-form__input"
              value={form.id ?? ""}
              onChange={(e) => set("id", e.target.value.toLowerCase().replace(/\s/g, "-"))}
              placeholder="vd: da-lat-2023"
              readOnly={mode === "edit"}
              style={mode === "edit" ? { opacity: 0.6, cursor: "not-allowed" } : {}}
            />
          </div>
          <div className="rethink-admin-form__field">
            <label className="rethink-admin-form__label">
              Slug <span style={{ color: "var(--color-accent)" }}>*</span>
              <span className="rethink-admin-form__label-hint">(URL của trang)</span>
            </label>
            <input
              className="rethink-admin-form__input"
              value={form.slug ?? ""}
              onChange={(e) => { setSlugEdited(true); set("slug", e.target.value.toLowerCase().replace(/\s/g, "-")); }}
              placeholder="vd: da-lat-2023"
            />
          </div>
        </div>

        <div className="rethink-admin-form__row rethink-admin-form__row--3col">
          <div className="rethink-admin-form__field">
            <label className="rethink-admin-form__label">
              Quốc gia <span style={{ color: "var(--color-accent)" }}>*</span>
            </label>
            <Combobox
              value={form.country ?? ""}
              onChange={(v) => { set("country", v); set("province", ""); set("city", ""); }}
              options={countryOptions}
              placeholder="Vietnam"
              required
            />
          </div>
          <div className="rethink-admin-form__field">
            <label className="rethink-admin-form__label">
              Tỉnh <span style={{ color: "var(--color-accent)" }}>*</span>
            </label>
            <Combobox
              value={form.province ?? ""}
              onChange={(v) => { set("province", v); set("city", ""); }}
              options={provinceOptions}
              placeholder="vd: Lâm Đồng"
              required
            />
          </div>
          <div className="rethink-admin-form__field">
            <label className="rethink-admin-form__label">
              Thành phố
            </label>
            <Combobox
              value={form.city ?? ""}
              onChange={(v) => set("city", v)}
              options={cityOptions}
              placeholder="vd: Đà Lạt (nếu có)"
            />
          </div>
        </div>

        <div className="rethink-admin-form__row rethink-admin-form__row--2col">
          <div className="rethink-admin-form__field">
            <label className="rethink-admin-form__label">
              Ngày <span style={{ color: "var(--color-accent)" }}>*</span>
            </label>
            <input
              type="date"
              className="rethink-admin-form__input"
              value={form.date ?? ""}
              onChange={(e) => handleDateChange(e.target.value)}
            />
          </div>
        </div>

        <div className="rethink-admin-form__row">
          <div className="rethink-admin-form__field">
            <label className="rethink-admin-form__label">Mô tả</label>
            <textarea
              className="rethink-admin-form__textarea"
              value={form.summary ?? ""}
              onChange={(e) => set("summary", e.target.value)}
              placeholder="Kể ngắn về chuyến đi này..."
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* ── Section 2: Tọa độ ── */}
      <div className="rethink-admin-form__section">
        <h2 className="rethink-admin-form__section-title">Tọa độ</h2>
        <CoordinatePicker
          lat={form.coordinates?.[0] ?? null}
          lng={form.coordinates?.[1] ?? null}
          onChange={(lat, lng) => set("coordinates", [lat, lng])}
        />
      </div>

      {/* ── Section 3: Hình ảnh ── */}
      <div className="rethink-admin-form__section">
        <h2 className="rethink-admin-form__section-title">Hình ảnh</h2>

        <div className="rethink-admin-form__row">
          <div className="rethink-admin-form__field">
            <label className="rethink-admin-form__label">Ảnh bìa</label>
            <CoverUploader
              slug={form.slug ?? ""}
              value={form.coverImage ?? ""}
              onChange={(path) => set("coverImage", path)}
            />
          </div>
        </div>

        <div className="rethink-admin-form__row">
          <div className="rethink-admin-form__field">
            <label className="rethink-admin-form__label">
              Ảnh gallery
              <span className="rethink-admin-form__label-hint">Kéo để sắp xếp lại</span>
            </label>
            <FeaturedUploader
              slug={form.slug ?? ""}
              value={form.featuredImages ?? []}
              onChange={(images) => set("featuredImages", images)}
            />
          </div>
        </div>
      </div>

      {/* ── Section 4: Nhóm (tuỳ chọn) ── */}
      <div className="rethink-admin-form__section">
        <h2 className="rethink-admin-form__section-title">Nhóm sự kiện (tuỳ chọn)</h2>
        <p className="rethink-admin-form__hint" style={{ marginBottom: "12px" }}>
          Để trống nếu đây là địa điểm độc lập. Dùng trang Nhóm để gán nhiều địa điểm vào cùng một sự kiện.
        </p>
        <div className="rethink-admin-form__row rethink-admin-form__row--2col">
          <div className="rethink-admin-form__field">
            <label className="rethink-admin-form__label">Group ID</label>
            <input
              className="rethink-admin-form__input"
              value={form.groupId ?? ""}
              onChange={(e) => set("groupId", e.target.value)}
              placeholder="vd: dam-cuoi-2024"
            />
          </div>
          <div className="rethink-admin-form__field">
            <label className="rethink-admin-form__label">Tên nhóm (hiển thị)</label>
            <input
              className="rethink-admin-form__input"
              value={form.groupLabel ?? ""}
              onChange={(e) => set("groupLabel", e.target.value)}
              placeholder="vd: Đám cưới 2024"
            />
          </div>
        </div>
      </div>

      {error && (
        <p style={{ color: "rgb(220, 38, 38)", fontSize: "0.875rem", marginBottom: "12px" }}>
          {error}
        </p>
      )}

      <div className="rethink-admin-form__actions">
        <a href="/admin" className="rethink-btn rethink-btn--secondary">
          Huỷ
        </a>
        <button type="submit" className="rethink-btn rethink-btn--primary" disabled={saving}>
          {saving ? "Đang lưu..." : mode === "create" ? "Tạo địa điểm" : "Lưu thay đổi"}
        </button>
      </div>
    </form>
  );
}
