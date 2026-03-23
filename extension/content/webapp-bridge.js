/**
 * Web App ↔ Extension Bridge
 *
 * Injected on willing-to-contribute.vercel.app to sync auth tokens
 * and settings between the web app's localStorage and the extension's
 * chrome.storage. Sync is bidirectional:
 *
 *   localStorage  →  chrome.storage   (on page load + storage events)
 *   chrome.storage →  localStorage     (on chrome.storage.onChanged)
 *
 * Data mapping:
 *   Web App localStorage                    Extension chrome.storage
 *   ──────────────────────                  ─────────────────────────
 *   willing-to-contribute-auth       ↔     wtc_auth_token      (local)
 *   willing-to-contribute-settings   ↔     wtc_settings        (sync)
 */

(function () {
  'use strict';

  // --- Constants -----------------------------------------------------------

  const WEB_APP_KEYS = {
    AUTH: 'willing-to-contribute-auth',
    SETTINGS: 'willing-to-contribute-settings',
  };

  const EXT_KEYS = {
    AUTH: 'wtc_auth_token',
    SETTINGS: 'wtc_settings',
    BRIDGE_LAST_SYNC: 'wtc_bridge_last_sync',
  };

  // Debounce guard: ignore echo writes for 2 seconds
  let suppressLocalStorageSync = false;
  let suppressChromeStorageSync = false;

  // --- Helpers -------------------------------------------------------------

  /**
   * Convert web app settings format to extension settings format.
   * Web app has `lastCheckedAt`; extension uses separate storage for that.
   */
  function webSettingsToExtSettings(webSettings) {
    return {
      repositories: (webSettings.repositories || []).map(r => ({
        id: r.id,
        owner: r.owner,
        name: r.name,
        url: r.url || `https://github.com/${r.owner}/${r.name}`,
        description: r.description || '',
        language: r.language || '',
        stars: r.stars || 0,
      })),
      notificationFrequency: webSettings.notificationFrequency || 'hourly',
      customLabels: webSettings.customLabels || [
        'good first issue',
        'help wanted',
        'easy',
      ],
      hideClosedIssues:
        webSettings.hideClosedIssues !== undefined ? webSettings.hideClosedIssues : true,
    };
  }

  /**
   * Convert extension settings format to web app settings format.
   */
  function extSettingsToWebSettings(extSettings, existingWebSettings) {
    return {
      ...existingWebSettings,
      repositories: (extSettings.repositories || []).map(r => ({
        id: r.id,
        owner: r.owner,
        name: r.name,
        url: r.url || `https://github.com/${r.owner}/${r.name}`,
        description: r.description || '',
        language: r.language || '',
        stars: r.stars || 0,
      })),
      notificationFrequency: extSettings.notificationFrequency || 'hourly',
      customLabels: extSettings.customLabels || [
        'good first issue',
        'help wanted',
        'easy',
      ],
      hideClosedIssues:
        extSettings.hideClosedIssues !== undefined ? extSettings.hideClosedIssues : true,
    };
  }

  // --- localStorage → chrome.storage --------------------------------------

  async function pushAuthToExtension() {
    const token = localStorage.getItem(WEB_APP_KEYS.AUTH);
    if (!token) return;

    const result = await chrome.storage.local.get(EXT_KEYS.AUTH);
    if (result[EXT_KEYS.AUTH] === token) return; // already in sync

    suppressChromeStorageSync = true;
    await chrome.storage.local.set({ [EXT_KEYS.AUTH]: token });
    setTimeout(() => {
      suppressChromeStorageSync = false;
    }, 100);
  }

  async function pushSettingsToExtension() {
    const raw = localStorage.getItem(WEB_APP_KEYS.SETTINGS);
    if (!raw) return;

    try {
      const webSettings = JSON.parse(raw);
      const extSettings = webSettingsToExtSettings(webSettings);

      suppressChromeStorageSync = true;
      await chrome.storage.sync.set({ [EXT_KEYS.SETTINGS]: extSettings });
      setTimeout(() => {
        suppressChromeStorageSync = false;
      }, 100);
    } catch {
      // Invalid JSON in localStorage — skip
    }
  }

  async function syncLocalStorageToExtension() {
    await pushAuthToExtension();
    await pushSettingsToExtension();
    await chrome.storage.local.set({ [EXT_KEYS.BRIDGE_LAST_SYNC]: Date.now() });
  }

  // --- chrome.storage → localStorage --------------------------------------

  function pullAuthToWebApp(token) {
    if (!token) return;
    const existing = localStorage.getItem(WEB_APP_KEYS.AUTH);
    if (existing === token) return;

    suppressLocalStorageSync = true;
    localStorage.setItem(WEB_APP_KEYS.AUTH, token);
    setTimeout(() => {
      suppressLocalStorageSync = false;
    }, 100);

    // Dispatch a custom event so the web app can react without a page reload
    window.dispatchEvent(
      new CustomEvent('wtc-extension-sync', {
        detail: { type: 'auth', action: 'updated' },
      }),
    );
  }

  function pullSettingsToWebApp(extSettings) {
    if (!extSettings) return;

    let existingWebSettings = {};
    try {
      const raw = localStorage.getItem(WEB_APP_KEYS.SETTINGS);
      if (raw) existingWebSettings = JSON.parse(raw);
    } catch {
      // ignore
    }

    const merged = extSettingsToWebSettings(extSettings, existingWebSettings);

    suppressLocalStorageSync = true;
    localStorage.setItem(WEB_APP_KEYS.SETTINGS, JSON.stringify(merged));
    setTimeout(() => {
      suppressLocalStorageSync = false;
    }, 100);

    window.dispatchEvent(
      new CustomEvent('wtc-extension-sync', {
        detail: { type: 'settings', action: 'updated' },
      }),
    );
  }

  // --- Event listeners -----------------------------------------------------

  // 1. On page load: push current localStorage to extension
  syncLocalStorageToExtension();

  // 2. Listen for localStorage changes (user action in web app)
  window.addEventListener('storage', event => {
    if (suppressLocalStorageSync) return;

    if (event.key === WEB_APP_KEYS.AUTH) {
      pushAuthToExtension();
    } else if (event.key === WEB_APP_KEYS.SETTINGS) {
      pushSettingsToExtension();
    }
  });

  // Also catch same-tab writes via a patched setItem
  try {
    const originalSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function (key, value) {
      originalSetItem(key, value);

      if (suppressLocalStorageSync) return;

      if (key === WEB_APP_KEYS.AUTH) {
        pushAuthToExtension();
      } else if (key === WEB_APP_KEYS.SETTINGS) {
        pushSettingsToExtension();
      }
    };
  } catch {
    // Patching failed (e.g. frozen localStorage) — fall back to storage event only
  }

  // 3. Listen for chrome.storage changes (extension popup/background updates)
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (suppressChromeStorageSync) return;

    if (areaName === 'local' && changes[EXT_KEYS.AUTH]) {
      pullAuthToWebApp(changes[EXT_KEYS.AUTH].newValue);
    }

    if (areaName === 'sync' && changes[EXT_KEYS.SETTINGS]) {
      pullSettingsToWebApp(changes[EXT_KEYS.SETTINGS].newValue);
    }
  });

  // 4. On initial load, also pull extension data to web app (if web app has no data)
  (async function pullExtensionDataIfNeeded() {
    // Auth: if web app has no token but extension does, pull it
    const webToken = localStorage.getItem(WEB_APP_KEYS.AUTH);
    if (!webToken) {
      const result = await chrome.storage.local.get(EXT_KEYS.AUTH);
      if (result[EXT_KEYS.AUTH]) {
        pullAuthToWebApp(result[EXT_KEYS.AUTH]);
      }
    }

    // Settings: if web app has no settings but extension does, pull them
    const webSettings = localStorage.getItem(WEB_APP_KEYS.SETTINGS);
    if (!webSettings) {
      const result = await chrome.storage.sync.get(EXT_KEYS.SETTINGS);
      if (result[EXT_KEYS.SETTINGS]) {
        pullSettingsToWebApp(result[EXT_KEYS.SETTINGS]);
      }
    }
  })();
})();
