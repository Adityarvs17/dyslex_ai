import React, { useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { Slider } from './Slider';
import { Toggle } from './Toggle';
import { ColorPicker } from './ColorPicker';
import { Select } from './Select';
import { ScreenTintSettings } from '@/types';
import { CalibrationModal } from './CalibrationModal';
import { startCalibration } from '@/content/modifiers/irisFocus';

const TINT_PRESETS = [
  { value: 'none', label: 'None' },
  { value: 'sepia', label: 'Sepia (Warm)' },
  { value: 'blue-light', label: 'Blue Light Filter' },
  { value: 'custom', label: 'Custom Color' },
];

export const VisualAidsSection: React.FC = () => {
  const { settings, updateVisualAids } = useSettingsStore();
  const { visualAids } = settings;
  const [showCalibration, setShowCalibration] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 pb-2 border-b border-white/10">
        <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <h3 className="text-sm font-semibold text-white/90">Visual Aids</h3>
      </div>

      {/* Reading Ruler */}
      <div className="space-y-3 p-3 rounded-xl bg-surface-800/30">
        <Toggle
          label="Reading Ruler"
          description="A horizontal bar that follows your cursor"
          checked={visualAids.readingRuler.enabled}
          onChange={(enabled) => updateVisualAids({ readingRuler: { enabled } })}
        />
        
        {visualAids.readingRuler.enabled && (
          <div className="space-y-3 pt-2 pl-2 border-l-2 border-primary-500/30">
            <Slider
              label="Height"
              value={visualAids.readingRuler.height}
              min={20}
              max={200}
              step={10}
              unit="px"
              onChange={(height) => updateVisualAids({ readingRuler: { height } })}
            />
            <Slider
              label="Opacity"
              value={visualAids.readingRuler.opacity}
              min={0.1}
              max={1}
              step={0.1}
              onChange={(opacity) => updateVisualAids({ readingRuler: { opacity } })}
            />
            <ColorPicker
              label="Color"
              value={visualAids.readingRuler.color}
              onChange={(color) => updateVisualAids({ readingRuler: { color } })}
            />
          </div>
        )}
      </div>

      {/* Screen Tint */}
      <div className="space-y-3 p-3 rounded-xl bg-surface-800/30">
        <Toggle
          label="Screen Tint"
          description="Color overlay to reduce eye strain"
          checked={visualAids.screenTint.enabled}
          onChange={(enabled) => updateVisualAids({ screenTint: { enabled } })}
        />
        
        {visualAids.screenTint.enabled && (
          <div className="space-y-3 pt-2 pl-2 border-l-2 border-primary-500/30">
            <Select
              label="Preset"
              value={visualAids.screenTint.preset}
              options={TINT_PRESETS}
              onChange={(preset) => updateVisualAids({ 
                screenTint: { preset: preset as ScreenTintSettings['preset'] } 
              })}
            />
            {visualAids.screenTint.preset === 'custom' && (
              <ColorPicker
                label="Custom Color"
                value={visualAids.screenTint.customColor}
                onChange={(customColor) => updateVisualAids({ screenTint: { customColor } })}
              />
            )}
            <Slider
              label="Intensity"
              value={visualAids.screenTint.intensity}
              min={10}
              max={80}
              step={5}
              unit="%"
              onChange={(intensity) => updateVisualAids({ screenTint: { intensity } })}
            />
          </div>
        )}
      </div>

      {/* Focus Mode */}
      <div className="space-y-3 p-3 rounded-xl bg-surface-800/30">
        <Toggle
          label="Focus Mode"
          description="Dims everything except the paragraph you're reading"
          checked={visualAids.focusMode.enabled}
          onChange={(enabled) => updateVisualAids({ focusMode: { enabled } })}
        />
        
        {visualAids.focusMode.enabled && (
          <div className="space-y-3 pt-2 pl-2 border-l-2 border-primary-500/30">
            <Slider
              label="Dim Amount"
              value={visualAids.focusMode.dimOpacity}
              min={0.3}
              max={0.9}
              step={0.1}
              onChange={(dimOpacity) => updateVisualAids({ focusMode: { dimOpacity } })}
            />
          </div>
        )}
      </div>

      {/* Iris Focus (Eye Tracking) */}
      <div className="space-y-3 p-3 rounded-xl bg-surface-800/30">
        <Toggle
          label="Iris Focus"
          description="Blur screen where you are NOT looking (Eye Tracking)"
          checked={visualAids.irisFocus.enabled}
          onChange={(enabled) => updateVisualAids({ irisFocus: { enabled } })}
        />
        
        {visualAids.irisFocus.enabled && (
          <div className="space-y-3 pt-2 pl-2 border-l-2 border-primary-500/30">
            <Slider
              label="Spotlight Radius"
              value={visualAids.irisFocus.spotlightRadius}
              min={100}
              max={400}
              step={10}
              unit="px"
              onChange={(spotlightRadius) => updateVisualAids({ irisFocus: { spotlightRadius } })}
            />
            
            <button
              onClick={() => {
                setShowCalibration(true);
                startCalibration();
              }}
              className="w-full py-2 px-3 rounded-lg bg-accent-600/20 hover:bg-accent-600/30 text-accent-400 font-medium border border-accent-600/30 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Calibrate Eye Tracker
            </button>
          </div>
        )}
      </div>

      {/* Hand Focus (Hand Tracking) */}
      <div className="space-y-3 p-3 rounded-xl bg-surface-800/30">
        <Toggle
          label="Hand Focus"
          description="Point with your finger to focus (Hand Tracking)"
          checked={visualAids.handFocus.enabled}
          onChange={(enabled) => updateVisualAids({ handFocus: { enabled } })}
        />
        
        {visualAids.handFocus.enabled && (
          <div className="space-y-3 pt-2 pl-2 border-l-2 border-primary-500/30">
            <Slider
              label="Spotlight Radius"
              value={visualAids.handFocus.spotlightRadius}
              min={40}
              max={150}
              step={5}
              unit="px"
              onChange={(spotlightRadius) => updateVisualAids({ handFocus: { spotlightRadius } })}
            />
            <Slider
              label="Blur Amount"
              value={visualAids.handFocus.blurAmount}
              min={2}
              max={15}
              step={1}
              unit="px"
              onChange={(blurAmount) => updateVisualAids({ handFocus: { blurAmount } })}
            />
            <p className="text-xs text-white/50 italic">
              Point with your index finger to control the focus area
            </p>
          </div>
        )}
      </div>

      {showCalibration && (
        <CalibrationModal 
          onClose={() => setShowCalibration(false)}
          onComplete={() => setShowCalibration(false)} 
        />
      )}
    </div>
  );
};
