// ─── Card Component ───────────────────────────────────────────────────────────

import { CONFIG } from './config.js';
import { attachSwipe, flyOff } from './swipe.js';

/**
 * Create a swipeable cat card DOM element.
 *
 * @param {Object}   cat      - { id, url, tag }
 * @param {number}   stackPos - 0 = top (active), 1 = second, 2 = third
 * @param {Function} onSwipe  - called with ('like'|'nope', cat)
 * @returns {{ el: HTMLElement, promote: Function, destroy: Function }}
 */
export function createCard(cat, stackPos, onSwipe) {
  const el = document.createElement('div');
  el.className = 'card';
  el.dataset.id = cat.id;

  // ── Inner structure ────────────────────────────────────────────────────────
  el.innerHTML = `
    <div class="card-image-wrap">
      <div class="card-skeleton"></div>
      <img
        class="card-img"
        src="${cat.url}"
        alt="A cat tagged '${cat.tag}'"
        draggable="false"
        loading="eager"
      />
    </div>

    <div class="card-badge card-badge--like">
      <span>😻</span> LOVE
    </div>
    <div class="card-badge card-badge--nope">
      <span>🙈</span> NOPE
    </div>

    <div class="card-footer">
      <span class="card-tag">#${cat.tag}</span>
    </div>
  `;

  const img    = el.querySelector('.card-img');
  const skel   = el.querySelector('.card-skeleton');
  const likeBadge = el.querySelector('.card-badge--like');
  const nopeBadge = el.querySelector('.card-badge--nope');

  // Remove skeleton once image loads
  img.addEventListener('load', () => {
    skel.style.opacity = '0';
    img.classList.add('loaded');
  }, { once: true });

  // Apply initial stack position
  applyStackPos(el, stackPos);

  // ── Attach gestures only to the top card ──────────────────────────────────
  let cleanup = null;

  if (stackPos === 0) {
    cleanup = attachSwipe(el, {
      onDrag({ dx, progress }) {
        if (dx > 0) {
          likeBadge.style.opacity = progress;
          nopeBadge.style.opacity = 0;
        } else {
          nopeBadge.style.opacity = progress;
          likeBadge.style.opacity = 0;
        }
      },
      onCancel() {
        likeBadge.style.opacity = 0;
        nopeBadge.style.opacity = 0;
      },
      onSwipe(direction) {
        onSwipe(direction, cat);
      },
    });
  }

  // ── promote(): called when this card moves from pos 1→0 or 2→1 ───────────
  function promote(newPos) {
    stackPos = newPos;
    el.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1)';
    applyStackPos(el, newPos);

    if (newPos === 0 && !cleanup) {
      // Now the active card — attach swipe handlers
      cleanup = attachSwipe(el, {
        onDrag({ dx, progress }) {
          if (dx > 0) {
            likeBadge.style.opacity = progress;
            nopeBadge.style.opacity = 0;
          } else {
            nopeBadge.style.opacity = progress;
            likeBadge.style.opacity = 0;
          }
        },
        onCancel() {
          likeBadge.style.opacity = 0;
          nopeBadge.style.opacity = 0;
        },
        onSwipe(direction) {
          onSwipe(direction, cat);
        },
      });
    }
  }

  // ── Programmatic swipe (button click) ─────────────────────────────────────
  function triggerSwipe(direction) {
    if (stackPos !== 0) return;
    likeBadge.style.opacity = direction === 'like' ? 1 : 0;
    nopeBadge.style.opacity = direction === 'nope' ? 1 : 0;
    flyOff(el, direction, () => onSwipe(direction, cat));
  }

  function destroy() {
    cleanup?.();
    el.remove();
  }

  return { el, promote, triggerSwipe, destroy };
}

/** Apply CSS transform + z-index for a given stack position */
function applyStackPos(el, pos) {
  const offset = CONFIG.STACK_OFFSETS[pos] ?? CONFIG.STACK_OFFSETS[CONFIG.STACK_OFFSETS.length - 1];
  el.style.transform = `translateY(${offset.y}px) scale(${offset.scale}) rotate(${offset.rotate}deg)`;
  el.style.zIndex    = offset.zIndex;
  el.style.pointerEvents = pos === 0 ? 'auto' : 'none';
}
