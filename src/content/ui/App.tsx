import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { FAB, Panel, SummaryModal } from './components';
import { ExtensionMessage } from '@/types';
import {
  applyTypography,
  removeTypography,
  enableReadingRuler,
  updateReadingRuler,
  disableReadingRuler,
  enableScreenTint,
  updateScreenTint,
  disableScreenTint,
  enableFocusMode,
  updateFocusMode,
  disableFocusMode,
  enableBionicReading,
  disableBionicReading,
  enableSyllableSplitter,
  disableSyllableSplitter,
  enableIrisFocus,
  updateIrisFocus,
  disableIrisFocus,
  enableHandFocus,
  updateHandFocus,
  disableHandFocus,
} from '../modifiers';
import { enableClickToRead, disableClickToRead } from '@/utils/speech';

export const App: React.FC = () => {
  const { settings, isLoading, initialize } = useSettingsStore();
  const [isOpen, setIsOpen] = useState(false);
  const [summaryText, setSummaryText] = useState<string | null>(null);

  // Initialize settings on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Apply/remove modifiers when settings change
  useEffect(() => {
    if (isLoading) return;

    // Master switch
    if (!settings.enabled) {
      // Remove all effects
      removeTypography();
      disableReadingRuler();
      disableScreenTint();
      disableFocusMode();
      disableBionicReading();
      disableSyllableSplitter();
      disableClickToRead();
      return;
    }

    // Typography
    applyTypography(settings.typography);

    // Reading Ruler
    if (settings.visualAids.readingRuler.enabled) {
      enableReadingRuler(settings.visualAids.readingRuler);
    } else {
      disableReadingRuler();
    }

    // Screen Tint
    if (settings.visualAids.screenTint.enabled && settings.visualAids.screenTint.preset !== 'none') {
      enableScreenTint(settings.visualAids.screenTint);
    } else {
      disableScreenTint();
    }

    // Focus Mode
    if (settings.visualAids.focusMode.enabled) {
      enableFocusMode(settings.visualAids.focusMode);
    } else {
      disableFocusMode();
    }

    // Bionic Reading
    if (settings.cognitive.bionicReading.enabled) {
      enableBionicReading(settings.cognitive.bionicReading);
    } else {
      disableBionicReading();
    }

    // Syllable Splitter
    if (settings.cognitive.syllableSplitter.enabled) {
      enableSyllableSplitter(settings.cognitive.syllableSplitter);
    } else {
      disableSyllableSplitter();
    }

    // Iris Focus (Eye Tracking)
    if (settings.visualAids.irisFocus.enabled) {
      enableIrisFocus(settings.visualAids.irisFocus);
    } else {
      disableIrisFocus();
    }

    // Hand Focus (Hand Tracking)
    if (settings.visualAids.handFocus.enabled) {
      enableHandFocus(settings.visualAids.handFocus);
    } else {
      disableHandFocus();
    }

    // Click to Read
    if (settings.audio.clickToRead) {
      enableClickToRead(settings.audio);
    } else {
      disableClickToRead();
    }
  }, [settings, isLoading]);

  // Update modifiers when specific settings change
  useEffect(() => {
    if (isLoading || !settings.enabled) return;
    updateReadingRuler(settings.visualAids.readingRuler);
  }, [settings.visualAids.readingRuler, isLoading, settings.enabled]);

  useEffect(() => {
    if (isLoading || !settings.enabled) return;
    updateScreenTint(settings.visualAids.screenTint);
  }, [settings.visualAids.screenTint, isLoading, settings.enabled]);

  useEffect(() => {
    if (isLoading || !settings.enabled) return;
    updateFocusMode(settings.visualAids.focusMode);
  }, [settings.visualAids.focusMode, isLoading, settings.enabled]);

  useEffect(() => {
    if (isLoading || !settings.enabled) return;
    updateIrisFocus(settings.visualAids.irisFocus);
  }, [settings.visualAids.irisFocus, isLoading, settings.enabled]);

  useEffect(() => {
    if (isLoading || !settings.enabled) return;
    updateHandFocus(settings.visualAids.handFocus);
  }, [settings.visualAids.handFocus, isLoading, settings.enabled]);

  // Listen for extension messages (including Summarize)
  useEffect(() => {
    const handleMessage = (message: ExtensionMessage) => {
      if (message.type === 'SUMMARIZE_TEXT' && typeof message.payload === 'string') {
        setSummaryText(message.payload);
        setIsOpen(false); // Close panel if open
      }
    };
    
    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      removeTypography();
      disableReadingRuler();
      disableScreenTint();
      disableFocusMode();
      disableBionicReading();
      disableSyllableSplitter();
      disableIrisFocus();
      disableClickToRead();
    };
  }, []);

  if (isLoading) {
    return null; // Don't render until settings are loaded
  }

  return (
    <div className="fixed bottom-6 right-6 z-[2147483647] flex flex-col items-end gap-4 font-sans">
      {/* Panel */}
      {isOpen && (
        <div className="animate-slide-up">
          <Panel onClose={() => setIsOpen(false)} />
        </div>
      )}

      {/* Summary Modal */}
      {summaryText && (
        <SummaryModal 
          originalText={summaryText} 
          onClose={() => setSummaryText(null)} 
        />
      )}

      {/* FAB */}
      <FAB onClick={() => setIsOpen(!isOpen)} isOpen={isOpen} />
    </div>
  );
};
