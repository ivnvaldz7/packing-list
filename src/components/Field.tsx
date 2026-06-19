import type { ChangeEventHandler, ReactNode } from 'react';

type FieldProps = {
  label: string;
  children: ReactNode;
  error?: string;
};

export const Field = ({ label, children, error }: FieldProps) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
      {label}
    </span>
    {children}
    {error ? (
      <small className="text-xs text-red-500 dark:text-red-400">{error}</small>
    ) : null}
  </label>
);

/* ─── Reusable input classes ─── */

function inputClasses(error?: string, readOnly?: boolean, className?: string): string {
  return [
    // base
    'w-full rounded-lg border px-3.5 py-2.5 text-sm transition-all duration-150',
    'placeholder:text-stone-400 dark:placeholder:text-stone-500',
    // focus ring
    'focus:outline-none focus:ring-2',
    // error vs normal
    error
      ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500/20 dark:border-red-700 dark:bg-red-950 dark:text-red-300'
      : 'border-stone-300 bg-white text-stone-900 focus:border-brand-500 focus:ring-brand-500/20 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100',
    // read-only
    readOnly ? 'cursor-default opacity-70' : '',
    // custom
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
}

/* ─── InputField ─── */

type InputFieldProps = {
  label: string;
  value: string | number;
  type?: 'text' | 'date' | 'number';
  min?: number;
  step?: number;
  onChange: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  error?: string;
  readOnly?: boolean;
  className?: string;
};

export const InputField = ({
  label,
  value,
  type = 'text',
  min,
  step,
  onChange,
  placeholder,
  error,
  readOnly,
  className,
}: InputFieldProps) => (
  <Field label={label} error={error}>
    <input
      type={type}
      value={value}
      min={min}
      step={step}
      onChange={onChange}
      placeholder={placeholder}
      aria-invalid={Boolean(error)}
      readOnly={readOnly}
      className={inputClasses(error, readOnly, className)}
    />
  </Field>
);

/* ─── SelectField ─── */

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  options: Array<{ value: string; label: string }>;
  error?: string;
};

export const SelectField = ({ label, value, onChange, options, error }: SelectFieldProps) => (
  <Field label={label} error={error}>
    <select
      value={value}
      onChange={onChange}
      aria-invalid={Boolean(error)}
      className={inputClasses(error)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </Field>
);
