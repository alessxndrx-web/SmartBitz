import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function InputField({ label, hint, id, ...props }: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <label className="field" htmlFor={inputId}>
      <span className="field-label">{label}</span>
      <input className="input" id={inputId} {...props} />
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}
