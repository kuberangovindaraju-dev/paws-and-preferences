import { SWIPE_THRESHOLD } from './config.js';
import { updateGhostCards } from './card.js';

let isDragging  = false;
let startX      = 0;
let startY      = 0;
let currentX    = 0;
let activeCard  = null;
let stackArea   = null;
let onDecision  = null;
let isFlying    = false;

export function attachSwipe(newStackArea, newOnDecision) {
  // Remove old listeners before attaching new ones
  if (stackArea) {
    stackArea.removeEventListener('mousedown',  handleStart);
    stackArea.removeEventListener('touchstart', handleStart);
  }

  stackArea  = newStackArea;
  onDecision = newOnDecision;
  isFlying   = false;

  stackArea.addEventListener('mousedown',  handleStart);
  stackArea.addEventListener('touchstart', handleStart, { passive: true });
}

function handleStart(e) {
  if (isDragging || isFlying) return;
  const card = e.target.closest('.card');
  if (!card || card.classList.contains('card-ghost')) return;

  isDragging = true;
  activeCard = card;

  const pt = e.touches ? e.touches[0] : e;
  startX   = pt.clientX;
  startY   = pt.clientY;
  currentX = 0;

  activeCard.style.transition = 'none';

  document.addEventListener('mousemove', handleMove);
  document.addEventListener('mouseup',   handleEnd);
  document.addEventListener('touchmove', handleMove, { passive: false });
  document.addEventListener('touchend',  handleEnd);
}

function handleMove(e) {
  if (!isDragging || !activeCard) return;
  if (e.cancelable) e.preventDefault();

  const pt = e.touches ? e.touches[0] : e;
  currentX = pt.clientX - startX;
  const dy = pt.clientY - startY;

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

function handleEnd() {
  document.removeEventListener('mousemove', handleMove);
  document.removeEventListener('mouseup',   handleEnd);
  document.removeEventListener('touchmove', handleMove);
  document.removeEventListener('touchend',  handleEnd);

  if (!isDragging) return;
  isDragging = false;

  if (Math.abs(currentX) >= SWIPE_THRESHOLD) {
    const liked = currentX > 0;
    triggerFlyOut(activeCard, liked);
  } else {
    snapBack(activeCard);
  }
}

function triggerFlyOut(card, liked) {
  if (isFlying) return;
  isFlying = true;

  const dir = liked ? 1 : -1;
  const tx  = dir * (window.innerWidth + 200);

  card.style.transition = 'transform 0.45s cubic-bezier(.55,0,.7,.4), opacity 0.45s ease';
  card.style.transform  = `translate(${tx}px, -40px) rotate(${dir * 25}deg)`;
  card.style.opacity    = '0';

  setTimeout(() => {
    isFlying = false;
    updateGhostCards(stackArea);
    onDecision(liked);
  }, 400);
}

// Called externally by the like/nope buttons in app.js
export function flyOut(card, liked, area, cb) {
  if (isFlying) return;
  isFlying = true;

  const dir = liked ? 1 : -1;
  const tx  = dir * (window.innerWidth + 200);

  card.style.transition = 'transform 0.45s cubic-bezier(.55,0,.7,.4), opacity 0.45s ease';
  card.style.transform  = `translate(${tx}px, -40px) rotate(${dir * 25}deg)`;
  card.style.opacity    = '0';

  setTimeout(() => {
    isFlying = false;
    updateGhostCards(area);
    cb();
  }, 400);
}

function snapBack(card) {
  if (!card) return;
  card.style.transition = 'transform 0.4s cubic-bezier(.34,1.56,.64,1)';
  card.style.transform  = 'translate(0,0) rotate(0deg)';
  card.querySelector('.stamp-like').style.opacity = 0;
  card.querySelector('.stamp-nope').style.opacity = 0;
}