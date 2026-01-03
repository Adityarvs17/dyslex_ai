// LexiLens Settings Types

export interface TypographySettings {
  fontFamily: 'OpenDyslexic' | 'Arial' | 'Verdana' | 'Comic Sans MS' | 'system-ui';
  lineHeight: number; // 1.0 - 3.0
  letterSpacing: number; // 0 - 10 (px)
  wordSpacing: number; // 0 - 20 (px)
  fontWeight: 'normal' | 'bold';
}

export interface ReadingRulerSettings {
  enabled: boolean;
  height: number; // 20 - 200 (px)
  color: string; // hex color
  opacity: number; // 0.1 - 1.0
}

export interface ScreenTintSettings {
  enabled: boolean;
  preset: 'none' | 'sepia' | 'blue-light' | 'custom';
  customColor: string; // hex color
  intensity: number; // 0 - 100 (%)
}

export interface FocusModeSettings {
  enabled: boolean;
  dimOpacity: number; // 0.3 - 0.9
}


export interface HandConductorSettings {
  enabled: boolean;
  conductingSensitivity: number; // 0.1 - 2.0
  gestureShortcutsEnabled: boolean;
}

export interface HandFocusSettings {
  enabled: boolean;
  spotlightRadius: number;
  blurAmount: number;
}

export interface VisualAidsSettings {
  readingRuler: ReadingRulerSettings;
  screenTint: ScreenTintSettings;
  focusMode: FocusModeSettings;
  handConductor: HandConductorSettings;
  handFocus: HandFocusSettings;
}

export interface BionicReadingSettings {
  enabled: boolean;
  boldPercentage: number; // 30 - 70 (%)
}

export interface SyllableSplitterSettings {
  enabled: boolean;
  separator: '·' | '-' | ' ';
}

export interface CognitiveSettings {
  bionicReading: BionicReadingSettings;
  syllableSplitter: SyllableSplitterSettings;
}

export interface AudioSettings {
  enabled: boolean;
  speed: number; // 0.5 - 2.0
  voiceURI: string;
  highlightColor: string; // hex color
  clickToRead: boolean;
}

export interface LexiLensSettings {
  enabled: boolean;
  typography: TypographySettings;
  visualAids: VisualAidsSettings;
  cognitive: CognitiveSettings;
  audio: AudioSettings;
  widgetPosition: { x: number; y: number };
  widgetCollapsed: boolean;
}

export const DEFAULT_SETTINGS: LexiLensSettings = {
  enabled: true,
  typography: {
    fontFamily: 'system-ui',
    lineHeight: 1.6,
    letterSpacing: 0,
    wordSpacing: 0,
    fontWeight: 'normal',
  },
  visualAids: {
    readingRuler: {
      enabled: false,
      height: 80,
      color: '#fef3c7',
      opacity: 0.4,
    },
    screenTint: {
      enabled: false,
      preset: 'none',
      customColor: '#f5e6d3',
      intensity: 30,
    },
    focusMode: {
      enabled: false,
      dimOpacity: 0.7,
    },
    handConductor: {
      enabled: false,
      conductingSensitivity: 1.0,
      gestureShortcutsEnabled: true,
    },
    handFocus: {
      enabled: false,
      spotlightRadius: 100,
      blurAmount: 6,
    },
  },
  cognitive: {
    bionicReading: {
      enabled: false,
      boldPercentage: 50,
    },
    syllableSplitter: {
      enabled: false,
      separator: '·',
    },
  },
  audio: {
    enabled: false,
    speed: 1.0,
    voiceURI: '',
    highlightColor: '#fef08a',
    clickToRead: false,
  },
  widgetPosition: { x: -1, y: -1 }, // -1 means use default position
  widgetCollapsed: true,
};

// Message types for communication between scripts
export interface ExtensionMessage {
  type: 'SETTINGS_UPDATED' | 'TOGGLE_EXTENSION' | 'READ_TEXT' | 'STOP_READING' | 'SUMMARIZE_TEXT';
  payload?: Partial<LexiLensSettings> | string;
}
