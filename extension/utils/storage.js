/**
 * Storage utility for Chrome Extension
 * Uses chrome.storage.sync for settings and chrome.storage.local for issue cache
 */

const STORAGE_KEYS = {
  SETTINGS: 'wtc_settings',
  AUTH_TOKEN: 'wtc_auth_token',
  LAST_CHECKED: 'wtc_last_checked',
  NEW_ISSUE_COUNT: 'wtc_new_issue_count',
};

function issuesCacheKey(owner, name) {
  return `wtc_issues_${owner}_${name}`;
}

/** Default settings */
const DEFAULT_SETTINGS = {
  repositories: [],
  notificationFrequency: 'hourly',
  customLabels: ['good first issue', 'help wanted', 'beginner friendly', 'easy'],
  hideClosedIssues: true,
};

/** Alarm interval in minutes based on frequency setting */
const FREQUENCY_MINUTES = {
  '15min': 15,
  '30min': 30,
  hourly: 60,
  '6hours': 360,
  daily: 1440,
};

// --- Settings (chrome.storage.sync) ---

async function getSettings() {
  const result = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
  return result[STORAGE_KEYS.SETTINGS] || { ...DEFAULT_SETTINGS };
}

async function saveSettings(settings) {
  await chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: settings });
}

async function addRepository(repo) {
  const settings = await getSettings();
  const exists = settings.repositories.some(
    r => r.owner === repo.owner && r.name === repo.name,
  );
  if (exists) return false;
  settings.repositories.push(repo);
  await saveSettings(settings);
  return true;
}

async function removeRepository(owner, name) {
  const settings = await getSettings();
  settings.repositories = settings.repositories.filter(
    r => !(r.owner === owner && r.name === name),
  );
  await saveSettings(settings);
  // Also clear cached issues
  await chrome.storage.local.remove(issuesCacheKey(owner, name));
}

// --- Auth Token ---

async function getAuthToken() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.AUTH_TOKEN);
  return result[STORAGE_KEYS.AUTH_TOKEN] || null;
}

async function saveAuthToken(token) {
  await chrome.storage.local.set({ [STORAGE_KEYS.AUTH_TOKEN]: token });
}

async function clearAuthToken() {
  await chrome.storage.local.remove(STORAGE_KEYS.AUTH_TOKEN);
}

// --- Issue Cache (chrome.storage.local) ---

async function getCachedIssues(owner, name) {
  const key = issuesCacheKey(owner, name);
  const result = await chrome.storage.local.get(key);
  return result[key] || null;
}

async function saveCachedIssues(owner, name, issues) {
  const key = issuesCacheKey(owner, name);
  await chrome.storage.local.set({
    [key]: {
      issues,
      lastFetched: Date.now(),
    },
  });
}

async function getAllCachedIssues() {
  const settings = await getSettings();
  const allIssues = [];

  for (const repo of settings.repositories) {
    const cached = await getCachedIssues(repo.owner, repo.name);
    if (cached && cached.issues) {
      allIssues.push(...cached.issues);
    }
  }

  return allIssues;
}

// --- New Issue Count ---

async function getNewIssueCount() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.NEW_ISSUE_COUNT);
  return result[STORAGE_KEYS.NEW_ISSUE_COUNT] || 0;
}

async function setNewIssueCount(count) {
  await chrome.storage.local.set({ [STORAGE_KEYS.NEW_ISSUE_COUNT]: count });
}

// --- Last Checked ---

async function getLastChecked() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.LAST_CHECKED);
  return result[STORAGE_KEYS.LAST_CHECKED] || null;
}

async function setLastChecked(timestamp) {
  await chrome.storage.local.set({ [STORAGE_KEYS.LAST_CHECKED]: timestamp });
}
