// LexiLens Background Service Worker

import { DEFAULT_SETTINGS, LexiLensSettings } from '../types';
import { getSettings, saveSettings } from '../utils/storage';

// Initialize default settings on installation
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('[LexiLens] Extension installed, setting defaults');
    await saveSettings(DEFAULT_SETTINGS);
  } else if (details.reason === 'update') {
    console.log('[LexiLens] Extension updated to version', chrome.runtime.getManifest().version);
    // Merge new default settings with existing settings
    const existing = await getSettings();
    const merged = { ...DEFAULT_SETTINGS, ...existing };
    await saveSettings(merged);
  }
});

// Context menus
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'lexilens-read-selection',
      title: '🔊 Read with LexiLens',
      contexts: ['selection'],
    });

    chrome.contextMenus.create({
      id: 'lexilens-summarize-selection',
      title: '📝 Summarize with LexiLens',
      contexts: ['selection'],
    });
  });
});

// Helper to inject scripts safely
const injectIrisScripts = (tabId: number) => {
  chrome.scripting.executeScript({
    target: { tabId },
    files: ['webgazer.js'],
    world: 'MAIN',
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('Failed to inject WebGazer:', JSON.stringify(chrome.runtime.lastError));
      return;
    }
    chrome.scripting.executeScript({
      target: { tabId },
      files: ['iris-driver.js'],
      world: 'MAIN',
    });
  });
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'INJECT_IRIS' && sender.tab?.id) {
    injectIrisScripts(sender.tab.id);
  }
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.selectionText && tab?.id) {
    if (info.menuItemId === 'lexilens-read-selection') {
      chrome.tabs.sendMessage(tab.id, {
        type: 'READ_TEXT',
        payload: info.selectionText,
      });
    } else if (info.menuItemId === 'lexilens-summarize-selection') {
      chrome.tabs.sendMessage(tab.id, {
        type: 'SUMMARIZE_TEXT',
        payload: info.selectionText,
      });
    }
  }
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_SETTINGS') {
    getSettings().then((settings) => {
      sendResponse({ success: true, settings });
    });
    return true; // Keep channel open for async response
  }

  if (message.type === 'SAVE_SETTINGS') {
    saveSettings(message.payload as LexiLensSettings).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'TOGGLE_EXTENSION') {
    getSettings().then(async (settings) => {
      const newSettings = { ...settings, enabled: !settings.enabled };
      await saveSettings(newSettings);
      sendResponse({ success: true, enabled: newSettings.enabled });
    });
    return true;
  }
});

// Log when service worker starts
console.log('[LexiLens] Background service worker started');
