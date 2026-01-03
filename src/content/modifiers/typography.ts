// Typography Modifier - Font, spacing, and weight adjustments

import { TypographySettings } from '@/types';

const STYLE_ID = 'lexilens-typography-styles';

// CSS variable names for typography settings
const CSS_VARS = {
  fontFamily: '--lexilens-font-family',
  lineHeight: '--lexilens-line-height',
  letterSpacing: '--lexilens-letter-spacing',
  wordSpacing: '--lexilens-word-spacing',
  fontWeight: '--lexilens-font-weight',
};

/**
 * Font family mappings with fallbacks
 */
export const FONT_STACKS: Record<TypographySettings['fontFamily'], string> = {
  'OpenDyslexic': '"OpenDyslexic", "Comic Sans MS", Arial, sans-serif',
  'Arial': 'Arial, Helvetica, sans-serif',
  'Verdana': 'Verdana, Geneva, sans-serif',
  'Comic Sans MS': '"Comic Sans MS", "Comic Sans", cursive, sans-serif',
  'system-ui': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

/**
 * Generate the CSS for typography overrides
 */
function generateTypographyCSS(settings: TypographySettings): string {
  return `
    :root {
      ${CSS_VARS.fontFamily}: ${FONT_STACKS[settings.fontFamily]};
      ${CSS_VARS.lineHeight}: ${settings.lineHeight};
      ${CSS_VARS.letterSpacing}: ${settings.letterSpacing}px;
      ${CSS_VARS.wordSpacing}: ${settings.wordSpacing}px;
      ${CSS_VARS.fontWeight}: ${settings.fontWeight};
    }

    /* Apply to all text elements with high specificity */
    html body,
    html body *:not(script):not(style):not(svg):not(path):not(.lexilens-widget):not(.lexilens-widget *) {
      font-family: var(${CSS_VARS.fontFamily}) !important;
      line-height: var(${CSS_VARS.lineHeight}) !important;
      letter-spacing: var(${CSS_VARS.letterSpacing}) !important;
      word-spacing: var(${CSS_VARS.wordSpacing}) !important;
      font-weight: var(${CSS_VARS.fontWeight}) !important;
    }

    /* Preserve icons and special fonts */
    html body [class*="icon"],
    html body [class*="Icon"],
    html body i[class*="fa"],
    html body .material-icons,
    html body svg,
    html body code,
    html body pre,
    html body kbd,
    html body samp {
      font-family: inherit !important;
      letter-spacing: normal !important;
      word-spacing: normal !important;
    }
  `;
}

/**
 * Apply typography settings to the page
 */
export function applyTypography(settings: TypographySettings): void {
  let styleElement = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = STYLE_ID;
    styleElement.setAttribute('data-lexilens', 'typography');
    document.head.appendChild(styleElement);
  }
  
  styleElement.textContent = generateTypographyCSS(settings);
}

/**
 * Remove typography modifications
 */
export function removeTypography(): void {
  const styleElement = document.getElementById(STYLE_ID);
  if (styleElement) {
    styleElement.remove();
  }
}

/**
 * Check if typography is currently applied
 */
export function isTypographyApplied(): boolean {
  return document.getElementById(STYLE_ID) !== null;
}
