// ─── Swipe Gesture Handler ───────────────────────────────────────────────────

import { CONFIG } from './config.js';

/**
 * Attach swipe (touch + mouse) gesture handling to a card element.
 *
 * @param {HTMLElement} el       - The card element to make swipeable
 * @param {Function}    onSwipe  - Called with 'like' | 'nope' when swipe completes
 * @param {Function}    onDrag   - Called with { dx, progress } during drag
 * @param {Function}    onCancel - Called when drag is released without reaching threshold
 */
export function attachSwipe(el, { onSwipe, onDrag, onCancel }) {
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let isDragging = false;
  let animFrame = null;

  // ── Pointer down ──────────────────────────────────────────────────────────
  function handleStart(e) {
    if (el.classList.contains('flying')) return;
    isDragging = true;
    const point = e.touches ? e.touches[0] : e;
    startX  = point.clientX;
    startY  = point.clientY;
    currentX = 0;
    el.style.transition = 'none';
    el.classList.add('dragging');
  }

  // ── Pointer move ──────────────────────────────────────────────────────────
  function handleMove(e) {
    if (!isDragging) return;
    e.preventDefault();

    const point = e.touches ? e.touches[0] : e;
    const dx = point.clientX - startX;
    const dy = point.clientY - startY;
    currentX = dx;

    const progress = Math.min(Math.abs(dx) / CONFIG.SWIPE_THRESHOLD, 1); // 0→1
    const rotate   = (dx / window.innerWidth) * CONFIG.MAX_ROTATION;

    if (animFrame) cancelAnimationFrame(animFrame);
    animFrame = requestAnimationFrame(() => {
      el.style.transform = `translateX(${dx}px) translateY(${dy * 0.25}px) rotate(${rotate}deg)`;
      onDrag?.({ dx, progress });
    });
  }

  // ── Pointer up ────────────────────────────────────────────────────────────
  function handleEnd() {
    if (!isDragging) return;
    isDragging = false;
    el.classList.remove('dragging');

    if (animFrame) cancelAnimationFrame(animFrame);

    if (Math.abs(currentX) >= CONFIG.SWIPE_THRESHOLD) {
      const direction = currentX > 0 ? 'like' : 'nope';
      flyOff(el, direction, () => onSwipe(direction));
    } else {
      // Snap back
      el.style.transition = 'transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      el.style.transform  = 'translateX(0) translateY(0) rotate(0deg)';
      onCancel?.();
    }
  }

  // ── Touch events ──────────────────────────────────────────────────────────
  el.addEventListener('touchstart',  handleStart, { passive: true });
  el.addEventListener('touchmove',   handleMove,  { passive: false });
  el.addEventListener('touchend',    handleEnd);
  el.addEventListener('touchcancel', handleEnd);

  // ── Mouse events (desktop fallback) ───────────────────────────────────────
  el.addEventListener('mousedown', handleStart);
  window.addEventListener('mousemove', handleMove);
  window.addEventListener('mouseup',   handleEnd);

  // Return cleanup fn
  return () => {
    el.removeEventListener('touchstart',  handleStart);
    el.removeEventListener('touchmove',   handleMove);
    el.removeEventListener('touchend',    handleEnd);
    el.removeEventListener('touchcancel', handleEnd);
    el.removeEventListener('mousedown',   handleStart);
    window.removeEventListener('mousemove', handleMove);
    window.removeEventListener('mouseup',   handleEnd);
  };
}

/**
 * Animate a card flying off-screen in a given direction, then call done().
 */
export function flyOff(el, direction, done) {
  const signX   = direction === 'like' ? 1 : -1;
  const exitX   = signX * (window.innerWidth + el.offsetWidth + 60);
  const exitRot = signX * CONFIG.MAX_ROTATION * 1.5;

  el.classList.add('flying');
  el.style.transition = 'transform 0.42s cubic-bezier(0.4, 0, 1, 1), opacity 0.42s ease';
  el.style.transform  = `translateX(${exitX}px) rotate(${exitRot}deg)`;
  el.style.opacity    = '0';

  el.addEventListener('transitionend', () => done(), { once: true });
}
