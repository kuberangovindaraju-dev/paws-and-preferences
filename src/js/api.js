// ─── Cataas API ──────────────────────────────────────────────────────────────

import { CONFIG, CAT_TAGS } from './config.js';

/**
 * Build a Cataas image URL.
 * We use /cat/{tag} with a cache-busting seed so each URL is unique.
 */
function buildCatUrl(tag, seed) {
  return `${CONFIG.CATAAS_BASE}/cat/${tag}?width=500&height=620&position=center&_=${seed}`;
}

/**
 * Fetch an array of cat objects: { id, url, tag }
 * We spread across different tags for visual variety.
 */
export async function fetchCats(count = CONFIG.TOTAL_CATS) {
  const cats = [];

  for (let i = 0; i < count; i++) {
    const tag = CAT_TAGS[i % CAT_TAGS.length];
    const seed = Date.now() + i * 997; // prime multiplier keeps seeds spread out
    cats.push({
      id: i,
      tag,
      url: buildCatUrl(tag, seed),
    });
  }

  return cats;
}

/**
 * Preload an image and return a promise that resolves when loaded (or rejects on error).
 */
export function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => resolve(url);
    img.onerror = () => reject(new Error(`Failed to load: ${url}`));
    img.src = url;
  });
}
