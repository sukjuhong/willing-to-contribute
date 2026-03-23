/**
 * Content Script for Willing to Contribute
 * Injected into GitHub pages to show "Track in WTC" floating button
 */

(function () {
  'use strict';

  // Non-repo first path segments (mirrors detectRepoFromUrl in github-api.js)
  const NON_REPO_SEGMENTS = new Set([
    'settings',
    'notifications',
    'explore',
    'topics',
    'trending',
    'collections',
    'events',
    'sponsors',
    'login',
    'signup',
    'organizations',
    'orgs',
    'marketplace',
    'features',
    'enterprise',
    'pricing',
    'search',
  ]);

  // ---- Repo detection ----

  function detectRepo() {
    try {
      const parsed = new URL(window.location.href);
      if (parsed.hostname !== 'github.com') return null;

      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts.length < 2) return null;
      if (NON_REPO_SEGMENTS.has(parts[0])) return null;

      return { owner: parts[0], name: parts[1] };
    } catch {
      return null;
    }
  }

  // ---- DOM helpers ----

  function getOrCreateButton() {
    let btn = document.getElementById('wtc-float-btn');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'wtc-float-btn';
      btn.className = 'wtc-float-btn';
      btn.setAttribute('aria-label', 'Track in Willing to Contribute');
      document.body.appendChild(btn);
    }
    return btn;
  }

  function removeButton() {
    const btn = document.getElementById('wtc-float-btn');
    if (btn) btn.remove();
  }

  function renderButton(tracked) {
    const btn = getOrCreateButton();

    if (tracked) {
      btn.className = 'wtc-float-btn wtc-float-btn--tracked';
      btn.innerHTML =
        '<span class="wtc-btn-icon">&#10003;</span>' +
        '<span class="wtc-btn-label">Tracked</span>';
    } else {
      btn.className = 'wtc-float-btn';
      btn.innerHTML =
        '<span class="wtc-btn-icon">+</span>' +
        '<span class="wtc-btn-label">Track</span>';
    }

    return btn;
  }

  // ---- Toast notifications ----

  function showToast(message, type) {
    // Remove any existing toast
    const existing = document.getElementById('wtc-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'wtc-toast';
    toast.className = 'wtc-toast wtc-toast--' + (type || 'success');
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger fade-out after 3s then remove
    setTimeout(function () {
      toast.classList.add('wtc-toast--fadeout');
      toast.addEventListener('animationend', function () {
        toast.remove();
      });
    }, 3000);
  }

  // ---- Storage helpers ----

  function isTracked(settings, owner, name) {
    if (!settings || !Array.isArray(settings.repositories)) return false;
    return settings.repositories.some(function (r) {
      return r.owner === owner && r.name === name;
    });
  }

  function loadSettings(callback) {
    chrome.storage.sync.get('wtc_settings', function (result) {
      callback(result.wtc_settings || null);
    });
  }

  // ---- Button click handler ----

  function handleTrackClick(owner, name, btn) {
    // Prevent double-clicks
    if (btn.disabled) return;
    btn.disabled = true;

    chrome.runtime.sendMessage(
      { action: 'trackRepo', owner: owner, name: name },
      function (response) {
        btn.disabled = false;

        if (chrome.runtime.lastError) {
          showToast('✗ Failed to track: extension error', 'error');
          return;
        }

        if (response && response.success) {
          renderButton(true);
          showToast('✓ Tracking ' + owner + '/' + name, 'success');
        } else {
          const reason = (response && response.error) || 'unknown error';
          showToast('✗ Failed to track: ' + reason, 'error');
        }
      },
    );
  }

  // ---- Main update logic ----

  var currentRepo = null;

  function update() {
    const repo = detectRepo();

    if (!repo) {
      removeButton();
      currentRepo = null;
      return;
    }

    currentRepo = repo;

    loadSettings(function (settings) {
      const tracked = isTracked(settings, repo.owner, repo.name);
      const btn = renderButton(tracked);

      // Re-attach click handler (fresh closure for current repo)
      btn.onclick = function () {
        if (tracked) return; // already tracked - ignore click
        handleTrackClick(repo.owner, repo.name, btn);
      };
    });
  }

  // ---- Storage change listener ----

  chrome.storage.onChanged.addListener(function (changes, area) {
    if (area === 'sync' && changes.wtc_settings && currentRepo) {
      const settings = changes.wtc_settings.newValue || null;
      const tracked = isTracked(settings, currentRepo.owner, currentRepo.name);
      const btn = renderButton(tracked);
      const repo = currentRepo;
      btn.onclick = function () {
        if (tracked) return;
        handleTrackClick(repo.owner, repo.name, btn);
      };
    }
  });

  // ---- GitHub SPA navigation ----

  document.addEventListener('turbo:load', update);
  window.addEventListener('popstate', update);

  // Also watch for URL changes via MutationObserver as fallback
  // (some GitHub navigations don't fire turbo:load or popstate)
  var lastHref = window.location.href;
  var navObserver = new MutationObserver(function () {
    if (window.location.href !== lastHref) {
      lastHref = window.location.href;
      update();
    }
  });
  navObserver.observe(document.body, { childList: true, subtree: true });

  // ---- Initial run ----

  update();
})();
