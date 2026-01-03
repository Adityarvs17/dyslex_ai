import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { Slider } from './Slider';
import { Toggle } from './Toggle';
import { Select } from './Select';
import { ColorPicker } from './ColorPicker';
import { getVoices, onVoicesReady, readSelection, stop, isSpeaking } from '@/utils/speech';

export const AudioSection: React.FC = () => {
  const { settings, updateAudio } = useSettingsStore();
  const { audio } = settings;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    onVoicesReady((availableVoices) => {
      setVoices(availableVoices);
      // Set default voice if not set
      if (!audio.voiceURI && availableVoices.length > 0) {
        updateAudio({ voiceURI: availableVoices[0].voiceURI });
      }
    });
  }, []);

  // Check speaking status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSpeaking(isSpeaking());
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const voiceOptions = voices.map((voice) => ({
    value: voice.voiceURI,
    label: `${voice.name} (${voice.lang})`,
  }));

  const handleTestRead = async () => {
    if (speaking) {
      stop();
      return;
    }
    
    const testText = "LexiLens helps you read better by providing customizable tools for improved reading fluency.";
    const utterance = new SpeechSynthesisUtterance(testText);
    utterance.rate = audio.speed;
    
    if (audio.voiceURI) {
      const voice = voices.find(v => v.voiceURI === audio.voiceURI);
      if (voice) utterance.voice = voice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 pb-2 border-b border-white/10">
        <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
        <h3 className="text-sm font-semibold text-white/90">Text-to-Speech</h3>
      </div>

      {/* Click to Read */}
      <Toggle
        label="Click to Read"
        description="Click any text to hear it spoken aloud"
        checked={audio.clickToRead}
        onChange={(clickToRead) => updateAudio({ clickToRead })}
      />

      {/* Voice Selection */}
      <Select
        label="Voice"
        value={audio.voiceURI}
        options={voiceOptions}
        onChange={(voiceURI) => updateAudio({ voiceURI })}
      />

      {/* Speed Control */}
      <Slider
        label="Speed"
        value={audio.speed}
        min={0.5}
        max={2}
        step={0.1}
        unit="x"
        onChange={(speed) => updateAudio({ speed })}
      />

      {/* Highlight Color */}
      <ColorPicker
        label="Highlight Color"
        value={audio.highlightColor}
        onChange={(highlightColor) => updateAudio({ highlightColor })}
        presets={['#fef08a', '#a5f3fc', '#c4b5fd', '#fda4af', '#86efac', '#fed7aa']}
      />

      {/* Test Button */}
      <button
        onClick={handleTestRead}
        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                    font-medium text-sm transition-all
                    ${speaking 
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                      : 'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30'
                    }`}
      >
        {speaking ? (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            Stop
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Test Voice
          </>
        )}
      </button>

      {/* Selection tip */}
      <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20">
        <p className="text-xs text-primary-300 leading-relaxed">
          💡 <strong>Tip:</strong> Select text and right-click to read it aloud, 
          or enable "Click to Read" to click any paragraph.
        </p>
      </div>
    </div>
  );
};
