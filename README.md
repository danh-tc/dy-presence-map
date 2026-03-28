# dy-presence-map

Bản đồ kỷ niệm cá nhân - lưu lại những nơi đã đặt chân đến, từng chuyến đi, từng sự kiện đáng nhớ. Mỗi địa điểm là một marker trên bản đồ thế giới, click vào sẽ hiện thông tin tóm tắt và ảnh nổi bật.

---

## Mục tiêu

Xây dựng một website cá nhân để:
- Đánh dấu các tỉnh thành, địa điểm đã đến trên bản đồ thế giới
- Ghi lại kỷ niệm ngắn kèm hình ảnh cho mỗi địa điểm
- Hỗ trợ sự kiện gắn với nhiều địa điểm (ví dụ: đám cưới 2 nhà → 2 marker nối nhau)
- Lọc theo quốc gia, tỉnh/thành phố và tìm kiếm theo tên
- Xem kỷ niệm theo dạng timeline thời gian
- Thống kê số địa điểm, tỉnh thành, quốc gia đã đến
- Chế độ tối / sáng

---

## Tech Stack

| Công nghệ | Mục đích |
|---|---|
| **Next.js 16 (App Router)** | Framework chính |
| **react-leaflet + OpenStreetMap** | Bản đồ tương tác - miễn phí, không cần API key |
| **SCSS + BEM** (`rethink-` prefix) | Styling - không dùng Tailwind |
| **next-themes** | Dark / light mode |
| **@next/mdx** | Nội dung chi tiết dạng Markdown |
| **Sharp** | Tối ưu ảnh khi upload (có sẵn trong Next.js) |
| **JSON files** | Lưu data địa điểm - không cần database |

---

## Kiến trúc thư mục

```
/
├── app/
│   ├── layout.tsx              # Root layout, ThemeProvider, Nav
│   ├── page.tsx                # Trang chủ: bản đồ + filter + stats
│   ├── timeline/
│   │   └── page.tsx            # Timeline theo thời gian
│   └── place/
│       └── [slug]/
│           └── page.tsx        # Trang chi tiết địa điểm
├── components/
│   ├── map/
│   │   ├── MapView.tsx         # Leaflet map (dynamic, no SSR)
│   │   ├── MapViewWrapper.tsx  # Wrapper dynamic import
│   │   ├── MarkerPopup.tsx     # Popup khi click marker
│   │   └── FilterPanel.tsx     # Dropdown lọc theo quốc gia / tỉnh
│   ├── timeline/
│   │   └── TimelineView.tsx    # Danh sách kỷ niệm theo năm
│   ├── ui/
│   │   ├── BlurImage.tsx       # Next.js Image với fade-in
│   │   ├── Gallery.tsx         # Gallery grid + Lightbox (client)
│   │   └── ShareButton.tsx     # Share dropdown (Facebook, Instagram, copy)
│   ├── admin/
│   │   ├── PlaceForm.tsx       # Form tạo/edit place
│   │   ├── CoordinatePicker.tsx# Nominatim search + Leaflet click
│   │   ├── LeafletPicker.tsx   # Map picker (dynamic import)
│   │   ├── ImageUploader.tsx   # Upload ảnh với drag & drop
│   │   └── GroupForm.tsx       # Form tạo/edit nhóm sự kiện
│   ├── Nav.tsx
│   ├── StatsBar.tsx
│   ├── SearchBar.tsx
│   ├── ThemeToggle.tsx
│   └── Providers.tsx
├── app/
│   ├── admin/                  # Admin Panel (dev only)
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Danh sách places
│   │   ├── places/new/
│   │   ├── places/[id]/
│   │   ├── groups/
│   │   ├── groups/new/
│   │   └── groups/[id]/
│   └── api/admin/              # API routes (dev only)
│       ├── places/
│       ├── places/[id]/
│       ├── upload/
│       ├── groups/
│       └── groups/[id]/
├── data/
│   └── places.json             # Toàn bộ data địa điểm
├── middleware.ts               # Block /admin trong production
├── public/
│   └── images/
│       └── [slug]/             # Ảnh local (.webp sau khi optimize)
├── styles/
│   ├── _variables.scss         # Color tokens, spacing, breakpoints
│   ├── _mixins.scss            # Responsive, flex helpers
│   ├── _reset.scss             # CSS reset
│   ├── _typography.scss        # Typography, prose styles
│   ├── components/             # SCSS cho từng component
│   └── main.scss               # Entry point, import tất cả partials
└── lib/
    ├── types.ts                # TypeScript types: Place, PlaceGroup
    └── places.ts               # Helper functions: filter, stats, group
```

---

## SCSS / BEM Convention

Toàn bộ class name theo pattern:

```
.rethink-[block]__[element]--[modifier]
```

Ví dụ: `.rethink-card`, `.rethink-card__title`, `.rethink-card--featured`

Dark mode dùng CSS custom properties, toggle bằng `[data-theme="dark"]` trên thẻ `<html>`.

---

## Data Schema

### Địa điểm đơn

```json
{
  "id": "long-an-2024",
  "slug": "long-an-2024",
  "name": "Long An",
  "country": "Vietnam",
  "province": "Long An",
  "city": null,
  "coordinates": [10.5354, 106.4121],
  "date": "2024-03-15",
  "summary": "Một chuyến đi ngắn xuống vùng đồng bằng sông Cửu Long...",
  "coverImage": "/images/long-an-2024/cover.jpg",
  "featuredImages": ["/images/long-an-2024/1.jpg"]
}
```

### Sự kiện gắn nhiều địa điểm (grouped event)

Hai địa điểm cùng `groupId` sẽ được nối bằng polyline trên map và dẫn về cùng một trang chi tiết.

```json
[
  {
    "id": "wedding-nha-gai",
    "slug": "dam-cuoi-2024",
    "name": "Đám cưới - Nhà gái",
    "country": "Vietnam",
    "province": "TP. Hồ Chí Minh",
    "city": "Quận 7",
    "coordinates": [10.7285, 106.7217],
    "date": "2024-11-10",
    "summary": "Lễ vu quy tại nhà gái...",
    "coverImage": "/images/dam-cuoi-2024/nha-gai-cover.jpg",
    "featuredImages": ["/images/dam-cuoi-2024/ng-1.jpg"],
    "groupId": "dam-cuoi-2024",
    "groupLabel": "Đám cưới 2024"
  },
  {
    "id": "wedding-nha-trai",
    "slug": "dam-cuoi-2024",
    "name": "Đám cưới - Nhà trai",
    "country": "Vietnam",
    "province": "Long An",
    "city": null,
    "coordinates": [10.5400, 106.4200],
    "date": "2024-11-11",
    "summary": "Lễ thành hôn tại nhà trai...",
    "coverImage": "/images/dam-cuoi-2024/nha-trai-cover.jpg",
    "featuredImages": ["/images/dam-cuoi-2024/nt-1.jpg"],
    "groupId": "dam-cuoi-2024",
    "groupLabel": "Đám cưới 2024"
  }
]
```

---

## Chạy dự án

```bash
# Cài dependencies
npm install

# Chạy dev server
npm run dev

# Build production
npm run build
```

Mở [http://localhost:3000](http://localhost:3000) để xem kết quả.

---

## Tính năng trang chi tiết

- **Hero image** — `aspect-ratio: 16/9`, responsive
- **Gallery** — hiển thị tối đa 6 ảnh, ô cuối có overlay `+N / Xem thêm`
- **Lightbox** — click ảnh mở full-screen; phím `←` `→` điều hướng, `Esc` đóng
- **Share** — dropdown với Facebook (popup), Instagram (`navigator.share` / copy), Sao chép link
- **Related places** — 3 địa điểm mới nhất khác slug hiện tại ở cuối trang
- **Locations list** (group) — hiển thị từng địa điểm trong nhóm với ngày và tỉnh

---

## Admin Panel

Chạy tại `http://localhost:3000/admin` — chỉ khả dụng khi `NODE_ENV=development`.

`middleware.ts` tự động block toàn bộ `/admin` và `/api/admin` trong production.

### Các trang

| Route | Chức năng |
|-------|-----------|
| `/admin` | Danh sách places (table, dedup by slug) |
| `/admin/places/new` | Tạo place mới |
| `/admin/places/[id]` | Chỉnh sửa place |
| `/admin/groups` | Danh sách nhóm sự kiện |
| `/admin/groups/new` | Tạo nhóm mới |
| `/admin/groups/[id]` | Chỉnh sửa nhóm |

### Coordinate Picker

- Tìm kiếm địa điểm bằng **Nominatim** (OpenStreetMap, miễn phí, không cần API key)
- Hoặc click trực tiếp trên bản đồ để lấy tọa độ
- Debounce 450ms, hiển thị tối đa 6 kết quả

### Image Upload & Optimization

Ảnh được xử lý qua **Sharp** trước khi lưu vào `public/images/[slug]/`:

| Bước | Tác dụng |
|------|----------|
| `.rotate()` | Auto-rotate theo EXIF orientation |
| `.resize({ withoutEnlargement: true })` | Thu nhỏ nếu vượt giới hạn, không phóng to |
| `.withMetadata({ exif: {} })` | Strip EXIF (GPS, camera info) |
| `.webp({ quality })` | Convert sang WebP — ~40–70% nhỏ hơn JPEG |

- Cover: max `1800×1200px`, quality 85
- Featured: max `1200×900px`, quality 82
- Output luôn lưu dạng `.webp`

### API Routes

```
GET  /api/admin/places          — lấy tất cả places
POST /api/admin/places          — tạo place mới → ghi data/places.json
PUT  /api/admin/places/[id]     — cập nhật place
DEL  /api/admin/places/[id]     — xoá place

POST /api/admin/upload          — upload + optimize ảnh → public/images/[slug]/

GET  /api/admin/groups          — lấy groups (derived từ places)
POST /api/admin/groups          — tạo group (gán slug/groupId cho nhiều places)
PUT  /api/admin/groups/[id]     — cập nhật group (thêm/xoá places, đổi label)
DEL  /api/admin/groups/[id]     — giải tán group (places trở về độc lập)
```

---

## Hướng dẫn thêm nội dung

Cách nhanh nhất: dùng Admin Panel tại `/admin`.

Hoặc chỉnh sửa trực tiếp `data/places.json` theo schema ở trên, sau đó đặt ảnh vào `public/images/[slug]/`.
