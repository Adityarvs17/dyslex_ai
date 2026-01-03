import React, { useState } from 'react';
import { Toggle } from './Toggle';

interface CalibrationModalProps {
  onClose: () => void;
  onComplete: () => void;
}

const POINTS = [
  { x: '10%', y: '10%' },
  { x: '50%', y: '10%' },
  { x: '90%', y: '10%' },
  { x: '10%', y: '50%' },
  { x: '50%', y: '50%' },
  { x: '90%', y: '50%' },
  { x: '10%', y: '90%' },
  { x: '50%', y: '90%' },
  { x: '90%', y: '90%' },
];

export const CalibrationModal: React.FC<CalibrationModalProps> = ({ onClose, onComplete }) => {
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const [clickCount, setClickCount] = useState(0);

  const handlePointClick = () => {
    const newClickCount = clickCount + 1;
    if (newClickCount >= 5) {
      // Move to next point
      if (currentPointIndex < POINTS.length - 1) {
        setCurrentPointIndex(prev => prev + 1);
        setClickCount(0);
      } else {
        // Done
        onComplete();
      }
    } else {
      setClickCount(newClickCount);
    }
  };

  const currentPoint = POINTS[currentPointIndex];

  return (
    <div className="fixed inset-0 z-[2147483648] bg-black/90 flex flex-col items-center justify-center font-sans">
      <div className="absolute top-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-2">Eye Tracking Calibration</h2>
        <p className="text-white/70">
          Look at the red dot and click it 5 times.<br/>
          Keep your head still!
        </p>
        <p className="mt-4 text-sm text-white/50">
          Point {currentPointIndex + 1} of {POINTS.length}
        </p>
      </div>

      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 text-white/50 hover:text-white"
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Calibration Point */}
      <button
        onClick={handlePointClick}
        style={{
          position: 'absolute',
          left: currentPoint.x,
          top: currentPoint.y,
          transform: 'translate(-50%, -50%)',
        }}
        className="group relative w-8 h-8"
      >
        <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
        <div className="relative w-8 h-8 bg-red-500 rounded-full border-2 border-white cursor-crosshair flex items-center justify-center text-xs font-bold text-white">
          {5 - clickCount}
        </div>
      </button>
    </div>
  );
};
