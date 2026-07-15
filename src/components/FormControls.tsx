import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  className?: string;
  [key: string]: any;
}

export function Input({ label, className = "", ...props }: InputProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[11px] font-semibold text-slate-700">{label}</label>
      <input
        {...props}
        className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed w-full"
      />
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  className?: string;
  [key: string]: any;
}

export function Select({ label, options, className = "", ...props }: SelectProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[11px] font-semibold text-slate-700">{label}</label>
      <select
        {...props}
        className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed bg-white w-full"
      >
        <option value="" disabled>Select {label.toLowerCase()}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  className?: string;
  [key: string]: any;
}

export function Checkbox({ label, className = "", ...props }: CheckboxProps) {
  return (
    <label className={`flex items-center gap-2 text-sm cursor-pointer ${className}`}>
      <input
        type="checkbox"
        {...props}
        className="rounded border-slate-300 accent-slate-900 cursor-pointer w-4 h-4"
      />
      <span>{label}</span>
    </label>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  description?: string;
  className?: string;
  [key: string]: any;
}

export function Textarea({ label, description, className = "", ...props }: TextareaProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <h2 className="text-xs font-bold text-slate-500 uppercase mb-0">{label}</h2>
      {description && <p className="text-[10px] text-slate-400 mb-1">{description}</p>}
      <textarea
        {...props}
        className="w-full border border-slate-300 rounded p-3 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 min-h-[64px]"
      />
    </div>
  );
}
