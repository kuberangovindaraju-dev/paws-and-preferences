export function createCard(cat, index) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.index = index;

  const img = document.createElement('img');
  img.src = cat.url;
  img.alt = `Cat ${index + 1}`;
  img.draggable = false;

  const footer = document.createElement('div');
  footer.className = 'card-footer';

  const num = document.createElement('div');
  num.className = 'cat-number';
  num.textContent = `Cat #${index + 1}`;

  const tagEl = document.createElement('div');
  tagEl.className = 'cat-tag';
  tagEl.textContent = cat.tag;

  footer.appendChild(num);
  footer.appendChild(tagEl);

  const stampLike = document.createElement('div');
  stampLike.className = 'stamp stamp-like';
  stampLike.textContent = 'CUTE!';

  const stampNope = document.createElement('div');
  stampNope.className = 'stamp stamp-nope';
  stampNope.textContent = 'NOPE';

  card.appendChild(stampNope);
  card.appendChild(stampLike);
  card.appendChild(img);
  card.appendChild(footer);

  return card;
}

export function renderStack(cats, currentIdx, stackArea, onSwipe) {
  stackArea.innerHTML = '';
  const visible = Math.min(3, cats.length - currentIdx);

  for (let i = visible - 1; i >= 0; i--) {
    const idx = currentIdx + i;
    if (idx >= cats.length) continue;
    const card = createCard(cats[idx], idx);
    const isTop = i === 0;

    if (!isTop) {
      card.classList.add('card-ghost');
      card.style.transform = `scale(${1 - i * 0.05}) translateY(${i * 10}px)`;
      card.style.opacity = (1 - i * 0.15).toString();
      card.style.zIndex = visible - i;
    } else {
      card.style.zIndex = 10;
    }
    stackArea.appendChild(card);
  }
}

export function updateGhostCards(stackArea) {
  const ghosts = stackArea.querySelectorAll('.card-ghost');
  ghosts.forEach((g, i) => {
    g.style.transition = 'transform 0.3s cubic-bezier(.34,1.56,.64,1), opacity 0.3s ease';
    g.style.transform = `scale(${1 - i * 0.05}) translateY(${i * 10}px)`;
    g.style.opacity = (1 - i * 0.15).toString();
  });
}