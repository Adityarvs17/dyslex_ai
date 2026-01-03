import React from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { Slider } from './Slider';
import { Toggle } from './Toggle';
import { Select } from './Select';
import { SyllableSplitterSettings } from '@/types';

const SEPARATOR_OPTIONS = [
  { value: '·', label: 'Middle Dot (·)' },
  { value: '-', label: 'Hyphen (-)' },
  { value: ' ', label: 'Space' },
];

export const CognitiveSection: React.FC = () => {
  const { settings, updateCognitive } = useSettingsStore();
  const { cognitive } = settings;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 pb-2 border-b border-white/10">
        <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h3 className="text-sm font-semibold text-white/90">Reading Assistance</h3>
      </div>

      {/* Bionic Reading */}
      <div className="space-y-3 p-3 rounded-xl bg-surface-800/30">
        <Toggle
          label="Bionic Reading"
          description="Bolds the first part of words to guide your eye"
          checked={cognitive.bionicReading.enabled}
          onChange={(enabled) => updateCognitive({ bionicReading: { enabled } })}
        />
        
        {cognitive.bionicReading.enabled && (
          <div className="space-y-3 pt-2 pl-2 border-l-2 border-primary-500/30">
            <Slider
              label="Bold Percentage"
              value={cognitive.bionicReading.boldPercentage}
              min={30}
              max={70}
              step={5}
              unit="%"
              onChange={(boldPercentage) => updateCognitive({ bionicReading: { boldPercentage } })}
            />
            <p className="text-xs text-white/50 leading-relaxed">
              Example: <strong className="text-white/90">Thi</strong>s is <strong className="text-white/90">ho</strong>w <strong className="text-white/90">bio</strong>nic <strong className="text-white/90">read</strong>ing <strong className="text-white/90">wor</strong>ks
            </p>
          </div>
        )}
      </div>

      {/* Syllable Splitter */}
      <div className="space-y-3 p-3 rounded-xl bg-surface-800/30">
        <Toggle
          label="Syllable Splitter"
          description="Splits words into syllables for easier reading"
          checked={cognitive.syllableSplitter.enabled}
          onChange={(enabled) => updateCognitive({ syllableSplitter: { enabled } })}
        />
        
        {cognitive.syllableSplitter.enabled && (
          <div className="space-y-3 pt-2 pl-2 border-l-2 border-primary-500/30">
            <Select
              label="Separator"
              value={cognitive.syllableSplitter.separator}
              options={SEPARATOR_OPTIONS}
              onChange={(separator) => updateCognitive({ 
                syllableSplitter: { separator: separator as SyllableSplitterSettings['separator'] } 
              })}
            />
            <p className="text-xs text-white/50 leading-relaxed">
              Example: el{cognitive.syllableSplitter.separator}e{cognitive.syllableSplitter.separator}phant, 
              beau{cognitive.syllableSplitter.separator}ti{cognitive.syllableSplitter.separator}ful
            </p>
          </div>
        )}
      </div>

      {/* Note about cognitive features */}
      <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20">
        <p className="text-xs text-primary-300 leading-relaxed">
          💡 <strong>Tip:</strong> These features work best on article and blog content. 
          Some dynamic websites may have limited support.
        </p>
      </div>
    </div>
  );
};
