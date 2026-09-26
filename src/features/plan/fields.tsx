"use client";

import { createContext, useContext, useId, useState, type ReactNode } from "react";

// Lets the control inside a Field pick up its label's id.
const FieldId = createContext<string | undefined>(undefined);

/** Small-caps label above an underlined control — editorial, not boxed. */
export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  const id = useId();
  return (
    <div className="min-w-0 border-b border-line-2 pb-2 focus-within:border-blue">
      <label htmlFor={id} className="eyebrow block whitespace-nowrap">
        {label}
      </label>
      <FieldId.Provider value={id}>{children}</FieldId.Provider>
      {hint && <span className="block text-[12px] text-muted">{hint}</span>}
    </div>
  );
}

const control = "mt-1 w-full min-w-0 border-none bg-transparent p-0 text-[18px] font-medium text-ink outline-none";

/**
 * A number input that keeps what's typed ("2.", "0.0") while committing the
 * parsed value upward. If the value changes from outside (a unit switch), the
 * outside value wins.
 */
export function NumberField({
  value,
  onChange,
  placeholder = "—",
  integer = false,
  min = 0,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder?: string;
  integer?: boolean;
  min?: number;
}) {
  const id = useContext(FieldId);
  const [text, setText] = useState(value === null ? "" : String(value));
  const parse = (s: string) => {
    const n = integer ? parseInt(s, 10) : parseFloat(s);
    return isFinite(n) && n >= min && (integer || n > 0) ? n : null;
  };
  const shown = parse(text) === value ? text : value === null ? (parse(text) === null ? text : "") : String(value);
  return (
    <input
      id={id}
      value={shown}
      inputMode={integer ? "numeric" : "decimal"}
      placeholder={placeholder}
      onChange={(e) => {
        setText(e.target.value);
        onChange(parse(e.target.value));
      }}
      className={control}
    />
  );
}

export function SelectField<V extends string>({ value, options, onChange }: { value: V; options: { value: V; label: string }[]; onChange: (v: V) => void }) {
  const id = useContext(FieldId);
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value as V)} className={`${control} cursor-pointer text-[16px]`}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function TimeField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const id = useContext(FieldId);
  return <input id={id} type="time" value={value} onChange={(e) => e.target.value && onChange(e.target.value)} className={`${control} text-[16px]`} />;
}

export function DateField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const id = useContext(FieldId);
  return <input id={id} type="date" value={value} onChange={(e) => e.target.value && onChange(e.target.value)} className={`${control} text-[16px]`} />;
}

export function Segmented<V extends string>({ value, options, onChange, label }: { value: V; options: { value: V; label: string }[]; onChange: (v: V) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full border border-line-2 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`cursor-pointer rounded-full px-3.5 py-1 text-[13px] font-medium transition-colors ${
            value === o.value ? "bg-ink text-paper" : "text-body hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
