/**
 * app.js
 * Main application controller.
 *
 * Orchestrates the other modules:
 *   CataasAPI     → fetches & preloads cat data
 *   CardManager   → builds and renders the card stack
 *   SwipeHandler  → handles drag interaction
 *   SummaryManager→ shows the results screen
 *
 * State machine:
 *   LOADING → SWIPING → SUMMARY → LOADING (replay)
 */

const App = (() => {
  // ── App state ────────────────────────────────────────────────
  let _cats       = [];   // Array of { url, tag, liked }
  let _currentIdx = 0;   // Index of the card currently on top

  // ── DOM references ───────────────────────────────────────────
  const _els = {
    loading:    document.getElementById('loading'),
    errorScreen:document.getElementById('error-screen'),
    app:        document.getElementById('app'),
    stackArea:  document.getElementById('stack-area'),
    currentNum: document.getElementById('current-num'),
    totalNum:   document.getElementById('total-num'),
    loadingBar: document.getElementById('loading-bar'),
    btnLike:    document.getElementById('btn-like'),
    btnNope:    document.getElementById('btn-nope'),
    btnRetry:   document.getElementById('btn-retry'),
  };

  // ── Boot ─────────────────────────────────────────────────────

  async function init() {
    _showScreen('loading');
    _resetState();

    try {
      _cats = await CataasAPI.loadAllCats(_onLoadProgress);
    } catch (err) {
      console.error('[App] Failed to load cats:', err);
      _showScreen('error');
      return;
    }

    _els.totalNum.textContent   = _cats.length;
    _els.currentNum.textContent = 1;

    _showScreen('app');
    _renderCurrentStack();
    _attachButtonListeners();
  }

  // ── Screen management ────────────────────────────────────────

  function _showScreen(name) {
    ['loading', 'errorScreen', 'app'].forEach(key => {
      _els[key]?.setAttribute('hidden', '');
    });
    document.getElementById('summary')?.setAttribute('hidden', '');

    if (name === 'loading')     _els.loading.removeAttribute('hidden');
    if (name === 'errorScreen') _els.errorScreen.removeAttribute('hidden');
    if (name === 'app')         _els.app.removeAttribute('hidden');
  }

  // ── Loading progress ─────────────────────────────────────────

  function _onLoadProgress(loaded, total) {
    const pct = Math.round((loaded / total) * 100);
    _els.loadingBar.style.width = `${pct}%`;
    _els.loadingBar.closest('[role="progressbar"]')
      ?.setAttribute('aria-valuenow', pct);
  }

  // ── Card rendering ───────────────────────────────────────────

  function _renderCurrentStack() {
    const topCard = CardManager.renderStack(
      _els.stackArea,
      _cats,
      _currentIdx
    );

    if (topCard) {
      SwipeHandler.attach(topCard, {
        onLike:    () => _handleSwipe(true),
        onDislike: () => _handleSwipe(false),
      });
    }
  }

  // ── Swipe logic ──────────────────────────────────────────────

  function _handleSwipe(liked) {
    // Record the user's decision
    _cats[_currentIdx].liked = liked;
    _currentIdx++;

    // Promote ghost cards toward top position while flyout animates
    CardManager.promoteGhostCards(_els.stackArea);

    // Wait for fly-out animation then render next card / show summary
    setTimeout(() => {
      if (_currentIdx >= _cats.length) {
        _showSummary();
      } else {
        _els.currentNum.textContent = _currentIdx + 1;
        _renderCurrentStack();
      }
    }, 380);
  }

  // ── Button listeners ─────────────────────────────────────────

  function _attachButtonListeners() {
    // Clone buttons to remove any stale listeners from a previous session
    ['btnLike', 'btnNope'].forEach(key => {
      const fresh = _els[key].cloneNode(true);
      _els[key].replaceWith(fresh);
      _els[key] = fresh;
    });

    _els.btnLike.addEventListener('click', () => SwipeHandler.trigger('like'));
    _els.btnNope.addEventListener('click', () => SwipeHandler.trigger('dislike'));
  }

  // ── Summary ──────────────────────────────────────────────────

  function _showSummary() {
    _els.app.setAttribute('hidden', '');
    SummaryManager.show(_cats, _onReplay);
  }

  function _onReplay() {
    SummaryManager.hide();
    init();
  }

  // ── State reset ──────────────────────────────────────────────

  function _resetState() {
    _cats       = [];
    _currentIdx = 0;
    _els.loadingBar.style.width = '0%';
    _els.stackArea.innerHTML    = '';
  }

  // ── Error retry ──────────────────────────────────────────────

  function _attachRetryListener() {
    _els.btnRetry.addEventListener('click', init);
  }

  // ── Public init ──────────────────────────────────────────────
  return { init, _attachRetryListener };
})();

// ── Bootstrap ────────────────────────────────────────────────
// Wait for DOM to be fully parsed before starting
document.addEventListener('DOMContentLoaded', () => {
  App._attachRetryListener();
  App.init();
});
