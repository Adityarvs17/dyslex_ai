import React from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { Slider } from './Slider';
import { Toggle } from './Toggle';
import { Select, FONT_OPTIONS } from './Select';
import { TypographySettings } from '@/types';

export const TypographySection: React.FC = () => {
  const { settings, updateTypography } = useSettingsStore();
  const { typography } = settings;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 pb-2 border-b border-white/10">
        <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
        <h3 className="text-sm font-semibold text-white/90">Typography</h3>
      </div>

      <Select
        label="Font Family"
        value={typography.fontFamily}
        options={FONT_OPTIONS}
        onChange={(value) => updateTypography({ fontFamily: value as TypographySettings['fontFamily'] })}
      />

      <Slider
        label="Line Height"
        value={typography.lineHeight}
        min={1.0}
        max={3.0}
        step={0.1}
        onChange={(value) => updateTypography({ lineHeight: value })}
      />

      <Slider
        label="Letter Spacing"
        value={typography.letterSpacing}
        min={0}
        max={10}
        step={0.5}
        unit="px"
        onChange={(value) => updateTypography({ letterSpacing: value })}
      />

      <Slider
        label="Word Spacing"
        value={typography.wordSpacing}
        min={0}
        max={20}
        step={1}
        unit="px"
        onChange={(value) => updateTypography({ wordSpacing: value })}
      />

      <Toggle
        label="Bold Text"
        description="Make all text bold for better visibility"
        checked={typography.fontWeight === 'bold'}
        onChange={(checked) => updateTypography({ fontWeight: checked ? 'bold' : 'normal' })}
      />
    </div>
  );
};
