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
| **Next.js 14+ (App Router)** | Framework chính |
| **react-leaflet + OpenStreetMap** | Bản đồ tương tác - miễn phí, không cần API key |
| **SCSS + BEM** (`rethink-` prefix) | Styling - không dùng Tailwind |
| **next-themes** | Dark / light mode |
| **@next/mdx** | Nội dung chi tiết dạng Markdown |
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
│   ├── Nav.tsx                 # Thanh navigation
│   ├── StatsBar.tsx            # Thống kê số địa điểm
│   ├── SearchBar.tsx           # Tìm kiếm theo tên
│   ├── ThemeToggle.tsx         # Nút chuyển dark / light
│   └── Providers.tsx           # ThemeProvider wrapper
├── content/
│   └── places/
│       └── [slug].mdx          # Nội dung dài cho từng địa điểm (tuỳ chọn)
├── data/
│   └── places.json             # Toàn bộ data địa điểm
├── public/
│   └── images/
│       └── [slug]/             # Ảnh của từng địa điểm
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

## Hướng dẫn sử dụng

Xem file [USAGE.md](USAGE.md) để biết cách thêm địa điểm, thêm ảnh, và quản lý nội dung.
