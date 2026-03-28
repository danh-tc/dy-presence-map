"use client";
import { useState, useRef, useEffect, useId } from "react";

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
}

export function Combobox({ value, onChange, options, placeholder, required }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useId();

  // Sync query when value is changed externally
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close on click outside
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const filtered = options.filter(
    (o) => o.toLowerCase().includes(query.toLowerCase())
  );
  const hasExactMatch = options.some(
    (o) => o.toLowerCase() === query.toLowerCase()
  );
  const showCreate = query.trim() && !hasExactMatch;

  function select(val: string) {
    onChange(val);
    setQuery(val);
    setOpen(false);
  }

  const listId = `combobox-list-${id}`;

  return (
    <div className="rethink-combobox" ref={containerRef}>
      <input
        type="text"
        className="rethink-admin-form__input"
        value={query}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={open}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && (filtered.length > 0 || showCreate) && (
        <ul className="rethink-combobox__list" id={listId} role="listbox">
          {filtered.map((opt) => (
            <li
              key={opt}
              role="option"
              aria-selected={opt === value}
              className={`rethink-combobox__option${opt === value ? " rethink-combobox__option--selected" : ""}`}
              onMouseDown={(e) => { e.preventDefault(); select(opt); }}
            >
              {opt}
            </li>
          ))}
          {showCreate && (
            <li
              role="option"
              aria-selected={false}
              className="rethink-combobox__option rethink-combobox__option--create"
              onMouseDown={(e) => { e.preventDefault(); select(query.trim()); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Tạo mới &ldquo;{query.trim()}&rdquo;
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
