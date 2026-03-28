"use client";
import { useRef, useState, DragEvent } from "react";
import Image from "next/image";

// ─── Cover uploader ───────────────────────────────────────────

interface CoverUploaderProps {
  slug: string;
  value: string;
  onChange: (path: string) => void;
}

export function CoverUploader({ slug, value, onChange }: CoverUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    if (!slug) {
      alert("Vui lòng nhập slug trước khi upload ảnh.");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("slug", slug);
      form.append("type", "cover");
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data.path) onChange(data.path);
    } catch {
      alert("Upload thất bại.");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) uploadFile(file);
  }

  function handleUrlSubmit() {
    const trimmed = urlInput.trim();
    if (trimmed) {
      onChange(trimmed);
      setUrlInput("");
    }
  }

  return (
    <div>
      {value ? (
        <div className="rethink-img-uploader__preview-single">
          <Image src={value} alt="Cover" fill style={{ objectFit: "cover" }} unoptimized />
          <button
            type="button"
            className="rethink-img-uploader__remove-btn"
            onClick={() => onChange("")}
            aria-label="Xóa ảnh"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ) : (
        <>
          <div
            className={`rethink-img-uploader__dropzone${dragOver ? " rethink-img-uploader__dropzone--drag-over" : ""}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          >
            <div className="rethink-img-uploader__dropzone-icon">
              {uploading ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="rethink-spin">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              )}
            </div>
            <div className="rethink-img-uploader__dropzone-text">
              {uploading ? "Đang upload..." : <><strong>Click hoặc kéo thả</strong> để upload ảnh bìa</>}
            </div>
          </div>

          <div className="rethink-img-uploader__url-row">
            <span className="rethink-img-uploader__url-divider">hoặc dán URL</span>
            <div className="rethink-img-uploader__url-input-row">
              <input
                type="url"
                className="rethink-admin-input"
                placeholder="https://..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleUrlSubmit())}
              />
              <button
                type="button"
                className="rethink-btn rethink-btn--secondary rethink-btn--sm"
                onClick={handleUrlSubmit}
                disabled={!urlInput.trim()}
              >
                Dùng URL
              </button>
            </div>
          </div>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ─── Featured images uploader ─────────────────────────────────

interface FeaturedUploaderProps {
  slug: string;
  value: string[];
  onChange: (images: string[]) => void;
}

export function FeaturedUploader({ slug, value, onChange }: FeaturedUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFiles(files: FileList | File[]) {
    if (!slug) {
      alert("Vui lòng nhập slug trước khi upload ảnh.");
      return;
    }
    setUploading(true);
    const newPaths: string[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("slug", slug);
        form.append("type", "featured");
        const res = await fetch("/api/admin/upload", { method: "POST", body: form });
        const data = await res.json();
        if (data.path) newPaths.push(data.path);
      } catch {
        // skip failed uploads
      }
    }
    onChange([...value, ...newPaths]);
    setUploading(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(e.dataTransfer.files);
  }

  function removeImage(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  // Drag-to-reorder
  function handleThumbDragStart(index: number) {
    setDraggingIndex(index);
  }

  function handleThumbDragOver(e: DragEvent, index: number) {
    e.preventDefault();
    setDragOverIndex(index);
  }

  function handleThumbDrop(e: DragEvent, targetIndex: number) {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === targetIndex) return;
    const reordered = [...value];
    const [moved] = reordered.splice(draggingIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    onChange(reordered);
    setDraggingIndex(null);
    setDragOverIndex(null);
  }

  return (
    <div>
      {value.length > 0 && (
        <div className="rethink-img-uploader__grid">
          {value.map((src, i) => (
            <div
              key={src}
              className={[
                "rethink-img-uploader__thumb",
                draggingIndex === i ? "rethink-img-uploader__thumb--dragging" : "",
                dragOverIndex === i && draggingIndex !== i ? "rethink-img-uploader__thumb--drag-over" : "",
              ].join(" ").trim()}
              draggable
              onDragStart={() => handleThumbDragStart(i)}
              onDragOver={(e) => handleThumbDragOver(e, i)}
              onDrop={(e) => handleThumbDrop(e, i)}
              onDragEnd={() => { setDraggingIndex(null); setDragOverIndex(null); }}
            >
              <Image src={src} alt={`Ảnh ${i + 1}`} fill style={{ objectFit: "cover" }} unoptimized />
              <button
                type="button"
                className="rethink-img-uploader__remove-btn"
                onClick={() => removeImage(i)}
                aria-label={`Xóa ảnh ${i + 1}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        className={`rethink-img-uploader__dropzone${dragOver ? " rethink-img-uploader__dropzone--drag-over" : ""}`}
        style={{ marginTop: value.length > 0 ? "8px" : "0" }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        tabIndex={0}
        role="button"
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        <div className="rethink-img-uploader__dropzone-icon">
          {uploading ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="rethink-spin">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          )}
        </div>
        <div className="rethink-img-uploader__dropzone-text">
          {uploading ? "Đang upload..." : <><strong>Click hoặc kéo thả</strong> để thêm ảnh. Kéo để sắp xếp lại.</>}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files) uploadFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
