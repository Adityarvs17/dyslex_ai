// Zustand Store for LexiLens Settings

import { create } from 'zustand';
import { LexiLensSettings, DEFAULT_SETTINGS, TypographySettings, VisualAidsSettings, CognitiveSettings, AudioSettings } from '@/types';
import { getSettings, saveSettings, onSettingsChange } from '@/utils/storage';

interface SettingsStore {
  settings: LexiLensSettings;
  isLoading: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  updateSettings: (partial: Partial<LexiLensSettings>) => void;
  updateTypography: (partial: Partial<TypographySettings>) => void;
  updateVisualAids: (partial: DeepPartial<VisualAidsSettings>) => void;
  updateCognitive: (partial: DeepPartial<CognitiveSettings>) => void;
  updateAudio: (partial: Partial<AudioSettings>) => void;
  toggleExtension: () => void;
  resetToDefaults: () => void;
}

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: true,

  initialize: async () => {
    const settings = await getSettings();
    set({ settings, isLoading: false });
    
    // Listen for changes from other contexts
    onSettingsChange((newSettings) => {
      set({ settings: newSettings });
    });
  },

  updateSettings: (partial) => {
    const newSettings = { ...get().settings, ...partial };
    set({ settings: newSettings });
    saveSettings(newSettings);
  },

  updateTypography: (partial) => {
    const newSettings = {
      ...get().settings,
      typography: { ...get().settings.typography, ...partial },
    };
    set({ settings: newSettings });
    saveSettings(newSettings);
  },

  updateVisualAids: (partial) => {
    const current = get().settings.visualAids;
    const newVisualAids = { ...current };
    
    // Deep merge for nested objects
    if (partial.readingRuler) {
      newVisualAids.readingRuler = { ...current.readingRuler, ...partial.readingRuler };
    }
    if (partial.screenTint) {
      newVisualAids.screenTint = { ...current.screenTint, ...partial.screenTint };
    }
    if (partial.focusMode) {
      newVisualAids.focusMode = { ...current.focusMode, ...partial.focusMode };
    }
    if (partial.irisFocus) {
      newVisualAids.irisFocus = { ...current.irisFocus, ...partial.irisFocus };
    }
    if (partial.handFocus) {
      newVisualAids.handFocus = { ...current.handFocus, ...partial.handFocus };
    }
    
    const newSettings = {
      ...get().settings,
      visualAids: newVisualAids,
    };
    set({ settings: newSettings });
    saveSettings(newSettings);
  },

  updateCognitive: (partial) => {
    const current = get().settings.cognitive;
    const newCognitive = { ...current };
    
    if (partial.bionicReading) {
      newCognitive.bionicReading = { ...current.bionicReading, ...partial.bionicReading };
    }
    if (partial.syllableSplitter) {
      newCognitive.syllableSplitter = { ...current.syllableSplitter, ...partial.syllableSplitter };
    }
    
    const newSettings = {
      ...get().settings,
      cognitive: newCognitive,
    };
    set({ settings: newSettings });
    saveSettings(newSettings);
  },

  updateAudio: (partial) => {
    const newSettings = {
      ...get().settings,
      audio: { ...get().settings.audio, ...partial },
    };
    set({ settings: newSettings });
    saveSettings(newSettings);
  },

  toggleExtension: () => {
    const newSettings = {
      ...get().settings,
      enabled: !get().settings.enabled,
    };
    set({ settings: newSettings });
    saveSettings(newSettings);
  },

  resetToDefaults: () => {
    set({ settings: DEFAULT_SETTINGS });
    saveSettings(DEFAULT_SETTINGS);
  },
}));
