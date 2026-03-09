// ─── App Controller ───────────────────────────────────────────────────────────

import { CONFIG }                  from './config.js';
import { fetchCats }               from './api.js';
import { createCard }              from './card.js';
import { renderSummary, hideSummary } from './summary.js';

class PawsApp {
  constructor() {
    this.deck        = [];    // all cat objects (queue)
    this.cards       = [];    // active card instances (max STACK_SIZE)
    this.liked       = [];
    this.noped       = [];
    this.totalCats   = 0;
    this.isAnimating = false;

    // DOM refs
    this.$stack    = document.getElementById('card-stack');
    this.$likeBtn  = document.getElementById('btn-like');
    this.$nopeBtn  = document.getElementById('btn-nope');
    this.$progress = document.getElementById('progress-fill');
    this.$progTxt  = document.getElementById('progress-text');
    this.$loading  = document.getElementById('loading');
    this.$empty    = document.getElementById('empty-state');
  }

  async init() {
    this.showLoading(true);

    try {
      const cats     = await fetchCats(CONFIG.TOTAL_CATS);
      this.totalCats = cats.length;
      this.deck      = [...cats].reverse(); // reverse so we pop() from the front

      this.renderInitialStack();
      this.bindButtons();
      this.showLoading(false);
    } catch (err) {
      console.error('Failed to load cats:', err);
      this.showLoading(false);
      this.$loading.innerHTML = `<p class="error">😿 Couldn't reach Cataas.<br>Check your connection and reload.</p>`;
      this.$loading.classList.remove('hidden');
    }
  }

  // ── Stack management ──────────────────────────────────────────────────────

  renderInitialStack() {
    const count = Math.min(CONFIG.STACK_SIZE, this.deck.length);
    for (let i = count - 1; i >= 0; i--) {
      // i=0 is top card; we add bottom cards first (lower z-index)
      const stackPos = i;
      const cat      = this.deck[this.deck.length - 1 - i];
      this.addCardToStack(cat, stackPos);
    }
    // Remove the cats we just rendered from deck
    this.deck.splice(this.deck.length - count, count);
    this.updateProgress();
  }

  addCardToStack(cat, stackPos) {
    const card = createCard(cat, stackPos, (direction, swipedCat) => {
      this.handleSwipe(direction, swipedCat, card);
    });
    this.$stack.appendChild(card.el);
    this.cards.unshift(card); // index 0 = top
  }

  handleSwipe(direction, cat, card) {
    if (direction === 'like') {
      this.liked.push(cat);
      this.triggerHaptic();
    } else {
      this.noped.push(cat);
    }

    // Remove top card from tracking array
    this.cards = this.cards.filter(c => c !== card);

    // Promote remaining cards up one position
    this.cards.forEach((c, idx) => c.promote(idx));

    // Pull next cat from deck
    if (this.deck.length > 0) {
      const nextCat  = this.deck.pop();
      const newPos   = Math.min(this.cards.length, CONFIG.STACK_SIZE - 1);
      // Insert at bottom of visual stack
      this.addCardToStack(nextCat, newPos);
      // Re-sort so index 0 is always the top
      this.cards = this.cards.sort((a, b) => {
        return parseInt(a.el.style.zIndex) < parseInt(b.el.style.zIndex) ? 1 : -1;
      });
    }

    this.updateProgress();

    // Check if done
    const done = this.liked.length + this.noped.length === this.totalCats;
    if (done) {
      setTimeout(() => this.showSummary(), 500);
    }
  }

  // ── Buttons ───────────────────────────────────────────────────────────────

  bindButtons() {
    this.$likeBtn.addEventListener('click', () => this.triggerTopCard('like'));
    this.$nopeBtn.addEventListener('click', () => this.triggerTopCard('nope'));
  }

  triggerTopCard(direction) {
    const top = this.cards[0];
    if (!top) return;
    top.triggerSwipe(direction);
  }

  // ── Progress ──────────────────────────────────────────────────────────────

  updateProgress() {
    const done  = this.liked.length + this.noped.length;
    const pct   = this.totalCats > 0 ? (done / this.totalCats) * 100 : 0;
    this.$progress.style.width = `${pct}%`;
    this.$progTxt.textContent  = `${done} / ${this.totalCats}`;
  }

  // ── Summary ───────────────────────────────────────────────────────────────

  showSummary() {
    renderSummary(this.liked, this.totalCats, () => this.restart());
  }

  async restart() {
    hideSummary();

    // Clear state
    this.liked  = [];
    this.noped  = [];
    this.cards.forEach(c => c.destroy());
    this.cards  = [];
    this.$stack.innerHTML = '';

    await new Promise(r => setTimeout(r, 400));
    await this.init();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  showLoading(show) {
    this.$loading.classList.toggle('hidden', !show);
  }

  triggerHaptic() {
    if ('vibrate' in navigator) navigator.vibrate(20);
  }
}

// ── Boot ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const app = new PawsApp();
  app.init();
});
