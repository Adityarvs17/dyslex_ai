import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  presets?: string[];
  disabled?: boolean;
}

const DEFAULT_PRESETS = [
  '#fef3c7', // Warm yellow
  '#fecaca', // Light red
  '#bbf7d0', // Light green
  '#bfdbfe', // Light blue
  '#e9d5ff', // Light purple
  '#fed7aa', // Light orange
  '#f5e6d3', // Sepia
  '#ffedd5', // Cream
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hue, setHue] = useState(0);

  // Sync with prop value
  useEffect(() => {
    setCurrentColor(value);
    const hueValue = hexToHue(value);
    setHue(hueValue);
  }, [value]);

  // Convert hex to HSL and get hue
  const hexToHue = (hex: string): number => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return 0;
    
    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    
    if (max !== min) {
      const d = max - min;
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    return Math.round(h * 360);
  };

  // Draw the color palette canvas
  const drawPalette = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Draw saturation/lightness gradient
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const saturation = (x / width) * 100;
        const lightness = 100 - (y / height) * 100;
        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, [hue]);

  useEffect(() => {
    if (isOpen) {
      drawPalette();
    }
  }, [isOpen, hue, drawPalette]);

  // Handle click outside to close - only close if clicking completely outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Only close if click is outside both the container and dropdown
      if (containerRef.current && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // Use a slight delay to prevent immediate closure
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const hslToHex = (h: number, s: number, l: number): string => {
    s /= 100;
    l /= 100;
    
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const applyColor = (color: string) => {
    setCurrentColor(color);
    onChange(color);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const saturation = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const lightness = Math.max(0, Math.min(100, 100 - (y / rect.height) * 100));
    
    const newColor = hslToHex(hue, saturation, lightness);
    applyColor(newColor);
  };

  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newHue = parseInt(e.target.value);
    setHue(newHue);
    const newColor = hslToHex(newHue, 100, 50);
    applyColor(newColor);
  };

  const handlePresetClick = (e: React.MouseEvent, color: string) => {
    e.preventDefault();
    e.stopPropagation();
    applyColor(color);
    setHue(hexToHue(color));
    // Don't close - let user see the change
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newColor = e.target.value;
    setCurrentColor(newColor);
    if (/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
      onChange(newColor);
      setHue(hexToHue(newColor));
    }
  };

  const openNativeColorPicker = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (colorInputRef.current) {
      colorInputRef.current.click();
    }
  };

  const handleNativeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newColor = e.target.value;
    applyColor(newColor);
    setHue(hexToHue(newColor));
  };

  const handleToggleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div ref={containerRef} className={`relative ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-white/90">{label}</label>
        <button
          type="button"
          disabled={disabled}
          onClick={handleToggleOpen}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-surface-800/50 
                     hover:bg-surface-700/50 transition-colors"
        >
          <div
            className="w-6 h-6 rounded-md border-2 border-white/20 shadow-inner"
            style={{ backgroundColor: currentColor }}
          />
          <span className="text-xs font-mono text-white/60 uppercase">{currentColor}</span>
        </button>
      </div>

      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 p-3 rounded-xl bg-surface-800 
                        border border-white/10 shadow-xl z-50 animate-scale-in min-w-[220px]"
          onClick={handleDropdownClick}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Full Color Palette Canvas */}
          <div className="mb-3">
            <canvas
              ref={canvasRef}
              width={200}
              height={120}
              onClick={handleCanvasClick}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full h-[120px] rounded-lg cursor-crosshair border border-white/10"
            />
          </div>

          {/* Hue Slider */}
          <div className="mb-3">
            <input
              type="range"
              min="0"
              max="360"
              value={hue}
              onChange={handleHueChange}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full h-3 rounded-lg appearance-none cursor-pointer"
              style={{
                background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
              }}
            />
          </div>

          {/* Quick presets */}
          <div className="grid grid-cols-8 gap-1 mb-3">
            {presets.map((color) => (
              <button
                key={color}
                type="button"
                onClick={(e) => handlePresetClick(e, color)}
                onMouseDown={(e) => e.stopPropagation()}
                className={`w-5 h-5 rounded border transition-all hover:scale-110 cursor-pointer
                           ${currentColor.toLowerCase() === color.toLowerCase() ? 'border-primary-500 ring-1 ring-primary-500/50' : 'border-white/20'}`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>

          {/* Custom color input */}
          <div className="flex gap-2 pt-2 border-t border-white/10">
            {/* Native color picker */}
            <input
              ref={colorInputRef}
              type="color"
              value={currentColor}
              onChange={handleNativeColorChange}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
            />
            {/* Hex input */}
            <input
              type="text"
              value={currentColor}
              onChange={handleHexInputChange}
              onClick={openNativeColorPicker}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder="#000000"
              className="flex-1 px-2 py-1 text-xs font-mono bg-surface-700 rounded-lg 
                         border border-white/10 text-white placeholder-white/30
                         focus:outline-none focus:border-primary-500 cursor-pointer"
            />
          </div>

          {/* Apply & Close Button */}
          <div className="mt-3 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="w-full py-2 rounded-lg bg-primary-600 hover:bg-primary-500 
                         text-white text-sm font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
