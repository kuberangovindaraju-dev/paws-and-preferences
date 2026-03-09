import { TOTAL_CATS, CAT_TAGS } from './config.js';

export async function loadCats(onProgress) {
  const cats = [];
  const promises = Array.from({ length: TOTAL_CATS }, (_, i) => {
    const seed = Date.now() + i * 137 + Math.floor(Math.random() * 9999);
    const tag = CAT_TAGS[i % CAT_TAGS.length];
    const url = `https://cataas.com/cat?width=600&height=700&${seed}`;
    return preloadImage(url, i).then(loaded => {
      cats.push({ url: loaded, tag, liked: null });
      onProgress(Math.round(((i + 1) / TOTAL_CATS) * 100));
    });
  });
  await Promise.allSettled(promises);
  return cats;
}

function preloadImage(url, idx) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload  = () => resolve(url);
    img.onerror = () => resolve(`https://cataas.com/cat?t=${Date.now()}${idx}`);
    img.src = url;
  });
}