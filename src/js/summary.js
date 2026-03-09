export function showSummary(cats) {
  const liked  = cats.filter(c => c.liked === true);
  const passed = cats.filter(c => c.liked === false);

  document.getElementById('stat-liked').textContent  = liked.length;
  document.getElementById('stat-passed').textContent = passed.length;
  document.getElementById('stat-total').textContent  = cats.length;

  const pct = liked.length / cats.length;
  let emoji, title, desc;
  if (pct >= 0.8) {
    emoji = '😻'; title = 'Absolute Cat Lover!';
    desc  = `You liked ${liked.length} out of ${cats.length} cats. You clearly have a lot of love to give! 🐾`;
  } else if (pct >= 0.5) {
    emoji = '😸'; title = 'Certified Cat Fan!';
    desc  = `${liked.length} cuties won your heart today. Nice taste!`;
  } else if (pct >= 0.2) {
    emoji = '🐱'; title = 'Picky but Passionate!';
    desc  = `Only ${liked.length} cats made the cut — you've got high standards!`;
  } else {
    emoji = '🙀'; title = 'Hard to Impress…';
    desc  = `Just ${liked.length} liked. Maybe next batch will have your type?`;
  }

  document.getElementById('summary-emoji').textContent = emoji;
  document.getElementById('summary-title').textContent = title;
  document.getElementById('summary-desc').textContent  = desc;

  const grid    = document.getElementById('liked-grid');
  const emptyEl = document.getElementById('empty-likes');
  const heading = document.getElementById('liked-heading');
  grid.innerHTML = '';

  if (liked.length === 0) {
    emptyEl.style.display = 'block';
    heading.style.display = 'none';
  } else {
    emptyEl.style.display = 'none';
    heading.style.display = '';
    liked.forEach((cat, i) => {
      const thumb = document.createElement('div');
      thumb.className = 'liked-thumb';
      thumb.style.animationDelay = (i * 0.06) + 's';
      const img = document.createElement('img');
      img.src = cat.url;
      img.alt = 'Liked cat';
      thumb.appendChild(img);
      grid.appendChild(thumb);
    });
  }

  document.getElementById('summary').classList.add('active');
  document.getElementById('summary').scrollTop = 0;
}