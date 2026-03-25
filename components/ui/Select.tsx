"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  disabled?: boolean;
  "aria-label"?: string;
}

export default function Select({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  "aria-label": ariaLabel,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  const openDropdown = useCallback(() => {
    if (disabled) return;
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 160),
      });
    }
    setOpen(true);
  }, [disabled]);

  const close = useCallback(() => setOpen(false), []);

  // Close on outside click or scroll
  useEffect(() => {
    if (!open) return;

    function handleOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        close();
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open, close]);

  function select(val: string) {
    onChange(val);
    close();
  }

  const dropdown = open
    ? createPortal(
        <div
          ref={dropdownRef}
          className="rethink-select__dropdown"
          role="listbox"
          aria-label={ariaLabel}
          style={{
            position: "fixed",
            top: dropdownPos.top,
            left: dropdownPos.left,
            minWidth: dropdownPos.width,
          }}
        >
          <button
            type="button"
            role="option"
            aria-selected={value === ""}
            className={`rethink-select__option${value === "" ? " rethink-select__option--selected" : ""}`}
            onClick={() => select("")}
          >
            {placeholder}
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={value === opt.value}
              className={`rethink-select__option${value === opt.value ? " rethink-select__option--selected" : ""}`}
              onClick={() => select(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={[
          "rethink-select__trigger",
          open ? "rethink-select__trigger--open" : "",
          disabled ? "rethink-select__trigger--disabled" : "",
          value ? "rethink-select__trigger--active" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => (open ? close() : openDropdown())}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        <span className="rethink-select__value">
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className="rethink-select__chevron"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {dropdown}
    </>
  );
}
