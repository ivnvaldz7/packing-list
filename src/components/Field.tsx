import type { ChangeEventHandler, ReactNode } from 'react';

type FieldProps = {
  label: string;
  children: ReactNode;
  error?: string;
};

export const Field = ({ label, children, error }: FieldProps) => (
  <label className={`field ${error ? 'field-with-error' : ''}`}>
    <span>{label}</span>
    {children}
    {error ? <small className="field-error">{error}</small> : null}
  </label>
);

type InputFieldProps = {
  label: string;
  value: string | number;
  type?: 'text' | 'date' | 'number';
  min?: number;
  step?: number;
  onChange: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  error?: string;
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
    />
  </Field>
);

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  options: Array<{ value: string; label: string }>;
  error?: string;
};

export const SelectField = ({ label, value, onChange, options, error }: SelectFieldProps) => (
  <Field label={label} error={error}>
    <select value={value} onChange={onChange} aria-invalid={Boolean(error)}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </Field>
);
