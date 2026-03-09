import { SWIPE_THRESHOLD } from './config.js';

let isDragging = false;
let startX     = 0;
let startY     = 0;
let currentX   = 0;
let activeCard = null;

export function attachSwipe(card, onFlyOut) {
  card.addEventListener('mousedown',  e => onStart(e, onFlyOut));
  card.addEventListener('touchstart', e => onStart(e, onFlyOut), { passive: true });
}

function onStart(e, onFlyOut) {
  if (isDragging) return;
  isDragging = true;
  const pt = e.touches ? e.touches[0] : e;
  startX     = pt.clientX;
  startY     = pt.clientY;
  currentX   = 0;
  activeCard = e.currentTarget;
  activeCard.style.transition = 'none';

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup',   () => onEnd(onFlyOut));
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('touchend',  () => onEnd(onFlyOut));
}

function onMove(e) {
  if (!isDragging || !activeCard) return;
  if (e.cancelable) e.preventDefault();
  const pt = e.touches ? e.touches[0] : e;
  currentX   = pt.clientX - startX;
  const dy   = pt.clientY - startY;

  activeCard.style.transform = `translate(${currentX}px, ${dy * 0.3}px) rotate(${currentX * 0.08}deg)`;

  const stampLike = activeCard.querySelector('.stamp-like');
  const stampNope = activeCard.querySelector('.stamp-nope');
  const ratio     = Math.abs(currentX) / SWIPE_THRESHOLD;

  if (currentX > 20) {
    stampLike.style.opacity = Math.min(ratio, 1);
    stampNope.style.opacity = 0;
  } else if (currentX < -20) {
    stampNope.style.opacity = Math.min(ratio, 1);
    stampLike.style.opacity = 0;
  } else {
    stampLike.style.opacity = 0;
    stampNope.style.opacity = 0;
  }
}

function onEnd(onFlyOut) {
  document.removeEventListener('mousemove', onMove);
  document.removeEventListener('mouseup',   () => onEnd(onFlyOut));
  document.removeEventListener('touchmove', onMove);
  document.removeEventListener('touchend',  () => onEnd(onFlyOut));

  if (!isDragging) return;
  isDragging = false;

  if (Math.abs(currentX) >= SWIPE_THRESHOLD) {
    flyOut(currentX > 0, onFlyOut);
  } else {
    snapBack();
  }
}

// card param is optional — passed by buttons, set from activeCard when swiping
export function flyOut(liked, onFlyOut, card = null) {
  const target = card || activeCard;
  if (!target) return;

  // Show the stamp briefly before flying off
  const stamp = target.querySelector(liked ? '.stamp-like' : '.stamp-nope');
  if (stamp) stamp.style.opacity = 1;

  const dir = liked ? 1 : -1;
  const tx  = dir * (window.innerWidth + 200);

  target.style.transition = 'transform 0.45s cubic-bezier(.55,0,.7,.4), opacity 0.45s ease';
  target.style.transform  = `translate(${tx}px, -40px) rotate(${dir * 25}deg)`;
  target.style.opacity    = '0';

  setTimeout(() => onFlyOut(liked), 350);
}

function snapBack() {
  if (!activeCard) return;
  activeCard.style.transition = 'transform 0.4s cubic-bezier(.34,1.56,.64,1)';
  activeCard.style.transform  = 'translate(0,0) rotate(0deg)';
  activeCard.querySelector('.stamp-like').style.opacity = 0;
  activeCard.querySelector('.stamp-nope').style.opacity = 0;
}