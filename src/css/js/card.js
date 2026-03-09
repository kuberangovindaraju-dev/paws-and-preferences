/**
 * card.js
 * Builds card DOM elements and manages the visible stack.
 *
 * Stack layout (z-index):
 *   z=10  → top card (interactive)
 *   z=9   → second card (ghost, scaled down slightly)
 *   z=8   → third card  (ghost, scaled down more)
 */

const CardManager = (() => {
  const GHOST_SCALE_STEP   = 0.05;  // Each ghost card is 5% smaller
  const GHOST_OFFSET_STEP  = 10;    // Each ghost card is 10px lower
  const GHOST_OPACITY_STEP = 0.15;  // Each ghost card is 15% more transparent
  const VISIBLE_STACK_SIZE = 3;

  /**
   * Creates a single card DOM element for a given cat.
   *
   * @param {{ url: string, tag: string }} cat
   * @param {number} index  - Position in the full cats array
   * @returns {HTMLElement}
   */
  function createCardElement(cat, index) {
    const card = document.createElement('div');
    card.className = 'card card--enter';
    card.dataset.index = index;
    card.setAttribute('role', 'img');
    card.setAttribute('aria-label', `Cat number ${index + 1}, tagged ${cat.tag}`);

    // Stamp overlays — shown as the user drags
    card.appendChild(_createStamp('like'));
    card.appendChild(_createStamp('nope'));

    // Cat image — src set AFTER element built to avoid layout thrash
    const img = document.createElement('img');
    img.className   = 'card__image card__image--loading';
    img.alt         = `Cat ${index + 1}`;
    img.draggable   = false;
    img.onload      = () => img.classList.remove('card__image--loading');
    img.onerror     = () => img.classList.remove('card__image--loading'); // show whatever loaded
    img.src         = cat.url; // Direct cataas URL as <img src> — CORS-safe

    // Footer
    const footer = document.createElement('div');
    footer.className = 'card__footer';

    const num = document.createElement('span');
    num.className   = 'card__number';
    num.textContent = `Cat #${index + 1}`;

    const tag = document.createElement('span');
    tag.className   = 'card__tag';
    tag.textContent = cat.tag;

    const source = document.createElement('span');
    source.className   = 'card__source';
    source.textContent = 'cataas.com';

    footer.appendChild(num);
    footer.appendChild(tag);
    footer.appendChild(source);

    card.appendChild(img);
    card.appendChild(footer);

    return card;
  }

  /**
   * Renders up to VISIBLE_STACK_SIZE cards into the stack container.
   * The top card is interactive; the rest are visual ghost cards.
   *
   * @param {HTMLElement} container  - The #stack-area element
   * @param {Array}       cats       - Full cats array
   * @param {number}      currentIdx - Index of the top card
   * @returns {HTMLElement} The top (interactive) card element
   */
  function renderStack(container, cats, currentIdx) {
    container.innerHTML = '';

    const count = Math.min(VISIBLE_STACK_SIZE, cats.length - currentIdx);

    // Render back-to-front so top card is appended last (highest z-index)
    for (let offset = count - 1; offset >= 0; offset--) {
      const idx  = currentIdx + offset;
      if (idx >= cats.length) continue;

      const card    = createCardElement(cats[idx], idx);
      const isTop   = offset === 0;

      if (isTop) {
        card.style.zIndex = 10;
      } else {
        card.classList.add('card--ghost');
        card.classList.remove('card--enter'); // ghosts don't animate in
        const scale   = 1 - offset * GHOST_SCALE_STEP;
        const offsetY = offset * GHOST_OFFSET_STEP;
        const opacity = 1 - offset * GHOST_OPACITY_STEP;
        card.style.transform = `scale(${scale}) translateY(${offsetY}px)`;
        card.style.opacity   = opacity;
        card.style.zIndex    = 10 - offset;
      }

      container.appendChild(card);
    }

    return container.querySelector(`.card[data-index="${currentIdx}"]`);
  }

  /**
   * Smoothly transitions ghost cards toward their new positions
   * after the top card is removed. Called during swipe flyout.
   *
   * @param {HTMLElement} container
   */
  function promoteGhostCards(container) {
    const ghosts = container.querySelectorAll('.card--ghost');
    ghosts.forEach((ghost, i) => {
      const scale   = 1 - i * GHOST_SCALE_STEP;
      const offsetY = i * GHOST_OFFSET_STEP;
      const opacity = 1 - i * GHOST_OPACITY_STEP;
      ghost.style.transform = `scale(${scale}) translateY(${offsetY}px)`;
      ghost.style.opacity   = opacity;
    });
  }

  // ── Private helpers ────────────────────────────────────────

  function _createStamp(type) {
    const el = document.createElement('div');
    el.className  = `stamp stamp--${type}`;
    el.textContent = type === 'like' ? 'CUTE!' : 'NOPE';
    el.setAttribute('aria-hidden', 'true');
    return el;
  }

  return { createCardElement, renderStack, promoteGhostCards };
})();
