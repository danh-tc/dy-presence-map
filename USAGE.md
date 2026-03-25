# Hướng dẫn sử dụng - Daen’s Footprints

## Mục lục

1. [Thêm địa điểm mới](#1-thêm-địa-điểm-mới)
2. [Thêm sự kiện nhiều địa điểm](#2-thêm-sự-kiện-nhiều-địa-điểm)
3. [Thêm ảnh](#3-thêm-ảnh)
4. [Tìm tọa độ địa điểm](#4-tìm-tọa-độ-địa-điểm)
5. [Trang chi tiết với nội dung dài](#5-trang-chi-tiết-với-nội-dung-dài)
6. [Filter và tìm kiếm](#6-filter-và-tìm-kiếm)
7. [Cấu trúc URL](#7-cấu-trúc-url)

---

## 1. Thêm địa điểm mới

Mở file `data/places.json` và thêm một object mới vào mảng:

```json
{
  "id": "ten-dia-diem-nam",
  "slug": "ten-dia-diem-nam",
  "name": "Tên hiển thị",
  "country": "Vietnam",
  "province": "Tên tỉnh",
  "city": "Tên thành phố (hoặc null)",
  "coordinates": [vĩ_độ, kinh_độ],
  "date": "YYYY-MM-DD",
  "summary": "Mô tả ngắn hiển thị trong popup và timeline (1-3 câu).",
  "coverImage": "/images/ten-dia-diem-nam/cover.jpg",
  "featuredImages": [
    "/images/ten-dia-diem-nam/1.jpg",
    "/images/ten-dia-diem-nam/2.jpg"
  ]
}
```

**Lưu ý:**
- `id` phải là duy nhất trong toàn bộ file
- `slug` dùng để tạo URL: `/place/[slug]` - nên viết thường, dùng dấu `-` thay khoảng trắng
- `coordinates` theo thứ tự `[latitude, longitude]` - xem mục 4 để tìm tọa độ
- `date` theo định dạng `YYYY-MM-DD` (ví dụ: `2024-03-15`)

---

## 2. Thêm sự kiện nhiều địa điểm

Dùng khi một sự kiện diễn ra ở nhiều nơi (ví dụ: đám cưới 2 nhà, chuyến đi qua nhiều tỉnh trong cùng một dịp).

Thêm **nhiều object** với cùng `slug`, `groupId`, và `groupLabel`:

```json
{
  "id": "ten-su-kien-dia-diem-1",
  "slug": "ten-su-kien-2024",
  "name": "Tên sự kiện - Địa điểm 1",
  "country": "Vietnam",
  "province": "Tỉnh A",
  "city": null,
  "coordinates": [lat1, lng1],
  "date": "2024-11-10",
  "summary": "Mô tả tại địa điểm 1...",
  "coverImage": "/images/ten-su-kien-2024/dd1-cover.jpg",
  "featuredImages": ["/images/ten-su-kien-2024/dd1-1.jpg"],
  "groupId": "ten-su-kien-2024",
  "groupLabel": "Tên hiển thị của sự kiện"
},
{
  "id": "ten-su-kien-dia-diem-2",
  "slug": "ten-su-kien-2024",
  "name": "Tên sự kiện - Địa điểm 2",
  "country": "Vietnam",
  "province": "Tỉnh B",
  "city": null,
  "coordinates": [lat2, lng2],
  "date": "2024-11-11",
  "summary": "Mô tả tại địa điểm 2...",
  "coverImage": "/images/ten-su-kien-2024/dd2-cover.jpg",
  "featuredImages": ["/images/ten-su-kien-2024/dd2-1.jpg"],
  "groupId": "ten-su-kien-2024",
  "groupLabel": "Tên hiển thị của sự kiện"
}
```

**Kết quả trên map:**
- Mỗi địa điểm có một marker màu xanh (khác với marker đơn màu đỏ cam)
- Các marker trong cùng group được nối bằng đường nét đứt
- Click bất kỳ marker nào cũng dẫn về cùng trang `/place/ten-su-kien-2024`
- Trong timeline: hiển thị như một entry duy nhất với badge group và danh sách địa điểm

---

## 3. Thêm ảnh

Tạo thư mục trong `public/images/` đặt tên trùng với `slug`:

```
public/
└── images/
    └── ten-dia-diem-nam/
        ├── cover.jpg        ← ảnh bìa chính (hiển thị trong popup và đầu trang chi tiết)
        ├── 1.jpg
        ├── 2.jpg
        └── 3.jpg
```

**Khuyến nghị:**
- `cover.jpg` - tỷ lệ 16:9 hoặc 3:2, tối thiểu 800px chiều rộng
- Ảnh gallery - tỷ lệ 4:3, tối thiểu 600px chiều rộng
- Định dạng `.jpg` hoặc `.webp` để tối ưu dung lượng

Sau đó cập nhật `coverImage` và `featuredImages` trong `data/places.json` để trỏ đúng đường dẫn.

---

## 4. Tìm tọa độ địa điểm

**Cách 1: Google Maps**
1. Mở Google Maps, tìm địa điểm
2. Click chuột phải vào vị trí trên bản đồ
3. Dòng đầu tiên trong menu hiện ra là tọa độ dạng `latitude, longitude`
4. Click vào để copy

**Cách 2: OpenStreetMap**
1. Mở [openstreetmap.org](https://www.openstreetmap.org)
2. Tìm địa điểm, click phải → "Show address"
3. URL trên thanh địa chỉ chứa `#map=zoom/lat/lng`

**Lưu ý:** Thứ tự trong `coordinates` là `[latitude, longitude]` - latitude (vĩ độ) trước, longitude (kinh độ) sau.

Ví dụ Long An: `[10.5354, 106.4121]`

---

## 5. Trang chi tiết với nội dung dài

Mặc định, trang `/place/[slug]` hiển thị `summary` từ `data/places.json`. Nếu muốn thêm nội dung dài hơn (câu chuyện, hành trình, ghi chép), tạo file MDX:

**Tạo file** `content/places/[slug].mdx`:

```mdx
# Long An - Đồng bằng sông Cửu Long

Chuyến đi bắt đầu từ sáng sớm, khi sương còn chưa tan...

## Hành trình

- 7:00 sáng: Khởi hành từ Sài Gòn
- 9:00 sáng: Đến Tân An, ghé chợ buổi sáng
- 11:00 sáng: Thăm cánh đồng lúa

## Ẩm thực

Bánh tét lá cẩm đặc sản Long An, cơm tấm bì chả với nước mắm pha đúng điệu miền Tây...
```

*(Tính năng render MDX vào trang chi tiết sẽ được tích hợp trong bước phát triển tiếp theo.)*

---

## 6. Filter và tìm kiếm

Trên trang chủ (bản đồ) có 3 cách lọc địa điểm:

| Cách | Mô tả |
|---|---|
| **Tìm kiếm** | Gõ tên địa điểm, tỉnh, quốc gia vào ô search → map cập nhật ngay |
| **Lọc quốc gia** | Chọn quốc gia từ dropdown |
| **Lọc tỉnh/thành** | Sau khi chọn quốc gia, chọn tiếp tỉnh/thành |

Bộ lọc được lưu vào URL (ví dụ `/?country=Vietnam&province=Long+An`) - có thể copy link để chia sẻ kết quả filter.

Bấm **"Xóa bộ lọc"** để reset về xem tất cả địa điểm.

---

## 7. Cấu trúc URL

| URL | Nội dung |
|---|---|
| `/` | Trang chủ - bản đồ với toàn bộ địa điểm |
| `/?country=Vietnam` | Bản đồ lọc theo quốc gia |
| `/?country=Vietnam&province=Long+An` | Lọc theo tỉnh |
| `/?search=đà+lạt` | Tìm kiếm |
| `/timeline` | Xem tất cả kỷ niệm theo thứ tự thời gian |
| `/place/[slug]` | Trang chi tiết của một địa điểm/sự kiện |

---

## Ví dụ: thêm chuyến đi Phú Quốc

**Bước 1:** Thêm vào `data/places.json`:

```json
{
  "id": "phu-quoc-2025",
  "slug": "phu-quoc-2025",
  "name": "Phú Quốc",
  "country": "Vietnam",
  "province": "Kiên Giang",
  "city": "Phú Quốc",
  "coordinates": [10.2899, 103.9840],
  "date": "2025-01-20",
  "summary": "Đảo ngọc Phú Quốc - biển xanh, cát trắng, và những buổi hoàng hôn không thể quên.",
  "coverImage": "/images/phu-quoc-2025/cover.jpg",
  "featuredImages": [
    "/images/phu-quoc-2025/1.jpg",
    "/images/phu-quoc-2025/2.jpg",
    "/images/phu-quoc-2025/3.jpg"
  ]
}
```

**Bước 2:** Tạo thư mục `public/images/phu-quoc-2025/` và copy ảnh vào.

**Bước 3:** Chạy `npm run dev` → marker mới xuất hiện trên bản đồ tại Phú Quốc.
