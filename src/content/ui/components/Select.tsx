import React from 'react';
import { TypographySettings } from '@/types';

interface SelectProps {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  options,
  onChange,
  disabled = false,
}) => {
  return (
    <div className={`flex flex-col gap-2 ${disabled ? 'opacity-50' : ''}`}>
      <label className="text-sm font-medium text-white/90">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 rounded-lg bg-surface-700/80 border border-white/10
                   text-white text-sm cursor-pointer
                   focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30
                   disabled:cursor-not-allowed appearance-none
                   bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')]
                   bg-[length:8px] bg-[center_right_12px] bg-no-repeat"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-surface-800">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// Font options for the typography settings
export const FONT_OPTIONS: Array<{ value: TypographySettings['fontFamily']; label: string }> = [
  { value: 'system-ui', label: 'System Default' },
  { value: 'OpenDyslexic', label: 'OpenDyslexic' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Comic Sans MS', label: 'Comic Sans' },
];
