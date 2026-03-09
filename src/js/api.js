/**
 * api.js
 * Responsible for all communication with the Cataas API.
 *
 * WHY NO fetch() FOR IMAGES?
 * Cataas does not send CORS headers, so fetch() calls for image data
 * are blocked by the browser. The correct pattern is to use the URL
 * directly as an <img src> — browsers allow cross-origin image loading
 * by default without a CORS preflight.
 *
 * We use fetch() ONLY to get the cat metadata list (JSON endpoint),
 * which Cataas does support. If that fails we fall back to random URLs.
 */

const CataasAPI = (() => {
  /**
   * Attempts to load a cat list from the Cataas JSON API.
   * Returns an array of { url, tag } objects.
   *
   * @returns {Promise<Array<{url: string, tag: string}>>}
   */
  async function fetchCatList() {
    // The ID-based endpoint (GET /api/cats + /cat/:id) returns 404s when
    // cataas.com rebuilds its database — which happens periodically.
    // The most reliable approach is the random /cat endpoint used directly
    // as <img src> with a unique cache-busting param per card.
    return buildFallbackList();
  }

  /**
   * Fallback: build URLs using the random /cat endpoint.
   * Each URL has a unique cache-busting query param so the browser
   * fetches a fresh image for every card.
   *
   * @returns {Array<{url: string, tag: string}>}
   */
  function buildFallbackList() {
    const base = Date.now();
    return Array.from({ length: CONFIG.TOTAL_CATS }, (_, i) => ({
      url: `${CONFIG.CATAAS_BASE_URL}?v=${base}-${i}`,
      tag: CONFIG.CAT_TAGS[i % CONFIG.CAT_TAGS.length],
    }));
  }

  /**
   * Pre-warms the browser image cache using HTMLImageElement.
   * This means cards display instantly rather than loading on demand.
   *
   * Uses a per-image timeout so a single slow image doesn't block the UI.
   *
   * @param {string}   url      - Image URL to preload
   * @param {Function} onProgress - Called with loaded count after each image
   * @param {number}   index    - Index used for progress tracking
   * @returns {Promise<void>}
   */
  function preloadImage(url, onProgress, index) {
    return new Promise((resolve) => {
      const img     = new Image();
      const timeout = setTimeout(() => {
        // Timed out — continue anyway, the card will show a shimmer until it loads
        onProgress(index);
        resolve();
      }, CONFIG.IMAGE_TIMEOUT_MS);

      img.onload = img.onerror = () => {
        clearTimeout(timeout);
        onProgress(index);
        resolve();
      };

      // Set src AFTER attaching handlers to avoid a race condition
      img.src = url;
    });
  }

  /**
   * Fetches the cat list and preloads all images in parallel.
   *
   * @param {Function} onProgress  - Called with (loadedCount, total)
   * @returns {Promise<Array<{url: string, tag: string, liked: null}>>}
   */
  async function loadAllCats(onProgress) {
    const cats = await fetchCatList();

    let loaded = 0;
    const handleProgress = () => {
      loaded++;
      onProgress(loaded, cats.length);
    };

    await Promise.allSettled(
      cats.map((cat, i) => preloadImage(cat.url, handleProgress, i))
    );

    // Return enriched cat objects ready for the app state
    return cats.map(cat => ({ ...cat, liked: null }));
  }

  // Public API
  return { loadAllCats };
})();
