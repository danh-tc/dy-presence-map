import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

// Max dimensions (px). Sharp không upscale nếu ảnh nhỏ hơn (withoutEnlargement).
const LIMITS = {
  cover:    { width: 1800, height: 1200, quality: 85 }, // 2x hero 900px
  featured: { width: 1200, height: 900,  quality: 82 }, // 2x gallery cell
} as const;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const slug = formData.get("slug") as string | null;
    const type = formData.get("type") as "cover" | "featured" | null;

    if (!file || !slug || !type) {
      return NextResponse.json({ error: "file, slug, type required" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const raw = Buffer.from(await file.arrayBuffer());
    const { width, height, quality } = LIMITS[type];

    // Pipeline: resize → strip EXIF → convert to WebP
    const optimized = await sharp(raw)
      .rotate()                          // auto-rotate từ EXIF orientation trước khi strip
      .resize({ width, height, fit: "inside", withoutEnlargement: true })
      .withMetadata({ exif: {} })        // strip tất cả EXIF, chỉ giữ orientation
      .webp({ quality, effort: 4 })      // effort 4 = cân bằng tốc độ / compression
      .toBuffer();

    const dir = path.join(process.cwd(), "public", "images", slug);
    await mkdir(dir, { recursive: true });

    // Luôn lưu dưới dạng .webp
    const filename = type === "cover" ? "cover.webp" : `${Date.now()}.webp`;
    await writeFile(path.join(dir, filename), optimized);

    // Log để dev biết mức tiết kiệm
    const savedKB = ((raw.length - optimized.length) / 1024).toFixed(0);
    const ratio = ((1 - optimized.length / raw.length) * 100).toFixed(0);
    console.log(`[upload] ${filename}: ${(raw.length / 1024).toFixed(0)}KB → ${(optimized.length / 1024).toFixed(0)}KB (-${savedKB}KB, ${ratio}%)`);

    return NextResponse.json({ path: `/images/${slug}/${filename}` });
  } catch (err) {
    console.error("[upload] error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
