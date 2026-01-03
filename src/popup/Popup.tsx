import React, { useEffect, useState } from 'react';
import { LexiLensSettings, DEFAULT_SETTINGS } from '../types';
import { getSettings, saveSettings } from '../utils/storage';

export const Popup: React.FC = () => {
  const [settings, setSettings] = useState<LexiLensSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const toggleEnabled = async () => {
    const newSettings = { ...settings, enabled: !settings.enabled };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const openFullPanel = () => {
    // Send message to content script to open the panel
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'OPEN_PANEL' });
        window.close();
      }
    });
  };

  if (loading) {
    return (
      <div className="w-72 p-6 bg-surface-900 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-72 bg-surface-900 text-white font-sans">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-accent-500 
                          flex items-center justify-center shadow-glow">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold">LexiLens</h1>
            <p className="text-xs text-white/50">Reading Assistant</p>
          </div>
        </div>
      </div>

      {/* Quick Toggle */}
      <div className="p-4">
        <button
          onClick={toggleEnabled}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all
                      flex items-center justify-center gap-3
                      ${settings.enabled
                        ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-glow hover:shadow-glow-lg'
                        : 'bg-surface-800 text-white/60 hover:bg-surface-700'}`}
        >
          <div className={`w-3 h-3 rounded-full ${settings.enabled ? 'bg-white animate-pulse-soft' : 'bg-white/30'}`} />
          {settings.enabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      {/* Quick Stats */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-2">
          <FeatureIndicator 
            label="Reading Ruler" 
            enabled={settings.visualAids.readingRuler.enabled} 
          />
          <FeatureIndicator 
            label="Screen Tint" 
            enabled={settings.visualAids.screenTint.enabled && settings.visualAids.screenTint.preset !== 'none'} 
          />
          <FeatureIndicator 
            label="Bionic Reading" 
            enabled={settings.cognitive.bionicReading.enabled} 
          />
          <FeatureIndicator 
            label="Focus Mode" 
            enabled={settings.visualAids.focusMode.enabled} 
          />
        </div>
      </div>

      {/* Open Full Panel Button */}
      <div className="p-4 pt-0">
        <button
          onClick={openFullPanel}
          className="w-full py-2.5 rounded-xl bg-surface-800 text-white/70 
                     hover:bg-surface-700 hover:text-white transition-all
                     text-sm font-medium flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Open Full Settings
        </button>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10 bg-surface-800/50">
        <p className="text-xs text-white/30 text-center">
          Use the floating button on any webpage for full controls
        </p>
      </div>
    </div>
  );
};

// Feature indicator component
const FeatureIndicator: React.FC<{ label: string; enabled: boolean }> = ({ label, enabled }) => (
  <div className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2
                   ${enabled ? 'bg-primary-500/20 text-primary-400' : 'bg-surface-800 text-white/40'}`}>
    <div className={`w-1.5 h-1.5 rounded-full ${enabled ? 'bg-primary-400' : 'bg-white/30'}`} />
    {label}
  </div>
);
