import React, { useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { TypographySection } from './TypographySection';
import { VisualAidsSection } from './VisualAidsSection';
import { CognitiveSection } from './CognitiveSection';
import { AudioSection } from './AudioSection';

type TabId = 'typography' | 'visual' | 'cognitive' | 'audio';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  {
    id: 'typography',
    label: 'Text',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
      </svg>
    ),
  },
  {
    id: 'visual',
    label: 'Visual',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    id: 'cognitive',
    label: 'Reading',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    id: 'audio',
    label: 'Audio',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      </svg>
    ),
  },
];

interface PanelProps {
  onClose: () => void;
}

export const Panel: React.FC<PanelProps> = ({ onClose }) => {
  const { settings, toggleExtension, resetToDefaults } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<TabId>('typography');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'typography':
        return <TypographySection />;
      case 'visual':
        return <VisualAidsSection />;
      case 'cognitive':
        return <CognitiveSection />;
      case 'audio':
        return <AudioSection />;
      default:
        return null;
    }
  };

  return (
    <div className="w-[340px] max-h-[550px] flex flex-col rounded-2xl glass shadow-2xl overflow-hidden animate-scale-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-accent-500 
                          flex items-center justify-center shadow-glow">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">LexiLens</h2>
            <p className="text-xs text-white/50">Reading Assistant</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Master Toggle */}
          <button
            onClick={toggleExtension}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                       ${settings.enabled 
                         ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                         : 'bg-surface-700 text-white/50 hover:bg-surface-600'}`}
          >
            {settings.enabled ? 'ON' : 'OFF'}
          </button>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex p-2 gap-1 border-b border-white/10 bg-surface-900/30">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg
                        text-xs font-medium transition-all
                        ${activeTab === tab.id
                          ? 'bg-primary-500/20 text-primary-400'
                          : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 lexilens-scrollbar">
        {settings.enabled ? (
          renderTabContent()
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <div>
              <p className="text-white/70 font-medium">LexiLens is disabled</p>
              <p className="text-white/40 text-sm mt-1">Click the ON button above to enable</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-3 border-t border-white/10 bg-surface-900/30">
        <button
          onClick={resetToDefaults}
          className="text-xs text-white/40 hover:text-white/60 transition-colors"
        >
          Reset to defaults
        </button>
        <span className="text-xs text-white/30">v1.0.0</span>
      </div>
    </div>
  );
};
