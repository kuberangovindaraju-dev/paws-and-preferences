/**
 * swipe.js
 * Handles all drag interaction: mouse and touch.
 *
 * Approach:
 *  - Listen for pointerdown on the top card (works for both mouse and touch)
 *  - Track horizontal delta and rotate the card proportionally
 *  - On release: if delta >= SWIPE_THRESHOLD → flyOut; else → snapBack
 *  - Callbacks (onLike / onDislike) are injected by app.js
 */

const SwipeHandler = (() => {
  // Internal state — reset on each new drag
  let _card        = null;
  let _startX      = 0;
  let _startY      = 0;
  let _currentX    = 0;
  let _isDragging  = false;
  let _onLike      = null;
  let _onDislike   = null;

  // How many degrees the card rotates per pixel of drag
  const ROTATION_FACTOR = 0.07;

  // Vertical drag is dampened so the card feels anchored
  const VERTICAL_DAMPEN = 0.25;

  /**
   * Attaches swipe listeners to a card element.
   *
   * @param {HTMLElement} card
   * @param {{ onLike: Function, onDislike: Function }} callbacks
   */
  function attach(card, { onLike, onDislike }) {
    _onLike    = onLike;
    _onDislike = onDislike;

    card.addEventListener('mousedown',  _onStart);
    card.addEventListener('touchstart', _onStart, { passive: true });
  }

  /**
   * Programmatically triggers a swipe (used by the ♥ / ✕ buttons).
   *
   * @param {'like'|'dislike'} direction
   */
  function trigger(direction) {
    _currentX = direction === 'like'
      ? CONFIG.SWIPE_THRESHOLD + 10
      : -(CONFIG.SWIPE_THRESHOLD + 10);
    _flyOut(_currentX > 0);
  }

  // ── Drag handlers ───────────────────────────────────────────

  function _onStart(e) {
    if (_isDragging) return;
    _isDragging = true;

    const pt = e.touches ? e.touches[0] : e;
    _startX  = pt.clientX;
    _startY  = pt.clientY;
    _currentX = 0;
    _card     = e.currentTarget;

    // Disable transition while dragging for immediate response
    _card.style.transition = 'none';

    document.addEventListener('mousemove',  _onMove);
    document.addEventListener('mouseup',    _onEnd);
    document.addEventListener('touchmove',  _onMove, { passive: false });
    document.addEventListener('touchend',   _onEnd);
  }

  function _onMove(e) {
    if (!_isDragging || !_card) return;

    // Prevent page scroll on touch while swiping
    if (e.cancelable) e.preventDefault();

    const pt  = e.touches ? e.touches[0] : e;
    _currentX = pt.clientX - _startX;
    const dy  = (pt.clientY - _startY) * VERTICAL_DAMPEN;
    const rot = _currentX * ROTATION_FACTOR;

    _card.style.transform = `translate(${_currentX}px, ${dy}px) rotate(${rot}deg)`;

    // Fade stamps in/out based on how far the card has been dragged
    _updateStamps(_currentX);
  }

  function _onEnd() {
    _removeDocumentListeners();
    if (!_isDragging) return;
    _isDragging = false;

    if (Math.abs(_currentX) >= CONFIG.SWIPE_THRESHOLD) {
      _flyOut(_currentX > 0);
    } else {
      _snapBack();
    }
  }

  // ── Motion helpers ──────────────────────────────────────────

  function _flyOut(liked) {
    if (!_card) return;

    const dir = liked ? 1 : -1;
    const tx  = dir * (window.innerWidth + 250);

    _card.style.transition = 'transform 0.42s cubic-bezier(0.55, 0, 0.7, 0.4), opacity 0.42s ease';
    _card.style.transform  = `translate(${tx}px, -50px) rotate(${dir * 28}deg)`;
    _card.style.opacity    = '0';

    // Notify app AFTER the card starts flying (feels more responsive)
    setTimeout(() => {
      if (liked) _onLike?.();
      else       _onDislike?.();
    }, 80);
  }

  function _snapBack() {
    if (!_card) return;
    _card.style.transition = `transform 0.45s var(--ease-spring)`;
    _card.style.transform  = 'translate(0, 0) rotate(0deg)';
    _updateStamps(0);
  }

  function _updateStamps(dx) {
    if (!_card) return;
    const ratio     = Math.abs(dx) / CONFIG.SWIPE_THRESHOLD;
    const likeStamp = _card.querySelector('.stamp--like');
    const nopeStamp = _card.querySelector('.stamp--nope');
    if (likeStamp) likeStamp.style.opacity = dx > 15  ? Math.min(ratio, 1) : 0;
    if (nopeStamp) nopeStamp.style.opacity = dx < -15 ? Math.min(ratio, 1) : 0;
  }

  function _removeDocumentListeners() {
    document.removeEventListener('mousemove', _onMove);
    document.removeEventListener('mouseup',   _onEnd);
    document.removeEventListener('touchmove', _onMove);
    document.removeEventListener('touchend',  _onEnd);
  }

  return { attach, trigger };
})();
