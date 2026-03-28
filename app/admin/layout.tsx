"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    document.body.classList.add("rethink-admin-mode");
    return () => document.body.classList.remove("rethink-admin-mode");
  }, []);

  const navLinks = [
    { href: "/admin", label: "Tất cả địa điểm" },
    { href: "/admin/places/new", label: "Thêm địa điểm" },
  ];

  const groupLinks = [
    { href: "/admin/groups", label: "Tất cả nhóm" },
    { href: "/admin/groups/new", label: "Tạo nhóm mới" },
  ];

  return (
    <div className="rethink-admin">
      <aside className="rethink-admin__sidebar">
        <Link href="/admin" className="rethink-admin__brand">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          Admin Panel
        </Link>

        <div className="rethink-admin__nav-section">
          <div className="rethink-admin__nav-label">Địa điểm</div>
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rethink-admin__nav-link${pathname === l.href ? " rethink-admin__nav-link--active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="rethink-admin__nav-section">
          <div className="rethink-admin__nav-label">Nhóm sự kiện</div>
          {groupLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rethink-admin__nav-link${pathname === l.href ? " rethink-admin__nav-link--active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <Link href="/" className="rethink-admin__back-link">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Về trang chính
        </Link>
      </aside>

      <main className="rethink-admin__main">{children}</main>
    </div>
  );
}
