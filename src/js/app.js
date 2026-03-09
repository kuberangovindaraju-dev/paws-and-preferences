import { loadCats }                      from './api.js';
import { renderStack, updateGhostCards } from './card.js';
import { flyOut, setActiveCard }         from './swipe.js';
import { showSummary }                   from './summary.js';

let cats       = [];
let currentIdx = 0;

const stackArea  = document.getElementById('stack-area');
const loadingEl  = document.getElementById('loading');
const loadingBar = document.getElementById('loading-bar');
const currentNum = document.getElementById('current-num');
const totalNum   = document.getElementById('total-num');
const btnLike    = document.getElementById('btn-like');
const btnNope    = document.getElementById('btn-nope');
const replayBtn  = document.getElementById('replay-btn');

function onFlyOut(liked) {
  cats[currentIdx].liked = liked;
  currentIdx++;

  setTimeout(() => {
    updateGhostCards(stackArea);
    if (currentIdx >= cats.length) {
      showSummary(cats);
    } else {
      currentNum.textContent = currentIdx + 1;
      renderStack(cats, currentIdx, stackArea, onFlyOut);
    }
  }, 350);
}

btnLike.addEventListener('click', () => {
  const card = stackArea.querySelector(`.card[data-index="${currentIdx}"]`);
  if (!card) return;
  setActiveCard(card);  // tell swipe.js which card to animate
  flyOut(true, onFlyOut);
});

btnNope.addEventListener('click', () => {
  const card = stackArea.querySelector(`.card[data-index="${currentIdx}"]`);
  if (!card) return;
  setActiveCard(card);  // tell swipe.js which card to animate
  flyOut(false, onFlyOut);
});

replayBtn.addEventListener('click', () => {
  document.getElementById('summary').classList.remove('active');
  currentIdx = 0;
  init();
});

async function init() {
  loadingEl.style.display = 'flex';
  loadingBar.style.width  = '0%';
  stackArea.innerHTML     = '';
  currentNum.textContent  = '1';

  cats = await loadCats(pct => loadingBar.style.width = pct + '%');

  loadingEl.style.display = 'none';
  totalNum.textContent    = cats.length;
  renderStack(cats, currentIdx, stackArea, onFlyOut);
}

init();