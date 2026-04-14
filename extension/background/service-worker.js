/**
 * Service Worker for Pickssue Chrome Extension
 * Manifest V3 - handles background polling, notifications, and context menus
 */

importScripts('../utils/storage.js', '../utils/github-api.js');

const ALARM_NAME = 'wtc-poll-issues';

// ---- Alarm setup ----

async function setupAlarm() {
  const settings = await getSettings();
  const minutes =
    FREQUENCY_MINUTES[settings.notificationFrequency] || FREQUENCY_MINUTES.hourly;

  await chrome.alarms.clear(ALARM_NAME);
  chrome.alarms.create(ALARM_NAME, {
    delayInMinutes: minutes,
    periodInMinutes: minutes,
  });
  console.log(`[WTC] Alarm set: every ${minutes} minutes`);
}

// ---- New issue detection ----

function findNewIssues(cachedData, freshIssues) {
  // First poll (no cache) - treat as initial load, no notifications
  if (cachedData === null) return [];

  const cachedIds = new Set((cachedData.issues || []).map(i => i.id));
  return freshIssues.filter(i => !cachedIds.has(i.id));
}

// ---- Badge management ----

async function updateBadge() {
  const count = await getNewIssueCount();
  if (count > 0) {
    chrome.action.setBadgeText({ text: String(count) });
    chrome.action.setBadgeBackgroundColor({ color: '#06b6d4' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// ---- Notification creation ----

function sendNotification(newIssues) {
  if (newIssues.length === 0) return;

  let notificationId;
  let options;

  if (newIssues.length === 1) {
    const issue = newIssues[0];
    const repo = `${issue.repository.owner}/${issue.repository.name}`;
    notificationId = encodeURIComponent(issue.url);
    options = {
      type: 'basic',
      iconUrl: '../icons/icon128.png',
      title: `New Issue: ${repo}`,
      message: issue.title,
    };
  } else {
    const repos = [
      ...new Set(newIssues.map(i => `${i.repository.owner}/${i.repository.name}`)),
    ];
    notificationId = `wtc-multi-${Date.now()}`;
    options = {
      type: 'basic',
      iconUrl: '../icons/icon128.png',
      title: `${newIssues.length} new beginner issues`,
      message: `Found in ${repos.join(', ')}`,
    };
  }

  chrome.notifications.create(notificationId, options);
}

// ---- Core polling ----

async function pollIssues() {
  console.log('[WTC] Polling issues...');

  try {
    const settings = await getSettings();
    const token = await getAuthToken();

    if (!settings.repositories || settings.repositories.length === 0) {
      console.log('[WTC] No repositories to track');
      await setLastChecked(Date.now());
      return;
    }

    let totalNewIssues = [];

    for (const repo of settings.repositories) {
      try {
        const freshIssues = await fetchIssues(
          repo.owner,
          repo.name,
          settings.customLabels,
          token,
        );

        const cachedData = await getCachedIssues(repo.owner, repo.name);
        const newIssues = findNewIssues(cachedData, freshIssues);

        totalNewIssues = totalNewIssues.concat(newIssues);

        await saveCachedIssues(repo.owner, repo.name, freshIssues);
        console.log(
          `[WTC] ${repo.owner}/${repo.name}: ${freshIssues.length} issues, ${newIssues.length} new`,
        );
      } catch (err) {
        console.log(`[WTC] Error fetching ${repo.owner}/${repo.name}:`, err.message);
        // Continue with next repo on error
      }
    }

    await setLastChecked(Date.now());

    if (totalNewIssues.length > 0) {
      sendNotification(totalNewIssues);

      const prevCount = await getNewIssueCount();
      await setNewIssueCount(prevCount + totalNewIssues.length);
      await updateBadge();
    }

    console.log(`[WTC] Poll complete. ${totalNewIssues.length} new issues found.`);
  } catch (err) {
    console.log('[WTC] Poll error:', err.message);
  }
}

// ---- Event: onInstalled ----

chrome.runtime.onInstalled.addListener(async () => {
  console.log('[WTC] Extension installed/updated');

  // Set up context menu
  chrome.contextMenus.create({
    id: 'pickssue-track-repo',
    title: 'Track this repo in Pickssue',
    contexts: ['link'],
    targetUrlPatterns: ['https://github.com/*/*'],
  });

  await setupAlarm();
  await pollIssues();
});

// ---- Event: alarms ----

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === ALARM_NAME) {
    pollIssues();
  }
});

// ---- Event: storage changes (frequency update) ----

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.wtc_settings) {
    const newSettings = changes.wtc_settings.newValue;
    const oldSettings = changes.wtc_settings.oldValue;

    if (
      newSettings &&
      oldSettings &&
      newSettings.notificationFrequency !== oldSettings.notificationFrequency
    ) {
      console.log('[WTC] Notification frequency changed, resetting alarm');
      setupAlarm();
    }
  }
});

// ---- Event: notification clicked ----

chrome.notifications.onClicked.addListener(notificationId => {
  // Single-issue notifications encode the issue URL as the notification ID
  try {
    const url = decodeURIComponent(notificationId);
    if (url.startsWith('https://')) {
      chrome.tabs.create({ url });
    }
  } catch {
    // Multi-issue notification or unrecognised ID - open the popup instead
  }
  chrome.notifications.clear(notificationId);
});

// ---- Event: context menu clicked ----

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== 'pickssue-track-repo') return;

  const linkUrl = info.linkUrl;
  const parsed = parseRepoUrl(linkUrl);
  if (!parsed) {
    console.log('[WTC] Could not parse repo URL:', linkUrl);
    return;
  }

  try {
    const token = await getAuthToken();
    const repoData = await fetchRepository(parsed.owner, parsed.name, token);
    const added = await addRepository(repoData);
    if (added) {
      console.log(`[WTC] Added repository: ${parsed.owner}/${parsed.name}`);
      await pollIssues();
    } else {
      console.log(`[WTC] Repository already tracked: ${parsed.owner}/${parsed.name}`);
    }
  } catch (err) {
    console.log('[WTC] Failed to add repository:', err.message);
  }
});

// ---- Event: runtime messages ----

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'pollNow') {
    pollIssues().then(() => sendResponse({ ok: true }));
    return true; // keep channel open for async response
  }

  if (message.action === 'getStatus') {
    Promise.all([getLastChecked(), getNewIssueCount(), getAuthToken()])
      .then(([lastChecked, newIssueCount, token]) =>
        getRateLimit(token).then(rateLimit => ({
          lastChecked,
          newIssueCount,
          rateLimit,
        })),
      )
      .then(status => sendResponse(status))
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }

  if (message.action === 'resetBadge') {
    setNewIssueCount(0)
      .then(() => {
        chrome.action.setBadgeText({ text: '' });
        sendResponse({ ok: true });
      })
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }

  if (message.action === 'trackRepo') {
    const { owner, name } = message;
    getAuthToken()
      .then(token => fetchRepository(owner, name, token))
      .then(repoData => addRepository(repoData))
      .then(added => {
        sendResponse({ success: true, alreadyTracked: !added });
        if (added) {
          pollIssues();
        }
      })
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }
});
