/**
 * summary.js
 * Renders the end-of-session results screen.
 *
 * Responsibilities:
 *  - Calculate and display like / pass / total counts
 *  - Show personalised message based on like ratio
 *  - Render a grid of liked cat thumbnails with staggered animation
 */

const SummaryManager = (() => {
  // Thresholds for personalised messages (like ratio)
  const MESSAGES = [
    {
      minRatio: 0.8,
      emoji: '😻',
      title: 'Absolute Cat Lover!',
      desc: (liked, total) =>
        `You liked ${liked} out of ${total} cats. You have so much love to give! 🐾`,
    },
    {
      minRatio: 0.5,
      emoji: '😸',
      title: 'Certified Cat Fan!',
      desc: (liked) => `${liked} cuties won your heart today. Excellent taste!`,
    },
    {
      minRatio: 0.2,
      emoji: '🐱',
      title: 'Picky but Passionate!',
      desc: (liked) => `Only ${liked} cats made the cut — you have high standards!`,
    },
    {
      minRatio: 0,
      emoji: '🙀',
      title: 'Hard to Impress…',
      desc: (liked) =>
        liked === 0
          ? "Not a single like! Maybe cats aren't your thing? 😅"
          : `Just ${liked} liked. The perfect cat is out there somewhere!`,
    },
  ];

  /**
   * Shows the summary screen populated with session results.
   *
   * @param {Array<{ url: string, tag: string, liked: boolean|null }>} cats
   * @param {Function} onReplay - Called when the user clicks "Play Again"
   */
  function show(cats, onReplay) {
    const liked  = cats.filter(c => c.liked === true);
    const passed = cats.filter(c => c.liked === false);

    _updateStats(liked.length, passed.length, cats.length);
    _updateMessage(liked.length, cats.length);
    _renderLikedGrid(liked);
    _attachReplayHandler(onReplay);

    document.getElementById('summary').removeAttribute('hidden');
  }

  /** Hides the summary screen */
  function hide() {
    document.getElementById('summary').setAttribute('hidden', '');
  }

  // ── Private helpers ─────────────────────────────────────────

  function _updateStats(likedCount, passedCount, total) {
    document.getElementById('stat-liked').textContent  = likedCount;
    document.getElementById('stat-passed').textContent = passedCount;
    document.getElementById('stat-total').textContent  = total;
  }

  function _updateMessage(likedCount, total) {
    const ratio   = total > 0 ? likedCount / total : 0;
    const message = MESSAGES.find(m => ratio >= m.minRatio) ?? MESSAGES[MESSAGES.length - 1];

    document.getElementById('summary-emoji').textContent = message.emoji;
    document.getElementById('summary-title').textContent = message.title;
    document.getElementById('summary-desc').textContent  = message.desc(likedCount, total);
  }

  function _renderLikedGrid(likedCats) {
    const grid     = document.getElementById('liked-grid');
    const section  = document.getElementById('liked-section');
    const emptyMsg = document.getElementById('empty-likes');

    grid.innerHTML = '';

    if (likedCats.length === 0) {
      section.setAttribute('hidden', '');
      emptyMsg.removeAttribute('hidden');
      return;
    }

    section.removeAttribute('hidden');
    emptyMsg.setAttribute('hidden', '');

    likedCats.forEach((cat, i) => {
      const thumb = document.createElement('div');
      thumb.className = 'liked-thumb';
      // Staggered pop-in animation delay
      thumb.style.animationDelay = `${i * 55}ms`;

      const img = document.createElement('img');
      img.src   = cat.url; // Already cached in browser — loads instantly
      img.alt   = `Liked cat ${i + 1}`;
      img.loading = 'lazy';

      thumb.appendChild(img);
      grid.appendChild(thumb);
    });
  }

  function _attachReplayHandler(onReplay) {
    const btn = document.getElementById('btn-replay');
    // Clone to remove any previously attached listener
    const fresh = btn.cloneNode(true);
    btn.replaceWith(fresh);
    fresh.addEventListener('click', onReplay);
  }

  return { show, hide };
})();
