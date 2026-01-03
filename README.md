# LexiLens - Advanced Dyslexia Assistant 👁️

A comprehensive Chrome/Edge/Brave browser extension designed to improve reading fluency and comprehension for users with dyslexia, ADHD, and visual processing disorders.

![LexiLens](public/icons/icon128.png)

## ✨ Features

### 📝 Typography Engine
- **Font Override**: Choose from OpenDyslexic, Arial, Verdana, Comic Sans, or System UI
- **Line Height**: Adjust from 1.0 to 3.0
- **Letter Spacing**: Fine-tune from 0px to 10px
- **Word Spacing**: Customize spacing between words
- **Font Weight**: Toggle bold text for better visibility

### 👁️ Visual Aids
- **Reading Ruler**: A horizontal bar that follows your cursor to isolate text lines
  - Customizable height, color, and opacity
- **Screen Tint**: Color overlays to reduce visual stress
  - Sepia, Blue Light Filter, or custom colors
  - Adjustable intensity
- **Focus Mode**: Dims all content except the paragraph you're reading

### 🧠 Cognitive Processing
- **Bionic Reading**: Bolds the first portion of words to guide your eye
  - Adjustable bold percentage (30-70%)
- **Syllable Splitter**: Visually separates words into syllables
  - Choose from middle dot (·), hyphen (-), or space separators

### 🔊 Audio Support
- **Click-to-Read**: Click any text to hear it spoken aloud
- **Text Highlighting**: Words are highlighted as they're read
- **Speed Control**: Adjust reading speed (0.5x - 2.0x)
- **Voice Selection**: Choose from available system voices

## 🚀 Installation

### Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Load in Chrome**:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### Production Build

```bash
npm run build
```

The built extension will be in the `dist` folder.

## 🛠️ Tech Stack

- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling (scoped via Shadow DOM)
- **Zustand** - State Management
- **CRXJS** - Chrome Extension Vite Plugin
- **Chrome Storage API** - Settings Persistence

## 📁 Project Structure

```
src/
├── background/          # Service worker
├── content/
│   ├── modifiers/       # DOM manipulation modules
│   │   ├── typography.ts
│   │   ├── readingRuler.ts
│   │   ├── screenTint.ts
│   │   ├── focusMode.ts
│   │   ├── bionicReading.ts
│   │   └── syllableSplitter.ts
│   ├── ui/              # React floating widget
│   │   ├── components/
│   │   └── App.tsx
│   └── index.tsx        # Content script entry
├── popup/               # Extension popup
├── store/               # Zustand store
├── styles/              # Tailwind CSS
├── types/               # TypeScript types
└── utils/               # Helpers
```

## 🎨 Design Principles

1. **Complete Style Isolation**: All UI is injected via Shadow DOM to prevent style conflicts
2. **Performance First**: Debounced DOM operations prevent page lag
3. **Persistent Settings**: Preferences sync across all tabs instantly
4. **User-Friendly**: Floating FAB widget for easy access without leaving the page

## 📝 License

MIT License


## ❓ Troubleshooting

### "Cannot find module 'react'" or JSX errors
This means dependencies are not installed. 
1. Run `build_lexilens.bat` in the project folder.
2. If that fails, ensure Node.js is installed from [nodejs.org](https://nodejs.org).

### Manifest Error
If you see errors about manifest files, ensure you are loading the `dist` folder, not the `src` folder.

## 🤝 Contributing


Contributions are welcome! Please feel free to submit a Pull Request.
