import React from 'react';

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <div 
      className={`flex items-center justify-between gap-3 p-3 rounded-lg bg-surface-800/30 
                  hover:bg-surface-800/50 transition-colors cursor-pointer
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => !disabled && onChange(!checked)}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-white/90">{label}</span>
        {description && (
          <span className="text-xs text-white/50">{description}</span>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
                    transition-colors duration-200 ease-in-out focus:outline-none
                    ${checked ? 'bg-primary-500' : 'bg-surface-600'}
                    ${disabled ? 'cursor-not-allowed' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) onChange(!checked);
        }}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full
                      bg-white shadow-lg ring-0 transition duration-200 ease-in-out
                      ${checked ? 'translate-x-5' : 'translate-x-0.5'}
                      mt-0.5`}
        />
      </button>
    </div>
  );
};
