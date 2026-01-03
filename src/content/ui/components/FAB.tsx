import React from 'react';
import { useSettingsStore } from '@/store/settingsStore';

interface FABProps {
  onClick: () => void;
  isOpen: boolean;
}

export const FAB: React.FC<FABProps> = ({ onClick, isOpen }) => {
  const { settings } = useSettingsStore();

  return (
    <button
      onClick={onClick}
      className={`group relative w-14 h-14 rounded-2xl shadow-lg transition-all duration-300
                  flex items-center justify-center
                  ${isOpen 
                    ? 'bg-surface-800 rotate-90 scale-90' 
                    : 'bg-gradient-to-br from-primary-500 to-accent-600 hover:scale-105 hover:shadow-glow-lg'
                  }
                  ${!settings.enabled && !isOpen ? 'opacity-60' : ''}`}
      aria-label={isOpen ? 'Close LexiLens panel' : 'Open LexiLens panel'}
    >
      {/* Icon */}
      <div className={`transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
          </svg>
        )}
      </div>

      {/* Status indicator */}
      {!isOpen && (
        <div 
          className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-surface-900
                      transition-colors duration-300
                      ${settings.enabled ? 'bg-green-500' : 'bg-surface-600'}`}
        />
      )}

      {/* Tooltip */}
      {!isOpen && (
        <div className="absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-surface-800 
                        text-white text-sm font-medium whitespace-nowrap
                        opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                        shadow-lg">
          LexiLens
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full
                          border-8 border-transparent border-l-surface-800" />
        </div>
      )}

      {/* Ripple effect on hover */}
      {!isOpen && (
        <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 
                        group-hover:opacity-100 group-active:opacity-20 transition-opacity" />
      )}
    </button>
  );
};
