/**
 * Popup UI controller for Pickssue Chrome Extension
 */

// ============================================================
// Utility helpers
// ============================================================

function timeAgo(dateInput) {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}

/**
 * Return black or white hex depending on the perceived brightness of a hex color.
 */
function labelTextColor(hexColor) {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // Perceived brightness (YIQ formula)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#0d1117' : '#e6edf3';
}

let toastTimer = null;

function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast show' + (type ? ` toast-${type}` : '');
  toast.hidden = false;

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.hidden = true;
      toast.className = 'toast';
    }, 200);
  }, 2500);
}

// ============================================================
// Tab switching
// ============================================================

function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      tabPanels.forEach(panel => {
        if (panel.id === `${target}-tab`) {
          panel.hidden = false;
        } else {
          panel.hidden = true;
        }
      });
    });
  });
}

// ============================================================
// Issues Tab
// ============================================================

function renderIssueLabels(labels) {
  if (!labels || labels.length === 0) return '';
  return labels
    .map(label => {
      const bg = `#${label.color}`;
      const fg = labelTextColor(label.color);
      return `<span class="label-badge" style="background-color:${bg};color:${fg}">${escapeHtml(label.name)}</span>`;
    })
    .join('');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function groupIssuesByRepo(issues) {
  const groups = new Map();
  for (const issue of issues) {
    const key = `${issue.repository.owner}/${issue.repository.name}`;
    if (!groups.has(key)) {
      groups.set(key, {
        owner: issue.repository.owner,
        name: issue.repository.name,
        issues: [],
      });
    }
    groups.get(key).issues.push(issue);
  }
  return Array.from(groups.values());
}

function renderIssueCard(issue) {
  const card = document.createElement('div');
  card.className = 'issue-card';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');

  const labelsHtml = renderIssueLabels(issue.labels);
  const commentIcon = `<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M1 2.75C1 1.784 1.784 1 2.75 1h10.5c.966 0 1.75.784 1.75 1.75v7.5A1.75 1.75 0 0 1 13.25 12H9.06l-2.573 2.573A1.457 1.457 0 0 1 4 13.543V12H2.75A1.75 1.75 0 0 1 1 10.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h4.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/></svg>`;

  card.innerHTML = `
    ${labelsHtml ? `<div class="issue-labels">${labelsHtml}</div>` : ''}
    <div class="issue-title">${escapeHtml(issue.title)}</div>
    <div class="issue-meta">
      <span class="issue-date">${timeAgo(issue.createdAt)}</span>
      ${issue.comments > 0 ? `<span class="issue-stat">${commentIcon} ${issue.comments}</span>` : ''}
    </div>
  `;

  const open = () => chrome.tabs.create({ url: issue.url });
  card.addEventListener('click', open);
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') open();
  });

  return card;
}

function renderIssuesTab(issues) {
  const list = document.getElementById('issues-list');
  const countEl = document.getElementById('issue-count');
  list.innerHTML = '';

  if (!issues || issues.length === 0) {
    countEl.textContent = '';
    list.innerHTML = `
      <div class="empty-state">
        <svg class="empty-state-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8b949e" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4M12 16h.01"/>
        </svg>
        <div class="empty-state-title">No issues found</div>
        <div class="empty-state-desc">Add repositories in the Repositories tab and click Refresh to load issues.</div>
      </div>`;
    return;
  }

  countEl.textContent = `${issues.length} issue${issues.length !== 1 ? 's' : ''}`;

  const groups = groupIssuesByRepo(issues);
  for (const group of groups) {
    const groupEl = document.createElement('div');
    groupEl.className = 'repo-group';

    const header = document.createElement('button');
    header.className = 'repo-group-header';
    header.innerHTML = `
      <span class="repo-group-name">${escapeHtml(group.owner)}/${escapeHtml(group.name)}</span>
      <span class="repo-group-meta">
        <span>${group.issues.length}</span>
        <svg class="repo-group-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>`;
    header.addEventListener('click', () => groupEl.classList.toggle('collapsed'));

    const issuesContainer = document.createElement('div');
    issuesContainer.className = 'repo-group-issues';
    for (const issue of group.issues) {
      issuesContainer.appendChild(renderIssueCard(issue));
    }

    groupEl.appendChild(header);
    groupEl.appendChild(issuesContainer);
    list.appendChild(groupEl);
  }
}

async function loadIssues() {
  try {
    const issues = await getAllCachedIssues();
    renderIssuesTab(issues);
  } catch (err) {
    showToast('Failed to load issues', 'error');
    console.error('loadIssues error:', err);
  }
}

function initRefreshButton() {
  const btn = document.getElementById('refresh-btn');
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.classList.add('refreshing');
    try {
      chrome.runtime.sendMessage({ action: 'pollNow' });
      // Give the service worker a moment then reload from cache
      setTimeout(async () => {
        await loadIssues();
        await updateFooter();
        btn.disabled = false;
        btn.classList.remove('refreshing');
        showToast('Issues refreshed', 'success');
      }, 1500);
    } catch {
      btn.disabled = false;
      btn.classList.remove('refreshing');
      showToast('Refresh failed', 'error');
    }
  });
}

// ============================================================
// Repositories Tab
// ============================================================

function renderRepoCard(repo) {
  const card = document.createElement('div');
  card.className = 'repo-card';

  const starsIcon = `<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg>`;

  const langDot = repo.language
    ? `<span class="lang-dot"></span><span>${escapeHtml(repo.language)}</span>`
    : '';

  card.innerHTML = `
    <div class="repo-card-header">
      <a class="repo-card-name" href="${escapeHtml(repo.url)}" title="${escapeHtml(repo.owner)}/${escapeHtml(repo.name)}">${escapeHtml(repo.owner)}/${escapeHtml(repo.name)}</a>
      <button class="btn btn-danger btn-sm remove-repo-btn" data-owner="${escapeHtml(repo.owner)}" data-name="${escapeHtml(repo.name)}">Remove</button>
    </div>
    ${repo.description ? `<div class="repo-card-desc">${escapeHtml(repo.description)}</div>` : ''}
    <div class="repo-card-footer">
      ${langDot ? `<span class="repo-badge">${langDot}</span>` : ''}
      <span class="repo-badge">${starsIcon} ${repo.stars.toLocaleString()}</span>
    </div>`;

  // Open repo URL in new tab
  const nameLink = card.querySelector('.repo-card-name');
  nameLink.addEventListener('click', e => {
    e.preventDefault();
    chrome.tabs.create({ url: repo.url });
  });

  // Remove button
  const removeBtn = card.querySelector('.remove-repo-btn');
  removeBtn.addEventListener('click', async () => {
    removeBtn.disabled = true;
    try {
      await removeRepository(repo.owner, repo.name);
      await loadRepos();
      await loadIssues();
      showToast(`Removed ${repo.owner}/${repo.name}`, 'success');
    } catch (err) {
      removeBtn.disabled = false;
      showToast('Failed to remove repository', 'error');
      console.error('removeRepository error:', err);
    }
  });

  return card;
}

async function loadRepos() {
  const list = document.getElementById('repos-list');
  list.innerHTML = '';
  try {
    const settings = await getSettings();
    const repos = settings.repositories || [];

    if (repos.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <svg class="empty-state-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8b949e" stroke-width="1.5">
            <path d="M3 6h18M3 12h18M3 18h18"/>
          </svg>
          <div class="empty-state-title">No repositories tracked</div>
          <div class="empty-state-desc">Add a repository above to start tracking beginner-friendly issues.</div>
        </div>`;
      return;
    }

    for (const repo of repos) {
      list.appendChild(renderRepoCard(repo));
    }
  } catch (err) {
    showToast('Failed to load repositories', 'error');
    console.error('loadRepos error:', err);
  }
}

function initAddRepoForm() {
  const input = document.getElementById('repo-input');
  const btn = document.getElementById('add-repo-btn');
  const errorEl = document.getElementById('add-repo-error');

  const showError = msg => {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  };
  const clearError = () => {
    errorEl.hidden = true;
    errorEl.textContent = '';
  };

  const doAdd = async () => {
    clearError();
    const value = input.value.trim();
    if (!value) return;

    const parsed = parseRepoUrl(value);
    if (!parsed) {
      showError('Invalid format. Use "owner/name" or a GitHub URL.');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Adding…';
    try {
      const token = await getAuthToken();
      const repo = await fetchRepository(parsed.owner, parsed.name, token);
      const added = await addRepository(repo);
      if (!added) {
        showError('Repository is already being tracked.');
        return;
      }
      input.value = '';
      await loadRepos();
      // Trigger a background fetch for the new repo
      chrome.runtime.sendMessage({ action: 'pollNow' });
      showToast(`Added ${repo.owner}/${repo.name}`, 'success');
    } catch (err) {
      showError(err.message || 'Failed to add repository.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Add';
    }
  };

  btn.addEventListener('click', doAdd);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') doAdd();
  });
}

// ============================================================
// Settings Tab
// ============================================================

async function loadSettings() {
  try {
    const settings = await getSettings();

    // Notification frequency
    const freqSelect = document.getElementById('frequency-select');
    freqSelect.value = settings.notificationFrequency || 'hourly';

    // Labels
    renderLabels(settings.customLabels || []);

    // Token
    await refreshTokenDisplay();
  } catch (err) {
    console.error('loadSettings error:', err);
  }
}

async function refreshTokenDisplay() {
  const token = await getAuthToken();
  const displayEl = document.getElementById('token-display');
  const inputRowEl = document.getElementById('token-input-row');
  const maskedEl = document.getElementById('token-masked');

  if (token) {
    const visible =
      token.length > 8 ? `${token.slice(0, 4)}****${token.slice(-4)}` : '****';
    maskedEl.textContent = visible;
    displayEl.hidden = false;
    inputRowEl.hidden = true;
  } else {
    displayEl.hidden = true;
    inputRowEl.hidden = false;
  }
}

function renderLabels(labels) {
  const list = document.getElementById('labels-list');
  list.innerHTML = '';
  for (const label of labels) {
    const tag = document.createElement('span');
    tag.className = 'label-tag active';

    const text = document.createElement('span');
    text.textContent = label;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'label-tag-remove';
    removeBtn.setAttribute('aria-label', `Remove label ${label}`);
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', async () => {
      try {
        const settings = await getSettings();
        settings.customLabels = (settings.customLabels || []).filter(l => l !== label);
        await saveSettings(settings);
        renderLabels(settings.customLabels);
      } catch (err) {
        showToast('Failed to remove label', 'error');
      }
    });

    tag.appendChild(text);
    tag.appendChild(removeBtn);
    list.appendChild(tag);
  }
}

function initSettingsControls() {
  // Frequency select
  const freqSelect = document.getElementById('frequency-select');
  freqSelect.addEventListener('change', async () => {
    try {
      const settings = await getSettings();
      settings.notificationFrequency = freqSelect.value;
      await saveSettings(settings);
      // Notify background to reschedule alarm
      chrome.runtime.sendMessage({
        action: 'updateFrequency',
        frequency: freqSelect.value,
      });
      showToast('Frequency updated', 'success');
    } catch (err) {
      showToast('Failed to save frequency', 'error');
    }
  });

  // Save token
  const saveTokenBtn = document.getElementById('save-token-btn');
  saveTokenBtn.addEventListener('click', async () => {
    const tokenInput = document.getElementById('token-input');
    const value = tokenInput.value.trim();
    if (!value) {
      showToast('Please enter a token', 'error');
      return;
    }
    try {
      await saveAuthToken(value);
      tokenInput.value = '';
      await refreshTokenDisplay();
      showToast('Token saved', 'success');
    } catch (err) {
      showToast('Failed to save token', 'error');
    }
  });

  // Clear token
  const clearTokenBtn = document.getElementById('clear-token-btn');
  clearTokenBtn.addEventListener('click', async () => {
    try {
      await clearAuthToken();
      await refreshTokenDisplay();
      showToast('Token cleared', 'success');
    } catch (err) {
      showToast('Failed to clear token', 'error');
    }
  });

  // Add label
  const labelInput = document.getElementById('label-input');
  const addLabelBtn = document.getElementById('add-label-btn');

  const doAddLabel = async () => {
    const value = labelInput.value.trim().toLowerCase();
    if (!value) return;
    try {
      const settings = await getSettings();
      const labels = settings.customLabels || [];
      if (labels.includes(value)) {
        showToast('Label already exists', 'error');
        return;
      }
      labels.push(value);
      settings.customLabels = labels;
      await saveSettings(settings);
      labelInput.value = '';
      renderLabels(labels);
      showToast(`Added label "${value}"`, 'success');
    } catch (err) {
      showToast('Failed to add label', 'error');
    }
  };

  addLabelBtn.addEventListener('click', doAddLabel);
  labelInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') doAddLabel();
  });
}

// ============================================================
// Footer
// ============================================================

async function updateFooter() {
  // Last checked
  const lastCheckedEl = document.getElementById('last-checked-text');
  try {
    const lastChecked = await getLastChecked();
    if (lastChecked) {
      lastCheckedEl.textContent = `Last checked: ${timeAgo(new Date(lastChecked))}`;
    } else {
      lastCheckedEl.textContent = 'Never checked';
    }
  } catch {
    lastCheckedEl.textContent = 'Never checked';
  }

  // Rate limit
  const rateLimitEl = document.getElementById('rate-limit-text');
  try {
    const token = await getAuthToken();
    const rateLimit = await getRateLimit(token);
    if (rateLimit) {
      rateLimitEl.textContent = `API: ${rateLimit.remaining}/${rateLimit.limit}`;
    }
  } catch {
    // Rate limit is non-critical, ignore silently
  }
}

// ============================================================
// Initialization
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  // Reset badge when popup opens
  try {
    chrome.runtime.sendMessage({ action: 'resetBadge' });
  } catch {
    // Ignore if service worker is not available
  }

  initTabs();
  initRefreshButton();
  initAddRepoForm();
  initSettingsControls();

  // Load all data in parallel
  await Promise.all([loadIssues(), loadRepos(), loadSettings(), updateFooter()]);
});
