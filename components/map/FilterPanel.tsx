"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getCountries, getProvincesByCountry } from "@/lib/places";
import Select from "@/components/ui/Select";

export default function FilterPanel({ search }: Readonly<{ search?: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const country = params.get("country") ?? "";
  const province = params.get("province") ?? "";

  const countries = getCountries().map((c) => ({ value: c, label: c }));
  const provinces = country
    ? getProvincesByCountry(country).map((p) => ({ value: p, label: p }))
    : [];

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    if (key === "country") {
      next.delete("province");
    }
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }

  function clearAll() {
    router.push(pathname, { scroll: false });
  }

  const hasFilter = country || province;

  return (
    <div className="rethink-filter">
      {search && (
        <div className="rethink-filter__search-row">{search}</div>
      )}

      <div className="rethink-filter__control-row">
        {search && (
          <div className="rethink-filter__search-desktop">
            {search}
            <div className="rethink-filter__divider" />
          </div>
        )}

        <span className="rethink-filter__label">Lọc:</span>

        <div className="rethink-filter__group">
          <Select
            value={country}
            onChange={(val) => updateParam("country", val)}
            options={countries}
            placeholder="Tất cả quốc gia"
            aria-label="Chọn quốc gia"
          />
          <Select
            value={province}
            onChange={(val) => updateParam("province", val)}
            options={provinces}
            placeholder="Tất cả tỉnh/thành"
            disabled={!country}
            aria-label="Chọn tỉnh/thành phố"
          />
        </div>

        {hasFilter && (
          <>
            <div className="rethink-filter__divider" />
            <button className="rethink-filter__clear" onClick={clearAll}>
              Xóa bộ lọc
            </button>
          </>
        )}
      </div>
    </div>
  );
}
