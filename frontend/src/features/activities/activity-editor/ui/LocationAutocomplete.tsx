import { useEffect, useMemo, useRef, useState } from 'react';

import type { Location } from '@entities/activities/model';

type Props = {
  locations: Location[];
  value: number | null; // selected location_id
  onChange: (id: number | null) => void; // emit id when selected
  placeholder?: string;
  allowCreateOption?: boolean; // optional: show "Add new"
  onCreateNew?: (name: string) => Promise<boolean>;
  disabled?: boolean;
};

export default function LocationAutocomplete({
  locations,
  value,
  onChange,
  placeholder = 'Search a location…',
  allowCreateOption = false,
  onCreateNew,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // resolve current selected name for display
  const selected = useMemo(
    () => (value != null ? (locations.find((l) => l.id === value) ?? null) : null),
    [value, locations],
  );

  const filtered = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    const safe = (locations ?? []).filter((l): l is Location => !!l && typeof l.name === 'string');
    const base = q ? safe.filter((l) => l.name.toLowerCase().includes(q)) : safe;
    return base.slice(0, 5);
  }, [locations, query]);

  useEffect(() => {
    if (open) setHighlight(0);
  }, [open, query]);

  // close on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  function commitSelection(loc: Location) {
    onChange(loc.id);
    setQuery(loc.name);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1 + (allowCreateOption ? 1 : 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // Enter on create?
      if (allowCreateOption && highlight === filtered.length) {
        if (onCreateNew) onCreateNew(query.trim());
        return;
      }
      const loc = filtered[highlight];
      if (loc) commitSelection(loc);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  useEffect(() => {
    // when controlled value changes from outside, sync input
    if (selected && !open) setQuery(selected.name);
    if (value == null && !open && query && !selected) setQuery('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, selected?.name]);

  async function handleCreateClick() {
    if (!onCreateNew) return;
    try {
      await onCreateNew(query);
      // res?.ok === true → success or 409 handled (auto-selected)
    } finally {
      // close either way so the user sees the banner
      setOpen(false);
      inputRef.current?.blur();
    }
  }
  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        className="w-full rounded border p-2"
        placeholder={placeholder}
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(null); // clear current selection when user edits
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
      />

      {open && (
        <div
          ref={listRef}
          className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow"
          role="listbox"
        >
          {filtered.length === 0 && !allowCreateOption && (
            <div className="px-3 py-2 text-sm text-gray-500">No matches</div>
          )}
          {filtered.map((loc, idx) => (
            <div
              key={loc.id}
              onMouseDown={(e) => {
                e.preventDefault();
                commitSelection(loc);
              }}
              onMouseEnter={() => setHighlight(idx)}
              className={`cursor-pointer px-3 py-2 capitalize ${idx === highlight ? 'bg-gray-100' : ''}`}
              role="option"
              aria-selected={value === loc.id}
            >
              {loc.name}
            </div>
          ))}
          {allowCreateOption && (
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                handleCreateClick();
              }}
              onMouseEnter={() => setHighlight(filtered.length)}
              className={`cursor-pointer border-t px-3 py-2 ${highlight === filtered.length ? 'bg-gray-100' : ''}`}
            >
              {query.trim() ? `➕ Add "${query.trim()}"` : '➕ Add new location'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
