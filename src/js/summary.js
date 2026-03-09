// ─── Summary Screen ───────────────────────────────────────────────────────────

/**
 * Render the summary/results screen into #summary.
 *
 * @param {Array} liked  - array of cat objects the user liked
 * @param {number} total - total cats shown
 * @param {Function} onRestart - callback when user hits "Play Again"
 */
export function renderSummary(liked, total, onRestart) {
  const section = document.getElementById('summary');
  section.innerHTML = '';
  section.classList.remove('hidden');

  const noped  = total - liked.length;
  const pct    = Math.round((liked.length / total) * 100);

  // Choose a mood message
  let mood, emoji;
  if (liked.length === 0)        { mood = 'Not a cat person today?';  emoji = '🙈'; }
  else if (liked.length === total){ mood = 'You love ALL the cats!';    emoji = '😻'; }
  else if (pct >= 70)             { mood = 'Certified cat enthusiast!'; emoji = '🐱'; }
  else if (pct >= 40)             { mood = 'Selective taste in cats.';  emoji = '😸'; }
  else                            { mood = 'A discerning cat critic.';  emoji = '🐾'; }

  // ── Header ────────────────────────────────────────────────────────────────
  const header = document.createElement('div');
  header.className = 'summary-header';
  header.innerHTML = `
    <div class="summary-emoji">${emoji}</div>
    <h2 class="summary-title">Your Results</h2>
    <p class="summary-mood">${mood}</p>
  `;
  section.appendChild(header);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = document.createElement('div');
  stats.className = 'summary-stats';
  stats.innerHTML = `
    <div class="stat stat--like">
      <span class="stat-num">${liked.length}</span>
      <span class="stat-label">Loved 😻</span>
    </div>
    <div class="stat stat--divider">/</div>
    <div class="stat stat--nope">
      <span class="stat-num">${noped}</span>
      <span class="stat-label">Noped 🙈</span>
    </div>
  `;
  section.appendChild(stats);

  // ── Liked grid ────────────────────────────────────────────────────────────
  if (liked.length > 0) {
    const gridWrap = document.createElement('div');
    gridWrap.className = 'summary-grid-wrap';

    const gridTitle = document.createElement('p');
    gridTitle.className = 'summary-grid-title';
    gridTitle.textContent = `Your favourites`;
    gridWrap.appendChild(gridTitle);

    const grid = document.createElement('div');
    grid.className = 'summary-grid';

    liked.forEach((cat, i) => {
      const item = document.createElement('div');
      item.className = 'summary-grid-item';
      item.style.animationDelay = `${i * 60}ms`;
      item.innerHTML = `
        <img src="${cat.url}" alt="liked cat" loading="lazy" />
        <span class="grid-tag">#${cat.tag}</span>
      `;
      grid.appendChild(item);
    });

    gridWrap.appendChild(grid);
    section.appendChild(gridWrap);
  }

  // ── Restart button ────────────────────────────────────────────────────────
  const btn = document.createElement('button');
  btn.className = 'btn-restart';
  btn.textContent = '🐾 Try Again';
  btn.addEventListener('click', onRestart);
  section.appendChild(btn);

  // Scroll to top
  section.scrollTop = 0;

  // Animate in
  requestAnimationFrame(() => section.classList.add('visible'));
}

/** Hide the summary screen */
export function hideSummary() {
  const section = document.getElementById('summary');
  section.classList.remove('visible');
  setTimeout(() => {
    section.classList.add('hidden');
    section.innerHTML = '';
  }, 350);
}
